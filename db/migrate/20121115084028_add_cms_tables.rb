class AddCmsTables < ActiveRecord::Migration
  
  class CmsTemplate < ActiveRecord::Base ; acts_as_versioned ; end
  class CmsSnippet < ActiveRecord::Base ; acts_as_versioned ; end
  class CmsPage < ActiveRecord::Base ; acts_as_versioned ; end
  
  def self.up
    create_table "cms_templates" do |t|
      t.column "name",              :string
      t.column "content",           :text
      t.column "options_yaml",      :text
      
      t.column "version",           :integer, :default => 0, :null => false
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    CmsTemplate.create_versioned_table  # => CmsTemplateVersions
    
    create_table "cms_snippets" do |t|
      t.column "name",              :string
      t.column "content",           :text
      
      t.column "version",           :integer, :default => 0, :null => false
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    CmsSnippet.create_versioned_table  # => CmsSnippetVersions
    
    create_table "cms_pages" do |t|
      t.column "cms_template_id",   :integer, :null => false
      t.column "cms_template_version", :integer, :null => false
      
      t.column "parent_id",         :integer, :references => :cms_pages
      
      t.column "name",              :string
      t.column "title",             :string
      t.column "path",              :text
      t.column "article_date",      :datetime
      t.column "article_end_date",  :datetime
      
      t.column "summary",           :text
      t.column "thumbnail_path",    :string, :limit => 255
      t.column "feature_image_path", :string, :limit => 255
      t.column "position",          :integer, :default => 0
      t.column "comment_count",     :integer, :default => 0
      
      t.column "version",           :integer, :default => 0, :null => false
      t.column "published_version", :integer, :default => 0, :null => false
      t.column "published_date",    :datetime, :null => false
      t.column "expiration_date",   :datetime
      t.column "expires",           :boolean, :default => false
      t.column "search_index",      :text
      t.column "html_head",         :text
      
      t.column "updated_by",        :integer, :null => false
      t.column "updated_by_username", :string, :null => false
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    CmsPage.create_versioned_table  # => CmsPageVersions
    
    create_table "cms_page_objects" do |t|
      t.column "cms_page_id",       :integer, :null => false
      t.column "cms_page_version",  :integer, :null => false
      
      t.column "name",              :string
      t.column "obj_type",          :string # one of [ :text, :asset ]
      t.column "content",           :text   # if :text, then text; if :asset, then asset_id
      t.column "options",           :text   # options hash
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    
    create_table "cms_page_tags" do |t|
      t.column "cms_page_id",       :integer, :null => false
      t.column "name",              :string, :null => false
      t.column "created_on",        :timestamp
    end
    
    create_table "cms_page_comments" do |t|
      t.column "cms_page_id",       :integer, :null => false
      
      t.column "owner",             :string, :null => false
      t.column "owner_url",         :string, :limit => 255
      t.column "owner_email",       :string, :limit => 255
      t.column "content",           :text
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    
    create_table "cms_assets" do |t|
      t.column "name",              :string
      t.column "content_type",      :string
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    
    create_table "cms_asset_tags" do |t|
      t.column "cms_asset_id",      :integer, :null => false
      t.column "user_id",           :integer, :null => false
      t.column "name",              :string
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    
    execute 'create index cms_snippets_name_index on cms_snippets (name(255))'
    execute 'create index cms_pages_path_index on cms_pages (path(255))'
    execute 'create index cms_page_objects_cms_page_id_obj_type_index on cms_page_objects (cms_page_id, obj_type)'
    execute 'create index cms_page_objects_cms_page_id_cms_page_version_index on cms_page_objects (cms_page_id, cms_page_version)'
  end
  
  def self.down
    execute 'drop index cms_page_objects_cms_page_id_cms_page_version_index on cms_page_objects'
    execute 'drop index cms_page_objects_cms_page_id_obj_type_index on cms_page_objects'
    execute 'drop index cms_pages_path_index on cms_pages'
    execute 'drop index cms_snippets_name_index on cms_snippets'
    
    drop_table "cms_asset_tags"
    drop_table "cms_assets"
    drop_table "cms_page_comments"
    drop_table "cms_page_tags"
    drop_table "cms_page_objects"
    drop_table "cms_page_versions"
    drop_table "cms_pages"
    drop_table "cms_snippet_versions"
    drop_table "cms_snippets"
    drop_table "cms_template_versions"
    drop_table "cms_templates"
  end
  
end
