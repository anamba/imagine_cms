module CmsApplicationHelper
  
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
  
  # Returns true if a Member is logged in.
  def is_logged_in?
    session[:authenticated]
  end
  
  # Returns true if a User is logged in.
  def is_logged_in_user?
    session[:user_authenticated]
  end
  
  # Returns true if the user is editing the current page.
  # (This just means that we are rendering :controller => 'management/cms', :action => 'edit_page_content'.)
  def is_editing_page?
    params[:controller] == 'management/cms' && params[:action] == 'edit_page_content'
  end
  
  # Determines whether the input string is a valid email address per RFC specification
  def valid_email_address?(addr, perform_mx_lookup = false)
    valid = true
    
    # simplified regex for speed... the original can basically lock up the system on longish addresses
    # valid = valid && addr.to_s =~ /\A([\w\d]+(?:[\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]*[\w\d]+)*)@((?:[\w\d]+(?:[-]*[\w\d]+)*\.)+[\w]{2,})\z/
    valid = valid && addr.to_s =~ /\A([\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]+)@((?:[\w\d]+(?:[-]*[\w\d]+)*\.)+[\w]{2,})\z/
    user, host = $1, $2
    
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
  
  
  
  def load_page_objects(obj_type = nil, name = nil)
    if params[:version].to_i > 0 && params[:version].to_i != @pg.published_version && !(@pg.published_version == 0 && params[:version].to_i == @pg.version)
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
    
    temp.html_safe
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
  
  # Get an array of all times, useful in select's (5 minute interval by default)
  def all_times_array(interval = 5)
    a = []
    (0..23).each do |h|
      (0..59).each do |m|
        next unless m % interval == 0
        t = Time.utc(2000, 1, 1, h, m)
        a << t.strftime("%I").to_i.to_s + t.strftime(":%M%p").downcase
      end
    end
    
    a
  end
  
  # Takes object_name and method_name as arguments (like other form helpers, such
  # as text_field) and returns html containing form_error.gif and form_loading.gif.
  # If there are no errors for the given field, form_error.gif is hidden using
  # style="display: none". If there are errors, form_error.gif is shown, and its
  # hover text lists the errors.
  def form_icons(object_name, method_name, options = {})
    object_name = object_name.to_s
    method_name = method_name.to_s
    
    ret = ''
    errors = []
    
    instance_variable_get("@#{object_name}").errors.each do |attr, msg|
      errors << msg if attr == method_name
    end
    
    options[:style] ||= ''
    
    if errors.size == 0
      options[:style] << 'display: none;'
    end
    
    ret << "<div id=\"#{object_name}_#{method_name}_error\" class=\"form-error\""
    ret << " style=\"#{options[:style]}\"" unless options[:style].blank?
    if errors.size > 0
      ret << " title=\"#{h errors.join('; ')}\""
    end
    ret << '><img src="/assets/interface/form_error.gif" width="17" height="17" border="0" />'
    ret << '</div>'
    
    ret << "<div id=\"#{object_name}_#{method_name}_loading\" class=\"form-loading\" style=\"display: none;\">"
    ret << "<img src=\"/assets/interface/form_loading.gif\" width=\"16\" height=\"16\" border=\"0\" style=\"margin: 0 1px 1px 0;\" />"
    ret << "</div>"
    
    if errors.size > 0 && options[:display_messages]
      options[:message_separator] ||= '<br/>'
      ret << "<div id=\"#{object_name}_#{method_name}_error_messages\" class=\"form-error-messages\">"
      ret << errors.join(options[:message_separator])
      ret << "</div>"
    end
    
    ret
  end
  
  def error_messages_for(object_name, options = {}) # :nodoc:
    options = options.symbolize_keys
    object = instance_variable_get("@#{object_name.to_s}")
    return '' unless object
    
    unless object.errors.empty?
      content_tag("div",
        content_tag("h3", "There were problems with the following fields:") +
        content_tag("ul", object.errors.full_messages.collect { |msg| content_tag("li", msg) }),
        "id" => options[:id] || "errorExplanation", "class" => options[:class] || "errorExplanation"
      )
    end
  end
  
  # Display any available flash messages (:error, :notice), 
  #
  # NOTE: @error and @notice are deprecated, use flash.now[:error] and flash.now[:notice] instead.
  def flash_message
    output = ''.html_safe
    if (flash[:error] || @error || '') != ''
      output << content_tag('div', :class => 'alert alert-error error') { flash[:error] || @error }
    end
    if (flash[:notice] || @notice || '') != ''
      output << content_tag('div', :class => 'alert alert-info notice') { flash[:notice] || @notice }
    end
    output
  end
  
  # Similar to button_to, but takes a url for a button image as its first argument.
  def image_button_to(source, options = {}, html_options = {})
    # html_options.stringify_keys!
    # html_options[:type] = 'image'
    # html_options[:src] = image_path(source)
    # 
    # convert_boolean_attributes!(html_options, %w( disabled ))
    # 
    # if confirm = html_options.delete("confirm")
    #   html_options["onclick"] = "return #{confirm_javascript_function(confirm)};"
    # end
    # 
    # url = options.is_a?(String) ? options : url_for(options)
    # name ||= url
    # 
    # "<form method=\"post\" action=\"#{h url}\" class=\"image-button-to\"><div>" +
    #   tag("input", html_options) + "</div></form>"
    html_options = html_options.stringify_keys
    
    convert_boolean_attributes!(html_options, %w( disabled ))

    method_tag = ''
    if (method = html_options.delete('method')) && %w{put delete}.include?(method.to_s)
      method_tag = tag('input', :type => 'hidden', :name => '_method', :value => method.to_s)
    end

    form_method = method.to_s == 'get' ? 'get' : 'post'
    form_options = html_options.delete('form') || {}
    form_options[:class] ||= html_options.delete('form_class') || 'button_to'

    remote = html_options.delete('remote')

    request_token_tag = ''
    if form_method == 'post' && protect_against_forgery?
      request_token_tag = tag(:input, :type => "hidden", :name => request_forgery_protection_token.to_s, :value => form_authenticity_token)
    end

    url = options.is_a?(String) ? options : self.url_for(options)
    name ||= url

    html_options = convert_options_to_data_attributes(options, html_options)

    html_options.merge!("type" => "image", "value" => name, "src" => image_path(source))

    form_options.merge!(:method => form_method, :action => url, :class => "image-button-to")
    form_options.merge!("data-remote" => "true") if remote

    "#{tag(:form, form_options, true)}<div>#{method_tag}#{tag("input", html_options)}#{request_token_tag}</div></form>".html_safe
  end
  
  # Similar to submit_to_remote, but takes a url for a button image as its
  # first argument.
  def image_submit_to_remote(source, options = {})
    options[:with] ||= 'Form.serialize(this.form)'
    
    options[:html] ||= {}
    options[:html][:type] = 'image'
    options[:html][:onclick] = "#{remote_function(options)}; return false;"
    options[:html][:src] = image_path(source)
    
    tag("input", options[:html], false)
  end
  
  # Creates a mailto: link that is encoded to prevent most harvesting attempts.
  def encoded_mail_to(email, link_text = nil)
    email = h(email)
    url = ''
    text = ''
    
    # this only works with ascii, but email addresses are supposed to be ascii
    email.bytes.to_a.each_with_index do |b, i|
      url << (i % 2 == 0 ? sprintf("%%%x", b) : b)
      text << (i % 4 == 0 ? '<span>' << b << '</span>' : b)
    end
    
    "<a href=\"mailto:#{url}\">#{link_text || text}</a>".html_safe
  end
  
  # Display a date picker with an ajax calendar.
  #
  # Options:
  # * :default_value => Time.now
  # * :start_date => '06/01/2006', :end_date => '05/31/2007'
  # * :exclude_days => [ :monday, :saturday, :sunday ]
  # * :blackout_ranges => [ ['06/04/2006', '06/18/2006'], ['08/16/2006', '09/01/2006'] ] (not implemented)
  #
  # TODOC: There are a number of somewhat complex prerequisites...
  def date_picker(object, method_prefix, options = {})
    object = object.to_s
    method_prefix = method_prefix.to_s
    
    # set some arbitrary but sensible limits for now...
    start_date = options[:start_date] || 5.years.ago
    start_date = Time.parse(start_date) if start_date.kind_of? String
    end_date   = options[:end_date] || 10.years.from_now
    end_date = Time.parse(end_date) if end_date.kind_of? String
    
    onchange = options[:onchange] || ''
    exclude_days = options[:exclude_days] || []
    min_year = start_date.year
    max_year = end_date.year
    
    
    exclude_days.map! do |d|
      case (d)
        when :sunday then 0
        when :monday then 1
        when :tuesday then 2
        when :wednesday then 3
        when :thursday then 4
        when :friday then 5
        when :saturday then 6
        else nil
      end
    end
    
    i = 0
    while exclude_days.include?(start_date.wday) && i < 7
      start_date += 1.day
      i += 1
    end
    
    default_value = options[:default_value] || (instance_variable_get("@#{object}").send(method_prefix) rescue nil)
    default_value = Time.parse(default_value) if default_value.is_a?(String)
    default_value ||= start_date
    
    draw_calendar = "new Ajax.Updater('date_picker_#{object}_#{method_prefix}_days', '" + date_picker_url + "?" +
                    "month=' + $('#{object}_#{method_prefix}_month_sel').value + " +
                    "'&year=' + $('#{object}_#{method_prefix}_year_sel').value + " +
                    "'&min_time=' + #{start_date.to_i} + " +
                    "'&max_time=' + #{end_date.to_i} + " +
                    "'&exclude_days=#{exclude_days.join(',')}' + " +
                    "'&onchange=#{escape_javascript(options[:onchange])}' + " +
                    "'&object=#{object}' + " +
                    "'&method_prefix=#{method_prefix}', {asynchronous:true, evalScripts:true})"
    
    ret = <<EOF
  <span><a href="#" onclick="showDatePicker('#{object}', '#{method_prefix}'); return false;"><span id="date_picker_#{object}_#{method_prefix}_value">#{default_value.strftime('%a %m/%d/%y')}</span></a></span>
  <span id="date_picker_#{object}_#{method_prefix}icon"><a href="#" onclick="showDatePicker('#{object}', '#{method_prefix}'); return false;"><img src="/assets/interface/icon_time.gif" style="float: none" alt="date picker" /></a></span>
  <div id="date_picker_#{object}_#{method_prefix}main" style="display: none; background-color: white; border: 1px solid gray; padding: 3px; z-index: 101;" class="date-picker-main">
    <table width="190">
      <tr>
        <td><a href="#" onclick="dpPrevMonth('#{object}', '#{method_prefix}', #{min_year}); #{h(draw_calendar)}; return false;"><img src="/assets/interface/arrow_previous.gif" border="0" alt="Previous" style="float: left; padding: 2px 0 0 6px; margin: 0;" /></a></td>
        <td colspan="5" align="center">
          <nobr>
          #{ select_tag object + '_' + method_prefix + '_month_sel', options_for_select(months_hash, default_value.month.to_s), :class => 'form', :style => 'border: 1px solid gray; font-size: 11px; padding: 0; margin: 0;', :onchange => h(draw_calendar) }
          #{ select_tag object + '_' + method_prefix + '_year_sel', options_for_select((min_year..max_year).to_a, default_value.year), :class => 'form', :style => 'border: 1px solid gray; font-size: 11px; padding: 0; margin: 0;', :onchange => h(draw_calendar) }
          </nobr>
        </td>
        <td><a href="#" onclick="dpNextMonth('#{object}', '#{method_prefix}', '#{max_year}'); #{h(draw_calendar)}; return false;"><img src="/assets/interface/arrow_next.gif" border="0" alt="Next" style="float: right; padding: 2px 6px 0 0; margin: 0;" /></a></td>
      </tr>
    </table>
    <div id="date_picker_#{object}_#{method_prefix}_days" class="date-picker-days"></div>
    #{ text_field object, method_prefix + '_year', :value => default_value.year, :style => 'display: none;' }
    #{ text_field object, method_prefix + '_month', :value => default_value.month, :style => 'display: none;' }
    #{ text_field object, method_prefix + '_day', :value => default_value.day, :style => 'display: none;' }
    <div style="width: 100%;" align="center" class="date-picker-close">
        <a href="#" onclick="hideDatePicker('#{object}', '#{method_prefix}'); return false;">Close</a>
    </div>
  </div>
