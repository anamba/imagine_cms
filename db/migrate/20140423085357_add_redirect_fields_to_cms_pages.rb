class AddRedirectFieldsToCmsPages < ActiveRecord::Migration[4.2]
  def change
    add_column :cms_pages, :redirect_enabled, :boolean, null: false, default: false
    add_column :cms_pages, :redirect_to, :text
  end
end
