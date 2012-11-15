class AddLogsTable < ActiveRecord::Migration
  
  def up
    create_table "logs" do |t|
      t.column "name",              :string
      t.column "description",       :text
      
      t.column "created_on",        :timestamp
    end
    
    create_table "log_entries" do |t|
      t.column "log_id",            :integer, :null => false
      
      t.column "type",              :string, :null => false
      t.column "description",       :text
      t.column "data",              :text
      
      t.column "created_on",        :timestamp
    end
    add_index "log_entries", ["type"], :name => "IDX_log_entries_type"
  end
  
  def down
    drop_table "log_entries"
    drop_table "logs"
  end
  
end