EOF
    ret += javascript_tag(draw_calendar)
    ret.html_safe
  end
  
  # Display a clickable ajax event calendar.
  #
  # Options:
  # * :start_date => '06/01/2006', :end_date => '05/31/2007'
  # * :show_selects => true (default :false)
  # * :calendar_id => 1
  # * :css_prefix => 'calendar_'
  #
  # TODOC: There are a number of somewhat complex prerequisites...
  def event_calendar(options = {})
    start_date = options[:start_date] || Time.now
    end_date   = options[:end_date] || 1.year.from_now
    start_date = Time.parse(start_date) if start_date.is_a? String
    end_date = Time.parse(end_date) if end_date.is_a? String
    
    onchange = options[:onchange] || ''
    min_year = start_date.year
    max_year = min_year + 5
    
    calendar_id = options[:calendar_id] || Calendar.find_first.id
    
    css_prefix = options[:css_prefix] || 'calendar_'
    popout_direction = options[:popout_direction] || :right
    
    draw_calendar = "var ta = $('event_calendar_events_' + " +
                    "$('event_calendar_month_sel').value + '_' + $('event_calendar_year_sel').value); " +
                    "new Ajax.Request(" +
                    "'#{url_for :controller => "/util", :action => "calendar" }?" +
                    "month=' + $('event_calendar_month_sel').value + " +
                    "'&year=' + $('event_calendar_year_sel').value + " +
                    "'&min_time=#{start_date.to_i}&max_time=#{end_date.to_i}" +
                    "&calendar_id=#{calendar_id}&css_prefix=#{css_prefix}" +
                    "&popout_direction=#{popout_direction.to_s}', {asynchronous:true, evalScripts:true})"
    
    # keep all this junk in sync with what's in UtilController
    @month = Time.now.month
    @year = Time.now.year
    @min_time = start_date.to_i
    @max_time = end_date.to_i
    @calendar = Calendar.find(calendar_id)
    @css_prefix = css_prefix
    @popout_direction = popout_direction
    
    first_of_month = Time.utc(@year, @month, 1)
    last_of_month = first_of_month.end_of_month
    events = @calendar.events.find(:all, :conditions => [ 'start_date >= ? and start_date <= ?', first_of_month, last_of_month ])
      
    @event_days = {}
    events.each do |e|
      @event_days[e.start_date.mday] = e
    end
    
    ret = <<EOF
  <table id="event_calendar" class="#{css_prefix}container" cellspacing="0" cellpadding="0" border="0">
    <tr class="#{css_prefix}container">
      <td class="#{css_prefix}container">
        <table class="#{css_prefix}head" cellspacing="0" cellpadding="0" border="0">
          <tr class="#{css_prefix}head">
            <td class="#{css_prefix}head #{css_prefix}head_prev_month"><a href="#" onclick="dpPrevMonth('event', 'calendar', #{min_year}); #{draw_calendar}; return false;"><img src="/assets/interface/arrow_previous.gif" border="0" alt="Previous" style="float: left; padding-left: 2px;" /></a></td>
            <td class="#{css_prefix}head #{css_prefix}head_month_select">
              <div#{options[:show_selects] ? '' : ' style="display: none"'}>
                #{ select 'event_calendar', 'month_sel', months_hash, { :selected => Time.now.month.to_s }, :class => 'form', :style => 'font-size: 11px;', :onchange => draw_calendar }
                #{ select 'event_calendar', 'year_sel', (min_year..max_year).to_a, { :selected => Time.now.year }, :class => 'form', :style => 'font-size: 11px;', :onchange => draw_calendar }
              </div>
              <div id="event_calendar_month_year"#{options[:show_selects] ? ' style="display: none"' : ''}>
                #{render '/util/_calendar_month_year'}
              </div>
            </td>
            <td class="#{css_prefix}head #{css_prefix}head_next_month"><a href="#" onclick="dpNextMonth('event', 'calendar', '#{max_year}'); #{draw_calendar}; return false;"><img src="/assets/interface/arrow_next.gif" border="0" alt="Next" style="float: right; padding-right: 2px;" /></a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr class="#{css_prefix}container">
      <td class="#{css_prefix}container">
        <div id="event_calendar_days" class="#{css_prefix}container #{css_prefix}container_days">
          #{render '/util/_calendar_days'}
        </div>
      </td>
    </tr>
  </table>
