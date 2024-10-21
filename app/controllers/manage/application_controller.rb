class Manage::ApplicationController < ActionController::Base
  before_action :authenticate_user
  layout 'management'
end
