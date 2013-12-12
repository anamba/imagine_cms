class Management::UsersController < Management::ApplicationController
  before_filter :check_permissions, :except => [ :edit ]
  
  def check_permissions
    render :action => 'permission_denied' if !user_has_permission?(:manage_users)
  end
  
  ###
  ### user list
  ###
  
  def index
    @users = User.order('active desc, username').all
  end
  
  def new
    @user = User.new
  end
  
  def create
    @user = User.new
    @user.username = params[:user][:username]
    @user.first_name = params[:user][:first_name]
    @user.last_name = params[:user][:last_name]
    @user.email_address = params[:user][:email_address]
    @user.password = params[:user][:password]
    @user.password_confirmation = params[:user][:password_confirmation]
    @user.active = true
    
    if request.post?
      if @user.save
        flash[:notice] = "User created successfully. Please check the boxes below to set this user's permissions, then click Save when you are done."
        redirect_to :action => 'edit', :id => @user.id
      else
        flash.now[:error] = @user.errors.full_messages.join('; ')
        render :action => 'new'
      end
    end
  end
  
  def edit
    return update if request.post?
    
    user = authenticate_user
    unless user.is_superuser || user.can_manage_users || user.id.to_s == params[:id]
      render :layout => true, :text => "Sorry, you don't have permission to access this section." and return false
    end
    
    @user = User.find(params[:id])
  end
  
  def update
    user = authenticate_user
    unless user.is_superuser || user.can_manage_users || user.id.to_s == params[:id]
      render :layout => true, :text => "Sorry, you don't have permission to access this section." and return false
    end
    
    @user = User.find(params[:id])
    
    if user.is_superuser || user.can_manage_users
      params[:user].each { |k,v| @user.send("#{k}=", v) }
    elsif user.id.to_s == params[:id]
      @user.first_name = params[:user][:first_name]
      @user.last_name = params[:user][:last_name]
      @user.email_address = params[:user][:email_address]
      @user.password = params[:user][:password]
      @user.password_confirmation = params[:user][:password_confirmation]
    end
    
    if @user.save
      flash[:notice] = 'User updated successfully. Please note that the user must log out and log back in for permission changes to take effect.'
      user = authenticate_user
      if user.is_superuser || user.can_manage_users
        redirect_to :action => 'index'
      else
        redirect_to :controller => '/manage/default', :action => 'index'
      end
    else
      flash.now[:error] = @user.errors.full_messages.join('; ')
      render :action => 'edit'
    end
  end
  
  def disable
    @user = User.find(params[:id])
    @user.active = false
    @user.save
    flash[:notice] = 'Login privileges have been suspended for ' + @user.username + '.'
    redirect_to :action => 'index'
  end
  
  def enable
    @user = User.find(params[:id])
    @user.active = true
    @user.save
    flash[:notice] = 'Login privileges for ' + @user.username + ' have been restored.'
    redirect_to :action => 'index'
  end
  
  def destroy
    @user = User.find(params[:id])
    flash[:notice] = @user.username + ' has been removed from the system.'
    @user.destroy
    redirect_to :action => 'index'
  end
end
