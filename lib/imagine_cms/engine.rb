module ImagineCms
  
  class Engine < Rails::Engine
    engine_name "imagine_cms"
    
    # initialize "imagine_cms.load_app_instance_data" do |app|
    #   ImagineCms.setup do |config|
        config.app_root = app.root
    #   end
    # end
    
    # initialize "imagine_cms.load_static_assets" do |app|
      # app.middleware.use ::ActionDispatch::Static, "#{root}/public"
      middleware.use ::ActionDispatch::Static, "#{root}/public"
    # end
    
  end
  
end
