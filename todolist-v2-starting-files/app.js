//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const myMongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const myloadash = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// // to connect with the database
// myMongoose.connect("mongodb://localhost:27017/ListDB", {
//   useUnifiedTopology: true,
//   useNewUrlParser: true
// }); // url+database name

// to connect with the cloud dta base
myMongoose.connect("mongodb+srv://shrivastavagagan3:Shrivastava@3@cluster0.m1xcm.mongodb.net/ListDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
}); // url+database name

// making Schema
const itemSchema = new myMongoose.Schema({
  itemName: String
});

const itemModel = myMongoose.model("toDoItem", itemSchema);

const t1 = new itemModel({
  itemName: "Eating"
});
const t2 = new itemModel({
  itemName: "Sleeping"
});
const t3 = new itemModel({
  itemName: "wting"
});

const defaultItems = [t1];
//const defaultItems = [];

const listSchmea = new myMongoose.Schema({
  name: String,
  listtaks: [itemSchema]
});

const listmodel = myMongoose.model("list", listSchmea);


app.get("/", function(req, res) {
  //getting the item from db, first paramter is the conditionn, second is the callback fucntion
  itemModel.find({}, function(err, data) {

    if (data.length === 0) {
      itemModel.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("error while inserting");
        } else {
          console.log("sucesscfully inserted");
        }
      });
      res.redirect("/");
    } else {
      console.log(data);
      res.render("list", {
        listTitle: "Today",
        newListItems: data
      });
    }
  });
});

app.post("/", function(req, res) {

  const item = req.body.newItem;
const listname = req.body.list;

  const newTask = new itemModel({
    itemName: item
  });
console.log(req.body);
  if(listname === "Today"){
    newTask.save();
    res.redirect("/");
  }else{
    // have to seaarch that list and add the new item
    listmodel.findOne({name:listname}, function(err,result){
      result.listtaks.push(newTask);
      result.save();
    res.redirect("/" +listname );
    });
  }

  // newTask.save();
  // res.redirect("/");
});


// insted of usuing different get methods , we are usng express route paramtere
app.get("/:routing", function(req, res) {
  console.log(req.params.routing);
  const route = myloadash.capitalize(req.params.routing);
  listmodel.findOne({name : route},function(err, result){
    if(!err){
      console.log(result);
      if(!result){
        console.log("doestn ot exist");
        // creating a list
        const l1 = new listmodel({
          name: route,
          listtaks: defaultItems // t1
        });
        l1.save();
        res.redirect("/" +route );
      }else{
        console.log("exist");
        res.render("list", {
          listTitle: result.name,
          newListItems: result.listtaks //result.listtaks
        });
      }
    }

  });

  // const l1 = new listmodel({
  //   name: route,
  //   listtaks: t1
  // });
  // l1.save();

});

app.post("/delete", function(req, res) {
  console.log(req.body.check);
  const checkd = req.body.check;
  const pageName = req.body.listName;

  if(pageName ==="Today"){
    itemModel.deleteOne({
      _id: req.body.check
    }, function(err) { // we can also use findByIdAndRemove method
      if (err) {
        console.log("error occr while deleting");
      } else {
        console.log("deleted sucessfully");
        res.redirect("/");
      }
    });
  }else{
    // have to check in the lists table for that item, first parameter is the where , second is the pulling and deleting it, callback
    listmodel.findOneAndUpdate({name:pageName }, {$pull : {listtaks : {_id: checkd}}}, function(err, result){
      if(!err){
        res.redirect("/" + pageName);
      }
    });
  }

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
