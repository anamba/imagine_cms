namespace :imagine_cms do
  
  namespace :cache do
    
    desc "Clear CMS cache (generated .html files)"
    task :clear => :environment do
      if Management::CmsController.perform_caching
        if File.expand_path(Management::CmsController.page_cache_directory) == File.expand_path("#{Rails.root}/public")
          CmsPage.select([ :id, :path ]).find_each do |page|
            page.expire_cache
          end
        else
          FileUtils.rm_r(Dir.glob("#{cache_dir}/*")) rescue Errno::ENOENT
        end
        
        puts "Cache cleared."
      else
        puts "Caching not enabled."
      end
    end
    
  end
  
end
