class Management::ApplicationController < ApplicationController
  before_filter :authenticate_user
  layout 'management'
end
