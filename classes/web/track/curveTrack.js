/* global layout */
/* global global */
var Track = require("./track"),
	extend = require("extend");

var CurvesToCircle = Object.freeze({
	27: 8,
	36: 12,
	45: 12,
	54: 16,
	63: 16,
	72: 16,
	81: 16,
	90: 16,
	99: 16,
	108: 16
});

var CurveTrack = Track.extend('CurveTrack', {
	init: function (paper, options) {
		if (options == undefined) {
			options = paper;
			paper = undefined;
		}
		this._super(paper);

		this.options.d = 36;
		if (options != undefined) {
			extend(this.options, options)
		}

		this.type = Track.TRACK_TYPE.CURVE;
	},

	draw: function () {
		if (this.image != undefined)
			this.image.clear();
		this.image = this.options.p.group();

		var track = this._getCurveTrackPath();
		var background = this._getCurveTrackPath(true);

		this.image.push(this.options.p.path(background).attr({ stroke: 'none', fill: '#888' }));
		this.image.push(this.options.p.path(track).attr({ stroke: '#CCC' }));

		if (!!layout.options.ShowEndpoints) {
			var endpoints = this.getEndpoints(true);
			for (var i = 0; i < endpoints.length; i++) {
				var arc = this._arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH / 2, endpoints[i].r % 180, - 0.5 * Math.sign(endpoints[i].dy))
				var dx = arc[arc.length - 2],
					dy = arc[arc.length - 1];

				this.image.push(this.options.p.circle(endpoints[i].dx - dx, endpoints[i].dy - dy, 2)
					.attr({ "stroke": "#fff", "fill": "#aaa" }));

				arc = this._arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH / 2, endpoints[i].r % 180, - 2 * Math.sign(endpoints[i].dy))
				dx = arc[arc.length - 2], dy = arc[arc.length - 1];
				this.image.push(this.options.p.text(endpoints[i].dx - dx, endpoints[i].dy - dy, i)
					.transform(["r", -this.options.r])
					.attr({ "fill": "#fff", "font-size": 16 }));
			}
		}

		this.moveTo();
	},

	getEndpoints: function (notransform) {
		var a = 360 / CurvesToCircle[this.options.d] / 2;

		var endpoints = [
			{
				dx: Track.INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.cos((a - a) * Math.PI / 180) / 2,
				dy: Track.INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.sin((a - a) * Math.PI / 180) / 2,
				r: 0
			},
			{
				dx: Track.INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.cos((a + a) * Math.PI / 180) / 2,
				dy: Track.INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.sin((a + a) * Math.PI / 180) / 2,
				r: 180 + 360 / CurvesToCircle[this.options.d]
			}
		];

		if (!!notransform)
			return endpoints;

		return this._super(endpoints);
	},

	_getCurveTrackPath: function (full) {
		if (full === undefined) {
			full = false;
		}

		var anchor = this.getEndpoints(true)[0],
			a = 360 / CurvesToCircle[this.options.d];
		var path = ["M", anchor.dx - Track.TRACK_WIDTH / 2, anchor.dy];

		var arc1 = this._arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH / 2, 0, a),
			arc_t = this._arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 - Track.TRACK_WIDTH / 2, 0, a),
			arc2 = this._arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 - Track.TRACK_WIDTH / 2, a, -a);

		path.push(arc1);
		path.push([full || this.options.connections[1] == undefined ? "l" : "m", Track.TRACK_WIDTH + arc_t[arc_t.length - 2] - arc1[arc1.length - 2], arc_t[arc_t.length - 1] - arc1[arc1.length - 1]]);
		path.push(arc2);
		path.push([full || this.options.connections[0] == undefined ? "l" : "m", -Track.TRACK_WIDTH, 0]);
		if (full || this.options.connections[1] == undefined) {
			path.push(["z"]);
		}

		return path;
	},

	_arcPath: function (r, a1, a2) {
		var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
			dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);

		return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
	},

	toJSON: function () {
		return {
			_type: "CurveTrack",
			options: this.options
		}
	}
});

CurveTrack.fromJSON = function (json) {
	if (json._type != "CurveTrack")
		return null;
	return new CurveTrack(json.options);
}

global.CurveTrack = CurveTrack;