var http = require('http');
var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require("body-parser");

var app = express();

app.use(session({
  secret: process.env['COOKIE_SECRET'],
  resave: true,
  saveUninitialized: false,
  key: 'ML',
  secure: true
}));

app.use(express.static(path.resolve(__dirname, 'public')));
app.set('views', path.resolve((__dirname, 'views')));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: false, limit: '400kb'}));
app.use(bodyParser.json({limit: '300kb'}));
// app.use(bodyParser.text({limit: '300kb'}));

require('./router')(app);

app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('addr',  process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");

http.createServer(app).listen(app.get('port'), app.get('addr'), function(){
  console.log("Listening on", app.get('port') + ":" + app.get('port'));
  console.log("starting database services");
  require('./models');
  global.db.sequelize.sync().catch(function(err){
    console.log('db synchronization failed');
  }).then(function(){
    console.log('db synchronization succeeded');
  });
});
