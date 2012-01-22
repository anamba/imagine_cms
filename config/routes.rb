Rails.application.routes.draw do
  
  # management
  match 'manage'                                => 'management/default#index'
  match 'manage/login'                          => 'management/user#login'
  match 'manage/logout'                         => 'management/user#logout'
  match 'manage/user(/:action(/:id))'           => 'management/user'
  
  match 'manage/cms/preview_template'           => 'cms/content#preview_template'
  match 'manage/cms(/:action(/:id))'            => 'management/cms'
  match 'manage/users(/:action(/:id))'          => 'management/users'
  
  # primary CMS content routes
  root :to => 'cms/content#show'
  match '*content_path' => 'cms/content#show'
  
end
