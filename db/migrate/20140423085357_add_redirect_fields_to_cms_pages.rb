class AddRedirectFieldsToCmsPages < ActiveRecord::Migration
  def change
    add_column :cms_pages, :redirect_enabled, :boolean, :null => false, :default => false
    add_column :cms_pages, :redirect_to, :text
  end
end
