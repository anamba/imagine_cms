module ImagineCms
  class ProposalBuilder
    class Invalid < StandardError; end

    def self.call(page:, user:, session_token:, sources:, changes:, working:, requested_scope:, render:)
      raise Invalid, 'Choose page-local or shared scope.' unless %w[page-local shared].include?(requested_scope)
      raise Invalid, 'Provide between one and twenty source changes.' unless changes.is_a?(Array) && (1..20).cover?(changes.size)

      catalog = sources.index_by { |s| s[:id] }
      ids = changes.map { |c| c.fetch('source_id') }
      raise Invalid, 'Each source can be changed only once per proposal.' unless ids.uniq == ids

      resolved = changes.map do |change|
        source = catalog[change.fetch('source_id')]
        raise SourceCatalog::Forbidden, 'Source is not editable in this page context.' unless source
        raise Invalid, 'Replacement content must be a string.' unless change['content'].is_a?(String)

        value = if source[:category] == 'staged'
                  ContentNormalizer.normalize_value(change['content'])
                elsif source[:kind] == 'property'
                  change['content']
                else
                  record = source[:kind] == 'template' ? CmsTemplate.new : CmsSnippet.new
                  record.content = change['content'].dup
                  record.content
                end
        { 'source_id' => source[:id], 'kind' => source[:kind], 'name' => source[:name],
          'content' => value, 'category' => source[:category], 'scope' => source[:scope],
          'before' => working.fetch(source[:id], source[:content]).to_s }
      end
      categories = resolved.map { |c| c['category'] }.uniq
      raise Invalid, 'Handle page content first and defer properties/shared changes, or vice versa. Mixed proposals are not supported.' unless categories.size == 1

      warnings = resolved.filter_map do |change|
        next if requested_scope == change['scope']

        if change['scope'] == 'shared'
          "#{change['name']} is shared. Saving it can affect other pages."
        else
          "#{change['name']} belongs only to this page. This will not change independent occurrences elsewhere."
        end
      end
      payload = { 'category' => categories.first, 'changes' => resolved, 'warnings' => warnings,
                  'requested_scope' => requested_scope, 'base' => ContentWriter.snapshot(page) }
      preview = render.call(resolved)
      proposal = CmsAgentProposal.create!(cms_page: page, user_id: user.id,
        session_digest: CmsAgentProposal.session_digest(session_token),
        payload: JSON.generate(payload), expires_at: 30.minutes.from_now)
      { id: proposal.id, category: categories.first, warnings: warnings,
        changes: resolved, preview: preview, expires_at: proposal.expires_at }
    rescue KeyError => e
      raise Invalid, "Missing proposal field: #{e.key}"
    end
  end
end
