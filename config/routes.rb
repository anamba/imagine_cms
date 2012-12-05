Rails.application.routes.draw do
  
  # management
  match 'manage'                                => 'management/default#index'
  match 'manage/login'                          => 'management/user#login'
  match 'manage/logout'                         => 'management/user#logout'
  match 'manage/user(/:action(/:id))'           => 'management/user'
  
  match 'manage/cms/preview_template'           => 'cms/content#preview_template'
  match 'manage/cms(/:action(/:id))'            => 'management/cms'
  
  # slowly convert to resourceful routes
  # match 'manage/users(/:action(/:id))'          => 'management/users'
  resources :users, :path => 'manage/users', :controller => 'management/users' do
      member do
        post :enable
        post :disable
        post :edit     # COMPAT: Remove for 3.1
      end
    end
  # end
  
  match 'util/date_picker'                      => 'util#date_picker', :as => :date_picker
  
  # primary CMS content routes
  root :to => 'cms/content#show'
  match 'rss/:page_id/:page_list_name'          => 'cms/content#rss_feed'
  match '*content_path'                         => 'cms/content#show'
  
end
