class AddSettingsTable < ActiveRecord::Migration
  
  def up
    create_table "settings" do |t|
      t.column "name",              :string, :null => false
      t.column "value",             :text
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    add_index "settings", ["name"], :name => "UN_settings_name", :unique => true
  end
  
  def down
    drop_table "settings"
  end
  
end
