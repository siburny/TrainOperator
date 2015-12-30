/* global CurveTrack */
/* global db */
/* global StraightTrack */
require("./track/straightTrack");
require("./track/curveTrack");

var //fs = require('fs'),
    //xml2js = require('xml2js'),
    Track = require("./track/track"),
    Class = require("class.extend"),
    extend = require("extend"),
	json = require("json-serialize");

var Layout = Class.extend('Layout', {
    init: function (paper) {
        this._loaded = false;
        this.track = [];
		this.options = {};
        if (paper == undefined)
            this.LoadLayout();
        else
            this.p = paper;
    },

    LoadLayout: function () {
        var self = this;
        db.findOne({ "type": "track" }, function (err, docs) {
            if (docs == null) {
                console.log("Loading demo tracks ...");
                self.LoadDemoTrack();
                self._loaded = true;
            }
        });
		db.findOne({ "type": "options" }, function (err, docs) {
			var defauts = {
				ShowGrid: true,
				ShowDynamicGrid: false,
				ShowEndpoints: false
			};
			
            if (docs == null) {
				extend(self.options, defauts);
            }
        });
	},

    LoadDemoTrack: function () {
        var t1 = new StraightTrack(this.p, { x: 400, y: 100, r: 30, l: 10 }),
            t2 = new StraightTrack(this.p, { l: 10 });

        t2.connectTo(t1, 0, 1);
        this.AddTrack(t1);
        this.AddTrack(t2);

		var t_old = t2;
		for (var i = 0; i < 11; i++) {
			var t = new CurveTrack(this.p, { d: 36 });
			t.connectTo(t_old);
			this.AddTrack(t);
			t_old = t;
		}
	},

    AddTrack: function (track) {
        if (!(track instanceof Track))
            throw new Error("Invalid track class.");

        this.track.push(track);
		track.id = this.track.indexOf(track); 
    },

    Parse: function (text) {
    },

    /*** CLIENT FUNCTIONS ***/
    ClientShowGrid: function () {
        var path = [];

        var start = -1000,
            end = 2000;

        for (var i = start; i < end; i += 50) {
            path.push(["M", start, i]);
            path.push(["L", end, i]);
        }
        for (var i = start; i < end; i += 50) {
            path.push(["M", i, start]);
            path.push(["L", i, end]);
        }
        this.p.path(path).attr({ "stroke": "#CCC", "stroke-width": 0.2 });
        this.p.path(["M", 0, start, "L", 0, end, "M", start, 0, "L", end, 0]).attr({ "stroke": "#CCC", "stroke-width": 1 });
    },

    ClientLoadLayout: function (ClientLoadLayout) {
        var self = this;
        $.get("/api/LoadLayout", function (data) {

			var layout = json.deserialize(data);
			layout.track.forEach(function (item) {
                item.setPaper(self.p);
            });
            extend(self, layout);

            if (!!ClientLoadLayout)
                ClientLoadLayout();
        });
    },

    ClientDraw: function () {
        //this.image.push(path.glow({ color: '#FFF', width: 2 }));
        for (var i = 0; i < this.track.length; i++) {
			this.track[i].draw();
        }
    },
	
	GetBBox: function () {
		var xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
        for (var i = 0; i < this.track.length; i++) {
			var box = this.track[i].image.getBBox();
			xmin = Math.min(box.x, xmin);
			ymin = Math.min(box.y, ymin);
			xmax = Math.max(box.x2, xmax);
			ymax = Math.max(box.y2, ymax);
        }

		return { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax };
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
