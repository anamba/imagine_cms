### Docker image for imagine5 ###

# See https://github.com/phusion/passenger-docker/blob/master/Changelog.md for a list of version numbers.
FROM phusion/passenger-ruby25:0.9.35
LABEL maintainer="aaron@aaronnamba.com"

# Set up 3rd party repos
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list

# Update package list
RUN apt-get update

# Upgrade other preinstalled packages
RUN apt-get upgrade -y -o Dpkg::Options::="--force-confnew"

# Install other packages we depend on
RUN apt-get install -y nodejs yarn
RUN apt-get install -y tzdata
RUN apt-get install -y mysql-client
RUN apt-get install -y libmagickcore-dev libmagickwand-dev  # for rmagick2 gem
RUN apt-get install -y imagemagick                          # for mini-magick gem
RUN apt-get install -y openjdk-8-jre-headless               # java for fop
RUN apt-get install -y memcached                            # for rack-attack and rails cache
RUN apt-get install -y cmake pkg-config                     # for rugged (git)
RUN apt-get autoremove -y

# Install the current gemset as a starting point (to make sure we didn't miss any apt dependencies),
# while also making deploys and dev setup time quicker
WORKDIR /home/app/myapp
COPY Gemfile ./
RUN gem update --system
RUN gem install bundler rake rack
RUN bundle install --jobs 8 --retry 3

#
# Try to put things AFTER the apt/bundler steps so we don't have to redo them as often
#

# Enable services
RUN rm -f /etc/service/nginx/down
RUN systemctl enable memcached

# Add custom services
# RUN mkdir /etc/service/sidekiq /etc/service/webpack
# COPY docker/services/sidekiq.sh /etc/service/sidekiq/run
# COPY docker/services/webpack.sh /etc/service/webpack/run

# Other startup scripts
RUN mkdir -p /etc/my_init.d
COPY docker/startup/101_mkdir.sh /etc/my_init.d/
COPY docker/startup/201_bundler.sh /etc/my_init.d/
COPY docker/startup/211_yarn.sh /etc/my_init.d/

# Remove the default vhost (so that ours will respond to any Host)
RUN rm -f /etc/nginx/sites-enabled/default

# For convenience
COPY docker/conf/.my.cnf /home/app

# Post-build clean up
RUN apt-get clean && rm -rf /tmp/* /var/tmp/*
# RUN rm -rf /var/lib/apt/lists/*

# Expose port 80 to the Docker host, so we can access it from the outside (remember to publish it using `docker run -p`).
EXPOSE 80

# Run this to start all services (if no command was provided to `docker run`)
CMD ["/sbin/my_init"]
