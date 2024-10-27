module RestoreTemplateAfterRevert
  def revert_to(*args)
    tmp = template
    ret = super(*args)
    self.template = tmp
    ret
  end
end

class CmsPage < ActiveRecord::Base
  include ActiveModel::Dirty
  include ActsAsTree
  include RestoreTemplateAfterRevert
  
  acts_as_versioned
  acts_as_tree order: 'path'
  
  belongs_to :template, class_name: 'CmsTemplate', foreign_key: 'cms_template_id'
  
  has_many :tags, class_name: 'CmsPageTag', dependent: :destroy
  has_many :versions, class_name: 'CmsPageVersion', dependent: :destroy
  has_many :sub_pages, -> { where('published_version >= 0').order(:position, :title, :name) }, class_name: 'CmsPage', foreign_key: :parent_id
  
  has_many :objects, class_name: 'CmsPageObject', dependent: :destroy
  has_many :custom_attributes, -> { where(obj_type: 'attribute') }, class_name: 'CmsPageObject'
  has_many :options, -> { where(obj_type: 'option') }, class_name: 'CmsPageObject'
  has_many :custom_attributes_and_options, -> { where(obj_type: ['attribute', 'option']) }, class_name: 'CmsPageObject'
  
  validates_format_of :name, with: /\A[-\w\d%]+\Z/
  validates_uniqueness_of :path, message: 'conflicts with an existing page'
  
  before_validation :compute_and_store_path, :set_versions
  
  after_save :resave_children
  
  def compute_and_store_path
    if self.parent
      if self.parent.path != ''
        self.path = "#{self.parent.path}/#{self.name}"
      else
        self.path = self.name
      end
    else
      self.path = ''
    end
  end
  
  def set_versions
    if self.template
      self.cms_template_version ||= self.template.version
    end
    
    self.published_version ||= -1
    self.published_date ||= self.created_on || Time.now
    
    if path == '' && published_version == -1
      self.published_version = 0  # home page should never be set to offline
    end
    
    true
  end
  
  def resave_children
    if path_changed?
      # get all pages under this one (even the offline ones)
      CmsPage.where(parent_id: id).each do |subpg|
        subpg.save_without_revision if subpg.valid?
      end
    end
  end
  
  def tags_as_css_classes
    self.tags.map { |t| t.name.downcase.gsub(/[^\w]+/, '-') }.join(' ')
  end

  def page_attributes
    @page_attributes ||= self.custom_attributes.each_with_object({}) do |obj, hash|
      hash[obj.name] = obj.content
    end
  end
  
  def self.index_all
    where('search_index is null').each(&:update_index!)
    true
  end
  
  def self.reindex_all
    find_each(&:update_index!)
    true
  end
  
  def name=(value)
    if value && value.is_a?(String)
      # filter suspicious content... go overboard for now, fine-tune later perhaps
      value.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?`.*?\s*%)>/, '&lt;\1&gt;')
    end
    super(value)
  end
  
  def html_head=(value)
    if value && value.is_a?(String)
      # filter suspicious content... go overboard for now, fine-tune later perhaps
      value.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?`.*?\s*%)>/, '&lt;\1&gt;')
    end
    super(value)
  end
  
  def update_index
    content = ''
    
    if self.published_version.to_i >= 0
      idx_version = self.published_version.to_i == 0 ? self.version : self.published_version
      self.objects.where(cms_page_version: idx_version, obj_type: [ 'text', 'string' ]).each do |obj|
        content << obj.content << "\n" if obj.content.to_s =~ /[^\d\.]/
      end
      self.custom_attributes_and_options.each do |obj|
        content << obj.content << "\n" if obj.content.to_s =~ /[^\d\.]/
      end
    end
    
    self.search_index = ActionController::Base.helpers.strip_tags(content.gsub('><', '> <'))
  end
  
  def update_index!
    update_index
    begin
      self.class.without_revision { save }
    rescue NoMethodError => e
      # sometime the cache sweeper fails, but that's okay here
    end
  end
  
  def set_parent_id!(new_id)
    self.parent_id = new_id
    self.save_without_revision
    self.valid?
  end
  
  # pass a hash to set page attributes in bulk
  def set_page_attributes(attrs)
    attrs.each do |key, value|
      objects.find_or_initialize_by(name: key, obj_type: 'attribute').update_attributes(content: value)
    end
  end
  
  
  def article_date_month   ; article_date.strftime("%B")      ; end
  def article_date_mon     ; article_date.strftime("%b")      ; end
  def article_date_m       ; article_date.strftime("%m").to_i ; end
  def article_date_weekday ; article_date.strftime("%A")      ; end
  def article_date_wday    ; article_date.strftime("%a")      ; end
  def article_date_day     ; article_date.strftime("%d").to_i ; end
  def article_date_d       ; article_date.strftime("%d").to_i ; end
  def article_date_year    ; article_date.strftime("%Y").to_i ; end
  def article_date_yr      ; article_date.strftime("%y").to_i ; end
  def article_date_y       ; article_date.strftime("%Y").to_i ; end
end
