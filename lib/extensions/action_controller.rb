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
          require 'net/dns/dns'
          res = Net::DNS::Resolver.new
          valid = valid && res.mx(host).size > 0
        rescue Exception => e
          logger.error(e)
        end
      end
      
      valid
    end
  end
end
