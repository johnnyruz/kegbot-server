#!/bin/bash

URL=$1
KEY=$2
[ $# -ne 2 ] && { echo "Usage: $0 ip_or_hostname api_key"; exit 1; }

#INSTALL NODE SERVER
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo rm -rf /home/kegbot/kegbot-server.venv/node_server

cd ~
git clone --branch latest https://github.com/johnnyruz/kegbot-server.git
sudo cp -rf ~/kegbot-server/node_server /home/kegbot/kegbot-server.venv/
sudo cp -rf ~/kegbot-server/node_server/kegbot.conf /etc/supervisor/conf.d/kegbot.conf
sudo rm -rf ~/kegbot-server
cd /home/kegbot/kegbot-server.venv/node_server
sudo npm install
sudo chown kegbot:kegbot /home/kegbot/kegbot-server.venv/node_server

sudo sed -i "s/[[]YOUR API KEY[]]/$KEY/" /home/kegbot/kegbot-server.venv/node_server/config.js

sudo sed -i "s|http[:][/][/]localhost|http://$URL|" /home/kegbot/kegbot-server.venv/lib/python2.7/site-packages/pykeg/web/kegweb/templates/kegweb/fullscreen.html

sudo supervisorctl update

