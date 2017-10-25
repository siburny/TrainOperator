function start() {
	var express = require('express');
	var app = express();

	// global routes
	app.use(express.static("web"));
	app.use(express.static("node_modules"));

	// API
	app.use("/api/LoadLayout", function (req, res) {
		res.json(module.exports.layout);
	});
	app.use("/api/ParseLayout", function (req, res) {
		res.json(module.exports.layout);
	});

	var server = app.listen(3000, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Starting app on http://%s:%s', host, port);
	});
}

module.exports.start = start;