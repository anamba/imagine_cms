class AddUsersTables < ActiveRecord::Migration
  
  def up
    create_table :users do |t|
      t.string :username
      t.string :password_hash, limit: 100
      
      t.string :first_name, limit: 100
      t.string :last_name, limit: 100
      
      t.text :dynamic_fields
      
      t.boolean :active, null: false, default: true
      t.boolean :is_superuser, null: false, default: true
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    add_index "users", ["username"], name: "UN_users_username", unique: true
    
    create_table :user_groups do |t|
      t.string :name
      
      t.datetime :created_on
      t.datetime :updated_on
    end
    add_index "user_groups", ["name"], name: "UN_user_groups_name", unique: true
    
    create_table :user_group_memberships, id: false do |t|
      t.integer :user_id, null: false
      t.integer :user_group_id, null: false
      t.datetime :created_on
    end
    execute 'alter table user_group_memberships add constraint PK_user_group_memberships primary key (user_id, user_group_id)'
  end
  
  def down
    drop_table :user_group_memberships
    drop_table :user_groups
    drop_table :users
  end
  
end
