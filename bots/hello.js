var FeedParser = require('feedparser');
var http = require('http');
var request = require('request');
var url = require('url');
var querystring = require('querystring');
var Forecast = require('forecast');
var YouTube = require('youtube-node');

module.exports = {
  path:    '/echo',
  handler: function(request, reply) {
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
		else if (requestedFeed.indexOf('video') == 0) {
			var search = requestedFeed.replace('video', '');
			console.log('search term: ' + search);
			var yt = new YouTube();
			yt.setKey('AIzaSyAqoNM3NWI2yXGK8bbSVPb2F-6Hpaj7Je4');
			yt.search(search, 1, function(resultData) {
				var data = {};
				if (resultData.items && resultData.items[0].id) {
					var item = resultData.items[0];
					data.text = '<https://www.youtube.com/watch?v=' + item.id.videoId+'|'+item.snippet.title+'>';
					data.unfurl_links = true;
					data.username = 'brownbearvideos';
					data.icon_url = 'http://brownbearnews.herokuapp.com/bearvids.jpg';
					sendPost(hookUrl, data);
				}
				reply(JSON.stringify(data), status);
			});
		}
		else if (requestedFeed == 'bot') {
			data = {};
			var seed = Math.floor((Math.random() * 100)) % 5;
			switch (seed) {
				case 0:
					data.text = 'lol';
					break;
				case 1:
					data.text = 'nice';
					break;
				case 2:
					data.text = 'word';
					break;
				case 3:
					data.text = 'predict for me @bonerscopes';
					break;
				case 4:
					data.text = 'when are we :vidaygame:ing';
					break;
				default:
					data.text = ':+1:';
			}
			data.username = 'brownbearbot';
			data.icon_url = 'http://brownbearnews.herokuapp.com/bearbot.jpg';
			sendPost(hookUrl, data);
			reply(JSON.stringify(data), status);
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
										reply(JSON.stringify(data)).code(status);
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