EOF
    ret += javascript_tag(draw_calendar)
  end
  
  def product_browser(object, method, options = {}) # :nodoc:
    # allowed options, with defaults:
    #  - :can_select_department => false
    #  - :can_select category => false
    #  - :allow_multiple => false    # not implemented
    #  - :offset_x => 0, :offset_y => 0
    #
    # Note that allowing dept and category will cause this helper to create multiple
    # input fields, called object_method_department_id and object_method_category_id.
    # It is your job to figure out which one is not blank and use that return value.
    # Similarly, with allow multiple, you will need to parse the comma-separated list
    # of ids yourself.
    
    object = object.to_s
    method = method.to_s
    
    object_name = self.instance_variable_get('@' + object).send(method + '_object_name')
    object_name = 'Select' if (object_name || '') == ''
    
    ret = <<EOF
  <a href="#" onclick="if (cbBrowserVisible) { cbHideBrowser(); } else { cbShowBrowser('#{object}', '#{method}', #{options[:offset_x] || 0}, #{options[:offset_y] || 0}); #{remote_function(:update => 'columnBrowserLevel0', :url => { :controller => '/management/bcom/products', :action => 'list_departments', :mode => 'select' })}; } return false;"><span id="#{object}_#{method}_link">#{object_name}</span></a>
  <div id="#{object}_#{method}_container" style="display: none"></div>
  <div style="display: none">
    #{text_field object, method + '_object_name'}
    #{text_field object, method + '_department_id'}
    #{text_field object, method + '_category_id'}
    #{text_field object, method + '_product_id'}
    #{text_field object, method + '_product_option_id'}
    #{text_field object, method + '_object_name_temp'}
    #{text_field object, method + '_department_id_temp'}
    #{text_field object, method + '_category_id_temp'}
    #{text_field object, method + '_product_id_temp'}
    #{text_field object, method + '_product_option_id_temp'}
  </div>
