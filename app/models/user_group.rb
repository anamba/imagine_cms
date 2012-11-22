class UserGroup < ActiveRecord::Base # :nodoc:
  has_and_belongs_to_many :users, :join_table => 'user_group_memberships'
  
  validates_presence_of :name
  validates_uniqueness_of :name
end
