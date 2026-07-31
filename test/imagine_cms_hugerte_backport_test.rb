require "minitest/autorun"
require "pathname"

class ImagineCmsHugeRteBackportTest < Minitest::Test
  ENGINE_ROOT = Pathname.new(File.expand_path("..", __dir__))

  def read_engine_file(path)
    ENGINE_ROOT.join(path).read
  end

  def test_hugerte_editor_is_the_default_path
    config = read_engine_file("lib/imagine_cms.rb")
    assert_includes config, "mattr_accessor :use_legacy_dojo_editor, default: false"

    controller = read_engine_file("app/controllers/manage/cms_pages_controller.rb")
    assert_includes controller, "imagine-cms-rte"
    assert_includes controller, "imagine-cms-rte-source"
    assert_includes controller, "contenteditable: 'true'"
    assert_includes controller, "textarea_id"
    assert_includes controller, "upload_image_url"
    assert_includes controller, "upload_file_url"
  end

  def test_modern_toolbar_and_dialog_partials_do_not_depend_on_dojo
    [
      "app/views/manage/cms_pages/toolbar_edit.html.erb",
      "app/views/manage/cms_pages/toolbar_preview.html.erb",
      "app/views/imagine_cms/_dialogs.html.erb"
    ].each do |path|
      source = read_engine_file(path)
      refute_includes source, "dojoType"
      refute_includes source, "Editor2Manager"
    end
  end

  def test_editor_assets_are_loaded_from_the_cms_manifests
    [
      "app/assets/javascripts/imagine_cms.js",
      "app/assets/javascripts/imagine_cms_compat.js"
    ].each do |path|
      source = read_engine_file(path)
      assert_includes source, "//= require hugerte"
      assert_includes source, "//= require imagine_cms/editor"
      refute_includes source, "//= require prototype"
      refute_includes source, "//= require prototype_ujs"
      refute_includes source, "//= require effects"
      refute_includes source, "//= require dragdrop"
      refute_includes source, "//= require controls"
      refute_includes source, "//= require builder"
    end
  end

  def test_authenticated_cms_controls_are_loaded_without_the_legacy_editor
    source = read_engine_file("app/views/imagine_cms/_header.html.erb")
    controls_link = source.index('document.writeln(\'<link href="/assets/imagine_controls.css"')
    legacy_editor_guard = source.index("<%- if ImagineCms.use_legacy_dojo_editor -%>")

    assert controls_link
    assert legacy_editor_guard
    assert_operator controls_link, :<, legacy_editor_guard
    assert_includes source, "var load_imagine_controls = loggedIn() ||"
  end

  def test_compat_manifest_does_not_load_scriptaculous_dependent_legacy_scripts
    source = read_engine_file("app/assets/javascripts/imagine_cms_compat.js")

    refute_includes source, "imagine_cms/legacy/rollovers"
    refute_includes source, "imagine_cms/legacy/slideshow"
    refute_includes source, "imagine_cms/legacy/misc"
    refute_includes source, "imagine_cms/legacy/textfieldhints"
  end

  def test_core_javascript_does_not_call_scriptaculous_or_prototype_ajax
    source = read_engine_file("app/assets/javascripts/imagine_cms/core.js")

    refute_includes source, "Position.includeScrollOffsets"
    refute_includes source, "new Ajax.Updater"
    refute_includes source, "Effect."
  end

  def test_editor_adapter_uses_inline_regions_with_hidden_textarea_sources
    source = read_engine_file("app/assets/javascripts/imagine_cms/editor.js")
    styles = read_engine_file("app/assets/stylesheets/imagine_cms.css.scss")

    assert_includes source, 'selector: ".imagine-cms-rte"'
    assert_includes source, "inline: true"
    refute_match(/^\s*ui_mode:\s*["']split["']/, source)
    assert_includes source, "toolbar_sticky_offset: stickyOffset"
    assert_includes source, 'window.dispatchEvent(new Event("resize"))'
    assert_includes source, 'addEventListener("scroll", nudgeToolbarLayout, { passive: true })'
    assert_includes source, "function alignActiveToolbar()"
    assert_match(
      /function nudgeToolbarLayout\(\).*?alignActiveToolbar\(\);\s*window\.dispatchEvent\(new Event\("resize"\)\)/m,
      source
    )
    assert_includes source, '"--imagine-cms-rte-toolbar-width"'
    assert_includes source, 'toolbar.classList.add("imagine-cms-rte-toolbar")'
    assert_includes source, '"imagine-cms-rte-toolbar--right"'
    assert_includes source, "if (editor._imagineCmsContentChanged) textarea.value = editor.getContent()"
    assert_includes source, "editor._imagineCmsContentChanged = false"
    assert_includes source, "editor._imagineCmsContentChanged = true"
    assert_includes source, "protect: cmsProtectedPatterns()"
    assert_includes source, '/<#[\\s\\S]*?#>/g'
    assert_includes source, '/<%[\\s\\S]*?%>/g'
    assert_includes source, "function renderCmsProtectedTokens(content)"
    assert_includes source, "function restoreCmsProtectedTokens(content)"
    assert_includes source, 'editor.on("BeforeSetContent"'
    assert_includes source, 'editor.on("GetContent"'
    assert_includes source, "data-imagine-cms-token"
    assert_includes source, "editor.setContent(textarea.value)"
    assert_includes source, "if (hydrating) return"
    assert_includes source, '"cmslink table cmsimage filelink code"'
    assert_includes source, 'tooltip: "Insert/edit link"'
    assert_includes source, '{ name: "linkClass", type: "input", label: "Class" }'
    assert_includes source, '{ name: "linkStyle", type: "input", label: "Style" }'
    assert_includes source, "editor.dom.setAttribs(anchor, attributes)"
    assert_includes source, "editor.execCommand(\"mceInsertLink\", false, attributes)"
    assert_includes source, "quickbars_selection_toolbar: false"
    assert_includes source, "quickbars_insert_toolbar: false"
    assert_includes styles, ".imagine-cms-rte-source[hidden]"
    assert_includes styles, ".imagine-cms-protected-token"
    assert_includes styles, "border: 3px dashed"
    assert_includes styles, "scroll-margin-top: 78px"
    assert_includes styles, ".imagine-cms-toolbar-shell"
    assert_includes styles, ".tox.imagine-cms-rte-toolbar"
    assert_includes styles, "width: var(--imagine-cms-rte-toolbar-width) !important"
    assert_includes styles, ".tox.imagine-cms-rte-toolbar .tox-editor-header"
    assert_includes styles, "max-width: none"
    assert_includes styles, ".tox.imagine-cms-rte-toolbar--right .tox-toolbar__primary"
    assert_includes styles, "justify-content: flex-end"
    refute_includes styles, ".print\\:hidden { display: contents; }"
  end

  def test_media_insert_callbacks_target_the_imagine_editor_adapter
    [
      "app/views/manage/cms_pages/_crop_results.html.erb",
      "app/views/manage/cms_pages/_complete_gallery.html.erb",
      "app/views/manage/cms_pages/_create_file_link.html.erb"
    ].each do |path|
      source = read_engine_file(path)
      assert_includes source, "ImagineCms.Editor.insertHtml"
      refute_includes source, "Editor2Manager"
    end
  end

  def test_preview_toolbar_urls_target_management_controller_explicitly
    source = read_engine_file("app/views/manage/cms_pages/toolbar_preview.html.erb")

    assert_includes source, "controller: '/manage/cms_pages', action: 'edit_page'"
    assert_includes source, "controller: '/manage/cms_pages', action: 'set_page_version'"
    assert_includes source, "controller: '/manage/cms_pages', action: 'request_review'"
    refute_includes source, "url_for action: 'edit_page'"
  end

  def test_properties_dialog_uses_native_dates_and_cms_owned_styles
    source = read_engine_file("app/views/manage/cms_pages/_edit_page.html.erb")
    styles = read_engine_file("app/assets/stylesheets/imagine_cms.css.scss")

    refute_includes source, "date_picker :pg"
    refute_includes source, "class: 'form_button'"
    assert_includes source, "date_field :pg, :article_date"
    assert_includes source, "date_field :pg, :published_date"
    assert_includes source, "date_field :pg, :expiration_date"
    assert_includes source, "class=\"imagine-cms-properties-form\""
    assert_includes source, "imagine-cms-dialog__button--primary"
    assert_includes source, "appendTo: '#properties_dialog'"
    assert_includes styles, ".imagine-cms-properties-form"
    assert_includes styles, "color: #ffffff !important;"
  end
end
