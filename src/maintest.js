'use strict';

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var utils = require('../utils');

const puppeteer = require('puppeteer');
const assert = require('chai').assert;
const expect  = require('chai').expect;


describe('Status and content', function() {
module.exports = app => {
        app.get('/', (req,res) => {
            console.log('in index.html');
            res.render('index.html')
         });

        app.get('/about', (req,res) => {
            console.log('in about.html');
            res.render('about.html');
        });
    
    describe ('Main page', function() {
        it('status', function(done){
        app.post('/myaction', urlencodedParser, (req, res) => {
   
                let browser;
                let page;
                console.log('1');
                describe('상품 등록', async() => {
                    it('should return an array', async() => {
                    console.log('3');
                    var customMade = false;
                    done();
                })
                })
        }); 
        });
    });
};
});