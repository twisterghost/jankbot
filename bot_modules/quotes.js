var fs = require('fs');
var friends = require('./friends.js');
var logger = require('./logger.js');

var quotes = [];
// if we've saved a quotes list, use it
if (fs.existsSync('quoteslist')) {
  quotes = JSON.parse(fs.readFileSync('quoteslist'));
}


// Saves quotes.
exports.save = function() {
  fs.writeFileSync("quoteslist", JSON.stringify(quotes));
}


// Helper function to add a quote.
function addQuote(quote) {
  quotes.push(quote);
}


// Helper function to get all quotes.
function getQuotes() {
  return quotes.join("\n");
}


// Handler.
exports.handle = function(input, source, bot) {
  input = input.split(" ");
  if (input.length > 2 && input[1].toLowerCase() == "add") {
    input.splice(0, 2);
    var quote = input.join(" ");
    quotes.push(quote);
    friends.messageUser(source, "Saved quote.", bot);
  }
  else if (input.length > 1 && input[1].toLowerCase() == "list") {
    friends.messageUser(source, "Here are quotes saved by Jank members:\n" + getQuotes(), bot);
  }
  else if (input.length > 1 && input[1].toLowerCase() == "random") {
    friends.messageUser(source, quotes[Math.floor(Math.random() * quotes.length)], bot);
  }
  exports.save();
}


// Can handle function.
exports.canHandle = function(original) {
  var input = original.toLowerCase().split(" ");
  return input[0] == "quote";
}


exports.onExit = function() {
  exports.save();
}


exports.getHelp = function() {
  return "QUOTES\n" +
  "quote add _____ - Adds a quote to the quote list.\n" +
  "quote list - Lists all quotes\n" +
  "quote random - Gives a random quote\n";
}
