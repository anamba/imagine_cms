module ActionControllerCachingExtensions
  
  module ClassMethods
    
    def expire_page(path)
      return unless perform_caching
      
      path = Pathname.new(page_cache_path(path)).relative_path_from(Pathname.new(Rails.root))
      Dir.chdir Rails.root
      
      instrument_page_cache :expire_page, path do
        Dir.glob(path, File::FNM_CASEFOLD).each { |f| File.delete(f) }
        Dir.glob(path + '.gz', File::FNM_CASEFOLD).each { |f| File.delete(f) }
      end
    end
    
  end
  
end
