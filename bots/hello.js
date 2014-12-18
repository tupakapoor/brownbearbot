var FeedParser = require('feedparser');
var http = require('http');

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
								reply({
									'text': item.title + ' ' + item.link
								}).code(status);
								return;
						}
				})
			});
  }
};
