module ImagineCms
  # Boundaries contain IDs only, not privileged source. They are safe in cached
  # public HTML. Full source is returned only from authenticated agent endpoints.
  module RenderTrace
    def insert_object(name, type = :text, options = {}, html_options = {})
      result = super
      return result unless @pg && %i[text string page_list snippet].include?(type.to_sym)

      key = if type.to_sym == :snippet
              snippet = CmsSnippet.find_by(name: name)
              "snippet:#{snippet.id}" if snippet
            else
              "page:#{@pg.id}:obj-#{type}-#{name.gsub(/[^\w]/, '_')}"
            end
      return result unless key

      (@cms_agent_rendered_sources ||= []) << key
      token = key.unpack1('H*')
      "<!--cms-source:#{token}:start-->#{result}<!--cms-source:#{token}:end-->".html_safe
    end
  end
end
