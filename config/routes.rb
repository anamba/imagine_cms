Rails.application.routes.draw do
  # management
  match 'manage'                                => 'management/default#index', :via => [ :get ]
  match 'manage/login'                          => 'management/user#login', :via => [ :get, :post ]
  match 'manage/logout'                         => 'management/user#logout', :via => [ :get, :post ]
  match 'manage/user(/:action(/:id))'           => 'management/user', :via => [ :get, :post ]
  
  match 'manage/cms/preview_template'           => 'cms/content#preview_template', :via => [ :get ]
  match 'manage/cms(/:action(/:id))'            => 'management/cms', :via => [ :get, :post ]
  
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
  
  match 'util/date_picker'                      => 'util#date_picker', :as => :date_picker, :via => [ :get, :post ]
  
  # primary CMS content routes
  root :to => 'cms/content#show'
  match 'rss/:page_id/:page_list_name'          => 'cms/content#rss_feed', :via => [ :get ]
  match '*content_path'                         => 'cms/content#show', :via => [ :get, :post ]
end
