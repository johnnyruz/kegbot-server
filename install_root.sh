#!/bin/bash

#continue on error
set +e

#update system packages
sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt-get install -y wget unzip

#Get Required Files from Github
wget https://github.com/johnnyruz/kegbot-server/raw/add_my_pkgs_to_github/my_kegbot_packages.zip
unzip /home/pi/my_kegbot_packages.zip

#DEBUG ONLY - REMOVE FILES FROM PIP INSTALLATION DIRECTORY
sudo rm -rf /usr/local/lib/python2.7/dist-packages/*

#RUN INSTALL FOR FIRST TIME
bash -c /home/pi/mypkgs/install_part1.sh

#FIX ISSUE WITH libmysqlclient-dev
sudo sed -i 's/libmysqlclient-dev/default-libmysqlclient-dev/' /usr/local/lib/python2.7/dist-packages/kegberry/app.py

#IF BUSTER RELEASE - FIX ISSUE WITH MYSQL SERVER
if sudo cat /etc/os-release | grep -q buster
then
 sudo sed -i 's/mysql-server/default-mysql-server/' /usr/local/lib/python2.7/dist-packages/kegberry/app.py
fi


#RUN INSTALL FOR SECOND TIME
bash -c /home/pi/mypkgs/install_part1.sh

#FIX ISSUE WITH MYSQL PERMISSION DENIED
sudo cp /home/pi/mypkgs/NEW-50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf
sudo systemctl restart mysql

#RUN INSTALL FOR THIRD TIME
bash -c /home/pi/mypkgs/install_part1.sh

#FIX ISSUE WITH HTTPS REQUIRED

if sudo cat /etc/os-release | grep -q raspbian
then
 bash -c /home/pi/mypkgs/install_part2_arm.sh
else
 bash -c /home/pi/mypkgs/install_part2.sh
fi

#RUN INSTALL FOR THE FOURTH AND FINAL TIME
bash -c /home/pi/mypkgs/install_part1.sh


