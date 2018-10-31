var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = app => {
     app.get('/', (req,res) => {
        res.render('index.html')
     });
     app.get('/about', (req,res) => {
        res.render('about.html');
    });

    app.post('/myaction', urlencodedParser, (req, res) => {
        console.log('12231');
      res.send('You sent the name "' + req.body.name + '".');
    });
}


//app.get('/', (req, res) => {
//   res.send('Hello World!');
//});
