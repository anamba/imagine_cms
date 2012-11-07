module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    config.app_root = root
    middleware.use ::ActionDispatch::Static, "#{root}/public"
    
    #
    # activate gems as needed
    #
    require 'net/dns'
    require 'acts_as_tree'
    require 'prototype-rails'
    require 'rails_rinku'
    
    #
    # rails plugins
    # 
    require 'acts_as_versioned/lib/acts_as_versioned'
    
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
      
      helper CmsApplicationHelper
      helper_method :user_has_permission?
      helper_method :user_has_permissions?
      helper_method :template_exists?
      helper_method :url_for_current
      helper_method :is_editing_page?
      helper_method :gm_to_local
      helper_method :local_to_gm
      helper_method :ts_to_str
      helper_method :ts_to_time_str
      helper_method :time_to_str
      helper_method :date_to_str
      
      helper_method :insert_object
      helper_method :substitute_placeholders
      helper_method :template_option
      helper_method :breadcrumbs
      
      # before_filter :create_settings_object, :set_default_session_values, :check_ssl_requirement, :expire_session_data
      # after_filter :compress_output    
    end
  end
  
end
