# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "imagine_cms/version"

Gem::Specification.new do |s|
  s.name        = "imagine_cms"
  s.version     = ImagineCms::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Aaron Namba"]
  s.email       = ["aaron@biggerbird.com"]
  s.homepage    = "http://www.biggerbird.com"
  s.summary     = %q{Imagine Content Management System for Rails}
  s.description = %q{Imagine Content Management System for Rails}

  s.rubyforge_project = "imagine_cms"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
