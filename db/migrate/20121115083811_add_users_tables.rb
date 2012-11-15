class AddUsersTables < ActiveRecord::Migration
  
  def self.up
    create_table "users" do |t|
      t.column "username",          :string
      t.column "password_hash",     :string, :limit => 100
      
      t.column "first_name",        :string, :limit => 100
      t.column "last_name",         :string, :limit => 100
      
      t.column "dynamic_fields",    :text
      
      t.column "active",            :integer, :default => 1, :null => false
      t.column "is_superuser",      :integer, :default => 0, :null => false
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    add_index "users", ["username"], :name => "UN_users_username", :unique => true
    
    create_table "user_groups" do |t|
      t.column "name",              :string
      
      t.column "created_on",        :timestamp
      t.column "updated_on",        :timestamp
    end
    add_index "user_groups", ["name"], :name => "UN_user_groups_name", :unique => true
    
    create_table "user_group_memberships", :id => false do |t|
      t.column "user_id",           :integer, :null => false
      t.column "user_group_id",     :integer, :null => false
      t.column "created_on",        :timestamp
    end
    execute 'alter table user_group_memberships add constraint PK_user_group_memberships primary key (user_id, user_group_id)'
  end
  
  def self.down
    drop_table "user_group_memberships"
    drop_table "user_groups"
    drop_table "users"
  end
  
end
