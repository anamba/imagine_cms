class CmsPageObject < ActiveRecord::Base
  # attr_accessible :name, :obj_type
  
  belongs_to :page, class_name: 'CmsPage', foreign_key: 'cms_page_id'
  
  before_create :set_page_version
  
  
  def set_page_version
    if cms_page_version.to_i == 0
      self.cms_page_version = page.version
    end
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
