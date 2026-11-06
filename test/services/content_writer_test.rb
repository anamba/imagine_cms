require 'test_helper'

class ContentWriterTest < ActiveSupport::TestCase
  self.use_transactional_tests = true

  setup do
    @template = CmsTemplate.create!(name: 'Agent test', content: '<%= text_editor("main") %>')
    @page = CmsPage.create!(parent: CmsPage.find_by(path: ''), name: 'agent-test', title: 'Agent test', template: @template,
                            updated_by: 1, updated_by_username: 'editor', published_version: 0)
    @page.objects.create!(obj_type: 'text', name: 'main', content: '<p>Before</p>')
    @page.objects.create!(obj_type: 'text', name: 'other', content: '<p>Keep</p>')
  end

  test 'partial save retains untouched regions and creates a revision' do
    original_version = @page.version
    ImagineCms::ContentWriter.call(page: @page, input: { 'obj-text-main' => '<p>After</p>' },
                                  user_id: 2, username: 'agent-editor', full_access: true)
    assert_equal original_version + 1, @page.reload.version
    assert_equal 'agent-editor', @page.updated_by_username
    assert_equal 0, @page.published_version
    assert_equal({ 'main' => '<p>After</p>', 'other' => '<p>Keep</p>' },
                 @page.objects.where(cms_page_version: @page.version).pluck(:name, :content).to_h)
  end

  test 'basic editing pins the previously published version' do
    version = @page.version
    ImagineCms::ContentWriter.call(page: @page, input: {}, user_id: 2,
                                  username: 'basic', full_access: false)
    assert_equal version, @page.reload.published_version
  end

  test 'unversioned page attributes and options are not copied into content revisions' do
    @page.objects.create!(obj_type: 'attribute', name: 'heading', content: 'Current')
    @page.objects.create!(obj_type: 'option', name: 'string-theme', content: 'light')
    2.times do
      ImagineCms::ContentWriter.call(page: @page, input: {}, user_id: 1,
                                    username: 'editor', full_access: true)
    end
    assert_equal 1, @page.objects.where(obj_type: 'attribute', name: 'heading').count
    assert_equal 1, @page.objects.where(obj_type: 'option', name: 'string-theme').count
  end

  test 'invalid input rolls back revision creation' do
    version = @page.version
    assert_raises ArgumentError do
      ImagineCms::ContentWriter.call(page: @page, input: { 'invalid' => 'bad' }, user_id: 2,
                                    username: 'editor', full_access: true)
    end
    assert_equal version, @page.reload.version
  end

  test 'preview normalization matches stored source and does not mutate input' do
    source = '<p class="MsoNormal">Hello <font>world</font></p><style>bad</style><% system("no") %>'
    original = source.dup
    normalized = ImagineCms::ContentNormalizer.call('obj-text-main' => source)
    assert_equal original, source
    assert_equal '<p>Hello world</p>&lt;% system("no") %&gt;', normalized['obj-text-main']
  end
end
