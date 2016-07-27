require 'safe_yaml'

require 'rails-observers'
require 'actionpack/action_caching'
require 'actionpack/page_caching'

require 'prototype-rails'
require 'prototype_legacy_helper/lib/prototype_legacy_helper'

require 'non-stupid-digest-assets'

require 'upload_progress/lib/multipart_progress'
require 'upload_progress/lib/progress'
require 'upload_progress/lib/upload_progress'
require 'upload_progress/lib/upload_progress_helper'

require 'acts_as_versioned/lib/acts_as_versioned'
require 'aws-sdk'
require 'zip'
require 'rails_rinku'
require 'acts_as_tree'
require 'net/dns'
require 'codemirror-rails'
require 'RMagick'
require 'mini_magick'

require 'auto_link_email_addresses'
require 'extensions/array_extensions'
require 'hash_object'
require 'hash_wrapper'


module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    config.app_root = root
    middleware.use ::ActionDispatch::Static, "#{root}/public"
    
    initializer "imagine_cms.assets.precompile" do |app|
      app.config.assets.precompile += %w( dojo/** management.css imagine_controls.css reset.css cropper/* interface/* management/* )
      app.config.assets.precompile += ["codemirror*", "codemirror/**/*"]
      # Rails.application.config.load_paths << File.dirname(__FILE__) + "/../app/helpers"
    end
    
    initializer 'imagine_cms.legacy_support' do |app|
      ActionController::Base.send :include, PrototypeHelper
      ActionController::Base.send :helper, PrototypeHelper
      
      ActionController::Base.send(:include, UploadProgress)
      ActionView::Base.send(:include, UploadProgress::UploadProgressHelper)
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
    
    
    def self.activate
      Dir.glob(File.join(Rails.root, "app/overrides/*.rb")) do |c|
        require_dependency(c)
      end
      Dir.glob(File.join(Rails.root, "app/**/*_decorator*.rb")) do |c|
        require_dependency(c)
      end
    end
    
    config.to_prepare &method(:activate).to_proc
  end
  
end
