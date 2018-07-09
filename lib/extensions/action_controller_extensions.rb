module ActionControllerExtensions
  
  module ClassMethods
  end
  
  module InstanceMethods
    
    # Takes a symbol/string or array of symbols/strings and returns true if user has all
    # of the named permissions.
    def user_has_permissions?(*permission_set)
      @user ||= authenticate_user
      return false unless @user
      return true if @user.is_superuser?
      
      permission_set = [ permission_set ] unless permission_set.is_a?(Array)
      
      if session[:user_is_superuser]
        permission_set.each { |perm| session["user_can_#{perm}".to_sym] = true }
        return true
      end
      
      has_permissions = true
      permission_set.each do |perm|
        session["user_can_#{perm}".to_sym] = (@user.send("can_#{perm}").to_i == 1)
        has_permissions = has_permissions && session["user_can_#{perm}".to_sym]
      end
      
      has_permissions
    end
    alias :user_has_permission? :user_has_permissions?
    
    # Saves the current request to the session so that it can be replayed later
    # (for example, after authentication). Only params of type String, Hash and
    # Array will be saved. save_request is called in a before_action in
    # application.rb.
    #
    # Two levels of saved params are required so that params can be unsaved in
    # the event of a 404 or other event that would make the current param set an
    # unlikely or undesirable candidate for replaying.
    def save_user_request
      return if params[:action] == 'login'
      
      session[:old_saved_user_uri] = session[:saved_user_uri];
      session[:old_saved_user_params] = session[:saved_user_params] || {};
      saved_params = params.reject { |k, v| !(v.kind_of?(String) || v.kind_of?(Hash) || v.kind_of?(Array)) }
      saved_params.each { |key, val| saved_params[key] = val.reject { |k, v| !(v.kind_of?(String) || v.kind_of?(Hash) || v.kind_of?(Array)) } if val.kind_of?(Hash) }
      session[:saved_user_uri] = request.url
      session[:saved_user_params] = saved_params
    end
    
    # Returns a User object corresponding to the currently logged in user, or returns false
    # and redirects to the login page if not logged in.
    def authenticate_user
      # if user is not logged in, record the current request and redirect
      if !session[:user_authenticated]
        flash[:notice] = 'This is an admin-only function. To continue, please log in.'
        save_user_request
        redirect_to :controller => '/management/user', :action => 'login' and return false
      end
      
      @user = User.find(session[:user_id]) rescue nil
      session[:user_is_superuser] = @user.is_superuser? rescue nil
      
      @user
    end
    
    def expire_session_data # :nodoc:
      # make sure this is not the first run (session being initialized)
      if session[:last_active]
        # expire session data as necessary
        #
        # idle_time = Time.now - session[:last_active]
        #
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
    
    # shortcuts
    def text_editor(name, options = {}, html_options = {})
      insert_object(name, :text, options, html_options)
    end
    alias :texteditor :text_editor
    def page_list(name, options = {}, html_options = {})
      insert_object(name, :page_list, options, html_options)
    end
    alias :pagelist :page_list
    def snippet(name, options = {}, html_options = {})
      insert_object(name, :snippet, options, html_options)
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
      Rails.logger.info "Number of page list segments: #{num_segments}"
      if first_non_empty(options[:use_pagination], @page_objects["#{key}-use-pagination"], 0).to_i == 1 && num_segments > 1
        content << '<div class="imagine_cms-paginator">'
        content << 'Page:&nbsp;'
        num_segments.times do |seg|
          start = seg * limit
          content << "<a id=\"#{key}-segment-#{seg}\" href=\"#\""
          if offset >= start && offset < (start + limit)
            content << " class=\"imagine_cms-paginator-link imagine_cms-paginator-link-selected\""
          else
            content << " class=\"imagine_cms-paginator-link\""
          end
          content << ">#{seg+1}</a>"
        end
        content << '</div>'
        content << <<-EOT
<script type="text/javascript">
  jQuery('##{key}').css({ opacity: '1', cursor: 'default' });
  jQuery('.imagine_cms-paginator-link').not('.imagine_cms-paginator-link-selected').mouseover(function () {
    jQuery(this).addClass('imagine_cms-paginator-link-selected');
  }).mouseout(function () {
    jQuery(this).removeClass('imagine_cms-paginator-link-selected');
  });
  
EOT
        num_segments.times do |seg|
          start = seg * limit
          content << <<-EOT
  jQuery('##{key}-segment-#{seg}').click(function () {
    jQuery('##{key}').css({ cursor: 'wait', opacity: '0.5' });
    jQuery('html,body').animate({ scrollTop: jQuery('##{key}').position().top }, 200);
    jQuery.get('#{url_for(:content_path => @pg.path.split('/').concat([ 'segment', start.to_s, name ]), :only_path => true)}', function (data) {
      jQuery('##{key}').html(data);
      jQuery('##{key}').css({ cursor: 'default', opacity: '1' });
    });
    return false;
  })
EOT
        end
        content << <<-EOT
</script>
EOT
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
