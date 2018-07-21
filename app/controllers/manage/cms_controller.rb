class Manage::CmsController < Manage::ApplicationController
  before_action :check_permissions

  protected

    def check_permissions
      if !user_has_permission?(:manage_cms)
        render '/imagine_cms/errors/permission_denied', :layout => false
        return false
      end
    end
    
end