# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "imagine_cms/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "imagine_cms"
  s.version     = ImagineCms::VERSION
  s.platform    = Gem::Platform::RUBY
  s.author      = "Aaron Namba"
  s.email       = "aaron@biggerbird.com"
  s.homepage    = "https://github.com/anamba/imagine_cms"
  s.summary     = %q{Imagine Content Management System for Rails}
  s.description = %q{See README for details.}

  s.required_ruby_version     = '>= 2.2.2'
  s.required_rubygems_version = '>= 1.8.11'

  s.license = 'AGPLv3'

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "rails",               [ ">= 5.2.0", "< 6.0" ]
  s.add_dependency "rails-observers",     "~> 0.1"
  s.add_dependency "actionpack-action_caching", "~> 1.0"
  s.add_dependency "actionpack-page_caching", "~> 1.1"
  s.add_dependency "aws-sdk",             "~> 2.0"
  s.add_dependency "rubyzip",             "~> 1.0"
  s.add_dependency "rinku",               "~> 2.0"
  s.add_dependency "net-dns",             "~> 0.7"
  s.add_dependency "acts_as_tree",        "~> 2.7"
  s.add_dependency "safe_yaml",           "~> 1.0"

  # on the way out, but still needed for now
  # s.add_dependency "prototype-rails",     "~> 4.2.0"
  s.add_dependency "codemirror-rails"
  s.add_dependency "rmagick",             [ ">= 1.15.0", "< 3.0" ]
  s.add_dependency "mini_magick",         [ ">= 3.3", "< 5.0" ]
  s.add_dependency "non-stupid-digest-assets", "~> 1.0"

  # add to your own Gemfile if you use these features
  # s.add_dependency "ckeditor",            "~> 4.2"

  s.add_development_dependency "sqlite3"
end
