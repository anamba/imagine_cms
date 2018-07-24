class AddRedirectFieldsToCmsPageVersions < ActiveRecord::Migration[4.2]
  def change
    add_column :cms_page_versions, :redirect_enabled, :boolean, null: false, default: false
    add_column :cms_page_versions, :redirect_to, :text
  end
end
