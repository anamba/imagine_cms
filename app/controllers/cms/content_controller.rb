module Cms # :nodoc:
  class ContentController < ::ApplicationController # :nodoc:
    include ActionController::Caching::Actions
    include ActionController::Caching::Pages
    self.page_cache_directory = "#{Rails.root}/public"
    
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
        render template: @content_path
      elsif show_from_db
        return
      else
        return not_found
      end
    end
    
    # Renders app/views/errors/404.rhtml with http status 404 Not Found.
    def not_found
      # logger.error "404 from #{request.referer}"
      # render :template => 'imagine_cms/errors/404', :status => 404
      
      # let Rails handle 404s natively (override if you want to handle manually)
      raise ActionController::RoutingError.new('404 Not Found')
    end
    
    def rendering_error(exception = nil)
      logger.error "500 from #{request.referer} (exception: #{exception})"
      logger.error exception.annoted_source_code if exception.class.name == 'ActionView::Template::Error'
      
      @exception = exception.message
      render template: 'imagine_cms/errors/500', status: 500, formats: [ :html ]
    end
    
    def show_from_db
      @@cms_page_table_exists ||= CmsPage.table_exists?
      return unless @@cms_page_table_exists
      
      logger.debug 'Rendering content from database'
      
      begin
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
              redirect_to controller: '/management/user', action: 'login' and return true
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
          if test[0] == 'segment' && !test[1].blank? && !test[2].blank?
            @page_list_segment = true
            params[:page_list_name] = db_path.pop
            params[:offset] = db_path.pop
            db_path.pop
            
            # don't cache to disk on server, but do allow browsers and proxies to cache briefly
            @allow_caching = false
            expires_in 1.minutes, public: true if Rails.env.production?
          end
        end
        
        if db_path.last == 'index'
          db_path.pop
          params[:page] = 'index'
        end
        
        if @pg = CmsPage.includes(:template).find_by_path(db_path.join('/'))
          if edit_mode
            redirect_to controller: '/management/cms', action: 'edit_page_content', id: @pg and return true
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
            
            # redirect if redirect enabled
            if @pg.respond_to?(:redirect_enabled) && @pg.redirect_enabled
              redirect_to @pg.redirect_to and return true
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
              render inline: render_page_list_segment(name, @page_list_pages[key]) and return true
            end
            # end of page list segment code
            
            render inline: template_content
            
            if UseCmsPageCaching && @allow_caching && perform_caching && request.format == Mime::HTML
              cache_page
            end
            
            return true
          end
        end
      rescue Exception => e
        logger.error "Error rendering from db: #{e.class}: #{e.message}"
        rendering_error(e) and return true
      end
      
      # if we haven't rendered something from the db by now, return false
      false
    end
    
    
    def disable_caching
      @allow_caching = false
    end
    helper_method :disable_caching
    
    def search
      @pages = []
      @terms = []
      @terms = params[:q].split(/[^\w\-]+/).reject { |t| t.length < 3 } if params[:q]
      
      unless @terms.empty?
        CmsPage.index_all
        
        base_query = CmsPage.includes(:tags).references(:cms_page_tags).where('published_version >= 0').limit(100)
        
        query = base_query.dup
        @terms.each do |term|
          term_variants = [ term, term.singularize, term.pluralize ].uniq.map { |v| v.gsub(/[\[\]\|\:\>\(\)\?]/, '').gsub(/\+/, '\+') }.join('|')
          query = query.where("(title regexp ?)", "[[:<:]](#{term_variants})[[:>:]]")
        end
        @pages.concat query.all
        
        query = base_query.dup.where('search_index is not null')
        @terms.each do |term|
          term_variants = [ term, term.singularize, term.pluralize ].uniq.map { |v| v.gsub(/[\[\]\|\:\>\(\)\?]/, '').gsub(/\+/, '\+') }.join('|')
          query = query.where("cms_page_tags.name regexp :regex or search_index regexp :regex",
                              regex: "[[:<:]](#{term_variants})[[:>:]]")
        end
        query.each { |pg| @pages << pg unless @pages.include?(pg) }
        
        # fulltext doesn't work with innodb... may need to make a separate myisam
        # table just for search. (this would be better because it would sort by relevance)
        # @pages.concat CmsPage.where('match (title, search_index) against (?)', params[:q])
      end
      @pages = @pages.first(100)
      
      logger.debug "Search returned #{@pages.size} matching pages for terms #{@terms}"
      
      @pg = CmsPage.new
      @pg.template = CmsTemplate.find_by_name('Search') || CmsTemplate.new
      @page_title = 'Search Results'
      
      load_page_objects or return
      
      @page_objects['obj-text-search_results'] = render_to_string(partial: 'search')
      
      render inline: render_cms_page_to_string(@pg)
    end
    
    def rss_feed
      min_time = Time.rfc2822(request.env["HTTP_IF_MODIFIED_SINCE"]) rescue nil
      if min_time && (Time.now - min_time) < 5.minutes
        render text: '', status: '304 Not Modified' and return
      end
      
      @@cms_page_table_exists ||= CmsPage.table_exists?
      return not_found unless @@cms_page_table_exists
      
      @pg = CmsPage.find_by_id(params[:page_id])
      render nothing: true and return unless @pg && params[:page_list_name]
      key = "obj-page_list-#{params[:page_list_name].gsub(/[^\w]/, '_')}"
      
      load_page_objects or return false
      
      # populate @page_list_pages
      render_cms_page_to_string(@pg)
      
      @pages = @page_list_pages[key].first(20) rescue []  # why only first 20?
      @page_contents = {}
      
      unless @pages.empty?
        @most_recent_pub_date = @pages.first
        @pages.each { |pg| most_recent_pub_date = pg if pg.published_date > @most_recent_pub_date.published_date }
        
        if min_time && @most_recent_pub_date.published_date && @most_recent_pub_date.published_date <= min_time
          # use cached version
          render text: '', status: '304 Not Modified' and return
        end
        
        @pages.each_with_index do |page, index|
          @page_contents[page.id] = render_to_string :inline => substitute_placeholders(@page_objects["#{key}-template"] || options[:template] || '', page, :index => index+1, :count => @pages.size)
        end
      end
      
      # send feed
      response.headers["Content-Type"] = "application/rss+xml"
      response.headers["Last-Modified"] = (@pages.first.published_date.httpdate rescue Time.now).to_s
      
      render 'rss_feed.xml', :layout => false
    end
    
    def preview_template
      @pg = CmsPage.new
      @pg.template = CmsTemplate.new
      @pg.template.name = (params[:temp] || params[:snip])[:name] || 'New Template'
      @pg.template.content = (params[:temp] || params[:snip])[:content]
      @page_objects = HashObject.new
      render :inline => substitute_placeholders(@pg.template.content, @pg), :layout => 'application'
    end
    
    def page_list_calendar
      @pg = CmsPage.find(params[:id])
      load_page_objects or return true
      
      @month = (params[:month] || Time.now.month).to_i
      @year = (params[:year] || Time.now.year).to_i
      @key = params[:key]
      first_of_month = Time.mktime(@year, @month, 1)
      last_of_month = first_of_month.end_of_month
      
      @css_prefix = params[:css_prefix] || 'calendar_'
      
      events = page_list_items(@pg, @key, :start_date => first_of_month, :end_date => last_of_month)
      
      @event_days = {}
      events.each do |e|
        if e.article_date
          event_start = e.article_date.mday
          if e.article_end_date
            event_end = e.article_end_date > last_of_month ? last_of_month.mday : e.article_end_date.mday
          else
            event_end = event_start
          end
          
          for index in event_start..event_end
            @event_days[index] ||= ''
            @event_days[index] << erb_render(substitute_placeholders(@page_objects["#{@key}-template"], e))
          end
          
        end
      end
      @event_days.each do |index, val|
        @event_days[index] = (@page_objects["#{@key}-header"] || '') + val + (@page_objects["#{@key}-footer"] || '')
      end
      
      render :update do |page|
        page.replace_html "page_list_calendar_#{@key}_month_year", :partial => 'page_list_calendar_month_year'
        page.replace_html "page_list_calendar_#{@key}_days", :partial => 'page_list_calendar_days'
      end
    end
    
    
    protected
    
    def render_cms_page_to_string(page)
      # sanitize possibly dangerous content before rendering
      template_content = substitute_placeholders(page.template.content, page)
      template_content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      # silence do
        template_content = render_to_string(:inline => template_content,
                                            :locals => { :page => page, :safe_level => 0 })
      # end
      
      template_content = substitute_placeholders(template_content, page)
      template_content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      template_content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      # silence do
        template_content = render_to_string(:inline => template_content,
                                            :layout => 'application',
                                            :locals => { :page => page })
      # end
      
      template_content
    end
    
  end
end
