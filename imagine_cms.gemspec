# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "imagine_cms/version"

Gem::Specification.new do |s|
  s.name        = "imagine_cms"
  s.version     = ImagineCms::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Aaron Namba"]
  s.email       = ["aaron@biggerbird.com"]
  s.homepage    = "https://github.com/anamba/imagine_cms"
  s.summary     = %q{Imagine Content Management System for Rails}
  s.description = %q{Don't use this for now. See README for details.}

  s.rubyforge_project = "imagine_cms"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
  
  s.add_dependency "rails",               "~> 3.2.3"
  s.add_dependency "mini_magick",         "~> 3.4"
  s.add_dependency "net-dns",             "~> 0.6.1"
end
