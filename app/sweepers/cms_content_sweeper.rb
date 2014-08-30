class CmsContentSweeper < ActionController::Caching::Sweeper
  observe CmsPage, CmsTemplate, CmsSnippet
  
  def after_save(record)
    delete_all_cached_pages
  end
  
  def after_destroy(record)
    delete_all_cached_pages
  end
  
  def delete_all_cached_pages
    if File.expand_path(Management::CmsController.page_cache_directory) == File.expand_path("#{Rails.root.to_s}/public")
      # expire home page
      expire_page :controller => 'cms/content', :action => 'show', :content_path => nil
      
      # expire all other pages
      CmsPage.select([ :id, :path ]).find_each do |page|
        expire_page :controller => 'cms/content', :action => 'show', :content_path => page.path.split('/')
      end
    else
      FileUtils.rm_r(Dir.glob(cache_dir+"/*")) rescue Errno::ENOENT
    end
  end
  
end
