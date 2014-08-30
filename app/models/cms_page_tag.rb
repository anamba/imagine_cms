class CmsPageTag < ActiveRecord::Base
  # attr_accessible :name
  
  belongs_to :page, :class_name => 'CmsPage', :foreign_key => 'cms_page_id'
  
  validates_uniqueness_of :name, :scope => 'cms_page_id'
end