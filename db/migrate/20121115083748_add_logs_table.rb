class AddLogsTable < ActiveRecord::Migration[4.2]
  
  def change
    create_table :logs do |t|
      t.string :name
      t.text :description
      
      t.datetime :created_on
    end
    
    create_table :log_entries do |t|
      t.integer :log_id, null: false
      
      t.string :type, null: false
      t.text :description
      t.text :data
      
      t.datetime :created_on
    end
    add_index "log_entries", ["type"], name: "IDX_log_entries_type"
  end
  
end
