var fs = require('fs');
var friends = require('./friends.js');
var logger = require('./logger.js');

var quotes = [];
// if we've saved a quotes list, use it
if (fs.existsSync('quoteslist')) {
  quotes = JSON.parse(fs.readFileSync('quoteslist'));
}


exports.save = function() {
  fs.writeFileSync("quotes", JSON.stringify(quotes));
}


function addQuote(quote) {
  quotes.push(quote);
}


function getQuotes() {
  return quotes.join("\n");
}


exports.handleQuotes = function(input, source, bot) {
  input = input.split(" ");
  if (input[1].toLowerCase() == "add") {
    input.splice(0, 2);
    var quote = input.join(" ");
    quotes.push(quote);
    friends.messageUser(source, "Saved quote.", bot);
  }
  else if (input[1].toLowerCase() == "list") {
    friends.messageUser(source, "Here are quotes saved by Jank members:\n" + getQuotes(), bot);
  }
  else if (input[1].toLowerCase() == "random") {
    friends.messageUser(source, quotes[Math.floor(Math.random() * quotes.length)], bot);
  }
  exports.save();
}
