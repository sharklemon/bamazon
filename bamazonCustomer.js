var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "12345",
  database: "bamazon"
});
//start your connection
connection.connect(function(err) {
  if (err) throw err;
  displayInvent();
});

itemIDs =[] //keep track of ids to check later

//display inventory to new customer
function displayInvent() {
	var query = "SELECT item_id, product_name, cost FROM products";
	connection.query(query, function(err, res) {
		for (var i = 0; i < res.length; i++) {
			console.log("Item ID: " + res[i].item_id + " || Product: " + res[i].product_name + " || Price: $" + res[i].cost);
			itemIDs.push(res[i].item_id);
		}    
		console.log("full list of item ids " +itemIDs);
		// connection.end();
		runSearch();
	});
}

//check if they want to purchase anything
var runSearch = function(){
  inquirer
    .prompt({
      name: "YNpurchase",
      type: "list",
      message: "Would you like to purchase an item?",
      choices: [
        "Yes!",
        "No, not today."
      ]
    })
    .then(function(answer) {
    	if(answer.YNpurchase === "Yes!"){
    		buyanitem();
    	}
    	else{
    		console.log("OK have a nice day!\n")
        connection.end();
    	}
    })
}

//if they want to make a purchase, take the item ID and make sure it exists!
function buyanitem(){
  inquirer
    .prompt(
    {
		name: "whichitem",
		type: "Input",
		message: "What is the item ID of the product you would like to purchase?",
    },
    {
    	name: "howmany",
    	type:"Input",
    	message:"How may would you like to purhcase?"
    }
    )
    .then(function(answer) {
    var checkinger = parseInt(answer.whichitem);
	if(itemIDs.indexOf(checkinger) === -1){
    		console.log("Sorry that item index number doesn't exist! Try to enter a different item ID.\n");
    		buyanitem();
    	}
    	else{
    		checkout(checkinger);
    	}
    })
}

//assuming item exists, get how many they want to purchase and make sure we have that many
function checkout(userentry) {
	var query = "SELECT item_id, product_name, cost, stock_quantity FROM products WHERE ?";
	connection.query(query, { item_id: userentry }, function(err, res) {
		if(err){console.log(err)};
		
		console.log("Your item " + res[0].product_name + " costs $" + res[0].cost + ". We have " + res[0].stock_quantity + " left in stock.");
		
		inquirer
	    .prompt(
	    {
			name: "howmany",
			type: "Input",
			message: "How many would like to purchase?",
	    }).then(function(answer) {
		    var checkinger = parseInt(answer.howmany);
			
			if(checkinger > res[0].stock_quantity){
	    		console.log("Sorry we don't have that many left in stock. Try a smaller number.\n");
	    		checkout(userentry);
	    	}
	    	else{
	    		var totalcost = ((res[0].cost)*(checkinger)).toFixed(2)
	    		console.log("Purchase complete, your total is $" +totalcost + ". Thank you, come again!");
	    		var newtotal = res[0].stock_quantity - checkinger
	    		updatesql(res[0].item_id, newtotal)
	    	}
	    })
	});
}

function updatesql(itemid, updateno){
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: updateno
      },
      {
        item_id: itemid
      }
    ],
    function(err, res) {
      console.log("Products updated!\n");
      displayInvent();
    }
  );
}














