# Imagine 5 - Rails-powered CMS

[![Version](https://img.shields.io/github/tag/anamba/imagine_cms.svg?maxAge=360)](https://github.com/anamba/imagine_cms/releases/latest)
[![License](https://img.shields.io/github/license/anamba/imagine_cms.svg)](https://github.com/anamba/imagine_cms/blob/master/license.txt)


Imagine CMS is a web content management system developed by [Bigger Bird Creative, Inc.](https://biggerbird.com) in 2006 for its clients.
Other CMSes came with a learning curve: not a problem for daily users, but clients who only used it once a month or so would forget everything by the next time they logged in.
Simpler systems didn't have enough functionality to allow us to do what we wanted to do as designers and developers.
Thus, we created a CMS that is easy for clients to use, stays out of our way, and provides useful automation (lists, publishing and unpublishing on a schedule, navigation links, RSS feeds, etc.).

## Current Status

[Imagine 6](https://github.com/ImagineCMS/imagine_cms) (Elixir-based) is use in production.

Imagine 5 (this repo) is in use in production, but is being wound down in favor of Imagine 6.

Imagine 4 (v4.2-stable branch) is available for apps tied to Rails 4.2, but is no longer actively maintained.

Imagine 3 (v3.0-stable branch) is available for apps tied to Rails 3.x, but is no longer actively maintained.

Unless you are already familiar with Imagine, this project is not suitable for wider use. Why? Well, the reason this version of Imagine is published on Github is to ensure that if something happens to Bigger Bird, our clients will not be left high and dry. However, this version was never intended to be used by the general public.

Imagine 7 (planned) will be a clean break and a great time to try Imagine CMS.

## History and Roadmap

Imagine was originally created in the Rails 1.0 days, to run a large number of technically straightforward content-based sites (versus the one or two highly-custom web applications most Rails developers were building at the time). We wanted to provide a way to create and manage static content with a little bit of automation, while also allowing limitless custom Ruby development. However, because plugins/engines were quite limited in those days, Imagine was implemented by monkey-patching core parts of Rails and creating a new framework on top of Rails. Although this allowed us great insight into the inner workings of Rails, this approach proved extremely difficult to port to Rails 2. Thus, sites using the original Imagine 1.x were stuck on Rails 1.x for many years.

All that is now firmly in the past. By extracting Imagine functionality into a Rails engine, we achieved compatibility with Rails 3.2 and Ruby 1.9 and removed roadblocks to a future upgrade to Rails 4 and Ruby 2, all while retaining backwards compatibility with the Imagine CMS database structure.

(Imagine 1.x and 2.x were internal-only releases, the open source version started at 3.0.)

* Imagine 3.0 (Rails 3.2, Ruby 1.9/2.0): [DONE, v3.0-stable] 100% restored functionality (plus a few extras and fixes), no database changes.
* Imagine 4.0 (Rails 4.0, Ruby 2.1): [DONE, v4.0-stable] Compatibility with Rails 4.0
* Imagine 4.1 (Rails 4.1, Ruby 2.1): [DONE, v4.1-stable] Compatibility with Rails 4.1
* Imagine 4.2 (Rails 4.2, Ruby 2.2): [DONE, v4.2-stable] Compatibility with Rails 4.2, many minor fixes and UI improvements
* Imagine 5.0 (Rails 5.0, Ruby 2.2): [SKIPPED] Compatibility with Rails 5.0
* Imagine 5.1 (Rails 5.1, Ruby 2.4): [SKIPPED] Compatibility with Rails 5.1
* **Imagine 5.2 (Rails 5.2, Ruby 2.5/2.6): [PRODUCTION] Compatibility with Rails 5.2**
* **Imagine 6 (Elixir/Phoenix + MySQL): [PRODUCTION] Bridge between Imagine 5 and 7**
* Imagine 7 (Elixir/Phoenix + CouchDB): [PLANNED] Community-driven open source project

Imagine 6 is a complete, ground-up rewrite in Elixir, and Imagine 7 builds on that, while also replacing the original MySQL/MariaDB store with CouchDB for improved scaling, redundancy, and replication. Imagine 7 development will also be done in the open, in a new repository under the Imagine CMS organization, as a proper community-driven open source project (finally!). The core concepts will continue on, but not a single line of code will be preserved.

## Hosting

Imagine 3.x-5.x can run on typical Rails hosting platforms (anything that uses Passenger, Unicorn, Puma, etc.). On hosts that don't allow writing to the local filesystem (e.g. Heroku) you won't be able to use photo galleries or page caching, but other features should work (note: this mode of operation has not been fully tested).

## Getting Help

Get paid support and hosting for Imagine CMS straight from the people who made it: [Bigger Bird Creative, Inc.](https://biggerbird.com) Neither is required to use Imagine CMS, of course.

## Contributing

Imagine 6 (Elixir rewrite) is now open source and Imagine 7 (MySQL -> CouchDB) will be a true open source project with full community involvement, but this project (Ruby-based Imagine 3.x - 5.x) will remain mostly closed for the foreseeable future (source will continue to be made available on Github, but development will be driven by Bigger Bird only). If companies or individuals are willing to sponsor or co-develop new features, we can work something out.

## Building Docker Image

(notes for myself)

```bash
docker build -t anamba/imagine5-dev:latest .
docker tag anamba/imagine5-dev:latest anamba/imagine5-dev:5.2.3
docker tag anamba/imagine5-dev:latest anamba/imagine5-dev:5.2
docker push anamba/imagine5-dev
```
