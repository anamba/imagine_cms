require 'digest'

class CmsAgentProposal < ActiveRecord::Base
  class Unavailable < StandardError; end

  belongs_to :cms_page

  def data
    JSON.parse(payload)
  end

  def self.session_digest(token)
    Digest::SHA256.hexdigest(token.to_s)
  end

  def self.pending_for!(id:, page_id:, user_id:, session_token:)
    proposal = where(id: id, cms_page_id: page_id, user_id: user_id,
                     session_digest: session_digest(session_token)).first
    raise Unavailable, 'Proposal expired or is no longer available. Request a new proposal.' unless
      proposal && !proposal.consumed_at && proposal.expires_at > Time.current

    proposal
  end

  def consume!
    with_lock do
      raise Unavailable, 'Proposal expired or already used.' if consumed_at || expires_at <= Time.current

      yield data if block_given?
      update!(consumed_at: Time.current)
    end
  end

  def self.cleanup_expired!(limit: 500)
    ids = where('expires_at <= ?', Time.current).order(:id).limit(limit).pluck(:id)
    where(id: ids).delete_all
  end
end
