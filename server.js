//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sql = require('mysql');

const keyFile = require('./keyFile.js');

console.log(keyFile);

const app = express();

const dateFormatRegEx = /\d{4}-\d{1,2}-\d{1,2}/;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var mySqlConnection = sql.createConnection({
  host: keyFile.host,
  user: keyFile.user,
  password: keyFile.password,
  multipleStatements: true
});

// Create database and date table if they didn't already exist.
mySqlConnection.connect(function(err){
  if(!err){
    console.log("Connected!");

    mySqlConnection.query("CREATE DATABASE IF NOT EXISTS " + keyFile.database, function(err, result){
      if(!err){
        console.log("Database newly created or already exists.");
      }
      else console.log(err);
    });

    mySqlConnection = sql.createConnection({
      host: keyFile.host,
      user: keyFile.user,
      password: keyFile.password,
      database: keyFile.database,
      multipleStatements: true
    });

    var sqlQuery = "CREATE TABLE IF NOT EXISTS dateTable (date DATE NOT NULL PRIMARY KEY)";

    mySqlConnection.query(sqlQuery, function(err, result){
      if(!err){
        console.log("Date table created or already exists");
      }
      else console.log(err);
    })

    sqlQuery = "CREATE TABLE IF NOT EXISTS itemTable (id INT AUTO_INCREMENT PRIMARY KEY, date DATE NOT NULL, item BLOB NOT NULL, checked BOOLEAN DEFAULT false, FOREIGN KEY (date) REFERENCES dateTable(date))";

    mySqlConnection.query(sqlQuery, function(err, result){
      if(!err){
        console.log("Item table created or already exists");
      }
      else console.log(err);
    })
  }
  else console.log(err);
});

app.get("/", function(req, res){
  res.render("home");
});

app.get("/date/:inputDate", function(req, res){
  const inputDate = req.params.inputDate;

  // Check whether inputDate is valid date entry (YYYY-MM-DD)
  if(dateFormatRegEx.exec(inputDate)){
    console.log("Date is valid");

    // Insert date into dateTable if date hasn't previously been inserted
    var sqlQuery = "INSERT IGNORE INTO dateTable(date) VALUES(?);";

    mySqlConnection.query(sqlQuery, [inputDate], function(err, result){
      if(err) console.log(err);
    });

    var sqlQuery = "SELECT id, item, checked FROM itemTable WHERE date = ?";

    mySqlConnection.query(sqlQuery, [inputDate], function(err, result){
      if(!err){
        console.log(result);

        var listArray = [];

        result.forEach(element => {
          console.log(element);

          let buffer = element.item.toString();

          let listItem = {
            id: element.id,
            name: buffer,
            checked: element.checked
          };

          console.log(listItem);

          listArray.push(listItem);
        });

        res.render("list", {listDate: inputDate, listArray: listArray});
      }
      else{
        console.log(err);
        res.render("error");
      }
    });
  }
  else{
    console.log("Date is invalid");
    res.render("error");
  }
});

app.post("/check", function(req, res){
  console.log("Checking item");

  const id = req.body.id;
  const listDate = req.body.listDate;
  const checked = req.body.checked;
  const name = req.body.name;

  var sqlQuery = "UPDATE itemtable SET checked = NOT checked WHERE id = ?;";

  mySqlConnection.query(sqlQuery, [id], function(err, result){
    if(!err){
      console.log(checked);
      // if() console.log(name + " changed to Done!");
      // else console.log(name + " changed to Not Done.");
    }
    else console.log(err);
  })

  res.redirect("/date/"+listDate);
});

app.post("/delete", function(req, res){
  console.log("Deleting item");

  const id = req.body.id;
  const listDate = req.body.listDate;
  const name = req.body.name;

  var sqlQuery = "DELETE from itemtable WHERE id = ?;";

  mySqlConnection.query(sqlQuery, [id], function(err, result){
    if(!err) console.log(name + " deleted");
    else console.log(err);
  });

  res.redirect("/date/"+listDate);
});

app.post("/add", function(req, res){
  console.log("Adding item");

  const newItem = req.body.newItem;
  const listDate = req.body.listDate;

  var sqlQuery = "INSERT IGNORE INTO itemtable(date, item, checked) VALUES(?, ?, false);";

  mySqlConnection.query(sqlQuery, [listDate, newItem], function(err, result){
    if(!err) console.log(newItem + " added");
    else console.log(err);
  })

  res.redirect("/date/"+listDate);
});

app.post("/date", function(req, res){
  console.log("Date event received.");
  const date = req.body.date;

  res.redirect("/date/"+date);
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Server started on port " + port);
});
