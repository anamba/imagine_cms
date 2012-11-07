module Cms # :nodoc:
  class ContentController < ::ApplicationController # :nodoc:
    caches_action :rss_feed
    
    before_filter :convert_content_path
    
    # Routes:
    # match 'plcalendar(/:action(/:id))' => 'cms/content#page_list_calendar'
    # root :to => 'cms/content#show'
    # match '*content_path' => 'cms/content#show'
    
    def show
      return not_found unless params[:content_path].is_a? Array
      
      @content_levels = (params[:prefix] || []).concat(params[:content_path])
      @content_path = File.join([ 'content' ].concat(@content_levels))
      template_found = false
      
      # set "legacy" vars
      begin
        if template_exists?(@content_path)
          params[:section] = @content_levels.first unless @content_levels.size < 2
          params[:subsection] = @content_levels[1] unless @content_levels.size < 3
          params[:page] = @content_levels.last
          template_found = true
        elsif template_exists?(File.join([ @content_path, 'index' ]))
          @content_path = File.join([ @content_path, 'index' ])
          params[:section] = @content_levels.first unless @content_levels.size < 1
          params[:subsection] = @content_levels[1] unless @content_levels.size < 2
          params[:page] = 'index'
          template_found = true
        end
      rescue Exception => e
        if e.message =~ /string contains null byte/
          # do nothing
        else
          raise e
        end
      end
      
      if template_found
        render :template => @content_path
      elsif show_from_db
        return
      else
        return not_found
      end
    end
    
    # Renders app/views/errors/404.rhtml with http status 404 Not Found.
    def not_found
      # logger.error "404 from #{request.referer}"
      # render :template => 'errors/404', :status => 404
      
      # let Rails handle 404s natively (override if you want to handle manually)
      raise ActionController::RoutingError.new('404 Not Found')
    end
    
    def show_from_db
      logger.debug 'Rendering content from database'
      
      # begin
        @content_levels = params[:content_path]
        db_path = params[:content_path]
        edit_mode = false
        @allow_caching = true
        
        # check for /login
        if db_path.last == 'login'
          db_path.pop
          if @pg = CmsPage.find_by_path(db_path.join('/'))
            db_path << 'version'
            db_path << (@pg.published_version <= 0 ? @pg.version : @pg.published_version).to_s
            @allow_caching = false
            
            if is_logged_in_user?
              redirect_to '/' + db_path.join('/') and return true
            else
              flash[:notice] = "Please log in now in order to switch to Preview Mode on the page you were just viewing."
              session[:saved_user_uri] = '/' + db_path.join('/')
              redirect_to :controller => '/management/user', :action => 'login' and return true
            end
          end
        end
        
        # check for /edit
        if db_path.last == 'edit'
          db_path.pop
          edit_mode = true
          @allow_caching = false
        end
        
        # check for 2-part suffixes (/version/[#], /form/[action])
        test = db_path.last(2)
        
        if test.size == 2
          if test.first == 'version' && test.last.to_i > 0
            params[:version] = db_path.pop
            db_path.pop
            @allow_caching = false
          elsif test.first == 'form'
            @form_action = db_path.pop
            db_path.pop
            @allow_caching = false
            
            # restore saved instance variables
            if session[:saved_instance_variables].is_a? Hash
              session[:saved_instance_variables].each do |k, v|
                instance_variable_set "@#{k}", v
              end
              session[:saved_instance_variables] = nil
            end
          end
        end
        
        # check for 3-part suffixes (/segment/[offset]/[plname])
        test = db_path.last(3)
        
        if test.size == 3
          if test[0] == 'segment' && !test[1].empty? && !test[2].empty?
            @page_list_segment = true
            params[:page_list_name] = db_path.pop
            params[:offset] = db_path.pop
            db_path.pop
            @allow_caching = false
          end
        end
        
        if db_path.last == 'index'
          db_path.pop
          params[:page] = 'index'
        end
        
        if @pg = CmsPage.find_by_path(db_path.join('/'), :include => [ :template ])
          if edit_mode
            redirect_to :controller => '/management/cms', :action => 'edit_page_content', :id => @pg and return true
          else
            # return if page is offline and viewer is not an admin
            if @pg.published_version < 0
              if !is_logged_in_user?
                return false
              else
                # display, but don't cache
                @allow_caching = false
              end
            end
            
            # load appropriate page version and associated objects
            # if we had to authenticate, load_page_objects = false, but return true so we don't call not_found
            load_page_objects or return true
            
            # set "legacy" vars
            params[:section] = @content_levels.size < 1 ? '' : @content_levels.first
            params[:subsection] = @content_levels[1] unless @content_levels.size < 3
            if @content_levels.size == 1
              params[:page] = 'index'
            elsif @content_levels.size > 1
              params[:page] = @content_levels.last
            end
            
            @page_title = @pg.title
            
            template_content = render_cms_page_to_string(@pg)
            
            # logger.debug @page_objects.map { |k,v| "#{k}: #{v}\n" }
            
            # this is kind of ugly, having this in the middle of my rendering code
            if @page_list_segment
              name = params[:page_list_name]
              key = "obj-page_list-#{name.gsub(/[^\w]/, '_')}"
              pages = page_list_items(@pg, key).compact.uniq
              render :inline => render_page_list_segment(name, pages) and return true
            end
            # end of page list segment code
            
            render :inline => template_content
            
            if perform_caching && UseCmsPageCaching && @allow_caching
              cache_page
            end
            
            return true
          end
        end
      # rescue Exception => e
      #   logger.debug "Error rendering from db: #{e.inspect.gsub(/</, '&lt;')} #{e.backtrace}"
      #   log_error(e)
      # end
      
      # if we haven't rendered something from the db by now, return false
      false
    end
    
    
    
    protected
    
    def render_cms_page_to_string(page)
      # sanitize possibly dangerous content before rendering
      template_content = substitute_placeholders(page.template.content, page)
      template_content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      logger.silence do
        template_content = render_to_string(:inline => template_content,
                                            :locals => { :page => page, :safe_level => 0 })
      end
      
      template_content = substitute_placeholders(template_content, page)
      template_content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      logger.silence do
        template_content = render_to_string(:inline => template_content,
                                            :layout => 'application',
                                            :locals => { :page => page })
      end
      
      template_content
    end
    
  end
end
