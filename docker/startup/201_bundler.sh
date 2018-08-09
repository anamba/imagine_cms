#!/bin/bash

su app -l -c 'cd ~/myapp && bundle update --jobs 8'
echo "bundler done"
