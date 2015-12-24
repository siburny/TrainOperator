var express = require('express');
var app = express();

// global routes
app.use(express.static("web"));

// API
app.use("/api/LoadLayout", function(req, res) {
    res.json(layout);
});

function server() {
}

server.prototype.start = function () {
	var server = app.listen(3000, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Starting app on http://%s:%s', host, port);
	});
}

module.exports.server = server;