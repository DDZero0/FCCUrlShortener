'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var mongoClient = require('mongoose').MongoClient;
var bodyParser = require('body-parser');
var dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

var Schema = mongoose.Schema;
const UrlSchema = new Schema({
  original_url: String,
  short_url: String
});
var Url = mongoose.model("Url",UrlSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

//Global Variables
var count = 1;
let redir = '';

//Functions
const findMyUrl = (num)=>{
  Url.findOne({short_url:num},(err,data)=>{
   if (err) return console.log(err);
  console.log(`Successfully pulled ${data.original_url} from shortcode ${data.short_url}`);
  redir = data.original_url;
  })
}

const dnsChecker = (urlToCheck)=>{
   return dns.lookup(urlToCheck,(err,data)=>{
    if(err){
      console.log(err);
    }
    if(data == undefined){
      return null;
    }
    else{
    urlShortener(urlToCheck); 
    }
})
  console.log(valid);
}

const urlShortener = (url) => {
  let newUrl = new Url({
  original_url:url,
  short_url:count
  });
  count++;
  Url.findOne({original_url:url},(err,data)=>{
    if(err) throw err;
    if(data == null){
        newUrl.save(function(err,newUrl){
  if(err){console.log(err)}
  console.log(`Successfully added ${newUrl.original_url} to database, at shortcode #${newUrl.short_url}`);
  });
    }
    else{
      console.log('Duplicate!');
    }
  })

};
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new",(req,res,next)=>{
  let url = req.body.url;
  let regex = /https?:\/\//;
  if (regex.test(url)){
   url= url.replace(regex,'');
    console.log(url);
     dnsChecker(url);
    res.json({"Status":"Success"});
  }
  else{
  res.json({"Status":"Invalid URL"})
  }
  next();
})

app.get("/api/shorturl/:num",(req,res,next)=>{
  let shortCode = req.params.num;
  findMyUrl(shortCode);
  res.redirect(redir);
  next();
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});

