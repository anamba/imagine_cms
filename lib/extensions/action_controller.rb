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
      valid = valid && addr.to_s =~ /\A([\w\d]+(?:[\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]*[\w\d]+)*)@((?:[\w\d]+\.)+[\w]{2,})\z/
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
      logger.debug "DEPRECATION WARNING: convert_content_path called"
      params[:content_path] = params[:content_path].to_s.split('/') rescue []
    end
    
    ### COMPAT - template_exists?
    def template_exists?(template, extension = nil)
      # ignore extension
      logger.debug("DEPRECATION WARNING: template_exists? called")
      lookup_context.find_all(template).any?
    end
    
    ### COMPAT - template_exists?
    def url_for_current
      logger.debug("DEPRECATION WARNING: url_for_current called")
      request.fullpath
    end
    
    ### COMPAT - log_error
    def log_error(e)
      # noop
      logger.debug("DEPRECATION WARNING: log_error called")
      logger.error(e)
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
    
  end
end
