class Manage::ApplicationController < ApplicationController
  before_action :authenticate_user
  layout 'management'
end
