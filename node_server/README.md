# Node JS Real-Time Updates Server

This is a Node JS Server that is designed to be used
with Kegbot Server to provide real-time pour updates to
the Fullscreen page of the Kegbot Server web interface.

The goal of this add-on is to replicate some of the
features of the Kegtab Android App, without having to use a tablet.

For my setup I'm using the Kegberry installation method on a Rasp Pi 3.

**Official Kegbot repository:** https://github.com/Kegbot/kegbot-server/


## Quick start

Super quick start instructions:

This assumes you already have a working Kegbot Server implementation.
See the post at: [Kegbot New Installation](https://forum.kegbot.org/t/kegberry-kegbot-new-installation/1017)
to help get you started.


* Install NodeJS 10
```
   curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
   sudo apt-get install -y nodejs
```
* Download the contents of the node-server directory and move to the location 
```
/home/kegbot/kegbot-server.venv
```
* Edit the **config.js** file with the desired port and refresh time. Must be a different port than Kegbot Server.
* Make sure you have the latest version of **fullscreen.html** in 
```
/home/kegbot/kegbot-server.venv/lib/python2.7/site-packages/pykeg/web/kegweb/templates/kegweb/
```
* In **fullscreen.html**, update `var sock = io.connect('http://localhost:3000');` with the IP Address of your Kegbot Server
* Navigate to the folder
```
/home/kegbot/kegbot-server.venv/node-server
```
* Run **npm install** to obtain required packages	
* Run **node server.js** (you can append the '&' symbol to the end of the command to run in background)

Node server will be running on the port configured in config.js (default is port 3000).

You will be able to test by starting a pour while viewing the fullscreen page of the Kegbot Server web interface.
There is also a test-page running at http://[YOUR IP OR HOSTNAME]:[YOUR CONFIGURED PORT]/index.html.

You can use Google Chrome's Developer tools to degbug and identifiy any connection issues.

## Advanced Setup

If you currently access your Kegbot Server from the internet you will likely have to port-forward
the configured port of your node server so you can connect to the real-time service.

You can also configure the Node service to auto-start by adding an entry to the supervisor config at /etc/supervisor/cond.d/kegbot.conf
to run the Node server. You can find an example config file in the node-server directory.


## Documentation and Help

[Kegbot Forum](https://forum.kegbot.org/)
