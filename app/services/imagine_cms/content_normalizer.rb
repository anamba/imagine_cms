module ImagineCms
  # Shared by manual saves and agent previews. This is editorial normalization,
  # not a security sandbox for Ruby or HTML.
  class ContentNormalizer
    def self.call(input)
      objects = input.to_h.transform_keys(&:to_s).transform_values { |v| v.is_a?(String) ? v.dup : v }
      # do a little bit of classification... for now, just identify page lists
      page_lists = []
      objects.each do |key,val|
        key =~ /^obj-(\w+?)-(\w+?)-sources-tag-count$/
        if $1 == 'page_list'
          page_lists << "obj-#{$1}-#{$2}"
        end
      end

      # run through page lists and do a little housekeeping
      page_lists.each do |key|
        # optimize source lists: tags
        if objects["#{key}-sources-tag-count"].to_i > 0
          tags = []
          objects["#{key}-sources-tag-count"].to_i.times do |i|
            Rails.logger.debug "Adding tag: #{objects["#{key}-sources-tag#{i}"]}"
            tags << objects["#{key}-sources-tag#{i}"]
          end
          tags.reject! { |tag| tag.blank? }
          objects["#{key}-sources-tag-count"] = tags.size
          tags.each_with_index do |tag, i|
            objects["#{key}-sources-tag#{i}"] = tag
          end
        end

        # optimize source lists: folders
        if objects["#{key}-sources-folder-count"].to_i > 0
          folders = []
          objects["#{key}-sources-folder-count"].to_i.times do |i|
            Rails.logger.debug "Adding folder: #{objects["#{key}-sources-folder#{i}"]}"
            folders << objects["#{key}-sources-folder#{i}"]
          end
          folders.reject! { |folder| folder.blank? }
          objects["#{key}-sources-folder-count"] = folders.size
          folders.each_with_index do |folder, i|
            objects["#{key}-sources-folder#{i}"] = folder
          end
        end

        # consolidate date picker fields
        if objects["#{key}-date-range-custom-start_year"]
          objects["#{key}-date-range-custom-start"] =
            Time.utc(objects.delete("#{key}-date-range-custom-start_year"),
                        objects.delete("#{key}-date-range-custom-start_month"),
                        objects.delete("#{key}-date-range-custom-start_day"))
        end
        if objects["#{key}-date-range-custom-end_year"]
          objects["#{key}-date-range-custom-end"] =
            Time.utc(objects.delete("#{key}-date-range-custom-end_year"),
                        objects.delete("#{key}-date-range-custom-end_month"),
                        objects.delete("#{key}-date-range-custom-end_day"))
        end
      end

      objects.transform_values { |value| normalize_value(value) }
    end

    def self.normalize_value(value)
      val = value.is_a?(String) ? value.dup : value
      # do a little bit of "censorship" to fix up Word pastes and strange things from the editor
      if val.is_a?(String)
        # all meta and link tags
        val.gsub!(/(<\/?)(meta|link)(.*?)>/m, '')

        # the dreaded MsoNormal
        val.gsub!(' class="MsoNormal"', '')

        # remove all font-family/font-size css styles, as well as font tags
        val.gsub!(/font-(?:family|size):.*?(;|")/, '\3')
        val.gsub!(/<font.*?>(.*?)<\/font>/, '\1')

        # strange conditional IE stuff
        val.gsub!(/<!--\[if(.*?)<!(--)?\[endif\]-->/m, '')

        # not even sure what these are supposed to be
        val.gsub!(/<xml>(.*?)<\/xml>/m, '')

        # images pointing to the local drive??
        val.gsub!(/<img src="file:(.*?)>/, '')

        # miscellany
        val.gsub!('<!--StartFragment-->', '')
        val.gsub!('<!--EndFragment-->', '')
        val.gsub!(/<span style="(?:;*)">(.*?)<\/span>/m, '\1')
        val.gsub!(' style="(?:;*)"', '')
        val.gsub!('<b></b>', '')

        # we could try to catch all strange ms tags...
        #val.gsub!(/(<\/?)(?:o|u1):p>/, '\1p>')
        #val.gsub!(/(<\/?)(?:st1):(.*?)>/, '')

        # but it's easier just remove all tags with colons in them
        val.gsub!(/(<\/?)[\w\d]+:[\w\d]+(.*?)>/, '')


        ### other non-ms word specific stuff ###

        # pirate styles not welcome
        val.gsub!(/<style(?:.*?)>(.*?)<\/style>/m, '')

        # fix strange <br>s from the editor
        val.gsub!(/<br>(<\/h\d>|<\/p>)/, '\1')
      end

      # Use the model setter too, so preview and persistence see identical source.
      CmsPageObject.new(content: val.to_s.encode('UTF-8')).content
    end
  end
end
