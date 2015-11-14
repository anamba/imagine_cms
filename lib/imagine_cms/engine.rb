module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    config.app_root = root
    middleware.use ::ActionDispatch::Static, "#{root}/public"
    
    initializer "imagine_cms.assets.precompile" do |config|
      Rails.application.config.assets.precompile += %w( dojo/** management.css imagine_controls.css reset.css )
      Rails.application.config.assets.precompile += ["codemirror*", "codemirror/**/*"]
      # Rails.application.config.load_paths << File.dirname(__FILE__) + "/../app/helpers"
    end
    
    initializer 'imagine_cms.load_helpers' do |app|
      ActionController::Base.send :include, CmsApplicationHelper
    end
    
    initializer 'imagine_cms.action_controller_extensions' do |app|
      require 'extensions/action_controller_extensions'
      ActionController::Base.send :extend, ActionControllerExtensions::ClassMethods
      ActionController::Base.send :include, ActionControllerExtensions::InstanceMethods
      
      require 'extensions/action_controller_caching_extensions'
      ActionController::Base.send :extend, ActionControllerCachingExtensions::ClassMethods
      
      ActionController::Base.send :helper_method, :user_has_permission?
      ActionController::Base.send :helper_method, :user_has_permissions?
      ActionController::Base.send :helper_method, :insert_object, :text_editor, :texteditor, :page_list, :pagelist, :snippet
      
      # before_filter :create_settings_object, :set_default_session_values, :check_ssl_requirement, :expire_session_data
      ActionController::Base.send :before_filter, :expire_session_data
    end
    
    initializer 'imagine_cms.prototype_legacy_helper' do |app|
      require 'prototype_legacy_helper/lib/prototype_legacy_helper'
      ActionController::Base.send :include, PrototypeHelper
      ActionController::Base.send :helper, PrototypeHelper
    end
    
    initializer 'imagine_cms.acts_as_versioned' do |app|
      require 'acts_as_versioned/lib/acts_as_versioned'
    end
    
    initializer 'imagine_cms.upload_progress' do |app|
      require 'upload_progress/lib/multipart_progress'
      require 'upload_progress/lib/progress'
      require 'upload_progress/lib/upload_progress'
      require 'upload_progress/lib/upload_progress_helper'
      ActionController::Base.send(:include, UploadProgress)
      ActionView::Base.send(:include, UploadProgress::UploadProgressHelper)
    end
    
    def self.activate
      Dir.glob(File.join(Rails.root, "app/overrides/*.rb")) do |c|
        Rails.application.config.cache_classes ? require(c) : load(c)
      end
      Dir.glob(File.join(Rails.root, "app/**/*_decorator*.rb")) do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end
    
    config.to_prepare &method(:activate).to_proc
    
    #
    # activate gems as needed
    #
    require 'rails-observers'
    require 'actionpack/action_caching'
    require 'actionpack/page_caching'
    require 'aws-sdk'
    require 'zip'
    require 'rails_rinku'
    require 'safe_yaml'
    require 'acts_as_tree'
    require 'net/dns'
    require 'codemirror-rails'
    
    # on the way out, but still needed for now
    require 'prototype-rails'
    require 'RMagick'
    require 'mini_magick'
    require 'non-stupid-digest-assets'
    
    #
    # rails plugins
    # 
    
    require 'auto_link_email_addresses'
    
    #
    # load provided classes
    #
    require 'hash_object'
    require 'hash_wrapper'
    
    #
    # load extensions
    #
    require 'extensions/array_extensions'
  end
  
end
