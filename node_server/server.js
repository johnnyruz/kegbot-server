var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var config = require('./config');
var { createLogger, format, transports } = require('winston');
var { combine, timestamp, prettyPrint } = format;

var redis = require('redis');
var url = 'redis://localhost:6379';
var client1 = redis.createClient(url);

var io = require('socket.io')(http)

var taplist = [];
var userlist = [];

//logging setup
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
  ),
  transports: [
    // colorize the output to the console
    new (transports.File)({
      filename: `./results.log`,
      timestamp: tsFormat,
      level: 'info'
    })
  ]
});

//point express to static file directory
app.use('/', express.static('www'));

//update information regarding taps
refreshTaps();
refreshUsers();

setInterval(refreshTaps, config.REFRESH_TAP_DELAY);
setInterval(refreshUsers, config.REFRESH_USER_DELAY);

//start server
http.listen(config.PORT, function(){
    console.log(new Date().toLocaleString() + ' - listening on *:' + config.PORT);
});


try {

//configure action when redis publish is received
client1.on('message', function(chan, msg) {
    var msgJSON = JSON.parse(msg);

    if(msgJSON.event === "UserAuthenticatedEvent"){

       var userAuthMsg = new Object();
       userAuthMsg.msg_type = "UserAuth";
       userAuthMsg.assigned = false;

       userlist.forEach((user) => {
           if (user.username === msgJSON.data.username){
              userAuthMsg.assigned = true;
              userAuthMsg.name = user.display_name;
           }
       });

       logger.info(userAuthMsg);
       io.sockets.emit('twits', userAuthMsg);

    }
    else if(msgJSON.event === "WebFlowUpdate"){

       logger.info(msgJSON);

       var flowUpdateMsg = new Object();

       taplist.forEach((tap) => {

            if (tap.meter_name === msgJSON.data.meter_name){
               flowUpdateMsg.beer_name = tap.beer_name;
               flowUpdateMsg.reading = ((msgJSON.data.ticks * tap.ml_per_tick) * 0.033814).toFixed(1);
	       flowUpdateMsg.status = msgJSON.data.state;
               flowUpdateMsg.flowId = msgJSON.data.flow_id;
	       flowUpdateMsg.username = msgJSON.data.username;
            }

       });

       flowUpdateMsg.msg_type = "FlowUpdate";
       logger.info(flowUpdateMsg);
       io.sockets.emit('twits', flowUpdateMsg);
    }
});

} catch (err){
        console.log(newDate().toLocaleString() + ' - Error in ClientON');
	console.log(newDate().toLocaleString() + ' - ' + err);

}

//subscribe to kegnet redis channel
client1.subscribe('kegnet');

//timer function to refresh taps
function refreshTaps() {
   
   try{

   taplist = [];

   request('http://localhost/api/taps', function (error, response, body) {
      
      var bodyjson = JSON.parse(body);

      bodyjson.objects.forEach((tap) => {

         var t = new Object();
         t.meter_name = tap.meter_name;
         t.ml_per_tick = tap.ml_per_tick;
         t.tap_name = tap.name;

         if(tap.current_keg != null){
            t.beer_name = tap.current_keg.type.name;
         }

      taplist.push(t);
   });

						  

   });

   } catch (err) {

	console.log(newDate().toLocaleString() + ' - Error Refreshing Taps');
	console.log(newDate().toLocaleString() + ' - ' + err);

   }

}

//timer function to refresh users
function refreshUsers() {

   try {

   userlist = [];

   const options = {  
    url: 'http://localhost/api/users',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'X-Kegbot-Api-Key': config.API_KEY
    }
   };


   request(options, function (error, response, body) {

      var bodyjson = JSON.parse(body);

      bodyjson.objects.forEach((user) => {

         var u = new Object();
         u.username = user.username;
         u.display_name = user.display_name;

         userlist.push(u);
      });

   });

   } catch (err){

	console.log(new Date().toLocaleString() + ' - Error Refreshing Users');
	console.log(new Date().toLocaleString() + ' - ' + err);

   }
}
