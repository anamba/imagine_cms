require "active_support/dependencies"

module ImagineCms
  # Our host application root path
  # We set this when the engine is initialized
  mattr_accessor :app_root
  mattr_accessor :use_legacy_dojo_editor, default: false
  mattr_accessor :toolbar_sticky_offset, default: 52
  mattr_accessor :toolbar_sticky_offset_mobile, default: nil
  
  # Yield self on setup for nice config blocks
  def self.setup
    yield self
  end
  
end

# Require our engine
require "imagine_cms/engine"
