module Cms # :nodoc:
  class ContentController < ::ApplicationController # :nodoc:
    caches_action :rss_feed
    helper CmsApplicationHelper
    
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
      logger.error "404 from #{request.referer}"
      render :template => 'errors/404', :status => 404
    end
    
    def show_from_db
      false
    end
    
    ### COMPAT: convert_content_path
    def convert_content_path
      logger.debug "DEPRECATION WARNING: convert_content_path called"
      params[:content_path] = params[:content_path].to_s.split('/')
    end
    
    ### COMPAT - template_exists?
    def template_exists?(template, extension = nil)
      # ignore extension
      logger.debug("DEPRECATION WARNING: template_exists? called")
      lookup_context.find_all(template).any?
    end
    helper_method :template_exists?
    
    def url_for_current
      request.fullpath
    end
    helper_method :url_for_current
    
    ### COMPAT - log_error
    def log_error(e)
      # noop
      logger.debug("DEPRECATION WARNING: log_error called")
      logger.error(e)
    end
    
  end
end
