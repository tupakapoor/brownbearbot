var FeedParser = require('feedparser');
var http = require('http');
var request = require('request');
var url = require('url');
var querystring = require('querystring');
var Forecast = require('forecast');

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
		var requestedFeed = request.payload.text;
		var rand = Math.floor((Math.random() * 10)) + 1;
		var counter = 0;
		if (requestedFeed == 'weather') {
			var forecast = new Forecast({
				service: 'forecast.io',
				key: '917893bf12931445f98a7fae15e60a7d',
				units: 'f', // Only the first letter is parsed
				cache: true,      // Cache API requests?
				ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
					minutes: 10,
					seconds: 0
					}
			});
			forecast.get([40.433708, -79.940594], function(err, weather) {
				if(err) reply({'text':''}).code(500);
				var current = 'The current temp is ' + weather.currently.temperature + ' but feels like ' + weather.currently.apparentTemperature + '.';
				var response = {'text': current + ' ' + weather.minutely.summary + ' ' + weather.hourly.summary + ' ' + weather.daily.summary};
				console.log(response);
				reply(JSON.stringify(response)).code(status);
			});
		}
		else {
			var feed = requestedFeed == 'deal' ? 'http://feeds.feedburner.com/SlickdealsnetForums-9' : 'http://feeds.feedburner.com/TechCrunchIT';

			// If you would like to change the name on a per-response basis,
			// simply include a `username` property in your response.
			http.get(feed, function(res) {
				res.pipe(new FeedParser({}))
					.on('error', function(error){
							reply({
								'text':     '',
							}).code(500);
					})
					.on('readable', function(){
							var stream = this, item;
							while (item = stream.read()){
									// Each 'readable' event will contain 1 article
									// Add the article to the list of episodes
									counter++;
									if (counter == rand) {
										sendPost(hookUrl, {'text': '<'+item.link+'|'+item.title+'>', 'unfurl_links': true});
										reply(JSON.stringify({'text': item.link})).code(status);
										return;
									}
							}
					})
				});
			}
  }
};

function sendPost(link, data) {
	// var post_options = url.parse(link);
// 	var post_data = querystring.stringify(data);
// 	post_options.port = 443;
// 	post_options.method = 'POST';
// 	post_options.headers =  {
// 						'Content-Type': 'application/x-www-form-urlencoded',
// 						'Content-Length': post_data.length
//       		};
//
//   // Set up the request
//   var post_req = request(post_options, null);
//
//   // post the data
//   post_req.write(post_data);
//   post_req.end();

  request.post({
                url:   link,
                body:    JSON.stringify(data)
            }, function (error, response, body) {
            console.log(data);
            console.log(error);
            console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
          console.log(body) // Print the google web page.
        }
        return;
     }
  );
}
