module ActionControllerExtensions
  module ClassMethods
  end
  
  module InstanceMethods
    
    # Saves the current request to the session so that it can be replayed later
    # (for example, after authentication). Only params of type String, Hash and
    # Array will be saved. save_request is called in a before_filter in
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
        if User.find(:all).size == 0
          flash[:notice] = 'No users exist in the system. Please create one now.'
          redirect_to :controller => '/management/user', :action => 'create_first'
        else
          flash[:notice] = 'This is an admin-only function. To continue, please log in.'
          save_user_request
          redirect_to :controller => '/management/user', :action => 'login'
        end
        
        return false
      end
      
      @user = User.find(session[:user_id]) rescue nil
      session[:user_is_superuser] = @user.is_superuser rescue nil
      
      @user
    end
    
    # Takes a symbol/string or array of symbols/strings and returns true if user has all
    # of the named permissions.
    #
    # Result is stored in the session to speed up future checks.
    def user_has_permissions?(*permission_set)
      return false if !(@user ||= authenticate_user)
      
      if !permission_set.is_a? Array
        permission_set = [ permission_set ]
      end
      
      if session[:user_is_superuser]
        for perm in permission_set
          perm = perm.to_s
          session[('user_can_' + perm).to_sym] ||= true
        end
        return true
      end
      
      for perm in permission_set
        perm = perm.to_s
        session[('user_can_' + perm).to_sym] = @user.send('can_' + perm)
        # logger.debug "user_can_#{perm} = #{@user.send('can_' + perm)}"
        return session[('user_can_' + perm).to_sym]
      end
    end
    alias :user_has_permission? :user_has_permissions?
    
    # Determines whether the input string is a valid email address per RFC specification
    def valid_email_address?(addr, perform_mx_lookup = false)
      valid = true
      
      # simplified regex for speed... the original can basically lock up the system on longish addresses
      # valid = valid && addr.to_s =~ /\A([\w\d]+(?:[\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]*[\w\d]+)*)@((?:[\w\d]+(?:[-]*[\w\d]+)*\.)+[\w]{2,})\z/
      valid = valid && addr.to_s =~ /\A([\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]+)@((?:[\w\d]+(?:[-]*[\w\d]+)*\.)+[\w]{2,})\z/
      user, host = $1, $2
      
      # blacklist
      # return false if ContactEmailBlacklist.include?(addr.to_s.strip)
      
      if perform_mx_lookup
        begin
          # require 'net/dns'
          res = Net::DNS::Resolver.new
          valid = valid && res.mx(host).size > 0
        rescue Exception => e
          logger.error(e)
        end
      end
      
      valid
    end
    
    ### COMPAT: convert_content_path
    def convert_content_path
      logger.debug "DEPRECATION WARNING (Imagine CMS) WARNING: convert_content_path called"
      params[:content_path] = params[:content_path].to_s.split('/') rescue []
    end
    
    ### COMPAT - template_exists?
    def template_exists?(template, extension = nil)
      # ignore extension
      logger.debug("DEPRECATION WARNING (Imagine CMS) WARNING: template_exists? called")
      partial = File.join(File.dirname(template), '_' + File.basename(template))
      lookup_context.find_all(template).any? || lookup_context.find_all(partial).any?
    end
    
    ### COMPAT - template_exists?
    def url_for_current
      logger.debug("DEPRECATION WARNING (Imagine CMS) WARNING: url_for_current called")
      request.fullpath
    end
    
    # Returns the first non-empty string in its arg list. Clearly, depends on nil_empty plugin.
    def first_non_empty(*args)
      while !args.empty?
        ret = args.shift
        return ret unless ret.to_s.empty?
      end
      return ''
    end
    
    ### COMPAT - log_error
    def log_error(e)
      # noop
      logger.debug("DEPRECATION WARNING (Imagine CMS) WARNING: log_error called")
      logger.error(e)
    end
    
    # Returns true if the user is editing the current page.
    # (This just means that we are rendering :controller => 'management/cms', :action => 'edit_page_content'.)
    def is_editing_page?
      params[:controller] == 'management/cms' && params[:action] == 'edit_page_content'
    end
    
    def convert_invalid_chars_in_params
      dig_deep(params) { |s| convert_invalid_chars!(s) }
    end
    
    def dig_deep(hash, &block)
      if hash.instance_of? String
        yield(hash)
      elsif hash.kind_of? Hash
        hash.each_key { |h| dig_deep(hash[h]) { |s| block.call(s) } }
      else
        nil
      end
    end
    
    def convert_invalid_chars!(s)
      # leave commented out until we're sure these are still needed
      
      # s.gsub!(/\xe2\x80\x98/, '&lsquo;')  # ‘
      # s.gsub!(/\xe2\x80\x99/, '&rsquo;')  # ’
      # s.gsub!(/\xe2\x80\x9c/, '&ldquo;')  # “
      # s.gsub!(/\xe2\x80\x9d/, '&rdquo;')  # ”
      # s.gsub!(/\xe2\x80\x93/, '&ndash;')  # –
      # s.gsub!(/\xe2\x80\x94/, '&mdash;')  # —
      # s.gsub!(/\xe2\x80\xa2/, '&bull;')   # •
      # s.gsub!(/\xe2\x80\xa6/, '&hellip;') # …
      # s.gsub!(/\xe2\x80\xa8/, '&nbsp;')   # (space)
      # s.gsub!(/\xe2\x84\xa2/, '&trade;')  # ™
      # 
      # s.gsub!(/\xc2\xae/, '&reg;')    # ®
      # s.gsub!(/\xc2\xab/, '&laquo;')  # «
      # s.gsub!(/\xc2\xbb/, '&raquo;')  # »
      # s.gsub!(/\xc2\xbd/, '&frac12;') # ½
      # s.gsub!(/\xc2\xbc/, '&frac14;') # ¼
      # 
      # s.gsub!(/\xc4\x80/, '&#x100;')  # Ā
      # s.gsub!(/\xc4\x81/, '&#x101;')  # ā
      # s.gsub!(/\xc4\x92/, '&#x112;')  # Ē
      # s.gsub!(/\xc4\x93/, '&#x113;')  # ē
      # s.gsub!(/\xc4\xaa/, '&#x12A;')  # Ī
      # s.gsub!(/\xc4\xab/, '&#x12B;')  # ī
      # s.gsub!(/\xc5\x8c/, '&#x14C;')  # Ō
      # s.gsub!(/\xc5\x8d/, '&#x14D;')  # ō
      # s.gsub!(/\xc5\xaa/, '&#x16A;')  # Ū
      # s.gsub!(/\xc5\xab/, '&#x16B;')  # ū
      # 
      # s.gsub!(/\xc3\x84/, '&Auml;') # Ä
      # s.gsub!(/\xc3\x8b/, '&Euml;') # Ë
      # s.gsub!(/\xc3\x8f/, '&Iuml;') # Ï
      # s.gsub!(/\xc3\x96/, '&Ouml;') # Ö
      # s.gsub!(/\xc3\x9c/, '&Uuml;') # Ü
      # s.gsub!(/\xc3\xa4/, '&auml;') # ä
      # s.gsub!(/\xc3\xab/, '&euml;') # ë
      # s.gsub!(/\xc3\xaf/, '&iuml;') # ï
      # s.gsub!(/\xc3\xb6/, '&ouml;') # ö
      # s.gsub!(/\xc3\xbc/, '&uuml;') # ü
      # 
      # s.gsub!(/\xc3\x81/, '&Aacute;') # Á
      # s.gsub!(/\xc3\x89/, '&Eacute;') # É
      # s.gsub!(/\xc3\x8d/, '&Iacute;') # Í
      # s.gsub!(/\xc3\x93/, '&Oacute;') # Ó
      # s.gsub!(/\xc3\x9a/, '&Uacute;') # Ú
      # s.gsub!(/\xc3\xa1/, '&aacute;') # á
      # s.gsub!(/\xc3\xa9/, '&eacute;') # é
      # s.gsub!(/\xc3\xad/, '&iacute;') # í
      # s.gsub!(/\xc3\xb3/, '&oacute;') # ó
      # s.gsub!(/\xc3\xba/, '&uacute;') # ú
      # 
      # s.gsub!(/\xc5\x98/, '&#x158;') # Ř
      # s.gsub!(/\xc5\x99/, '&#x159;') # ř
      # 
      # s.gsub!(/\x85/, '&hellip;') # …
      # s.gsub!(/\x8b/, '&lt;')     # <
      # s.gsub!(/\x9b/, '&gt;')     # >
      # s.gsub!(/\x91/, '&lsquo;')  # ‘
      # s.gsub!(/\x92/, '&rsquo;')  # ’
      # s.gsub!(/\x93/, '&ldquo;')  # “
      # s.gsub!(/\x94/, '&rdquo;')  # ”
      # s.gsub!(/\x97/, '&mdash;')  # —
      # s.gsub!(/\x99/, '&trade;')  # ™
      # s.gsub!(/\x95/, '*')
      # s.gsub!(/\x96/, '-')
      # s.gsub!(/\x98/, '~')
      # s.gsub!(/\x88/, '^')
      # s.gsub!(/\x82/, ',')
      # s.gsub!(/\x84/, ',,')
      # s.gsub!(/\x89/, 'o/oo')
      # s.gsub!(/\x8c/, 'OE')
      # s.gsub!(/\x9c/, 'oe')
    end
    
    # Convert from GMT/UTC to local time (based on time zone setting in session[:time_zone])
    def gm_to_local(time)
      ActiveSupport::TimeZone.new(session[:time_zone] || 'UTC').utc_to_local(time)
    end
    
    # Convert from local time to GMT/UTC (based on time zone setting in session[:time_zone])
    def local_to_gm(time)
      ActiveSupport::TimeZone.new(session[:time_zone] || 'UTC').local_to_utc(time)
    end
    
    # Convert a time object into a formatted date/time string
    def ts_to_str(ts)
      return '' if ts == nil
      gm_to_local(ts).strftime('%a %b %d, %Y') + ' at ' +
        gm_to_local(ts).strftime('%I:%M%p').downcase + ' ' + (session[:time_zone_abbr] || '')
    end
    
    # Convert a time object into a formatted time string (no date)
    def ts_to_time_str(ts)
      return '' if ts == nil
      gm_to_local(ts).strftime('%I:%M:%S%p').downcase
    end
    
    # Convert times to a standard format (e.g. 1:35pm)
    def time_to_str(t, convert = true)
      return '' if t == nil
      if convert
        gm_to_local(t).strftime("%I").to_i.to_s + gm_to_local(t).strftime(":%M%p").downcase
      else
        t.strftime("%I").to_i.to_s + t.strftime(":%M%p").downcase
      end
    end
    
    # Convert times to a standard format (e.g. 1:35pm)
    def date_to_str(t, convert = true)
      return '' if t == nil
      if convert
        gm_to_local(t).strftime("%m").to_i.to_s + '/' + gm_to_local(t).strftime("%d").to_i.to_s + gm_to_local(t).strftime("/%Y")
      else
        t.strftime("%m").to_i.to_s + '/' + t.strftime("%d").to_i.to_s + t.strftime("/%Y")
      end
    end
    
    
    
    #
    # For CMS integration
    #
  
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
        content = auto_link(content, :all, :target => '_blank') unless options[:disable_auto_link]
        content_tag :span, content, html_options
      when :text
        content = substitute_placeholders(@page_objects[key] || '', @pg)
        content = erb_render(content)
        # content = auto_link(content, :all, :target => '_blank') unless options[:disable_auto_link]
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
          today = Time.mktime(Time.now.year, Time.now.month, Time.now.day)
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
          @page_objects["#{key}-template"] = options[:template] if @page_objects["#{key}-template"].empty?
          
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
        gallery_dir = File.join('images', 'content', @pg.path, File.basename(name))
        Dir.chdir(File.join(Rails.root, 'public'))
        all_images = Dir.glob("#{gallery_dir}/*.{jpg,jpeg,png,gif}")
        Dir.chdir(Rails.root)
        all_images.sort! { |a,b| File.basename(a).to_i <=> File.basename(b).to_i }
        images = all_images.reject { |img| img =~ /-thumb/ }
        thumbs = all_images.reject { |img| img !~ /-thumb/ }
        render_to_string(:partial => 'photo_gallery', :locals => { :name => name, :images => images, :thumbs => thumbs }).html_safe
      end
    end
    
    def erb_render(content, safe_level = 3, rethrow_exceptions = false)
      # sanitize possibly dangerous content before rendering
      content.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      content.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      content.gsub!(/<(%.*?\`.*?\s*%)>/, '&lt;\1&gt;')
      
      render_to_string(:inline => content).html_safe
    end
    
    def load_page_objects(obj_type = nil, name = nil)
      if params[:version].to_i > 0 && params[:version].to_i != @pg.published_version
        if is_logged_in_user?
          if user_has_permission?(:manage_cms)
            @pg.revert_to(params[:version].to_i)
          end
        else
          authenticate_user
          return false
        end
      elsif @pg.version != @pg.published_version
        @pg.revert_to(@pg.published_version)
      end
      
      @page_objects = HashObject.new
      conditions = [ 'cms_page_version = ?' ]
      cond_vars = [ @pg.version ]
      
      if obj_type
        conditions << 'obj_type = ?'
        cond_vars << obj_type
      end
      if name
        conditions << 'name = ?'
        cond_vars << name
      end
      
      @pg.objects.find(:all, :conditions => [ conditions.join(' and ') ].concat(cond_vars)).each do |obj|
        @page_objects["obj-#{obj.obj_type.to_s}-#{obj.name}"] = obj.content
      end
    end
    
    def page_list_items(pg, key, options = {})
      pages = []
      instance_tags_include = []
      instance_tags_exclude = []
      instance_tags_require = []
      
      conditions = [ 'cms_pages.published_version >= 0', 'cms_pages.published_date is not null', 'cms_pages.published_date < NOW()' ]
      cond_vars = []
      
      if options[:start_date]
        options[:start_date] = Time.parse(options[:start_date]) if options[:start_date].is_a? String
        conditions << 'cms_pages.article_date >= ?'
        cond_vars << options[:start_date]
      end
      if options[:end_date]
        options[:end_date] = Time.parse(options[:end_date]) if options[:end_date].is_a? String
        conditions << 'cms_pages.article_date < ?'
        cond_vars << (options[:end_date] + 1.day)
      end
      
      @page_objects["#{key}-sources-tag-count"] = @page_objects["#{key}-sources-tag-count"].to_i
      
      for i in 0...@page_objects["#{key}-sources-tag-count"]
        case @page_objects["#{key}-sources-tag#{i}-behavior"]
        when 'include'
          instance_tags_include << @page_objects["#{key}-sources-tag#{i}"]
        when 'exclude'
          instance_tags_exclude << @page_objects["#{key}-sources-tag#{i}"]
        when 'require'
          instance_tags_require << @page_objects["#{key}-sources-tag#{i}"]
        end
      end
      include_tags = instance_tags_include.map { |t| t.strip }.reject { |t| t.empty? }
      exclude_tags = instance_tags_exclude.map { |t| t.strip }.reject { |t| t.empty? }
      require_tags = instance_tags_require.map { |t| t.strip }.reject { |t| t.empty? }
      
      if include_tags.empty?
        include_tags = (options[:include_tags] || '').split(',').map { |t| t.strip }.reject { |t| t.empty? }
        include_tags.each do |t|
          i = @page_objects["#{key}-sources-tag-count"]
          @page_objects["#{key}-sources-tag#{i}"] = t
          @page_objects["#{key}-sources-tag#{i}-behavior"] = 'include'
          @page_objects["#{key}-sources-tag-count"] += 1
        end
      end
      if exclude_tags.empty?
        exclude_tags = (options[:exclude_tags] || '').split(',').map { |t| t.strip }.reject { |t| t.empty? }
        exclude_tags.each do |t|
          i = @page_objects["#{key}-sources-tag-count"]
          @page_objects["#{key}-sources-tag#{i}"] = t
          @page_objects["#{key}-sources-tag#{i}-behavior"] = 'exclude'
          @page_objects["#{key}-sources-tag-count"] += 1
        end
      end
      if require_tags.empty?
        require_tags = (options[:require_tags] || '').split(',').map { |t| t.strip }.reject { |t| t.empty? }
        require_tags.each do |t|
          i = @page_objects["#{key}-sources-tag-count"]
          @page_objects["#{key}-sources-tag#{i}"] = t
          @page_objects["#{key}-sources-tag#{i}-behavior"] = 'require'
          @page_objects["#{key}-sources-tag-count"] += 1
        end
      end
      
      # pull all folder content
      folders = []
      for i in 0...@page_objects["#{key}-sources-folder-count"].to_i
        folders << HashObject.new(:src => @page_objects["#{key}-sources-folder#{i}"].strip,
                                  :expand_folders => @page_objects["#{key}-sources-folder#{i}-expand-folders"])
      end
      folders = folders.reject { |f| f.src.empty? }
      
      if folders.empty?
        folders = (options[:folders] || '').split(',').map do |f|
          bits = f.strip.split(':')
          
          obj = HashObject.new
          obj.src = bits[0]
          obj.expand_folders = 'true'
          
          while bit = bits.shift
            case bit
            when 'expand-folders'
              ;
            when 'no-expand-folders'
              obj.expand_folders = 'false'
            end
          end
          
          obj
        end
        folders = folders.reject { |f| f.src.empty? }
        
        @page_objects["#{key}-sources-folder-count"] = folders.size
        folders.each_with_index do |f, i|
          @page_objects["#{key}-sources-folder#{i}"] = f.src
          @page_objects["#{key}-sources-folder#{i}-expand-folders"] = f.expand_folders
        end
      end
      
      # exclude expired items if specified
      if @page_objects["#{key}-include-expired"]
        if @page_objects["#{key}-include-expired"] == 'false'
          conditions << '(cms_pages.expires = ? OR (cms_pages.expires = ? AND cms_pages.expiration_date >= ?))'
          cond_vars << false
          cond_vars << true
          cond_vars << Time.now
        end
      end
      
      folders.each do |f|
        begin
          if f.expand_folders && f.expand_folders == 'false'
            f.src = f.src.slice(1...f.src.length) if f.src.slice(0,1) == '/'
            parent_page = CmsPage.find_by_path(f.src)
            pages.concat parent_page.children.find(:all, :include => [ :tags ], :conditions => [ conditions.join(' and ') ].concat(cond_vars))
          else
            if f.src == '/'
              pages.concat CmsPage.find(:all, :include => [ :tags ], :conditions => [ conditions.join(' and ') ].concat(cond_vars))
            else
              f.src = f.src.slice(1...f.src.length) if f.src.slice(0,1) == '/'
              fconditions = conditions.dup
              fconditions << 'path like ?'
              fcond_vars = cond_vars.dup
              fcond_vars << f.src+'/%'
              pages.concat CmsPage.find(:all, :include => [ :tags ], :conditions => [ fconditions.join(' and ') ].concat(fcond_vars))
            end
          end
        rescue Exception => e
          logger.debug e
        end
      end
      
      # pull all include tag content
      include_tags.each do |tag|
        pages.concat CmsPageTag.find_all_by_name(tag, :include => [ :page ], :conditions => [ conditions.join(' and ') ].concat(cond_vars)).map { |cpt| cpt.page }
      end
      
      # dump anything that has an excluded tag
      exclude_tags.each do |tag|
        pages.reject! { |page| page.tags.reject { |t| t.name != tag } != [] }
      end
      
      # dump anything that does not have a required tag
      require_tags.each do |tag|
        pages.reject! { |page| page.tags.reject { |t| t.name != tag } == [] }
      end
      
      if pg && (options[:exclude_current] === true || @page_objects["#{key}-exclude-current"] == 'true')
        pages.reject! { |page| page == pg }
      end
      
      # set some reasonable defaults in case the sort keys are nil
      pages.each { |pg| pg.article_date ||= Time.now; pg.position ||= 0; pg.title ||= '' }
      pri_sort_key = first_non_empty(@page_objects["#{key}-sort-first-field"], options[:primary_sort_key], 'article_date')
      pri_sort_dir = first_non_empty(@page_objects["#{key}-sort-first-direction"], options[:primary_sort_direction], 'asc')
      sec_sort_key = first_non_empty(@page_objects["#{key}-sort-second-field"], options[:secondary_sort_key], 'position')
      sec_sort_dir = first_non_empty(@page_objects["#{key}-sort-second-direction"], options[:secondary_sort_direction], 'asc')
      @page_objects["#{key}-sort-first-field"] ||= pri_sort_key
      @page_objects["#{key}-sort-first-direction"] ||= pri_sort_dir
      @page_objects["#{key}-sort-second-field"] ||= sec_sort_key
      @page_objects["#{key}-sort-second-direction"] ||= sec_sort_dir
      
      keys_with_dir = [ [ pri_sort_key, pri_sort_dir ], [ sec_sort_key, sec_sort_dir ] ]
      pages.sort! do |a,b|
        index = 0
        result = 0
        while result == 0 && index < keys_with_dir.size
          key = keys_with_dir[index][0]
          aval = a.send(key)
          bval = b.send(key)
          
          if !aval
            result = 1
          elsif !bval
            result = -1
          else
            result = aval <=> bval
          end
          
          result *= -1 if keys_with_dir[index][1] && keys_with_dir[index][1].downcase == 'desc'
          index += 1
        end
        
        result
      end
      
      offset = first_non_empty(@page_objects["#{key}-item-offset"], options[:item_offset], 0).to_i
      pages = pages[offset, pages.size] || []
      
      # randomize if requested
      randomize = first_non_empty(@page_objects["#{key}-use-randomization"], options[:use_randomization], 'false').to_s == 'true'
      random_pool_size = first_non_empty(@page_objects["#{key}-random-pool-size"], options[:random_pool_size], '').to_i
      if randomize
        if random_pool_size > 0
          pages = pages.first(random_pool_size)
        end
        
        n = pages.length
        for i in 0...n
          r = rand(n-1).floor
          pages[r], pages[i] = pages[i], pages[r]
        end
      end
      
      pages
    end
    
    def substitute_placeholders(html, page, extra_attributes = {})
      return html unless page
      
      temp = html.dup
      
      # mangle anything inside of an insert_object so that it won't be caught (yet)
      temp.gsub!(/(insert_object\()((?:\(.*?\)|[^()]*?)*)(\))/) do |match|
        one, two, three = $1, $2, $3
        one + two.gsub(/<#/, '<!#') + three
      end
      
      # first, extras passed in args
      extra_attributes.each do |k,v|
        temp.gsub!(/<#\s*#{k.to_s}\s*#>/, v.to_s)
      end
      
      # next, page object attributes and template options (from page properties)
      page.objects.find(:all, :conditions => [ "obj_type = 'attribute'" ]).each do |obj|
        temp.gsub!(/<#\s*#{obj.name}\s*#>/, (obj.content || '').to_s)
      end
      page.objects.find(:all, :conditions => [ "obj_type = 'option'" ]).each do |obj|
        temp.gsub!(/<#\s*option_#{obj.name.gsub(/[^\w\d]/, '_')}\s*#>/, obj.content || '')
      end
      
      # path is kind of a special case, we like to see it with a leading /
      temp.gsub!(/<#\s*path\s*#>/, '/' + (page.path || ''))
      
      # substitute tags in a helpful way
      temp.gsub!(/<#\s*tags\s*#>/, page.tags.map { |t| t.name }.join(', '))
      temp.gsub!(/<#\s*tags_as_css_classes\s*#>/, page.tags_as_css_classes)
      
      # use full date/time format for created_on and updated_on
      temp.gsub!(/<#\s*created_on\s*#>/, "#{page.created_on.getlocal.strftime('%a')} #{date_to_str(page.created_on)} #{time_to_str(page.created_on)}") if page.created_on
      temp.gsub!(/<#\s*updated_on\s*#>/, "#{page.updated_on.getlocal.strftime('%a')} #{date_to_str(page.updated_on)} #{time_to_str(page.updated_on)}") if page.updated_on
      
      # handle any custom substitutions
      temp = substitute_placeholders_custom(temp, page)
      
      # finally, toss in the rest of the generic class attributes
      (page.attributes.map { |c| c.first } +
      [ 'article_date_month', 'article_date_mon', 'article_date_day', 'article_date_year', 'article_date_yr' ]).each do |attr|
        begin
          val = page.send(attr.downcase.underscore)
          case val.class.to_s
          when 'String'
            val
          when 'Time'
            val = val.strftime("(%a) ") + val.strftime("%B ") + val.day.to_s + val.strftime(", %Y")
          when 'NilClass'
            val = ''
          else
            # logger.error "#{attr} (#{val.class}): #{val}"
          end
        rescue
          # val = '<!-- attribute not found -->'
          val = ''
        end
        temp.gsub!(/<#\s*#{attr}\s*#>/, val.to_s)
      end
      # temp.gsub!(/<#\s*(.*?)\s*#>/, "<!-- attribute not found -->")
      temp.gsub!(/<#\s*(.*?)\s*#>/, '')
      
      # unmangle mangled stuff
      temp.gsub!(/(insert_object\()((?:\(.*?\)|[^()]*?)*)(\))/) do |match|
        one, two, three = $1, $2, $3
        one + two.gsub(/<!#/, '<#') + three
      end
      
      temp
    end
    
    # override this method to do your own custom subtitutions
    def substitute_placeholders_custom(temp, page)
      # an example:
      # begin
      #   temp.gsub!(/<#\s*upcoming_event_date\s*#>/, page.article_date.strftime("<span class=\"month\">%b</span><span class=\"day\">%d</span>"))
      # rescue
      # end
      
      # remember to return your modified copy of temp
      temp
    end
    
    
    def template_option(name, type = :string)
      return nil unless @pg
      
      @template_options ||= {}
      @template_options[name] = type
      
      key = name.gsub(/[^\w\d]/, '_')
      obj = @pg.objects.find_by_name("#{type}-#{key}", :conditions => [ "obj_type = 'option'" ])
      return nil unless obj
      
      case type
      when :checkbox
        obj.content == "1"
      else
        obj.content
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
          content << "<td><div"
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
          content << ">#{seg+1}</div></td>"
        end
        content << '</tr></table>'
      end
      
      if options[:wrapper_div]
        content_tag :div, erb_render(content), html_options.update(:id => key)
      else
        erb_render(content)
      end
    end
    
    def breadcrumbs(options = {})
      # only works on CCS pages
      if @pg
        separator = options.delete(:separator) || ' &raquo; '
        link_class = options.delete(:link_class)
        
        pg = @pg
        ret = pg.title
        
        while pg = pg.parent
          if pg.published_version >= 0
            ret = "<a href=\"/#{pg.path}\" class=\"#{link_class}\">#{pg.title}</a>" + separator + ret
          end
        end
        
        return ret
      else
        return ''
      end
    end
    
  end
end
