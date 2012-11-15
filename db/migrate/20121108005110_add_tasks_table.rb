class AddTasksTable < ActiveRecord::Migration
  
  def up
    create_table "tasks" do |t|
      t.column "name",              :string, :null => false
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    add_index "tasks", ["name"], :name => "UN_tasks_name", :unique => true
  end
  
  def down
    drop_table "tasks"
  end
  
end
