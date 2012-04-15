module ActionControllerExtensions
  module ClassMethods
  end
  
  module InstanceMethods
    
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
      params[:content_path] = params[:content_path].to_s.split('/')
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
    
  end
end
