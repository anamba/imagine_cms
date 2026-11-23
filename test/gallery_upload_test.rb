# Run independently of the dummy application's database:
# ruby test/gallery_upload_test.rb
require "minitest/autorun"
require "tmpdir"
require "pathname"
require "logger"
require "ostruct"
require "json"
require "bigdecimal"
require "zip"
gem "mini_magick", "< 5"
require "mini_magick"
require "rmagick"
require "yaml"
require "action_view"
require "erb"

# Exercise the controller's actual methods with real ZIPs and image processing,
# isolating only page lookup, Rails root/logger, and response rendering.
module GalleryUploadHarness
  Rails = OpenStruct.new(logger: Logger.new(File::NULL))
  CmsPage = Object.new
  def CmsPage.find(_id)
    OpenStruct.new(path: "news")
  end

  def CmsPage.find_by_id(id)
    find(id)
  end

  GalleryMaxWidth = 586
  GalleryMaxHeight = 440
  GalleryThumbWidth = 50
  GalleryThumbHeight = 50
  module ImagineCms
    Engine = OpenStruct.new(root: File.expand_path("..", __dir__))
  end

  class Controller
    def request
      OpenStruct.new(xhr?: xhr)
    end

    def session
      @session ||= {}
    end

    attr_accessor :params, :xhr
    attr_reader :result

    def render(**options)
      @result = options
    end

    def upload_progress
      @upload_progress ||= OpenStruct.new
    end

    def redirect_to(**options)
      @result = options
    end
  end
  source = File.read(File.expand_path("../app/controllers/manage/cms_pages_controller.rb", __dir__))
  ["receive_gallery", "delete_gallery", "add_to_gallery"].each do |name|
    method_source = source[/^  def #{name}\n.*?^  end$/m]
    raise "Cannot locate #{name}" unless method_source
    module_eval("class Controller\n#{method_source}\nend", __FILE__, __LINE__)
  end
  %w[create_captions_file append_gallery_images stage_gallery_image create_preview_image].each do |name|
    method_source = source[/^    def #{name}\b.*?^    end$/m]
    Controller.class_eval(method_source, __FILE__, __LINE__)
  end
  TOPLEVEL_BINDING.eval(source[/^module MiniMagick\n.*\z/m], __FILE__, __LINE__)
end

class GalleryUploadTest < Minitest::Test
  def setup
    @root = Pathname.new(Dir.mktmpdir("gallery-upload-test"))
    GalleryUploadHarness::Rails.root = @root
    @target = @root.join("public/assets/content/news")
    @controller = GalleryUploadHarness::Controller.new
    @controller.params = { id: 1 }
    @controller.xhr = true
  end

  def teardown
    FileUtils.rm_rf(@root)
  end

  def upload(entries)
    zip = @root.join("photos.zip")
    Zip::File.open(zip, create: true) do |archive|
      entries.each { |name, content| archive.get_output_stream(name) { |out| out.write(content) } }
    end
    @controller.params[:gallery_file] = { data: OpenStruct.new(path: zip.to_s) }
    @controller.receive_gallery
    @controller.result
  end

  def image_data
    image = @root.join("source.png")
    MiniMagick::Tool::Convert.new do |command|
      command.size("80x80")
      command << "plasma:fractal"
      command << image.to_s
    end
    File.binread(image)
  end

  def append_to_gallery(filename, bytes)
    gallery = @target.join("gallery_1")
    FileUtils.mkdir_p(gallery.join("management"))
    gallery.join("1.jpg").write("existing photo")
    gallery.join("1-thumb.jpg").write("existing thumbnail")
    gallery.join("captions.yml").write("---\n- 0\n- Existing caption\n")
    @controller.params[:gallery_id] = "gallery_1"
    @root.join(filename).binwrite(bytes)
    File.open(@root.join(filename), "rb") do |file|
      file.define_singleton_method(:original_filename) { filename }
      @controller.params[:gallery_file] = { data: file }
      @controller.add_to_gallery
    end
    gallery
  end

  def test_appends_one_image_and_refreshes_existing_gallery
    gallery = append_to_gallery("photo.PNG", image_data)
    assert_equal({ partial: "gallery_index", formats: [:html] }, @controller.result)
    assert_equal "existing photo", gallery.join("1.jpg").read
    assert_equal [0, "Existing caption"], YAML.load_file(gallery.join("captions.yml"))
    assert_equal "JPEG", MiniMagick::Image.open(gallery.join("2.jpg").to_s).type
    assert gallery.join("2-thumb.jpg").file?
    assert gallery.join("management/2.jpg").file?
  end

  def test_regular_upload_redirects_back_to_existing_gallery
    @controller.xhr = false
    append_to_gallery("photo.png", image_data)

    assert_equal "gallery_management", @controller.result[:action]
    assert_equal "gallery_1", @controller.result[:gallery_id]
    assert_equal :see_other, @controller.result[:status]
  end

  def test_appends_zip_photos_after_highest_existing_id
    archive = @root.join("archive.zip")
    photo = image_data
    Zip::File.open(archive, create: true) do |zip|
      zip.get_output_stream("nested/a.png") { |stream| stream.write(photo) }
      zip.get_output_stream("nested/._a.png") { |stream| stream.write("ignored") }
      zip.get_output_stream("nested/b.PNG") { |stream| stream.write(photo) }
    end
    gallery = @target.join("gallery_1")
    FileUtils.mkdir_p(gallery)
    gallery.join("4.jpg").write("existing photo without thumbnail")
    append_to_gallery("photos.zip", archive.binread)

    assert_equal({ partial: "gallery_index", formats: [:html] }, @controller.result)
    assert_equal "existing photo without thumbnail", gallery.join("4.jpg").read
    assert_equal [1, 4, 5, 6], @controller.instance_variable_get(:@images)
    %w[5.jpg 5-thumb.jpg management/5.jpg 6.jpg 6-thumb.jpg management/6.jpg].each do |file|
      assert gallery.join(file).file?, "expected #{file}"
    end
  end

  def test_append_rejects_invalid_zip_image_without_publishing_previous_entries
    archive = @root.join("archive.zip")
    photo = image_data
    Zip::File.open(archive, create: true) do |zip|
      zip.get_output_stream("a.png") { |stream| stream.write(photo) }
      zip.get_output_stream("b.jpg") { |stream| stream.write("invalid image") }
    end
    gallery = append_to_gallery("photos.zip", archive.binread)

    assert_equal :unprocessable_entity, @controller.result[:status]
    assert_equal %w[1-thumb.jpg 1.jpg captions.yml management], gallery.children.map { |path| path.basename.to_s }.sort
  end

  def assert_rejected(result)
    assert_equal :unprocessable_entity, result[:status]
    assert result[:json][:error]
    assert_empty Dir.glob(@target.join("gallery_*"))
  end

  def test_success_extracts_normalized_images_for_setup
    result = upload("photo.PNG" => image_data)
    assert_nil result[:status]
    assert_equal "gallery_1", JSON.parse(result[:json])["filename"]
    image = @target.join("gallery_1/temp/1.jpg")
    assert_equal 80, MiniMagick::Image.open(image.to_s).width
    refute @target.join("gallery_1/temp/1.png").exist?
  end

  def test_rejects_zip_without_supported_images_and_removes_directory
    assert_rejected upload("readme.txt" => "No pictures")
  end

  def test_conversion_failure_removes_even_previously_extracted_images
    assert_rejected upload("a.png" => image_data, "b.jpg" => "not an image" * 200)
  end

  def test_invalid_zip_is_rejected_without_leaving_a_gallery
    zip = @root.join("invalid.zip")
    zip.write("invalid ZIP contents")
    @controller.params[:gallery_file] = { data: OpenStruct.new(path: zip.to_s) }
    @controller.receive_gallery
    assert_rejected @controller.result
  end

  def test_missing_file_is_rejected_without_leaving_a_gallery
    @controller.receive_gallery
    assert_rejected @controller.result
  end

  def test_existing_galleries_are_never_reused_after_one_hundred
    FileUtils.mkdir_p(@target)
    1.upto(100) { |index| Dir.mkdir(@target.join("gallery_#{index}")) }
    marker = @target.join("gallery_100/keep.txt")
    marker.write("existing gallery")
    result = upload("photo.png" => image_data)
    assert_equal "gallery_101", JSON.parse(result[:json])["filename"]
    assert_equal "existing gallery", marker.read
  end

  def test_concurrent_directory_claim_does_not_merge_uploads
    original_mkdir = Dir.method(:mkdir)
    raced = false
    claim = lambda do |directory, *args|
      if !raced && directory.to_s.end_with?("/gallery_1")
        raced = true
        original_mkdir.call(directory, *args)
        File.write(File.join(directory, "keep.txt"), "other upload")
        raise Errno::EEXIST, directory.to_s
      end
      original_mkdir.call(directory, *args)
    end
    begin
      Dir.define_singleton_method(:mkdir, claim)
      result = upload("photo.png" => image_data)
    ensure
      Dir.define_singleton_method(:mkdir, original_mkdir)
    end
    assert_equal "gallery_2", JSON.parse(result[:json])["filename"]
    assert_equal "other upload", @target.join("gallery_1/keep.txt").read
  end

  def test_deletes_an_unfinished_gallery_without_requiring_metadata
    gallery = @target.join("gallery_1/temp")
    FileUtils.mkdir_p(gallery)
    gallery.join("incomplete.jpg").write("partial image")
    @controller.params[:gallery_id] = "gallery_1"
    @controller.delete_gallery
    refute gallery.parent.exist?
    assert_equal "select_gallery", @controller.result[:action]
  end

  def test_deletes_a_completed_gallery_and_preserves_other_galleries
    gallery = @target.join("gallery_1")
    other_gallery = @target.join("gallery_2")
    FileUtils.mkdir_p([gallery.join("management"), other_gallery])
    ["1.jpg", "1-thumb.jpg", "captions.yml", "settings.yml", "management/preview.jpg"].each do |file|
      gallery.join(file).write("gallery content")
    end
    other_gallery.join("1.jpg").write("other gallery")

    @controller.params[:gallery_id] = "gallery_1"
    @controller.delete_gallery

    refute gallery.exist?
    assert_equal "other gallery", other_gallery.join("1.jpg").read
    assert_equal "select_gallery", @controller.result[:action]
  end

  class GallerySelectionView
    include ActionView::Helpers::UrlHelper

    def initialize
      @galleries = []
    end

    def session
      { broken_galleries: ["gallery_1"] }
    end

    def params
      { id: 1 }
    end

    def url_for(options)
      "/manage/cms_pages/1/#{options[:action]}?gallery_id=#{options[:gallery_id]}"
    end

    def render(**_options)
      ""
    end

    def html
      source = File.read(File.expand_path("../app/views/manage/cms_pages/_select_gallery.html.erb", __dir__))
      ERB.new(source, trim_mode: "-").result(binding)
    end
  end

  def test_broken_gallery_delete_link_renders_post_method
    assert_gallery_delete_link GallerySelectionView.new.html
  end

  def gallery_management_html
    lookup = ActionView::LookupContext.new(
      [File.expand_path("../app/views", __dir__)], {}, ["manage/cms_pages"]
    )
    view = ActionView::Base.with_empty_template_cache.new(lookup, {
      galleries: ["/gallery_1"], pg: OpenStruct.new(path: "news"), images: [],
      gallery: OpenStruct.new(slide_duration: 0, autoplay: "true", show_thumbs: "true")
    }, nil)
    def view.params
      { id: 1, gallery_id: "gallery_1" }
    end
    def view.session
      { broken_galleries: [] }
    end
    def view.url_for(options = {})
      "/manage/cms_pages/1/#{options[:action]}?gallery_id=#{options[:gallery_id]}"
    end

    view.render(template: "manage/cms_pages/gallery_management")
  end

  def test_completed_gallery_delete_link_renders_post_method
    assert_gallery_delete_link gallery_management_html
  end

  def test_existing_gallery_upload_posts_multipart_and_updates_the_gallery_index
    form = Nokogiri::HTML.fragment(gallery_management_html).at_css(
      'form[action="/manage/cms_pages/1/add_to_gallery?gallery_id=gallery_1"]'
    )
    refute_nil form
    assert_equal "post", form["method"]
    assert_equal "multipart/form-data", form["enctype"]
    assert_equal "true", form["data-remote"]
    assert_equal "gallery_window", form["data-update"]
    assert form.at_css('input[type=file][name="gallery_file[data]"][required]')
  end

  def assert_gallery_delete_link(html)
    link = Nokogiri::HTML.fragment(html).at_css('a[href*="/delete_gallery?"]')
    refute_nil link
    assert_equal "post", link["data-method"]
    assert_equal "true", link["data-remote"]
    assert_equal "delete_gallery_container", link["data-update"]
    assert_match(/cannot be undone/, link["data-confirm"])
    assert_includes link["href"], "gallery_id=gallery_1"
  end
end
