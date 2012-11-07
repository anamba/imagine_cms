class CmsPage < ActiveRecord::Base
  include ActsAsTree
  
  acts_as_versioned
  acts_as_tree :order => 'path'
  
  belongs_to :template, :class_name => 'CmsTemplate', :foreign_key => 'cms_template_id'
  has_many :objects, :class_name => 'CmsPageObject', :dependent => :destroy
  has_many :tags, :class_name => 'CmsPageTag', :dependent => :destroy
  has_many :versions, :class_name => 'CmsPageVersion', :dependent => :destroy
  
  validates_format_of :name, :with => /\A[-\w\d%]+\Z/
  validates_uniqueness_of :path, :message => 'conflicts with an existing page'
  
  def sub_pages(options = {})
    # not using options just yet, but you can override if you like
    conditions = [ 'published_version >= 0' ]
    self.children.find(:all, :conditions => conditions, :order => 'position')
  end
  
  def tags_as_css_classes
    self.tags.map { |t| t.name.downcase.gsub(/[^\w]+/, '-') }.join(' ')
  end
  
  def self.index_all
    CmsPage.find(:all, :conditions => [ 'search_index is null' ]).each { |pg| pg.update_index ; pg.save_without_revision }
    true
  end
  
  def self.reindex_all
    CmsPage.find(:all).each { |pg| pg.update_index ; pg.save_without_revision }
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
  
  def before_validation
    # compute and store path
    if self.parent
      if self.parent.path != ''
        self.path = "#{self.parent.path}/#{self.name}"
      else
        self.path = self.name
      end
    else
      self.path = ''
    end
    
    if self.template
      self.cms_template_version ||= self.template.version
    end
    
    self.published_version ||= -1
    self.published_date ||= self.created_on || Time.now
  end
  
  def update_index
    content = ''
    
    if self.published_version.to_i >= 0
      idx_version = self.published_version.to_i == 0 ? self.version : self.published_version
      self.objects.find(:all, :conditions => [ "cms_page_version = ? and (obj_type = 'text' or obj_type = 'string')", idx_version ]).each do |obj|
        content << obj.content << "\n"
      end
    end
    
    self.search_index = sanitize_index(content)
  end
  
  def set_parent_id!(new_id)
    self.parent_id = new_id
    self.save_without_revision
  end
  
  
  def article_date_month ; article_date.strftime("%B")      ; end
  def article_date_mon   ; article_date.strftime("%b")      ; end
  def article_date_day   ; article_date.strftime("%d").to_i ; end
  def article_date_year  ; article_date.strftime("%Y").to_i ; end
  def article_date_yr    ; article_date.strftime("%y").to_i ; end
  
  
  private
  
  def sanitize_index(html)
    return html if html.blank?
    if html.index("<")
      text = ""
      tokenizer = HTML::Tokenizer.new(html)
      
      while token = tokenizer.next
        node = HTML::Node.parse(nil, 0, 0, token, false)
        # result is only the content of any Text nodes
        text << node.to_s if node.class == HTML::Text  
      end
      # strip any comments, and if they have a newline at the end (ie. line with
      # only a comment) strip that too, as well as any erb stuff
      text.gsub(/<!--(.*?)-->[\n]?/m, "").gsub(/\<%.*?%\>/m, '').gsub(/&\w+;/, '')
    else
      html # already plain text
    end 
  end
end