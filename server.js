var express = require('express');
var app = express();
var router = require('./src/main')(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.listen(3000, ()=>{
   console.log('register server start! (port:3000)')
});

//app.use(express.static('/public'));

