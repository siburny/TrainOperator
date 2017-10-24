var //fs = require('fs'),
	//xml2js = require('xml2js'),
	server = require("../server"),
	Track = require("./track/track"),
	StraightTrack = require('./track/straightTrack'),
	CurveTrack = require('./track/curveTrack'),
	SwitchTrack = require('./track/switchTrack'),
	Class = require("class.extend"),
	extend = require("extend");

class Layout {
	constructor() {
		this._loaded = false;
		this.track = [];
		this.options = {};
		this.LoadLayout();
	}

	LoadLayout() {
		var self = this;
		server.db.findOne({ "type": "track" }, function (err, docs) {
			if (docs == null) {
				console.log("Loading demo tracks ...");
				self.LoadDemoTrack();
				self._loaded = true;

				//TODO: add save
				//server.db.insert(self.track);
			}
		});
		server.db.findOne({ "type": "options" }, function (err, docs) {
			var defauts = {
				ShowGrid: true,
				ShowDynamicGrid: true,
				ShowEndpoints: true
			};

			if (docs == null) {
				extend(self.options, defauts);
			}
		});
	}

	LoadDemoTrack() {
		var id = 1;

		/*t_p = t1;
		for (var i = 0; i < 8; i++) {
			var t = new CurveTrack({ id: id++, d: 54 });
			t.connectTo(t_p, 0, 1);
			this.AddTrack(t);
			t_p = t;
		}

		for (var i = 0; i < 4; i++) {
			var t = new StraightTrack({ id: id++, l: 10 });
			t.connectTo(t_p, 0, 1);
			this.AddTrack(t);
			t_p = t;
		}

		for (var i = 0; i < 8; i++) {
			var t = new CurveTrack({ id: id++, d: 54 });
			t.connectTo(t_p, 0, 1);
			this.AddTrack(t);
			t_p = t;
		}*/

		var s_o;
		var s = new SwitchTrack({ id: id++, d: 36, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s_o = s;

		var s = new SwitchTrack({ id: id++, d: 36, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s.connectTo(s_o, 2, 0);

		var s = new SwitchTrack({ id: id++, d: 36, x: 200, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s_o = s;

		var s = new SwitchTrack({ id: id++, d: 36, x: 200, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s.connectTo(s_o, 2, 1);

		var s = new SwitchTrack({ id: id++, d: 36, x: 400, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s_o = s;

		var s = new SwitchTrack({ id: id++, d: 36, x: 300, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		s.connectTo(s_o, 2, 2);
		
		
		return;
		var s = new SwitchTrack({ id: id++, d: 54, x: 200, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);
		//s.connectTo(s_o, 0, 1);
		
		var s = new SwitchTrack({ id: id++, d: 54, x: 300, type: SwitchTrack.SWITCH_TYPE.RIGHT });
		this.AddTrack(s);
		//s.connectTo(s_o, 1);
		
		var s = new SwitchTrack({ id: id++, d: 72, x: 400, type: SwitchTrack.SWITCH_TYPE.LEFT });
		this.AddTrack(s);

		var s = new SwitchTrack({ id: id++, d: 72, x: 500, type: SwitchTrack.SWITCH_TYPE.RIGHT });
		this.AddTrack(s);

		return;
		var t1 = new StraightTrack({ id: id++, x: 100, y: 100, l: 10 });
		t1.connectTo(s);
		this.AddTrack(t1);

		t1 = new StraightTrack({ id: id++, x: 100, y: 100, l: 10 });
		t1.connectTo(s);
		this.AddTrack(t1);

		var t_p = new StraightTrack({ id: id++, x: 100, y: 100, l: 10 });
		t_p.connectTo(s);
		this.AddTrack(t_p);
	}

	AddTrack(track) {
		if (!(track instanceof Track))
			throw new Error("Invalid track class.");

		this.track.push(track);
	}

	Parse(text) {
	}
}

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
