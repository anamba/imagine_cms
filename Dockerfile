### Docker image for imagine5 ###

# See https://hub.docker.com/r/anamba/rails-dev/tags/ for a list of tags
FROM anamba/rails-dev:1.0
LABEL maintainer="bbsoftware@biggerbird.com"

# Update package list and upgrade pre-installed packages
RUN apt-get update
RUN apt-get upgrade -y -o Dpkg::Options::="--force-confnew"

# Install other packages we depend on
RUN apt-get install -y mysql-client
RUN apt-get install -y libmagickcore-dev libmagickwand-dev  # for rmagick2 gem
RUN apt-get install -y imagemagick                          # for mini-magick gem
RUN apt-get install -y openjdk-8-jre-headless               # java for fop
RUN apt-get install -y cmake pkg-config                     # for rugged (git)
RUN apt-get autoremove -y

# apt clean up
RUN apt-get clean && rm -rf /tmp/* /var/tmp/*
# RUN rm -rf /var/lib/apt/lists/*

# Add custom vhost
COPY /docker/conf/nginx-vhost.conf.template /etc/nginx/

# Remove the default vhost (so that ours will respond to any Host)
RUN rm -f /etc/nginx/sites-enabled/default

# Add custom services
RUN mkdir /etc/service/memcached
COPY docker/services/memcached /etc/service/memcached/run

# For convenience
COPY docker/conf/.my.cnf /home/app
