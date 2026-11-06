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
    post :propose, params: { id: @page.id, requested_scope: 'page-local', working: {},
      changes: [{ source_id: 'obj-text-main', content: '<p>New</p>' }] }
    assert_response :success
    proposal = JSON.parse(response.body)
    assert_includes proposal['preview'], '<p>New</p>'
    post :accept, params: { id: @page.id, proposal_id: proposal['id'], working: {} }
    assert_response :success
    working = JSON.parse(response.body)['working']
    assert_equal version, @page.reload.version
    save_content(working)
    assert_response :success
    assert_equal version + 1, @page.reload.version
    assert_equal "/#{@page.path}#{@page.path.empty? ? '' : '/'}version/#{@page.version}", JSON.parse(response.body).fetch('redirect_to')
    assert_equal '<p>Other</p>', @page.objects.find_by(cms_page_version: @page.version, name: 'other').content
  end

  test 'changed working target rejects acceptance without consuming proposal' do
    post :propose, params: { id: @page.id, requested_scope: 'page-local',
      changes: [{ source_id: 'obj-text-main', content: 'Agent' }] }
    id = JSON.parse(response.body)['id']
    post :accept, params: { id: @page.id, proposal_id: id, working: { 'obj-text-main' => 'Manual edit' } }
    assert_response :conflict
    assert_nil CmsAgentProposal.find(id).consumed_at
  end

  test 'publishing changes after Apply do not block Save or get overwritten' do
    get :context, params: { id: @page.id }
    post :propose, params: { id: @page.id, requested_scope: 'page-local',
      changes: [{ source_id: 'obj-text-main', content: '<p>Applied draft</p>' }] }
    assert_response :success
    proposal_id = JSON.parse(response.body).fetch('id')
    post :accept, params: { id: @page.id, proposal_id: proposal_id, working: {} }
    assert_response :success
    working = JSON.parse(response.body).fetch('working')

    # Same operation as the existing Publish selector: publication state and
    # derived search index change without creating a content revision.
    published_version = @page.version
    @page.published_version = published_version
    @page.update_index
    @page.updated_on = 1.minute.from_now
    @page.save_without_revision!

    save_content(working)
    assert_response :success
    assert_equal published_version, @page.reload.published_version
    assert_equal '<p>Applied draft</p>', @page.objects.find_by(cms_page_version: @page.version, name: 'main').content
  end

  test 'each editor can save a revision without blocking the other draft' do
    original_version = @page.version
    ImagineCms::ContentWriter.call(page: @page, input: { 'obj-text-main' => 'First editor saved this' },
      user_id: @user.id, username: @user.username, full_access: true)
    first_version = @page.reload.version
    save_content({ 'obj-text-main' => 'Second editor saved this' })
    assert_response :success
    assert_equal original_version + 2, @page.reload.version
    assert_equal 'First editor saved this', @page.objects.find_by(cms_page_version: first_version, name: 'main').content
    assert_equal 'Second editor saved this', @page.objects.find_by(cms_page_version: @page.version, name: 'main').content
  end

  test 'html head is part of the rendered proposal before saving' do
    post :propose, params: { id: @page.id, requested_scope: 'page-local',
      changes: [{ source_id: 'property:html_head', content: '<style>body { background: red; }</style>' }] }
    assert_response :success
    assert_includes JSON.parse(response.body)['preview'], '<head><style>body { background: red; }</style></head>'
    assert_nil @page.reload.html_head
  end

  test 'template changes do not block applying page content' do
    post :propose, params: { id: @page.id, requested_scope: 'page-local',
      changes: [{ source_id: 'obj-text-main', content: 'Proposed' }] }
    id = JSON.parse(response.body)['id']
    @page.template.update!(content: '<article><%= text_editor("main") %></article>')
    post :accept, params: { id: @page.id, proposal_id: id, working: {} }
    assert_response :success
    assert CmsAgentProposal.find(id).consumed_at
    assert_equal 'Proposed', JSON.parse(response.body)['working']['obj-text-main']
  end

  test 'new configuration fields belong to an authorized rendered page list' do
    @page.template.update!(content: '<main><%= page_list("news") %></main>')
    save_content({
      'obj-page_list-news-sources-tag-count' => '2',
      'obj-page_list-news-sources-tag0' => 'First',
      'obj-page_list-news-sources-tag1' => 'Second'
    })
    assert_response :success
    assert_equal 'Second', @page.objects.find_by(cms_page_version: @page.reload.version,
      name: 'news-sources-tag1', obj_type: 'page_list').content
  end

  test 'property save preserves staged content' do
    post :propose, params: { id: @page.id, requested_scope: 'page-local',
      working: { 'obj-text-main' => 'Unsaved' }, changes: [{ source_id: 'property:title', content: 'New title' }] }
    assert_response :success
    proposal = JSON.parse(response.body)
    post :accept, params: { id: @page.id, proposal_id: proposal['id'], working: { 'obj-text-main' => 'Unsaved' } }
    assert_response :success
    assert_equal 'New title', @page.reload.title
    assert_equal '<p>Old</p>', @page.objects.find_by(cms_page_version: @page.version, name: 'main').content
    assert_includes JSON.parse(response.body)['preview'], 'Unsaved'
  end

  test 'ordinary HTML Save redirects to the revision just like preview Save' do
    save_content({ 'obj-text-main' => '<p>Saved normally</p>' }, format: :html)
    @page.reload
    assert_redirected_to "/#{@page.path}#{@page.path.empty? ? '' : '/'}version/#{@page.version}"
  end

  test 'JSON Save retains section restrictions and does not create a revision when denied' do
    @user.cms_allowed_sections = '/not-allowed'
    @user.save!
    assert_no_difference 'CmsPageVersion.count' do
      save_content({ 'obj-text-main' => 'Not permitted' })
      assert_response :forbidden
    end
  end

  private

  def save_content(content, format: :json)
    @controller = Manage::CmsPagesController.new
    post :edit_page_content, params: { id: @page.id, page_objects: content }, format: format
  end
end
