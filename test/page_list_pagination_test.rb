require 'test_helper'

class PageListPaginationTest < ActionController::TestCase
  tests Cms::ContentController

  setup do
    @controller.prepend_view_path File.expand_path('support/views', __dir__)
    @original_layout = Cms::ContentController._layout
    Cms::ContentController.layout 'cms/pagination_test'
    @template = CmsTemplate.create!(name: 'Pagination test', content: '<%= page_list("feed", folders: "pagination-items", item_count: 2, pagination_mode: "load_more", header: "<ul>", footer: "</ul>", template: "<li><a href=\'<#path#>\'><#title#></a></li>") %>')
    root = CmsPage.find_by(path: '') || CmsPage.create!(name: 'home', title: 'Home', template: @template, updated_by: 1, updated_by_username: "test", published_version: 0)
    @page = CmsPage.create!(parent: root, name: 'pagination-test', title: 'Pagination', template: @template, updated_by: 1, updated_by_username: "test", published_version: 0)
    @folder = CmsPage.create!(parent: root, name: 'pagination-items', title: 'Items', template: @template, updated_by: 1, updated_by_username: "test", published_version: 0)
    @items = 5.times.map do |i|
      CmsPage.create!(parent: @folder, name: "item-#{i}", title: "Item #{i}", template: @template,
        updated_by: 1, updated_by_username: "test", published_version: 0, published_date: 1.day.ago, article_date: 1.day.ago, position: i)
    end
  end

  teardown do
    Cms::ContentController.layout @original_layout
  end

  def append(offset: 2, name: 'feed', seed: '123')
    @controller.instance_variable_set(:@page_list_seeds, nil)
    @request.headers['Accept'] = 'application/json'
    get :show, params: { content_path: "#{@page.path}/segment/#{offset}/#{name}", append: '1', seed: seed }
  end

  test 'initial markup includes one frame and a seeded continuation' do
    get :show, params: { content_path: @page.path }
    assert_response :success
    assert_select 'ul', count: 1
    assert_select 'li', count: 2
    assert_select '[data-cms-pagination="obj-page_list-feed"]', count: 1
    assert_includes response.body, 'seed='
    assert_includes response.body, 'cms-list-end:obj-page_list-feed'
    assert_select 'script[src*="imagine_cms/page_list"]', count: 1
  end

  test 'append returns only item markup and final metadata' do
    append
    assert_response :success
    assert_equal 'no-store', response.headers['Cache-Control']
    data = JSON.parse(response.body)
    assert_equal 2, data['count']
    assert_includes data['html'], 'Item 2'
    assert_not_includes data['html'], '<ul>'
    assert_not_includes data['html'], '<script'
    assert_includes data['next_url'], '/segment/4/feed'
    assert_includes data['next_url'], 'seed=123'
    append(offset: 4)
    data = JSON.parse(response.body)
    assert_equal 1, data['count']
    assert_nil data['next_url']
    append(offset: 8)
    assert_equal 0, JSON.parse(response.body)['count']
  end

  test 'invalid offset seed and unknown list do not produce batches' do
    append(offset: '-2')
    assert_response :bad_request
    append(seed: '4294967296')
    assert_response :bad_request
    assert_raises(ActionController::RoutingError) { append(name: 'missing') }
  end

  test 'ordinary segment response stays HTML with numbered controls' do
    @template.update!(content: @template.content.sub('pagination_mode: "load_more"', 'use_pagination: 1'))
    get :show, params: { content_path: "#{@page.path}/segment/2/feed" }
    assert_response :success
    assert_match 'text/html', response.media_type
    assert_select '.imagine_cms-paginator', count: 1
    assert_select 'li', count: 2
    assert_select '[data-cms-pagination]', count: 0
  end

  test 'mode resolution preserves legacy options and explicit none' do
    @controller.instance_variable_set(:@page_objects, OpenStruct.new('obj-page_list-feed-use-pagination' => '1'))
    assert_equal 'numbered', @controller.page_list_pagination_mode('obj-page_list-feed')
    assert_equal 'none', @controller.page_list_pagination_mode('obj-page_list-feed', pagination_mode: 'none')
    assert_equal 'none', @controller.page_list_pagination_mode('obj-page_list-feed', use_pagination: 0)
  end

  test 'seeded batches reproduce one ordering after skip and pool limit' do
    @template.update!(content: @template.content.sub('item_count: 2', 'item_count: 2, item_offset: 1, use_randomization: true, random_pool_size: 4'))
    append(offset: 0)
    first = JSON.parse(response.body)
    append(offset: 2)
    second = JSON.parse(response.body)
    ids = (first['html'] + second['html']).scan(/cms-owner:(\d+):start/).flatten.map(&:to_i)
    assert_equal @items.drop(1).map(&:id).sort, ids.sort
    assert_equal 4, ids.uniq.size
    append(offset: 0)
    assert_equal first, JSON.parse(response.body)
    assert_nil second['next_url']
  end

  test 'offline items remain unavailable and offline owner cannot serve append' do
    @items[2].update_columns(published_version: -1)
    append(offset: 0)
    first = JSON.parse(response.body)
    append(offset: 2)
    second = JSON.parse(response.body)
    assert_not_includes first['html'] + second['html'], "cms-owner:#{@items[2].id}:start"
    @page.update_columns(published_version: -1)
    assert_raises(ActionController::RoutingError) { append }
    @request.session[:user_authenticated] = true
    append
    assert_response :success
    assert_equal 'no-store', response.headers['Cache-Control']
  end
  test 'saved mode survives a content revision and subsequent segment rendering' do
    @template.update!(content: @template.content.sub(', pagination_mode: "load_more"', ''))
    ImagineCms::ContentWriter.call(page: @page, input: { 'obj-page_list-feed-pagination-mode' => 'infinite' },
      user_id: 1, username: 'test', full_access: true)
    get :show, params: { content_path: @page.path }
    assert_response :success
    assert_select '[data-mode="infinite"]', count: 1
    append
    assert_response :success
    assert_equal 2, JSON.parse(response.body)['count']
  end

  test 'seed does not affect other lists and next URL retains explicit preview version' do
    @request.session[:user_authenticated] = true
    @controller.instance_variable_set(:@page_objects, OpenStruct.new)
    @controller.params[:append] = '1'
    @controller.params[:page_list_name] = 'feed'
    @controller.params[:seed] = '123'
    assert_equal 123, @controller.page_list_seed('obj-page_list-feed')
    other_seed = @controller.page_list_seed('obj-page_list-other')
    assert_equal other_seed, @controller.page_list_seed('obj-page_list-other')
    @controller.instance_variable_set(:@pg, @page)
    @controller.params[:version] = '3'
    url = @controller.page_list_segment_url('feed', 2, append: true, seed: 123)
    assert_includes url, '/segment/2/feed/version/3'
    assert_includes url, 'seed=123'
  end

  test 'explicit draft continuation requires authentication and preserves version after login' do
    published = @page.version
    @page.update_columns(published_version: published)
    ImagineCms::ContentWriter.call(page: @page, input: { 'obj-page_list-feed-pagination-mode' => 'load_more' },
      user_id: 1, username: 'test', full_access: true)
    path = "#{@page.path}/segment/2/feed/version/#{@page.version}"
    get :show, params: { content_path: path, append: '1', seed: '42' }
    assert_response :redirect
    user = User.new(username: 'pagination-preview', password: 'test-password')
    user.first_name = 'Pagination'
    user.last_name = 'Preview'
    user.is_superuser = 1
    user.save!
    @request.session[:user_authenticated] = true
    @request.session[:user_id] = user.id
    @request.session[:user_username] = user.username
    get :show, params: { content_path: path, append: '1', seed: '42' }
    assert_response :success
    assert_equal 'no-store', response.headers['Cache-Control']
    data = JSON.parse(response.body)
    assert_equal 2, data['count']
    assert_includes data['next_url'], "/version/#{@page.version}"
    assert_includes data['next_url'], 'seed=42'
  end

  test 'calendar lists retain calendar dispatch even with an append option' do
    @controller.instance_variable_set(:@pg, @page)
    @controller.instance_variable_set(:@page_objects,
      OpenStruct.new('obj-page_list-feed-style-display-as' => 'calendar'))
    rendered = {}
    @controller.define_singleton_method(:render) { |**args| rendered.merge!(args); 'calendar' }
    @controller.insert_object('feed', :page_list,
      folders: 'pagination-items', pagination_mode: 'infinite')
    assert_equal 'page_list_calendar', rendered[:partial]
    assert_equal 5, rendered[:locals][:pages].size
  end

end
