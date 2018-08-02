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
        get :list_pages, :select_page, :list_pages_select
        post :list_pages, :select_page, :list_pages_select
        get :toolbar_preview
        get :page_attribute
      end
      member do
        get :toolbar_preview, :toolbar_edit
        post :set_page_version, :request_review

        get :edit_page, :show_template_options, :page_tags_for_lookup
        post :edit_page
        post :delete_page

        get :edit_page_content, :insert_page_object_config
        post :edit_page_content

        get :create_file_link, :upload_file, :receive_file
        post :create_file_link, :upload_file, :receive_file
        
        get :upload_image, :receive_image, :crop_image, :save_crop, :upload_status
        post :upload_image, :receive_image, :crop_image, :save_crop, :upload_status
        get :upload_thumb, :crop_thumb, :save_crop_thumb
        post :upload_thumb, :crop_thumb, :save_crop_thumb
        get :upload_feature_image, :crop_feature_image, :save_crop_feature_image
        post :upload_feature_image, :crop_feature_image, :save_crop_feature_image

        
        get :receive_gallery, :complete_gallery, :gallery_setup, :add_to_gallery
        post :receive_gallery, :complete_gallery, :gallery_setup, :add_to_gallery
        get :gallery_management, :select_gallery, :set_gallery_order, :save_gallery_settings
        post :gallery_management, :select_gallery, :set_gallery_order, :save_gallery_settings
        get :sort_images, :sort_images_save
        post :sort_images, :sort_images_save
        get :image_details, :update_caption
        post :image_details, :update_caption
        # get :delete_photo, :delete_gallery
        post :delete_photo, :delete_gallery
      end
    end
    resources :cms_templates
    resources :cms_snippets
  end

  resources :users, path: 'manage/users', controller: 'management/users' do
    member do
      post :enable, :disable
    end
  end
  
  match 'util/date_picker'                      => 'util#date_picker', :as => :date_picker, :via => [ :get, :post ]
  
  # primary CMS content routes
  root :to => 'cms/content#show'
  match 'rss/:page_id/:page_list_name'          => 'cms/content#rss_feed', :via => [ :get ]
  match '*content_path'                         => 'cms/content#show', :via => [ :get, :post ]
end
