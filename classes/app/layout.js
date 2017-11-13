var //fs = require('fs'),
	//xml2js = require('xml2js'),
	server = require("../server"),
	Track = require("./track/track"),
	StraightTrack = require('./track/straightTrack'),
	CurveTrack = require('./track/curveTrack'),
	SwitchTrack = require('./track/switchTrack'),
	Class = require("class.extend"),
	extend = require("extend"),
	utils = require('./utils');

class Layout {
	constructor() {
		this._loaded = false;
		this.tracks = [];
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

		this.tracks.push(track);
	}

	GetTrack(id) {
		for (var j = 0; j < this.tracks.length; j++) {
			if (this.tracks[j].id == id) {
				return this.tracks[j];
			}
		}

		return null;
	}

	ClearLayout() {
		this.tracks = [];
		this._loaded = true;
	}

	GetConnected(start_node) {
		let ret = [start_node];
		let found = true;

		while (found) {
			found = false;
			for (let n = 0; n < ret.length; n++) {
				let node = ret[n];
				for (let e in node.options.connections) {
					let tr = this.GetTrack(node.options.connections[e]);
					if (ret.findIndex(item => item.id == tr.id) == -1) {
						ret.push(tr);
						found = true;
					}
				}
			}
		}

		ret.splice(0, 1)
		return ret;
	}

	Parse(xml, callback) {
		var parseString = require('xml2js').parseString;
		console.log('Parsing started.');
		var self = this;

		parseString(xml, { explicitArray: false }, function (err, data) {
			if (err) {
				console.log('Error parsing XML', err);
			} else {
				let scale = data.layout.$.scaleX / 2.54;
				self.ClearLayout();

				if (data.layout && data.layout.parts && data.layout.parts.part) {
					//Flip tracks
					for (let i = 0; i < data.layout.parts.part.length; i++) {
						let part = data.layout.parts.part[i];
						let id = part.endpointNrs.endpointNr[0];

						for (let j = 0; j < data.layout.endpoints.endpoint.length; j++) {
							let endpoint = data.layout.endpoints.endpoint[j];
							if (endpoint.$.nr == id) {

								let coord = endpoint.$.coord.substring(0, endpoint.$.coord.lastIndexOf(','));
								switch (part.$.type) {
									case "Straight":
										if (coord != part.drawing.line.$.pt1) {
											part.endpointNrs.endpointNr.reverse();
										}
										break;
									case "Curve":
										if (coord != part.drawing.arc.$.pt1) {
											part.endpointNrs.endpointNr.reverse();
										}
										break;
								}
								break;
							}
						}
					}

					let x = 0;
					let t;
					for (var i = 0; i < data.layout.parts.part.length; i++) {
						var part = data.layout.parts.part[i];
						switch (part.$.type) {
							case "Straight":
								let l = Math.round(utils.Distance(part.drawing.line.$.pt1, part.drawing.line.$.pt2) * scale * 8) / 8;
								t = new StraightTrack({ l: l, id: i, x: x });
								self.AddTrack(t);
								x += 20;
								break;
							case "Curve":
								let d = Math.round(part.drawing.arc.$.radius * scale * 8) / 4;
								t = new CurveTrack({ d: d, id: i, x: x });
								self.AddTrack(t);
								x += 20;
								break;
						}
					}

					// connect parsed tracks
					for (var i = 0; i < self.tracks.length; i++) {
						let track1 = self.tracks[i];
						let part1 = data.layout.parts.part[self.tracks[i].id];

						for (var e = 0; e < part1.endpointNrs.endpointNr.length; e++) {
							let ep1 = part1.endpointNrs.endpointNr[e];
							let ep2;
							let track2;

							for (var conn in data.layout.connections.connection) {
								if (data.layout.connections.connection[conn].$.endpoint1 == ep1) {
									ep2 = data.layout.connections.connection[conn].$.endpoint2;
									break;
								}
								else if (data.layout.connections.connection[conn].$.endpoint2 == ep1) {
									ep2 = data.layout.connections.connection[conn].$.endpoint1;
									break;
								}
							}

							var i2;
							if (ep2) {
								for (var j in data.layout.parts.part) {
									if (data.layout.parts.part[j].endpointNrs.endpointNr.indexOf(ep2) != -1) {
										track2 = self.GetTrack(j);
										if (track2) {
											track1.connectTo(track2, e, data.layout.parts.part[j].endpointNrs.endpointNr.indexOf(ep2));
										} else {
											console.log('Track not found:', j);
										}
										break;
									}
								}
							}
						}
					}

					// lay out connected tracks
					let anchor = true;
					let startX = 0;
					while (anchor) {

						// find unanchored piece and place it down
						anchor = false;
						for (let a = 0; a < self.tracks.length; a++) {
							if (!self.tracks[a].anchored) {
								anchor = self.tracks[a];
								anchor.anchored = true;

								anchor.options.x = startX;
								anchor.options.y = 0;

								startX += 100;
								break;
							}
						}

						if (anchor) {
							let not_anchored = true;
							while (not_anchored) {
								not_anchored = false;

								for (let a = 0; a < self.tracks.length; a++) {
									if (self.tracks[a].anchored) {
										anchor = self.tracks[a];

										for (let e in anchor.options.connections) {
											let tr = self.GetTrack(anchor.options.connections[e]);
											if (!tr.anchored) {
												tr.repositionTo(anchor);
												tr.anchored = true;

												not_anchored = true;
												break;
											}
										}

									}
								}
							}
						}
					}
				}
			}

			console.log('Parsing ended.');
			if (callback) {
				callback(data);
			}
		});
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
