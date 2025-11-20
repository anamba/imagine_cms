class AddRedirectStatusCode < ActiveRecord::Migration[7.2]
  def change
    add_column :cms_pages, :redirect_status_code, :integer, default: 302
    add_column :cms_page_versions, :redirect_status_code, :integer, default: 302
  end
end
