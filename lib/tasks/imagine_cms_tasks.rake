namespace :imagine_cms do
  
  namespace :cache do
    
    desc "Clear CMS cache (generated .html files)"
    task :clear => :environment do
      include ActionDispatch::Routing::UrlFor
      include Rails.application.routes.url_helpers
      
      # expire home page
      ActionController::Base.expire_page url_for(:controller => 'cms/content', :action => 'show', :content_path => nil, :only_path => true)
      
      # expire all other pages
      CmsPage.select([ :id, :path ]).find_each do |page|
        ActionController::Base.expire_page url_for(:controller => 'cms/content', :action => 'show', :content_path => page.path.split('/'), :only_path => true)
      end
      
      puts "Cache cleared."
    end
    
  end
  
end
