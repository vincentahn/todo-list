//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
  res.render("list", {listDate: "Today"});
});

app.post("/date", function(req, res){
  console.log("date event received.");
  const date = req.body.date;

  console.log(date);

  res.redirect("/"+date);
});

app.get("/:inputDate", function(req, res){
  const inputDate = req.params.inputDate;

  console.log(inputDate);

  res.render("list", {listDate: inputDate});

  // else[
  //   res.render("error");
  // ]
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
