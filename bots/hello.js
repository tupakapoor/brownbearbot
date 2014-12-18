var FeedParser = require('feedparser');
var http = require('http');
var url = require('url');
var querystring = require('querystring');

module.exports = {
  path:    '/echo',
  handler: function(request, reply) {

    // Slack Payload Cheatsheet
    // {
    //   token:        "9itBZe5CqNXUsqh3RXACsfqb"
    //   team_id:      "T0001"
    //   channel_id:   "C2147483705"
    //   channel_name: "test"
    //   timestamp:    "1355517523.000005"
    //   user_id:      "U2147483697"
    //   user_name:    "Steve"
    //   text:         "googlebot: What is the air-speed velocity of an unladen swallow?"
    // }
    // Non-200 responses will be retried a reasonable number of times.
		var status = 200;
		var hookUrl = request.query.url;

		// If you would like to change the name on a per-response basis,
		// simply include a `username` property in your response.
		http.get('http://feeds.feedburner.com/TechCrunch/', function(res) {
			res.pipe(new FeedParser({}))
				.on('error', function(error){
						reply({
							'text':     '',
						}).code(500);
				})
				.on('meta', function(meta){
						// Store the metadata for later use
						feedMeta = meta;
				})
				.on('readable', function(){
						var stream = this, item;
						while (item = stream.read()){
								// Each 'readable' event will contain 1 article
								// Add the article to the list of episodes
								sendPost(hookUrl, {'text': '<' + item.link + '|' + item.title + '>'});
								reply('').code(status);
								return;
						}
				})
			});
  }
};

function sendPost(link, data) {
	var post_options = url.parse(link);
	var post_data = querystring.stringify(data);
	post_options.port = 443;
	post_options.method = 'POST';
	post_options.headers =  {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': post_data.length
      		};

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();
}
