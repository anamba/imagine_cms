# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "imagine_cms/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "imagine_cms"
  s.version     = ImagineCms::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Aaron Namba"]
  s.email       = ["aaron@biggerbird.com"]
  s.homepage    = "https://github.com/anamba/imagine_cms"
  s.summary     = %q{Imagine Content Management System for Rails}
  s.description = %q{See README for details.}

  s.rubyforge_project = "imagine_cms"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
  
  s.add_dependency "rails",               "~> 3.2.0"
  s.add_dependency "prototype-rails",     "~> 3.2.0"
  s.add_dependency "aws-s3",              "~> 0.6.3"
  s.add_dependency "rmagick"
  s.add_dependency "mini_magick",         "~> 3.3"
  s.add_dependency "rubyzip"
  s.add_dependency "rinku",               "~> 1.7.2"
  s.add_dependency "net-dns",             "~> 0.7.1"
  s.add_dependency "acts_as_tree",        "~> 1.1"
  
  s.add_development_dependency "sqlite3"
end
