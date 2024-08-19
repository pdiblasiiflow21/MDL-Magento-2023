This project is created from a GitLab [Project Template](https://docs.gitlab.com/ce/gitlab-basics/create-project.html)

Additions and changes to the project can be proposed [on the original project](https://gitlab.com/gitlab-org/project-templates/express)

** Datos de prueba Lyracons: **

StoreId: 586a75a3e4b08a4be8ff3f2e
CourierId: t7hjfdfd
Token: 4r5ty7uio0r5ty7uio0fgh7jg7hjk

http://www.vtexcarriers.com/order?courierId=t7hjfdfd&storeId=586a75a3e4b08a4be8ff3f2e&orderId=603523293325-01
http://dpvtex.lyracons.com:9696/order

** Processing automation **
node-cron

## Script

script ./start.sh convenient

## Forever

The service runs on forever, with command 
```sudo NODE_ENV=production /usr/local/bin/forever start -m 10 -a -l /var/www/iflow-server/logs/server.log /var/www/iflow-server/bin/www > /var/www/iflow-server/logs/system.log /var/www/iflow-server/logs/system-error.log```

To stop, sudo forever stopall, to run, script above

Check Mongo service, if stopped, restart
```
sudo service mongod status
```
