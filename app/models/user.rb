class User < ActiveRecord::Base # :nodoc:
  require 'dynamic_methods'
  include DynamicMethods
  
  attr_accessible :first_name, :last_name
  attr_reader :password # :nodoc:
  
  has_and_belongs_to_many :groups, :class_name => 'UserGroup', :join_table => 'user_group_memberships'
  
  validates_presence_of [ :username, :password, :first_name, :last_name ], :message => 'is required'
  validates_length_of :password, :minimum => 4
  validates_uniqueness_of :username, :message => 'already in use'
  validates_confirmation_of :password
  
  before_validation :fake_password_confirmation, :on => :update
  
  def name ; [ first_name, last_name ].compact.join(' ') ; end
  
  SaltLength = 16 unless defined?(SaltLength) # :nodoc:
  
  def password=(val) # :nodoc:
    @password = val
    self.password_hash = User.hash_password(val) if (val ||= "") != ""
  end
  
  def self.hash_password(val, salt = '') # :nodoc:
    require 'digest/sha1'
    
    # create the salt if we need to
    if salt.length != SaltLength
      salt = ''
      allowed_chars = (('a'..'f').to_a).concat(('0'..'9').to_a)
      SaltLength.times do
        salt << allowed_chars[rand(allowed_chars.length)]
      end
    end
    
    # now, let the hashing begin
    digest = Digest::SHA1.new
    digest << salt << val
    salt << digest.hexdigest
  end
  
  def fake_password_confirmation # :nodoc:
    # if password is blank, user is not trying to change it.
    # just appease the validator by setting something valid
    if ((@password ||= "") == "")
      @password = "imapassword" 
      @password_confirmation = "imapassword" 
    end
  end
end
