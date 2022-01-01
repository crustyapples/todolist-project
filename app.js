//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-advait:test-1234@cluster0.asz5x.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const todoSchema = new mongoose.Schema({
  item: {
    type: String,
  },
  list: {
    type: String,
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema]
});

const List = mongoose.model("List", listSchema);

const Item = new mongoose.model("Item", todoSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];

const item1 = new Item({
  item: "Welcome to your todolist",
  list: "Main"
});

const item2 = new Item({
  item: "Create an item by clicking +",
  list: "Main"
});

const item3 = new Item({
  item: "Check the box to delete an item",
  list: "Main"
});

let items = [];

let defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({list:"Main"}, function (err, docs) {
    if (docs.length === 0) {
      Item.insertMany(defaultItems);
    }
    items = docs;
    console.log(items);
    res.render("list", {listTitle: "Today", newListItems: items});
  });
  
  
});

app.post("/", function(req, res){
  if (req.body.list === "Today") {
    const item = new Item ({
      item:req.body.newItem,
      list: "Main"
    });   
    item.save()
    res.redirect("/");
  } else {
    const item = new Item ({
      item:req.body.newItem,
      list: req.body.list
    });
    List.findOne({name: req.body.list}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"  + req.body.list);
    });
  }
    
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.deleted;
  const listName = req.body.listName;
  
  if (listName === "Today") {
    console.log(checkedItemId);
    Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("successfully deleted checked item");
      res.redirect("/");
    };
  });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    })
  }
  
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        const list = new List ({
          name: customListName,
          items: defaultItems
        })
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port==null||port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});




