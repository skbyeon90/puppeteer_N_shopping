var express = require('express');
var app = express();
var router = require('./src/main')(app);
//var router = require('./test/maintest')(app);
//var bodyParser = require('body-parser');

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.listen(3000, ()=>{
   console.log('Example app listening on port 3000!')
});

app.use(express.static('/public'));
