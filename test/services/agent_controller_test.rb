require 'test_helper'

class AgentControllerTest < ActionController::TestCase
  tests Cms::AgentController

  setup do
    @controller.prepend_view_path File.expand_path('../support/views', __dir__)
    @original_layout = Cms::AgentController._layout
    Cms::AgentController.layout 'cms/agent_test'
    @user = User.new(username: 'agent-editor', password: 'test-password')
    @user.first_name = 'Agent'
    @user.last_name = 'Editor'
    @user.is_superuser = 1
    @user.save!
    @request.session[:user_authenticated] = true
    @request.session[:user_id] = @user.id
    @request.session[:user_username] = @user.username
    template = CmsTemplate.create!(name: 'Agent controller', content: '<main><%= text_editor("main") %><%= text_editor("other") %></main>')
    @page = CmsPage.create!(parent: CmsPage.find_by(path: ''), name: 'agent-controller', title: 'Agent', template: template,
      updated_by: @user.id, updated_by_username: @user.username, published_version: 0)
    @page.objects.create!(name: 'main', obj_type: 'text', content: '<p>Old</p>')
    @page.objects.create!(name: 'other', obj_type: 'text', content: '<p>Other</p>')
  end

  teardown do
    Cms::AgentController.layout @original_layout
  end

  test 'anonymous context is denied' do
    @request.session.clear
    get :context, params: { id: @page.id }
    assert_response :unauthorized
    assert_not_includes response.body, 'Old'
  end

  test 'context renders named sources and does not cache' do
    get :context, params: { id: @page.id }
    assert_response :success
    data = JSON.parse(response.body)
    assert_includes data['preview'], 'cms-source:'
    assert_includes data['sources'].map { |s| s['id'] }, 'obj-text-main'
    assert_equal 'no-store', response.headers['Cache-Control']
  end

  test 'content proposal applies without saving and explicit save persists' do
    version = @page.version
    post :propose, params: { id: @page.id, base: ImagineCms::ContentWriter.snapshot(@page), requested_scope: 'page-local', working: {},
      changes: [{ source_id: 'obj-text-main', content: '<p>New</p>' }] }
    assert_response :success
    proposal = JSON.parse(response.body)
    assert_includes proposal['preview'], '<p>New</p>'
    post :accept, params: { id: @page.id, proposal_id: proposal['id'], working: {} }
    assert_response :success
    working = JSON.parse(response.body)['working']
    assert_equal version, @page.reload.version
    post :save, params: { id: @page.id, working: working, base: ImagineCms::ContentWriter.snapshot(@page) }
    assert_response :success
    assert_equal version + 1, @page.reload.version
    assert_equal '<p>Other</p>', @page.objects.find_by(cms_page_version: @page.version, name: 'other').content
  end

  test 'changed working target rejects acceptance without consuming proposal' do
    post :propose, params: { id: @page.id, base: ImagineCms::ContentWriter.snapshot(@page), requested_scope: 'page-local',
      changes: [{ source_id: 'obj-text-main', content: 'Agent' }] }
    id = JSON.parse(response.body)['id']
    post :accept, params: { id: @page.id, proposal_id: id, working: { 'obj-text-main' => 'Manual edit' } }
    assert_response :conflict
    assert_nil CmsAgentProposal.find(id).consumed_at
  end

  test 'new immediate proposal cannot acknowledge unrelated concurrent content changes' do
    base = ImagineCms::ContentWriter.snapshot(@page)
    ImagineCms::ContentWriter.call(page: @page, input: { 'obj-text-main' => 'Concurrent' },
      user_id: @user.id, username: @user.username, full_access: true)
    assert_no_difference 'CmsAgentProposal.count' do
      post :propose, params: { id: @page.id, base: base, requested_scope: 'page-local',
        working: { 'obj-text-main' => 'Staged before concurrent edit' },
        changes: [{ source_id: 'property:title', content: 'New title' }] }
      assert_response :conflict
    end
  end

  test 'html head is part of the rendered proposal before saving' do
    post :propose, params: { id: @page.id, base: ImagineCms::ContentWriter.snapshot(@page), requested_scope: 'page-local',
      changes: [{ source_id: 'property:html_head', content: '<style>body { background: red; }</style>' }] }
    assert_response :success
    assert_includes JSON.parse(response.body)['preview'], '<head><style>body { background: red; }</style></head>'
    assert_nil @page.reload.html_head
  end

  test 'template changes invalidate an already previewed content proposal' do
    post :propose, params: { id: @page.id, base: ImagineCms::ContentWriter.snapshot(@page), requested_scope: 'page-local',
      changes: [{ source_id: 'obj-text-main', content: 'Proposed' }] }
    id = JSON.parse(response.body)['id']
    @page.template.update!(content: '<article><%= text_editor("main") %></article>')
    post :accept, params: { id: @page.id, proposal_id: id, working: {} }
    assert_response :conflict
    assert_nil CmsAgentProposal.find(id).consumed_at
  end

  test 'new configuration fields belong to an authorized rendered page list' do
    @page.template.update!(content: '<main><%= page_list("news") %></main>')
    base = ImagineCms::ContentWriter.snapshot(@page)
    post :save, params: { id: @page.id, base: base, working: {
      'obj-page_list-news-sources-tag-count' => '2',
      'obj-page_list-news-sources-tag0' => 'First',
      'obj-page_list-news-sources-tag1' => 'Second'
    } }
    assert_response :success
    assert_equal 'Second', @page.objects.find_by(cms_page_version: @page.reload.version,
      name: 'news-sources-tag1', obj_type: 'page_list').content
  end

  test 'property save preserves staged content' do
    post :propose, params: { id: @page.id, base: ImagineCms::ContentWriter.snapshot(@page), requested_scope: 'page-local',
      working: { 'obj-text-main' => 'Unsaved' }, changes: [{ source_id: 'property:title', content: 'New title' }] }
    assert_response :success
    proposal = JSON.parse(response.body)
    post :accept, params: { id: @page.id, proposal_id: proposal['id'], working: { 'obj-text-main' => 'Unsaved' } }
    assert_response :success
    assert_equal 'New title', @page.reload.title
    assert_equal '<p>Old</p>', @page.objects.find_by(cms_page_version: @page.version, name: 'main').content
    assert_includes JSON.parse(response.body)['preview'], 'Unsaved'
  end
end
