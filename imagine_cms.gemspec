require_relative "lib/imagine_cms/version"

Gem::Specification.new do |spec|
  spec.name        = "imagine_cms"
  spec.version     = ImagineCms::VERSION
  spec.authors     = ["Aaron Namba"]
  spec.email       = ["aaron@biggerbird.com"]
  spec.homepage    = "https://github.com/anamba/imagine_cms"
  spec.summary     = "Imagine Content Management System for Rails"
  spec.description = "See README for details."
  spec.license = 'AGPLv3'

  spec.required_ruby_version     = '>= 3.1.0'
  spec.required_rubygems_version = '>= 3.0.0'

  spec.files         = `git ls-files -- {app,assets,config,db,lib}/* license.txt Rakefile README.md`.split("\n")
  spec.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  spec.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_dependency "rails",               [ ">= 6.0.0", "< 8.0" ]
  spec.add_dependency "rails-observers",     "~> 0.1"
  spec.add_dependency "actionpack-action_caching", "~> 1.0"
  spec.add_dependency "actionpack-page_caching", "~> 1.1"
  spec.add_dependency "aws-sdk",             "~> 2.0"
  spec.add_dependency "rubyzip",             "~> 2.0"
  spec.add_dependency "rinku",               "~> 2.0"
  spec.add_dependency "net-dns",             "~> 0.7"
  spec.add_dependency "acts_as_tree",        "~> 2.7"
  # spec.add_dependency "safe_yaml",           "~> 1.0"

  # on the way out, but still needed for now
  # spec.add_dependency "prototype-rails",     "~> 5.2.0"

  spec.add_dependency "rmagick",             [ ">= 1.15.0", "< 6.0" ]
  spec.add_dependency "mini_magick",         [ ">= 3.3", "< 5.0" ]
  spec.add_dependency "non-stupid-digest-assets", "~> 1.0"

  # add to your own Gemfile if you use these features
  # spec.add_dependency "ckeditor",            "~> 4.2"

  spec.add_development_dependency "sqlite3", "< 1.7"
end
