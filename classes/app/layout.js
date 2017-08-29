var //fs = require('fs'),
	//xml2js = require('xml2js'),
	server = require("../server"),
	Track = require("./track/track"),
	StraightTrack = require('./track/straightTrack'),
	Class = require("class.extend"),
	extend = require("extend"),
	json = require("json-serialize");

var Layout = Class.extend('Layout', {
	init: function () {
		this._loaded = false;
		this.track = [];
	},

	LoadLayout: function () {
		var self = this;
		server.db.findOne({ "type": "track" }, function (err, docs) {
			if (docs == null) {
				console.log("Loading demo tracks ...");
				self.LoadDemoTrack();
				self._loaded = true;
			}
		});
	},

	LoadDemoTrack: function () {
		var t1 = new StraightTrack(this.p, { x: 100, y: 100, r: 30, l: 10 });
		t2 = new StraightTrack(this.p, { l: 10 }),
			t3 = new StraightTrack(this.p, { l: 5 });

		t2.connectTo(t1, 0, 1);
		t3.connectTo(t1, 0, 0);
		this.AddTrack(t1);
		this.AddTrack(t2);
		this.AddTrack(t3);
	},

	AddTrack: function (track) {
		if (!(track instanceof Track))
			throw new Error("Invalid track class.");

		this.track.push(track);
	},

	Parse: function (text) {
	}
});

module.exports = Layout;

var loop = [],
	track = {};

function findSegmentByEndpoint(id) {
	for (var part in track.layout.parts.part) {
		for (var end in track.layout.parts.part[part].endpointNrs.endpointNr) {
			if (track.layout.parts.part[part].endpointNrs.endpointNr[end] == id)
				return part;
		};
	}
	return null;
}

function findLoopRecursive(input) {
	if (loop.length > 3) {
		if (loop[loop.length - 1].connections.indexOf(loop[0].id) > -1) {
			console.log("found loop", loop);
		}
	}
	if (input.length == 0)
		return;
	for (var j = 0; j < loop[loop.length - 1].connections.length; j++) {
		for (var i = 0; i < input.length; i++) {
			//console.log("testing", loop[loop.length - 1].connections[j], input[i].id);
			if (loop[loop.length - 1].connections[j] == input[i].id) {
				loop.push(input.splice(i, 1)[0]);
				findLoopRecursive(input);
				input.splice(i, 0, loop.pop());
			}
		}
		//if (loop[loop.length-1].indexOf(seg.id))
		//	findLoops(input);
	}
}

function findLoops(input) {
	for (var i = 0; i < input.length; i++) {
		var item = input.splice(i, 1)[0];
		loop[0] = item;
		findLoopRecursive(input);
		input.splice(i, 1, item);
	}
}

function findConnectedNode(id) {
	for (var conn in track.layout.connections.connection) {
		if (track.layout.connections.connection[conn].$.endpoint1 == id) {
			return track.layout.connections.connection[conn].$.endpoint2;
		}
		else if (track.layout.connections.connection[conn].$.endpoint2 == id) {
			return track.layout.connections.connection[conn].$.endpoint1;
		}
	}
	return null;
}

function findSegments() {
	track.layout.parts.part.forEach(function (part, index) {
		var segment = { id: index, connections: [] };
		part.endpointNrs.endpointNr.forEach(function (end) {
			var connectedNode = findConnectedNode(end);
			if (!!connectedNode) {
				var conn = findSegmentByEndpoint(connectedNode);
				if (!!conn) {
					segment.connections.push(+conn);
				}
				else
					throw new Error("Can't find part");
			}
		});
		segments.push(segment);
	});
	findLoops(segments);
}
