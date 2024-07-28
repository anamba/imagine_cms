module DynamicMethods
  require 'yaml'
  
  def dynamic_hash
    @dynamic_fields_data ||= YAML::load(self.dynamic_fields || '') || {}
    @dynamic_fields_data
  end
  
  def method_missing(method_id, *args)
    key = method_id.id2name
    
    # argh... this is kind of a special case
    return super if key =~ /^dynamic_fields(=)?$/
    
    # trim out validation prefixes
    key.slice!(/^([A-Z]+_)*/)
    
    if key.ends_with?('?')
      key.slice!(-1,1)
      if self.dynamic_hash.has_key?(key)
        return self.dynamic_hash[key].to_i == 1
      end
    else
      return self.dynamic_hash[key] if self.dynamic_hash.has_key?(key)
    end
    
    begin
      return super
    rescue NoMethodError
      @required_fields ||= []
      @ccnumber_fields ||= []
      @email_fields    ||= []
      
      # get back the full original key
      key = method_id.id2name
      if key[-1, 1] == '='
        key.slice!(-1, 1)
        
        # check for validation prefixes
        if (prefix = key.slice!(/^([A-Z]+_)*/))
          @required_fields << key if prefix[/REQUIRED_/]
          @ccnumber_fields << key if prefix[/CCNUMBER_/]
          @email_fields    << key if prefix[/EMAIL_/]
        end
        
        val = args.shift
        @dynamic_fields_data[key] = val
        
        Rails.logger.debug "DYNAMIC_METHOD: #{key} = #{val}"
        self.dynamic_fields = YAML::dump(self.dynamic_hash)
        return val
      end
    end
    
    # just return nil if we couldn't do anything appropriate
    nil
  end
  
  def validate
    super
    
    # TODO: refactor validation system... won't be pretty when it scales up
    
    for f in @required_fields || []
      errors.add(f, "is required") if self.send(f).blank?
    end
    
    for f in @ccnumber_fields || []
      next if (self.send(f) || '') == ''
      
      # get rid of any dashes or spaces that may have been entered
      value = self.send(f).gsub(/[-\s]/, '')
      
      # for easy testing
      next if value == 'test' && RAILS_ENV == 'development'
      
      # the rest should be only digits, 15 or 16 of em
      errors.add(f, "is invalid") and next if value !~ /^\d{15,16}$/
      
      # basic prefix checks first
      errors.add(f, "is invalid") and next if value !~ /^(4)|(3[47])|(5[1-5])|(6011)/
      
      # luhn check digit calculation
      sum = 0
      
      for k in 1..value.length
        temp = value.slice(-k, 1).to_i
        
        if k.odd?
          sum += temp.to_i
        elsif k.even?
          (temp * 2).to_s.split('').each { |d| sum += d.to_i }
        end
      end
      
      errors.add(f, "is invalid") if sum % 10 != 0
    end
    
    for f in @email_fields || []
      errors.add(f, "is invalid") if self.send(f) !~ /^[\w\d]+([\w\d\!\#\$\%\&\*\+\-\/\=\?\^\`\{\|\}\~\.]*[\w\d]+)*@([\w\d]+\.)+[\w]{2,}$/
    end
  end
  
  def save(*args)
    self.dynamic_fields = YAML::dump(self.dynamic_hash)
    super
  end
  
  def save!(*args)
    self.dynamic_fields = YAML::dump(self.dynamic_hash)
    super
  end
end
