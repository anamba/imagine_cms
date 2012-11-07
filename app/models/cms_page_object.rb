class CmsPageObject < ActiveRecord::Base
  belongs_to :page, :class_name => 'CmsPage', :foreign_key => 'cms_page_id'
  
  def before_create
    self.cms_page_version = self.page.version unless self.cms_page_version.to_i > 0
  end
  
  def content=(value)
    if value && value.is_a?(String)
      # filter suspicious content... go overboard for now, fine-tune later perhaps
      value.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?`.*?\s*%)>/, '&lt;\1&gt;')
    end
    super(value)
  end
  
end
