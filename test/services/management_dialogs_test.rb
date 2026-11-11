require 'test_helper'

class ManagementDialogsTest < ActionController::TestCase
  tests Manage::CmsPagesController

  setup do
    # Render the engine layout without requiring a host-specific precompile manifest.
    @view_class = @controller.view_context_class
    @check_precompiled_asset = @view_class.check_precompiled_asset
    @unknown_asset_fallback = @view_class.unknown_asset_fallback
    @view_class.check_precompiled_asset = false
    @view_class.unknown_asset_fallback = true
    user = User.new(username: 'dialog-editor', password: 'test-password')
    user.first_name = 'Dialog'
    user.last_name = 'Editor'
    user.is_superuser = 1
    user.save!
    @request.session[:user_authenticated] = true
    @request.session[:user_id] = user.id
    @request.session[:user_username] = user.username
    template = CmsTemplate.create!(name: 'Dialog test', content: '<main>Dialog test</main>')
    @home = CmsPage.find_by(id: 1) || CmsPage.create!(id: 1, name: 'Home', path: '', template: template,
      updated_by: user.id, updated_by_username: user.username, published_version: 0)
  end

  teardown do
    @view_class.check_precompiled_asset = @check_precompiled_asset
    @view_class.unknown_asset_fallback = @unknown_asset_fallback
  end

  test 'authenticated page management renders CMS dialogs without loading a toolkit' do
    get :index, params: { path: '' }
    assert_response :success
    assert_select '#properties_dialog[hidden]'
    assert_select '#page_browser_dialog[hidden]'
    assert_select 'script[src*="dojo"]', count: 0
    refute_match(/dojo\.require|dojoType|Editor2/, response.body)
  end

  test 'new page properties still render in the existing CMS dialog' do
    get :new, params: { mode: 'ajax_new', parent_id: @home.id }
    assert_response :success
    assert_select '.imagine-cms-properties-form'
    refute_match(/dojo\.require|dojoType|Editor2/, response.body)
  end
end
