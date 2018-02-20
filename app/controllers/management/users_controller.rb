class Management::UsersController < Management::ApplicationController
  before_filter :check_permissions, except: [ :edit, :update ]
  
  def check_permissions
    render :action => 'permission_denied' if !user_has_permission?(:manage_users)
  end
  
  ###
  ### user list
  ###
  
  def index
    @usrs = User.order('active desc, username').all
  end
  
  def new
    @usr = User.new
  end
  
  def create
    @usr = User.new
    @usr.username = params[:user][:username]
    @usr.first_name = params[:user][:first_name]
    @usr.last_name = params[:user][:last_name]
    @usr.email_address = params[:user][:email_address]
    @usr.password = params[:user][:password]
    @usr.password_confirmation = params[:user][:password_confirmation]
    @usr.active = true
    
    if request.post?
      if @usr.save
        flash[:notice] = "User created successfully. Please check the boxes below to set this user's permissions, then click Save when you are done."
        redirect_to action: 'edit', id: @usr.id
      else
        flash.now[:error] = @usr.errors.full_messages.join('; ')
        render :action => 'new'
      end
    end
  end
  
  def edit
    return update if request.post?
    
    unless user_has_permission?(:manage_users) || @user.id == params[:id].to_i
      render plain: "Sorry, you don't have permission to access this section.", layout: true and return false
    end
    
    @usr = User.find(params[:id])
  end
  
  def update
    @usr = User.find(params[:id])
    
    unless user_has_permission?(:manage_users) || @user.id == @usr.id
      render plain: "Sorry, you don't have permission to access this section.", layout: true and return false
    end
    
    if user_has_permission?(:manage_users)
      params[:user].each { |k,v| @usr.send("#{k}=", v) }
    elsif @user.id == @usr.id
      @usr.first_name = params[:user][:first_name]
      @usr.last_name = params[:user][:last_name]
      @usr.email_address = params[:user][:email_address]
      @usr.password = params[:user][:password]
      @usr.password_confirmation = params[:user][:password_confirmation]
    end
    
    if @usr.save
      if user_has_permission?(:manage_users)
        flash[:notice] = 'User updated successfully. Please note that the user must log out and log back in for permission changes to take effect.'
        redirect_to action: 'index'
      else
        flash[:notice] = 'Account updated successfully.'
        redirect_to controller: '/management/default', action: 'index'
      end
    else
      flash.now[:error] = @usr.errors.full_messages.join('; ')
      render action: 'edit'
    end
  end
  
  def disable
    @usr = User.find(params[:id])
    @usr.active = false
    @usr.save
    flash[:notice] = 'Login privileges have been suspended for ' + @usr.username + '.'
    redirect_to :action => 'index'
  end
  
  def enable
    @usr = User.find(params[:id])
    @usr.active = true
    @usr.save
    flash[:notice] = 'Login privileges for ' + @usr.username + ' have been restored.'
    redirect_to :action => 'index'
  end
  
  def destroy
    @usr = User.find(params[:id])
    flash[:notice] = @usr.username + ' has been removed from the system.'
    @usr.destroy
    redirect_to :action => 'index'
  end
end
