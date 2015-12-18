var express = require('express');
var app = express();

// global routes
app.use(express.static("web"));

//
app.use("/api/getLayout", function(req, res) {
	res.json([{x:100,y:100}]);
	//res.end();
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

exports.server = server;