class AddSettingsTable < ActiveRecord::Migration[4.2]
  
  def change
    create_table :settings do |t|
      t.string :name, null: false
      t.text :value
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    add_index "settings", ["name"], name: "UN_settings_name", unique: true
  end
  
end
