#!/bin/sh
sudo forever stopall
sudo NODE_ENV=production /usr/local/bin/forever start -m 10 -a -l /var/www/iflow-server/logs/server.log /var/www/iflow-server/bin/www > /var/www/iflow-server/logs/system.log /var/www/iflow-server/logs/system-error.log

