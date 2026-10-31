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
require "mini_magick"
require "action_view"
require "erb"

# Exercise the controller's actual methods with real ZIPs and image processing,
# isolating only page lookup, Rails root/logger, and response rendering.
module GalleryUploadHarness
  Rails = OpenStruct.new(logger: Logger.new(File::NULL))
  CmsPage = Object.new
  def CmsPage.find_by_id(_id)
    OpenStruct.new(path: "news")
  end

  class Controller
    attr_accessor :params
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
  ["receive_gallery", "delete_gallery"].each do |name|
    method_source = source[/^  def #{name}\n.*?^  end$/m]
    raise "Cannot locate #{name}" unless method_source
    module_eval("class Controller\n#{method_source}\nend", __FILE__, __LINE__)
  end
end

class GalleryUploadTest < Minitest::Test
  def setup
    @root = Pathname.new(Dir.mktmpdir("gallery-upload-test"))
    GalleryUploadHarness::Rails.root = @root
    @target = @root.join("public/assets/content/news")
    @controller = GalleryUploadHarness::Controller.new
    @controller.params = { id: 1 }
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

  def test_completed_gallery_delete_link_renders_post_method
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

    assert_gallery_delete_link view.render(template: "manage/cms_pages/gallery_management")
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
