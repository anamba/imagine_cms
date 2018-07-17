#!/bin/bash

# check ownership on /home/app/myapp
APP_UID=`stat --format '%u' /home/app/myapp`
APP_GID=`stat --format '%g' /home/app/myapp`

echo "Setting app user uid/gid to $APP_UID/$APP_GID"
groupmod -g $APP_GID app
usermod -u $APP_UID -g $APP_GID app

echo "Creating log, tmp/pids directories"
su app -l -c 'cd /home/app/myapp && mkdir -p log tmp/pids'

echo "chowning node_modules, log, tmp directories (created from volumes)"
cd /home/app/myapp && chown app node_modules log tmp
