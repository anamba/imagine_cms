require 'securerandom'

module Cms
  class AgentController < ContentController
    skip_before_action :convert_content_path
    before_action :authorize_agent
    protect_from_forgery with: :exception
    cache_sweeper :cms_content_sweeper

    rescue_from ImagineCms::SourceCatalog::Forbidden, with: ->(e) { render json: { error: e.message }, status: :forbidden }
    rescue_from ImagineCms::ProposalBuilder::Invalid, ArgumentError, with: ->(e) { render json: { error: e.message }, status: :unprocessable_entity }
    rescue_from ImagineCms::ContentWriter::Conflict, CmsAgentProposal::Unavailable, with: ->(e) { render json: { error: e.message }, status: :conflict }

    def context
      html = render_working({})
      render json: { page_id: @pg.id, title: @pg.title, version: @pg.version,
                     base: ImagineCms::ContentWriter.snapshot(@pg), sources: catalog_sources,
                     referenced_pages: referenced_pages,
                     csrf_token: form_authenticity_token, preview: html }
    end

    def preview
      render json: { preview: render_working(working_params) }
    end

    def propose
      if ImagineCms::ContentWriter.snapshot(@pg) != params.require(:base)
        raise ImagineCms::ContentWriter::Conflict, 'The page changed since your working copy was opened. Save or reconcile your content before requesting another change.'
      end
      working = working_params
      render_working(working)
      result = ImagineCms::ProposalBuilder.call(page: @pg, user: @user, session_token: agent_session,
        sources: catalog_sources, changes: params.require(:changes).map(&:to_unsafe_h), working: working,
        requested_scope: params[:requested_scope], render: ->(changes) { render_working(working, changes) })
      render json: result
    end

    def discard
      proposal.consume!
      render json: { discarded: true }
    end

    def accept
      working = working_params
      result = nil
      # Lock order is page, then proposal; all writers follow the same order.
      @pg.with_lock do
        proposal.consume! do |data|
          if ImagineCms::ContentWriter.snapshot(@pg) != data.fetch('base')
            raise ImagineCms::ContentWriter::Conflict, 'The page changed. Request a fresh proposal.'
          end
          render_working(working)
          sources = catalog_sources.index_by { |s| s[:id] }
          data.fetch('changes').each do |change|
            source = sources[change['source_id']]
            raise ImagineCms::SourceCatalog::Forbidden, 'Source is no longer editable.' unless source
            if working.fetch(source[:id], source[:content]).to_s != change['before']
              raise ImagineCms::ContentWriter::Conflict, 'Working content changed. Request a fresh proposal.'
            end
          end
          candidate = working.merge(data['changes'].to_h { |c| [c['source_id'], c['content']] })
          rendered = render_working(working, data['changes'])
          if data['category'] == 'immediate'
            validate_dirty_regions!(working)
            persist_immediate!(data['changes'])
            @pg.reload
            result = { saved: true, base: ImagineCms::ContentWriter.snapshot(@pg),
                       sources: catalog_sources, preview: render_working(working) }
          else
            result = { saved: false, working: candidate, preview: rendered, changes: data['changes'] }
          end
        end
      end
      render json: result
    end

    def save
      @pg.with_lock do
        if ImagineCms::ContentWriter.snapshot(@pg) != params.require(:base)
          raise ImagineCms::ContentWriter::Conflict, 'The page changed. Reload before saving.'
        end
        working = working_params
        render_working(working)
        allowed = catalog_sources.select { |s| s[:category] == 'staged' }.map { |s| s[:id] }
        raise ImagineCms::SourceCatalog::Forbidden, 'Unknown content source.' unless (working.keys - allowed).empty?

        ImagineCms::ContentWriter.call(page: @pg, input: working, user_id: @user.id,
          username: @user.username, full_access: !UseCmsAccessLevels || user_has_permission?(:manage_cms_full_access))
      end
      render json: { saved: true, version: @pg.version, base: ImagineCms::ContentWriter.snapshot(@pg),
                     preview: render_working({}), sources: catalog_sources }
    end

    private

    def authorize_agent
      unless session[:user_authenticated] && (@user = User.find_by(id: session[:user_id]))
        render json: { error: 'Sign in to edit this page.' }, status: :unauthorized
        return
      end
      @pg = CmsPage.find(params[:id])
      @catalog = ImagineCms::SourceCatalog.new(page: @pg, user: @user, permission: method(:user_has_permission?))
      response.headers['Cache-Control'] = 'no-store'
      agent_session
    end

    def agent_session
      session[:cms_agent_session] ||= SecureRandom.hex(32)
    end

    def proposal
      CmsAgentProposal.pending_for!(id: params.require(:proposal_id), page_id: @pg.id,
        user_id: @user.id, session_token: agent_session)
    end

    def working_params
      value = params[:working]
      return {} unless value
      raise ArgumentError, 'Working content must be a source map.' unless value.is_a?(ActionController::Parameters)

      result = value.to_unsafe_h
      raise ArgumentError, 'Invalid working content.' unless result.all? { |k, v| k.match?(/\Aobj-(text|string|page_list)-.+\z/) && v.is_a?(String) }
      result
    end

    def render_working(working, changes = [])
      @page_objects = OpenStruct.new
      @pg.objects.where(cms_page_version: @pg.version).each do |object|
        @page_objects["obj-#{object.obj_type}-#{object.name}"] = object.content
      end
      staged = working.merge(changes.select { |c| c['kind'] == 'content' }.to_h { |c| [c['source_id'], c['content']] })
      ImagineCms::ContentNormalizer.call(staged).each { |k, v| @page_objects[k] = v }
      @cms_agent_snippet_overrides = {}
      template_source = @pg.template.content
      # Duplicate page attributes for preview without touching persisted records.
      original_attributes = @pg.attributes
      changes.each do |change|
        case change['kind']
        when 'content' then next
        when 'property' then @pg[change['name']] = change['content']
        when 'template' then template_source = change['content']
        when 'snippet' then @cms_agent_snippet_overrides[change['source_id'].split(':').last] = change['content']
        end
      end
      @cms_agent_rendered_sources = []
      @cms_agent_rendered_pages = []
      @content_levels = @pg.path.split('/')
      params[:section], params[:subsection], params[:page] = @content_levels.first, @content_levels[1], @content_levels.last
      @page_title = @pg.title
      render_cms_page_to_string(@pg, template_source)
    ensure
      @pg.assign_attributes(original_attributes) if original_attributes
      @cms_agent_snippet_overrides = {}
    end

    def catalog_sources
      sources = @catalog.sources
      (@cms_agent_rendered_sources || []).uniq.each do |id|
        if id.start_with?("page:#{@pg.id}:")
          key = id.split(':', 3).last
          next if sources.any? { |s| s[:id] == key }

          sources << @catalog.descriptor(key, 'content', key, @page_objects[key].to_s, 'page-local', 'staged')
        elsif id.start_with?('snippet:') && @catalog.shared_access?
          record = CmsSnippet.find_by(id: id.split(':').last)
          next unless record && sources.none? { |s| s[:id] == id }

          sources << @catalog.descriptor(id, 'snippet', record.name, record.content, 'shared', 'immediate')
        end
      end
      list_roots = (@cms_agent_rendered_sources || []).grep(/\Apage:#{@pg.id}:obj-page_list-/).map { |id| id.split(':', 3).last }
      @page_objects.to_h.each do |key, value|
        next unless list_roots.any? { |root| key.to_s.start_with?(root + '-') }
        next if sources.any? { |s| s[:id] == key.to_s }

        sources << @catalog.descriptor(key.to_s, 'content', key.to_s, value.to_s, 'page-local', 'staged')
      end
      sources
    end

    def referenced_pages
      (@cms_agent_rendered_pages || []).uniq.filter_map do |id|
        next if id == @pg.id
        page = CmsPage.find_by(id: id)
        next unless page

        begin
          ImagineCms::SourceCatalog.new(page: page, user: @user, permission: method(:user_has_permission?))
        rescue ImagineCms::SourceCatalog::Forbidden
          next
        end
        { page_id: page.id, title: page.title, scope: 'page-local',
          url: "/#{page.path}/version/#{page.version}".gsub('//', '/'),
          guidance: 'This list item belongs to another page. Open its page context to edit its content or properties.' }
      end
    end

    def validate_dirty_regions!(working)
      rendered = @cms_agent_rendered_sources || []
      working.each do |key, value|
        old = @pg.objects.find_by(cms_page_version: @pg.version,
          obj_type: key.split('-', 3)[1], name: key.split('-', 3).last)&.content.to_s
        next if value == old
        # Page-list configuration fields are represented by the list boundary.
        represented = rendered.any? { |id| id == "page:#{@pg.id}:#{key}" ||
          (id.start_with?("page:#{@pg.id}:obj-page_list-") && key.start_with?(id.split(':', 3).last + '-')) }
        raise ImagineCms::ContentWriter::Conflict, 'Save or discard content in removed regions before changing structure.' unless represented
      end
    end

    def persist_immediate!(changes)
      changes.sort_by { |c| c['source_id'] }.each do |change|
        case change['kind']
        when 'property'
          raise ImagineCms::SourceCatalog::Forbidden unless ImagineCms::SourceCatalog::PROPERTY_FIELDS.include?(change['name'])
          @pg[change['name']] = change['content']
        when 'template', 'snippet'
          raise ImagineCms::SourceCatalog::Forbidden unless @catalog.shared_access?
          klass = change['kind'] == 'template' ? CmsTemplate : CmsSnippet
          record = klass.lock.find(change['source_id'].split(':').last)
          # Compare the exact shared source, since page revisions do not track it.
          if record.content.to_s != change['before']
            raise ImagineCms::ContentWriter::Conflict, 'Shared source changed. Request a new proposal.'
          end
          record.content = change['content'].dup
          record.save!
        end
      end
      @pg.save_without_revision! if changes.any? { |c| c['kind'] == 'property' }
    end
  end
end
