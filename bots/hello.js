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
				var response = {'text': current + ' ' + weather.minutely.summary + ' ' + weather.hourly.summary + ' ' + weather.daily.summary, 'username': 'bluebirdweather', 'icon_url': 'http://brownbearnews.herokuapp.com/bluebird2.png'};
				console.log(response);
				sendPost(hookUrl, response);
				reply(JSON.stringify(response)).code(status);
			});
		}
		else {
			var feed = requestedFeed == 'deal' ? 'http://feeds.feedburner.com/SlickdealsnetForums-9' : 'http://feeds.feedburner.com/TechCrunchIT';
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
										var data = {'text': '<'+item.link+'|'+item.title+'>', 'unfurl_links': true};
										if (requestedFeed == 'deal') {
											data.username = 'brownbeardeals';
											data.icon_url = 'http://brownbearnews.herokuapp.com/beardeal.jpg';
										}
										sendPost(hookUrl, data);
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
