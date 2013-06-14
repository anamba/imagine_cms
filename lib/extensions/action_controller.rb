module ActionControllerExtensions
  
  module ClassMethods
  end
  
  module InstanceMethods
    def expire_session_data # :nodoc:
      # make sure this is not the first run (session being initialized)
      if session[:last_active]
        idle_time = Time.now - session[:last_active]
        
        # expire session data as necessary
        # session_data = session.instance_variable_get("@data")
        # session_data.select { |k,v| k.to_s !~ /_expiration$/ && v }.each do |k,v|
        #   idx = k.to_s + '_expiration'
        #   if (exp = (session[idx] || session[idx.to_sym]).to_i) > 0
        #     if idle_time > exp
        #       logger.debug "Expiring #{k} = #{v} (expiration #{exp} > idle time #{idle_time})"
        #       session[k] = nil
        #     else
        #       logger.debug "Retaining #{k} = #{v} (expiration #{exp} < idle time #{idle_time})"
        #     end
        #   else
        #     #logger.debug "Retaining #{k} = #{v} (does not expire)"
        #   end
        # end
      end
      
      # bump/set last active time
      session[:last_active] = Time.now
      if is_logged_in_user?
        cookies[:user_auth_status] = { :value => 'authenticated', :expires => 5.minutes.from_now }
      end
    end
    
    
    # valid options:
    # * :include_tags => 'tags, to, include'
    # * :exclude_tags => 'tags, to, exclude'
    def insert_object(name, type = :text, options = {}, html_options = {})
      extend ActionView::Helpers::TagHelper
      extend ActionView::Helpers::TextHelper
      
      @page_objects ||= {}
      
      key = "obj-#{type.to_s}-#{name.gsub(/[^\w]/, '_')}"
      case type.to_sym
      when :string
        content = substitute_placeholders(@page_objects[key] || '', @pg)
        content = erb_render(content)
        content = auto_link(content, :urls, :target => '_blank') unless options[:disable_auto_link]
        content = auto_link_email_addresses(content) unless options[:disable_auto_link]
        content_tag :span, content, html_options
      when :text
        content = substitute_placeholders(@page_objects[key] || '', @pg)
        content = erb_render(content)
        content = auto_link(content, :urls, :target => '_blank') unless options[:disable_auto_link]
        content = auto_link_email_addresses(content) unless options[:disable_auto_link]
        content_tag :div, content, html_options
      when :page_list
        @rss_feeds ||= []
        @rss_feeds << name
        
        case @page_objects["#{key}-style-display-as"]
        when 'calendar'
          pages = page_list_items(@pg, key, options).compact.uniq.
                    sort { |a,b| (a.position || 0) <=> (b.position || 0) }.
                    sort { |a,b| (b.article_date || b.published_date || Time.now) <=>
                                 (a.article_date || a.published_date || Time.now) }
          render :partial => 'page_list_calendar', :locals => { :key => key, :pages => pages }
        else  # display as 'list'
          today = Time.utc(Time.now.year, Time.now.month, Time.now.day)
          case @page_objects["#{key}-date-range"]
            when 'all'
            when 'past'
              options[:end_date] ||= today
            when 'future'
              options[:start_date] ||= today
            when 'custom'
              options[:start_date] ||= @page_objects["#{key}-date-range-custom-start"]
              options[:end_date] ||= @page_objects["#{key}-date-range-custom-end"]
          end
          
          pages = page_list_items(@pg, key, options).compact.uniq
          
          options[:wrapper_div] = true
          
          # make options specified in snippets and templates accessible to
          # page list segments and rss feeds
          @page_objects["#{key}-template"] = options[:template] if @page_objects["#{key}-template"].blank?
          
          render_page_list_segment(name, pages, options, html_options)
        end
      when :snippet
        @snippet = CmsSnippet.find_by_name(name)
        if @snippet
          erb_render(substitute_placeholders(@snippet.content, @pg))
        else
          'Could not find snippet "' + name + '" in the database.'
        end
      when :photo_gallery
        gallery_dir = File.join('assets', 'content', @pg.path, File.basename(name))
        Dir.chdir(File.join(Rails.root, 'public'))
        all_images = Dir.glob("#{gallery_dir}/*.{jpg,jpeg,png,gif}")
        Dir.chdir(Rails.root)
        all_images.sort! { |a,b| File.basename(a).to_i <=> File.basename(b).to_i }
        images = all_images.reject { |img| img =~ /-thumb/ }
        thumbs = all_images.reject { |img| img !~ /-thumb/ }
        render_to_string(:partial => 'photo_gallery', :locals => { :name => name, :images => images, :thumbs => thumbs }).html_safe
      end
    end
    
    def render_page_list_segment(name, pages, options = {}, html_options = {})
      extend ActionView::Helpers::TagHelper
      extend ActionView::Helpers::TextHelper
      extend ActionView::Helpers::JavaScriptHelper
      extend ActionView::Helpers::PrototypeHelper
      
      key = "obj-page_list-#{name.gsub(/[^\w]/, '_')}"
      
      offset = first_non_empty(params[:offset], 0).to_i
      limit = first_non_empty(@page_objects["#{key}-max-item-count"], options[:item_count], pages.size).to_i
      limit = 1 if limit < 1
      page_subset = pages[offset, limit] || []
      
      content = ''
      content << substitute_placeholders(first_non_empty(@page_objects["#{key}-header"], options[:header]), @pg,
                                         :count => page_subset.size, :total => pages.size,
                                         :rss_feed_url => (@pg && @pg.id ? url_for(:action => 'rss_feed', :page_id => @pg.id,
                                                                         :page_list_name => name) : nil))
      if page_subset.empty?
        content << substitute_placeholders(first_non_empty(@page_objects["#{key}-empty_message"],
                                                           options[:empty_message],
                                                           'No pages found.'), @pg)
      else
        page_subset.each_with_index do |page, index|
          content << substitute_placeholders(first_non_empty(@page_objects["#{key}-template"], options[:template], ''), page,
                                             :index => index+1, :count => page_subset.size, :total => pages.size)
        end
      end
      
      content << substitute_placeholders(first_non_empty(@page_objects["#{key}-footer"], options[:footer]), @pg,
                                         :count => page_subset.size, :total => pages.size,
                                         :rss_feed_url => (@pg && @pg.id ? url_for(:action => 'rss_feed', :page_id => @pg.id,
                                                                         :page_list_name => name) : nil))
      
      num_segments = (pages.size.to_f / limit).ceil
      if @page_objects["#{key}-use-pagination"].to_i == 1 && num_segments > 1
        content << '<table style="margin-top: 4px;" align="right" cellpadding="0" cellspacing="0" border="0"><tr valign="bottom">'
        content << '<td>Page:&nbsp;</td>'
        num_segments.times do |seg|
          start = seg * limit
          content << "<td><a href=\"#\""
          if offset >= start && offset < (start + limit)
            content << " class=\"page_list_segment page_list_segment_selected\""
          else
            content << " class=\"page_list_segment\""
            content << " onmouseover=\"this.className = 'page_list_segment page_list_segment_selected'\""
            content << " onmouseout=\"this.className = 'page_list_segment'\""
            content << " onclick=\"this.style.cursor = 'wait';"
            content << remote_function(:update => key, :url => { :content_path => @pg.path.split('/').concat([ 'segment', start.to_s, name ]) })
            content << "; return false;\""
          end
          content << ">#{seg+1}</a></td>"
        end
        content << '</tr></table>'
      end
      
      if options[:wrapper_div]
        content_tag :div, erb_render(content), html_options.update(:id => key)
      else
        erb_render(content)
      end
    end
    
    def erb_render(content, safe_level = 3, rethrow_exceptions = false)
      # sanitize possibly dangerous content before rendering
      content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      render_to_string(:inline => content.to_s).html_safe
    end
    
  end
end
