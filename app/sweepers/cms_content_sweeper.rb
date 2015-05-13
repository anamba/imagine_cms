class CmsContentSweeper < ActionController::Caching::Sweeper
  observe CmsPage, CmsTemplate, CmsSnippet
  
  def after_save(record)
    delete_all_cached_pages
  end
  
  def after_destroy(record)
    delete_all_cached_pages
  end
  
  def delete_all_cached_pages
    cache_dir = File.expand_path(Management::CmsController.page_cache_directory)
    public_dir = File.expand_path("#{Rails.root}/public")
    
    # this could throw Errno::ENOENT
    begin
      cache_dir = File.realpath cache_dir
      public_dir = File.realpath public_dir
    end
    
    begin
      if cache_dir == public_dir
        # expire home page
        expire_page controller: 'cms/content', action: 'show', content_path: nil
        
        # expire all other pages
        
        # original method is too slow for large sites:
        # CmsPage.select([ :id, :path ]).find_each do |page|
        #   expire_page controller: 'cms/content', action: 'show', content_path: page.path.split('/')
        # end
        
        # quicker method: remove entire directory trees when possible
        dangerous_names = [ 'assets', 'images', 'javascripts', 'stylesheets' ]
        CmsPage.find_by_path('').sub_pages.each do |page|
          if dangerous_names.include?(page.path)
            # expire pages the old way
            sub_page_paths(page).each do |path|
              expire_page controller: 'cms/content', action: 'show', content_path: path.split('/')
            end
          else
            # remove entire directory tree, after sanity check
            path = File.realpath File.expand_path(File.join(Management::CmsController.page_cache_directory, page.path)) rescue nil
            
            if path  # could be nil if it doesn't exist (i.e. realpath threw an Errno::ENOENT
              raise "Cache directory name #{path} failed sanity check" unless path =~ /^#{public_dir}/
              raise "Cache directory name #{path} failed sanity check 2" unless File.directory?(path)
              Rails.logger.info "Expire tree #{path} using rm -rf"
              FileUtils.rm_rf(path)
            end
            
            # also clear this page
            expire_page controller: 'cms/content', action: 'show', content_path: page.path.split('/')
          end
        end
        
      else
        FileUtils.rm_r(Dir.glob("#{cache_dir}/*")) rescue Errno::ENOENT
      end
    rescue Exception => e
      Rails.logger.error "Error while clearing cache: #{e.message}" unless e.is_a?(NoMethodError)
    end
  end
  
  
  private
    
    def sub_page_paths(page)
      paths = [ page.path ]
      page.sub_pages.each do |pg|
        paths << pg.path
        paths.concat sub_page_paths(pg)
      end
      paths
    end
    
end
