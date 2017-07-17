class AddTasksTable < ActiveRecord::Migration
  
  def change
    create_table :tasks do |t|
      t.string :name, null: false
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    add_index "tasks", ["name"], name: "UN_tasks_name", unique: true
  end
  
end
