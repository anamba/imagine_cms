class Management::UserController < Management::ApplicationController
  skip_before_action :authenticate_user, :only => [ :login, :logout, :create_first ]
  
  ###
  ### login
  ###
  
  # login page
  def login
    if request.post?
      test = ::User.find_by_username(params[:login][:username]) rescue nil
      if (test && test.password_hash == User.hash_password(params[:login][:password], test.password_hash[0,16]))
        if (test.active != 1)
          flash[:error] = 'Your account has been disabled by an administrator.'
          redirect_to :action => 'login' and return false
        end
        session[:user_authenticated] = true
        
        session[:user_id] = test.id
        session[:user_username] = test.username
        session[:user_first_name] = test.first_name
        session[:user_last_name] = test.last_name
        
        complete_login(test)
        
        if params[:redirect_on_success]
          redirect_to params[:redirect_on_success] and return
        else
          restore_request(test)
        end
      else
        flash[:error] = 'Invalid username or password, please try again.'
        redirect_to params[:redirect_on_failure] || { :action => 'login' }
      end
    end
  end
  
  def complete_login(user)
  end
  
  def restore_request(user)
    # restore saved request uri & params if they exist
    if session[:saved_user_uri]
      uri = session[:saved_user_uri]
      session[:saved_user_uri] = nil
      redirect_to uri
    else
      return redirect_to_default(user)
    end
  end
  
  def redirect_to_default(user)
    redirect_to UserRedirectAfterLogin and return if defined?(UserRedirectAfterLogin)
    redirect_to :controller => '/management/default', :action => 'index'
  end
  
  
  ###
  ### logout
  ###
  
  def logout
    complete_logout(User.find_by_id(session[:user_id])) if session[:authenticated]
    reset_session
    cookies.delete(:user_auth_status)
    flash[:notice] = 'You have been logged out of the system.'
    redirect_to UserRedirectAfterLogout and return if defined?(UserRedirectAfterLogout)
    redirect_to params[:redirect] and return unless params[:redirect].blank?
    redirect_to :action => 'login'
  end
  
  def complete_logout(user)
  end
  
  
  ###
  ### update profile
  ###
  
  def profile
    @user = User.find(session[:user_id])
    
    if request.post?
      @user.attributes = @user.attributes.update(params[:user])
      
      if @user.save
        flash[:notice] = 'Your profile has been updated.'
        redirect_to :action => 'profile' and return true
      end
    end
  end
  
  
  ###
  ### first time setup
  ###
  
  def create_first
    redirect_to :action => 'login' and return unless User.list.empty?
    @user = User.new(params[:user])
    
    if request.post?
      @user.active = true
      @user.is_superuser = true
      
      if @user.save
        flash[:notice] = 'User created successfully. Please log in now.'
        redirect_to :controller => 'user', :action => 'login'
      else
        @errors = 'The following errors occurred:'
        @errors = @user.errors.full_messages
        flash.now[:error] = @errors
      end
    end
  end
end
