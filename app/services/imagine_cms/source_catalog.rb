module ImagineCms
  # Constructed only in authenticated requests. Source IDs are resolved against
  # this catalog, never constantized or interpreted as arbitrary model fields.
  class SourceCatalog
    class Forbidden < StandardError; end
    PROPERTY_FIELDS = %w[title summary position article_date article_end_date published_date
                         expiration_date expires thumbnail_path feature_image_path html_head].freeze

    def initialize(page:, user:, permission:)
      @page, @user, @permission = page, user, permission
      authorize_page!
    end

    def authorize_page!
      raise Forbidden, 'You cannot edit this page.' unless @permission.call(:manage_cms)

      sections = @user.cms_allowed_sections.to_s.split(',').map(&:strip).reject(&:empty?)
      # Existing section patterns are administrator-configured regular expressions.
      unless sections.empty? || sections.any? { |s| Regexp.new("^#{s}").match?("/#{@page.path}") }
        raise Forbidden, 'This page is outside your allowed sections.'
      end
    end

    def shared_access?
      !UseCmsAccessLevels || @permission.call(:manage_cms_full_access)
    end

    def sources
      result = @page.objects.where(cms_page_version: @page.version, obj_type: %w[text string page_list])
                    .order(:id).map do |object|
        key = "obj-#{object.obj_type}-#{object.name}"
        descriptor(key, 'content', key, object.content, 'page-local', 'staged')
      end
      PROPERTY_FIELDS.each do |field|
        next unless @page.has_attribute?(field)

        result << descriptor("property:#{field}", 'property', field, @page[field], 'page-local', 'immediate')
      end
      if shared_access?
        result << descriptor("template:#{@page.template.id}", 'template', @page.template.name,
                             @page.template.content, 'shared', 'immediate')
        # Only expose snippets reachable through literal calls in this page's
        # template/content. Dynamic calls are resolved by render instrumentation.
        pending = [@page.template.content] + result.select { |s| s[:kind] == 'content' }.map { |s| s[:content] }
        seen = []
        until pending.empty?
          source = pending.shift.to_s
          names = source.scan(/snippet\(\s*['"]([^'"]+)['"]/).flatten
          names += source.scan(/insert_object\(\s*['"]([^'"]+)['"]\s*,\s*:snippet/).flatten
          names.uniq.each do |name|
            next if seen.include?(name)

            seen << name
            snippet = CmsSnippet.find_by(name: name)
            next unless snippet

            result << descriptor("snippet:#{snippet.id}", 'snippet', snippet.name,
                                 snippet.content, 'shared', 'immediate')
            pending << snippet.content
          end
        end
      end
      result
    end

    def descriptor(id, kind, name, content, scope, category)
      { id: id, kind: kind, name: name, content: content, owner_page_id: @page.id,
        scope: scope, category: category }
    end
  end
end