EOF
    return ret
  end
  
  # Note that this currently won't work for > 100 options
  def ordered_hash(input) # :nodoc:
    ret = Hash.new
    i = 0
    for k in input
      ret[k[0]] = (i < 10 ? '0' + i.to_s : i.to_s) + k[1]
      i += 1
    end
    ret.sort { |a,b| a[1] <=> b[1] }.map { |a| a[1].slice!(0...2) ; a }
  end
  
  # Returns an array of arrays (no, it is not named particularly well) containing the 50 US
  # states and their abbreviations. Pass true as first arg to enable territories, etc. Intended
  # for use with the select form helper.
  def us_states_hash(include_territories = false)
    states_plus_dc = {
      "Alabama" => 'AL', "Alaska" => 'AK', "Arizona" => 'AZ', "Arkansas" => 'AR',
      "California" => 'CA', "Colorado" => 'CO', "Connecticut" => 'CT',
      "Delaware" => 'DE', "District Of Columbia" => 'DC',
      "Florida" => 'FL',
      "Georgia" => 'GA',
      "Hawaii" => 'HI',
      "Idaho" => 'ID', "Illinois" => 'IL', "Indiana" => 'IN', "Iowa" => 'IA',
      "Kansas" => 'KS', "Kentucky" => 'KY',
      "Louisiana" => 'LA',
      "Maine" => 'ME', "Maryland" => 'MD', "Massachusetts" => 'MA', "Michigan" => 'MI',
      "Minnesota" => 'MN', "Mississippi" => 'MS', "Missouri" => 'MO', "Montana" => 'MT',
      "Nebraska" => 'NE', "Nevada" => 'NV', "New Hampshire" => 'NH', "New Jersey" => 'NJ',
      "New Mexico" => 'NM', "New York" => 'NY', "North Carolina" => 'NC', "North Dakota" => 'ND',
      "Ohio" => 'OH', "Oklahoma" => 'OK', "Oregon" => 'OR',
      "Pennsylvania" => 'PA',  
      "Rhode Island" => 'RI',
      "South Carolina" => 'SC', "South Dakota" => 'SD',
      "Tennessee" => 'TN', "Texas" => 'TX',
      "Utah" => 'UT',
      "Vermont" => 'VT', "Virginia"=>'VA',
      "Washington" => 'WA', "West Virginia" => 'WV', "Wisconsin" => 'WI', "Wyoming" => 'WY'
    }
    
    territories_etc = {
      "Armed Forces Americas" => 'AA',
      "Armed Forces Europe, Middle East, Africa and Canada" => 'AE',
      "Armed Forces Pacific" => 'AP',
      "American Samoa" => 'AS',
      "Federated States of Micronesia" => 'FM',
      "Guam" => 'GU',
      "Marshall Islands" => 'MH',
      "Northern Mariana Islands" => 'MP',
      "Palau" => 'PW',
      "Puerto Rico" => 'PR',
      "Virgin Islands" => 'VI'
    }
    
    (include_territories ? states_plus_dc.merge(territories_etc) : states_plus_dc).to_a.sort { |a,b| a.last <=> b.last }
  end
  
  # Returns a hash containing the months of the year. Intended for use with the
  # select form helper.
  def months_hash
    { 'January' => '1', 'February' => '2', 'March' => '3', 'April' => '4',
      'May' => '5', 'June' => '6', 'July' => '7', 'August' => '8',
      'September' => '9', 'October' => '10', 'November' => '11',
      'December' => '12' }.sort{ |a, b| a.last.to_i <=> b.last.to_i }
  end
  
  # Returns a hash containing the 3-character abbreviations of the months of
  # the year. Intended for use with the select form helper.
  def short_months_hash
    { 'Jan' => '1', 'Feb' => '2', 'Mar' => '3', 'Apr' => '4', 'May' => '5',
      'Jun' => '6', 'Jul' => '7', 'Aug' => '8', 'Sep' => '9', 'Oct' => '10',
      'Nov' => '11', 'Dec' => '12' }.sort{ |a, b| a.last.to_i <=> b.last.to_i }
  end
  
  
  def cropper_image_tag(options)
    ret = "<img id=\"testImage\" src=\"/assets/#{options[:url]}\" />".html_safe
    ret += javascript_tag("cropper = new Cropper.Img('testImage', { minWidth: 0, minHeight: 0, captureKeys: false, onEndCrop: onEndCrop });")
  end
  
  # filename should include version number in query string
  def page_file_path(page, filename)
    if ImagineCmsConfig['amazon_s3'] && ImagineCmsConfig['amazon_s3']['enabled']
      prefix = ImagineCmsConfig['amazon_s3']['file_prefix']
      hostname = ImagineCmsConfig['amazon_s3'][Rails.env]['file_hostname']
      filename, timestamp = File.basename(filename).split('?')
      "//#{hostname}/#{prefix}/#{page.path.blank? ? 'index' : page.path}/#{ERB::Util.url_encode filename}?#{timestamp}"
    else
      "/#{File.join('assets', 'content', page.path, File.basename(filename))}"
    end
  end
  
  # filename should include version number in query string
  def page_image_path(page, filename)
    if ImagineCmsConfig['amazon_s3'] && ImagineCmsConfig['amazon_s3']['enabled']
      prefix = ImagineCmsConfig['amazon_s3']['image_prefix']
      hostname = ImagineCmsConfig['amazon_s3'][Rails.env]['image_hostname']
      filename, timestamp = File.basename(filename).split('?')
      "//#{hostname}/#{prefix}/#{page.path.blank? ? 'index' : page.path}/#{ERB::Util.url_encode filename}?#{timestamp}"
    else
      "/#{File.join('assets', 'content', page.path, File.basename(filename))}"
    end
  end
  
  def page_image_tag(page, filename)
    "<img src=\"#{page_image_path(page, filename)}\" alt=\"#{File.basename(filename, '.*').sub(/-[[:xdigit:]]{32}\z/, '').capitalize}\" />".html_safe
  end
  
  def copyright_year(year)
    year_str, this_year = year.to_s, Time.now.year.to_s
    year_str << "&ndash;#{this_year}" if ((year_str.to_i.to_s == year_str) and (year_str.to_i != this_year.to_i))
    year_str.html_safe
  end
  
end
