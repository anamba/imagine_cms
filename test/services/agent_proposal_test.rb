require 'test_helper'

class AgentProposalTest < ActiveSupport::TestCase
  setup do
    template = CmsTemplate.create!(name: 'Proposal test', content: '<p>Page</p>')
    @page = CmsPage.create!(parent: CmsPage.find_by(path: ''), name: 'proposal-test', title: 'Proposal', template: template,
                            updated_by: 1, updated_by_username: 'editor')
    @user = Struct.new(:id, :cms_allowed_sections).new(42, '')
    @sources = [
      { id: 'obj-text-main', kind: 'content', name: 'Main', content: '<p>Old</p>', category: 'staged', scope: 'page-local' },
      { id: 'snippet:1', kind: 'snippet', name: 'Footer', content: '<p>Footer</p>', category: 'immediate', scope: 'shared' }
    ]
  end

  def build(changes, scope: 'page-local', render: ->(_) { '<p>Preview</p>' })
    ImagineCms::ProposalBuilder.call(page: @page, user: @user, session_token: 'session', sources: @sources,
      changes: changes, working: {}, requested_scope: scope, render: render)
  end

  test 'preview persists proposal only, normalizes source and warns about scope' do
    version = @page.version
    result = build([{ 'source_id' => 'obj-text-main', 'content' => '<font>New</font>' }], scope: 'shared')
    assert_equal 'New', result[:changes].first['content']
    assert_equal 1, result[:warnings].size
    assert_equal version, @page.reload.version
    assert_empty @page.objects
    assert_equal 'staged', CmsAgentProposal.find(result[:id]).data['category']
  end

  test 'mixed changes rejected before rendering or saving proposal' do
    assert_no_difference 'CmsAgentProposal.count' do
      assert_raises ImagineCms::ProposalBuilder::Invalid do
        build(@sources.map { |s| { 'source_id' => s[:id], 'content' => 'New' } }, render: ->(_) { flunk 'must not render' })
      end
    end
  end

  test 'shared source local intent warns' do
    assert_match(/shared/, build([{ 'source_id' => 'snippet:1', 'content' => 'New' }])[:warnings].first)
  end

  test 'unavailable source is denied' do
    assert_raises ImagineCms::SourceCatalog::Forbidden do
      build([{ 'source_id' => 'snippet:secret', 'content' => 'New' }])
    end
  end

  test 'failed render does not create a proposal' do
    assert_no_difference 'CmsAgentProposal.count' do
      assert_raises RuntimeError do
        build([{ 'source_id' => 'obj-text-main', 'content' => 'New' }], render: ->(_) { raise 'render failed' })
      end
    end
  end

  test 'proposals are bound to editor and session, expire, and consume once' do
    result = build([{ 'source_id' => 'obj-text-main', 'content' => 'New' }])
    args = { id: result[:id], page_id: @page.id, user_id: 42, session_token: 'session' }
    assert_raises(CmsAgentProposal::Unavailable) { CmsAgentProposal.pending_for!(**args.merge(user_id: 43)) }
    assert_raises(CmsAgentProposal::Unavailable) { CmsAgentProposal.pending_for!(**args.merge(session_token: 'other')) }
    proposal = CmsAgentProposal.pending_for!(**args)
    proposal.consume!
    assert_raises(CmsAgentProposal::Unavailable) { proposal.consume! }
    proposal.update!(consumed_at: nil, expires_at: 1.minute.ago)
    assert_raises(CmsAgentProposal::Unavailable) { CmsAgentProposal.pending_for!(**args) }
    assert_equal 1, CmsAgentProposal.cleanup_expired!
  end

  test 'page catalog enforces section and shared permissions' do
    denied = ->(_) { false }
    assert_raises(ImagineCms::SourceCatalog::Forbidden) do
      ImagineCms::SourceCatalog.new(page: @page, user: @user, permission: denied)
    end
    @user.cms_allowed_sections = '/other'
    assert_raises(ImagineCms::SourceCatalog::Forbidden) do
      ImagineCms::SourceCatalog.new(page: @page, user: @user, permission: ->(_) { true })
    end
    @user.cms_allowed_sections = ''
    catalog = ImagineCms::SourceCatalog.new(page: @page, user: @user,
      permission: ->(p) { p == :manage_cms })
    assert catalog.sources.none? { |s| s[:scope] == 'shared' }
  end
end
