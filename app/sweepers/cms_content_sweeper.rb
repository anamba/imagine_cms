class CmsContentSweeper < ActionController::Caching::Sweeper
  observe CmsPage, CmsTemplate, CmsSnippet
  
  def after_save(record)
    delete_all_cached_pages
  end
  
  def after_destroy(record)
    delete_all_cached_pages
  end
  
  def delete_all_cached_pages
    # expire home page
    expire_page :controller => 'cms/content', :action => 'show', :content_path => nil
    
    # expire all other pages
    CmsPage.select([ :id, :path ]).find_each do |page|
      expire_page :controller => 'cms/content', :action => 'show', :content_path => page.path.split('/')
    end
  end
  
end
