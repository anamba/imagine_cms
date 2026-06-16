Rails.application.routes.draw do
  # management
  match 'manage'                                => 'management/default#index', :via => [ :get ]
  match 'manage/login'                          => 'management/user#login', :via => [ :get, :post ]
  match 'manage/logout'                         => 'management/user#logout', :via => [ :get, :post ]
  match 'manage/cms/preview_template'           => 'cms/content#preview_template', :via => [ :post ]
  
  namespace :manage do
    get 'cms' => 'cms#index'

    resources :cms_pages do
      collection do
        get :list_pages
        get :select_page
        get :list_pages_select
        post :list_pages
        post :select_page
        post :list_pages_select
        get :toolbar_preview
        get :page_attribute
        
        # for new pages (no id yet)
        get :show_template_options
        post :edit_page

        # page list dialog functions
        post :page_list_add_folder
        post :page_list_add_tag
      end
      member do
        get :toolbar_preview
        get :toolbar_edit
        post :set_page_version
        post :request_review

        get :edit_page
        get :show_template_options
        post :edit_page
        post :delete_page

        get :edit_page_content
        get :insert_page_object_config
        post :edit_page_content

        get :create_file_link
        get :upload_file
        get :receive_file
        post :create_file_link
        post :upload_file
        post :receive_file
        
        get :upload_image
        get :receive_image
        get :crop_image
        get :save_crop
        get :upload_status
        post :upload_image
        post :receive_image
        post :crop_image
        post :save_crop
        post :upload_status
        get :upload_thumb
        get :crop_thumb
        get :save_crop_thumb
        post :upload_thumb
        post :crop_thumb
        post :save_crop_thumb
        get :upload_feature_image
        get :crop_feature_image
        get :save_crop_feature_image
        post :upload_feature_image
        post :crop_feature_image
        post :save_crop_feature_image

        
        get :receive_gallery
        get :complete_gallery
        get :gallery_setup
        get :add_to_gallery
        post :receive_gallery
        post :complete_gallery
        post :gallery_setup
        post :add_to_gallery
        get :gallery_management
        get :select_gallery
        get :set_gallery_order
        get :save_gallery_settings
        post :gallery_management
        post :select_gallery
        post :set_gallery_order
        post :save_gallery_settings
        get :sort_images
        get :sort_images_save
        post :sort_images
        post :sort_images_save
        get :image_details
        get :update_caption
        post :image_details
        post :update_caption
        # get :delete_photo, :delete_gallery
        post :delete_photo
        post :delete_gallery
      end
    end
    resources :cms_templates
    resources :cms_snippets
  end

  resources :users, path: 'manage/users', controller: 'management/users' do
    member do
      post :enable
      post :disable
    end
  end
  
  match 'util/date_picker'                      => 'util#date_picker', :as => :date_picker, :via => [ :get, :post ]
  
  # primary CMS content routes
  root :to => 'cms/content#show'
  match 'rss/:page_id/:page_list_name'          => 'cms/content#rss_feed', :via => [ :get ]
  match '*content_path'                         => 'cms/content#show', :via => [ :get, :post ]
end
