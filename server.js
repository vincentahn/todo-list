//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  res.render("list");
});

app.post("/date", function(req, res){
  console.log("date event received.");
  const date = req.body.date;

  console.log(date);
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
