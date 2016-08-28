#!/bin/bash

#Add latest node repo
cd ~
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh

#Refresh packages
sudo apt-get update

#install our needs
sudo apt-get install nodejs build-essential redis-tools git
cd -

#We use this for service management
npm install -g forever
npm install -g forever-service
