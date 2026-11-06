class CreateCmsAgentProposals < ActiveRecord::Migration[7.0]
  def change
    create_table :cms_agent_proposals do |t|
      t.integer :cms_page_id, null: false
      t.integer :user_id, null: false
      t.string :session_digest, null: false
      t.text :payload, null: false
      t.datetime :expires_at, null: false
      t.datetime :consumed_at
      t.timestamps
    end
    add_index :cms_agent_proposals, :expires_at
    add_index :cms_agent_proposals, [:cms_page_id, :user_id]
  end
end
