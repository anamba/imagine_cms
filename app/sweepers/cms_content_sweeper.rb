class CmsContentSweeper < ActionController::Caching::Sweeper
  observe CmsPage, CmsTemplate, CmsSnippet
  
  def after_save(record)
    delete_all_cached_pages
  end
  
  def after_destroy(record)
    delete_all_cached_pages
  end
  
  def delete_all_cached_pages
    CmsPage.find_each do |page|
      expire_page :controller => 'cms/content', :action => 'show', :content_path => page.path.split('/')
    end
  end
  
end
