module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    config.app_root = root
    middleware.use ::ActionDispatch::Static, "#{root}/public"
    
    initializer "imagine_cms.assets.precompile" do |config|
      Rails.application.config.assets.precompile += %w( codepress/** dojo/** management.css reset.css )
    end
    
    #
    # activate gems as needed
    #
    require 'prototype-rails'
    require 'mini_magick'
    require 'RMagick'
    require 'rails_rinku'
    require 'net/dns'
    require 'acts_as_tree'
    
    #
    # rails plugins
    # 
    require 'acts_as_versioned/lib/acts_as_versioned'
    require 'prototype_legacy_helper/lib/prototype_legacy_helper'
    
    require 'upload_progress/lib/multipart_progress'
    require 'upload_progress/lib/progress'
    require 'upload_progress/lib/upload_progress'
    require 'upload_progress/lib/upload_progress_helper'
    
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
      
      include UploadProgress
      helper UploadProgress::UploadProgressHelper
      
      # include + helper: allow use both in controllers and views
      
      include PrototypeHelper  # from prototype_legacy_helper
      helper PrototypeHelper
      
      include CmsApplicationHelper
      helper CmsApplicationHelper
      
      helper_method :insert_object
      
      # before_filter :create_settings_object, :set_default_session_values, :check_ssl_requirement, :expire_session_data
      before_filter :expire_session_data
    end
  end
  
end
