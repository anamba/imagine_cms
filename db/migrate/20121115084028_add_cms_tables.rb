class AddCmsTables < ActiveRecord::Migration[4.2]
  
  class CmsTemplate < ActiveRecord::Base ; acts_as_versioned ; end
  class CmsSnippet < ActiveRecord::Base ; acts_as_versioned ; end
  class CmsPage < ActiveRecord::Base ; acts_as_versioned ; end
  
  def up
    create_table :cms_templates do |t|
      t.string :name
      t.text :content
      t.text :options_yaml
      
      t.integer :version, default: 0, null: false
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    CmsTemplate.create_versioned_table  # => CmsTemplateVersions

    CmsTemplate.create(
      name: 'Default',
      content: '',
      options_yaml: '',
    )
    
    create_table :cms_snippets do |t|
      t.string :name
      t.text :content
      
      t.integer :version, default: 0, null: false
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    CmsSnippet.create_versioned_table  # => CmsSnippetVersions
    
    create_table :cms_pages do |t|
      t.integer :cms_template_id, null: false
      t.integer :cms_template_version, null: false
      
      t.integer :parent_id, references: :cms_pages
      
      t.string :name
      t.string :title
      t.string :path
      t.datetime :article_date
      t.datetime :article_end_date
      
      t.text :summary
      t.string :thumbnail_path
      t.string :feature_image_path
      t.integer :position, default: 0
      t.integer :comment_count, default: 0
      
      t.integer :version, default: 0, null: false
      t.integer :published_version, default: 0, null: false
      t.datetime :published_date, null: false
      t.datetime :expiration_date
      t.boolean :expires, default: false
      t.text :search_index
      t.text :html_head
      
      t.integer :updated_by, null: false
      t.string :updated_by_username, null: false
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    CmsPage.create_versioned_table  # => CmsPageVersions

    CmsPage.create(
      cms_template_id: CmsTemplate.first.id,
      name: 'Home',
      title: 'Home',
      path: '',
      updated_by: User.first.id,
      updated_by_username: User.first.username,
    )
    
    create_table :cms_page_objects do |t|
      t.integer :cms_page_id, null: false
      t.integer :cms_page_version, null: false
      
      t.string :name
      t.string :obj_type    # one of [ :text, :asset ]
      t.text :content       # if :text, then text; if :asset, then asset_id
      t.text :options       # options hash
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    
    create_table :cms_page_tags do |t|
      t.integer :cms_page_id, null: false
      t.string :name, null: false
      
      t.datetime :created_on
    end
    
    create_table :cms_page_comments do |t|
      t.integer :cms_page_id, null: false
      
      t.string :owner, null: false
      t.string :owner_url
      t.string :owner_email
      t.text :content
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    
    create_table :cms_assets do |t|
      t.string :name
      t.string :content_type
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    
    create_table :cms_asset_tags do |t|
      t.integer :cms_asset_id, null: false
      t.integer :user_id, null: false
      t.string :name
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    
    execute 'create index cms_snippets_name_index on cms_snippets (name(255))'
    execute 'create index cms_pages_path_index on cms_pages (path(255))'
    execute 'create index cms_page_objects_cms_page_id_obj_type_index on cms_page_objects (cms_page_id, obj_type)'
    execute 'create index cms_page_objects_cms_page_id_cms_page_version_index on cms_page_objects (cms_page_id, cms_page_version)'
  end
  
  def down
    execute 'drop index cms_page_objects_cms_page_id_cms_page_version_index on cms_page_objects'
    execute 'drop index cms_page_objects_cms_page_id_obj_type_index on cms_page_objects'
    execute 'drop index cms_pages_path_index on cms_pages'
    execute 'drop index cms_snippets_name_index on cms_snippets'
    
    drop_table :cms_asset_tags
    drop_table :cms_assets
    drop_table :cms_page_comments
    drop_table :cms_page_tags
    drop_table :cms_page_objects
    drop_table :cms_page_versions
    drop_table :cms_pages
    drop_table :cms_snippet_versions
    drop_table :cms_snippets
    drop_table :cms_template_versions
    drop_table :cms_templates
  end
  
end
