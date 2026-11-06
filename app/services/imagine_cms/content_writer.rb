module ImagineCms
  class ContentWriter
    def self.call(page:, input:, user_id:, username:, full_access:)
      page.with_lock do
        # Preserve the complete current version, including regions omitted by a
        # form. The former Relation truthiness check could drop those regions.
        content = page.objects.where(cms_page_version: page.version, obj_type: %w[text string page_list])
                      .each_with_object({}) { |o, h| h["obj-#{o.obj_type}-#{o.name}"] = o.content }
        content.merge!(ContentNormalizer.call(input))
        page.published_version = page.version if !full_access && page.published_version == 0
        page.updated_by = user_id
        page.updated_by_username = username
        page.updated_on = Time.now.utc
        # Databases with second-precision timestamps can see consecutive content
        # saves as an unchanged page row. Content still needs a distinct version.
        page.updated_on_will_change!
        page.save!
        content.each do |key, value|
          match = /\Aobj-(\w+)-(.+)\z/.match(key)
          raise ArgumentError, 'Invalid content key' unless match

          page.objects.create!(obj_type: match[1], name: match[2], content: value,
                               cms_page_version: page.version)
        end
        page.update_index
        page.save_without_revision!
      end
      page
    end
  end
end
