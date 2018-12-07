#!/bin/bash -l

su app bash -l -c 'cd /home/app/myapp && NO_YARN_INTEGRITY_CHECK=1 NO_BOOTSNAP=1 REDIS_URL="redis://redis:6379/1" sidekiq'
