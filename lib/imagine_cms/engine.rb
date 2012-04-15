module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    config.app_root = root
    middleware.use ::ActionDispatch::Static, "#{root}/public"
    
    #
    # load unusual gems
    #
    require 'net/dns'
    
    #
    # load provided classes
    #
    require 'hash_object'
    require 'hash_wrapper'
    
    #
    # load extensions
    #
    require 'extensions/array'
    
    ActiveSupport.on_load(:action_controller) do
      require 'extensions/action_controller'
      extend ActionControllerExtensions::ClassMethods
      include ActionControllerExtensions::InstanceMethods
      # before_filter :create_settings_object, :set_default_session_values, :check_ssl_requirement, :expire_session_data
      # after_filter :compress_output    
    end
  end
  
end
