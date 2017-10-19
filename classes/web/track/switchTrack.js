var Class = require("class.extend");
var Track = require("./track"),
	extend = require("extend");

class SwitchTrack extends Track {
	constructor(paper, options) {
		if (options == undefined) {
			options = paper;
			paper = undefined;
		}
		super(paper);

		this.options.d = 36;
		this.options.l = 10;
		if (options != undefined) {
			extend(this.options, options)
		}

		this.type = Track.TRACK_TYPE.Switch;
	}


	static get CURVES_TO_CIRCLE() {
		return {
			36: 12,
			54: 16,
			72: 16,
		}
	}


	draw() {
		if (this.image != undefined)
			this.image.clear();
		this.image = this.options.p.group();

		var track = this.getTrackPath();
		var background = this.getTrackPath(true);

		this.image.push(this.options.p.path(background).attr({ stroke: 'none', fill: '#888' }));
		this.image.push(this.options.p.path(track).attr({ stroke: '#CCC' }));

		if (1 /*|| !!layout.options.ShowEndpoints*/) {
			var endpoints = this.getEndpoints(true);
			for (var i = 0; i < endpoints.length; i++) {
				var arc = this.arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH / 2, endpoints[i].r % 180, - 0.5 * Math.sign(endpoints[i].dy))
				var dx = arc[arc.length - 2],
					dy = arc[arc.length - 1];

				this.image.push(this.options.p.circle(endpoints[i].dx - dx, endpoints[i].dy - dy, 2)
					.attr({ "stroke": "#fff", "fill": "#aaa" }));

				arc = this.arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH / 2, endpoints[i].r % 180, - 2 * Math.sign(endpoints[i].dy))
				dx = arc[arc.length - 2], dy = arc[arc.length - 1];
				this.image.push(this.options.p.text(endpoints[i].dx - dx, endpoints[i].dy - dy, i)
					.transform(["r", -this.options.r])
					.attr({ "fill": "#fff", "font-size": 16 }));
			}
		}

		this.moveTo();
	}

	get SWITCH_ANGLE() {
		return Math.acos(2 * (this.options.d / 2 - 1) / this.options.d) * 180 / Math.PI;
	}

	getTrackPath(full) {
		if (full === undefined) {
			full = false;
		}

		var anchor = this.getEndpoints(true)[0],
			a = 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d];
		var path = ["M", -Track.TRACK_WIDTH * Track.INCH_TO_PIXEL / 2, this.options.l * Track.INCH_TO_PIXEL / 2];
		var arc_t = this.arcPath((this.options.d - Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL / 2, 0, a);

		path.push(["l", 0, -this.options.l * Track.INCH_TO_PIXEL]);
		path.push([full || this.options.connections[1] == undefined ? "l" : "m", Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, 0]);
		path.push(["l", 0, this.options.l * Track.INCH_TO_PIXEL - (this.options.d + Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL * Math.sin(this.SWITCH_ANGLE * Math.PI / 180) / 2]);

		path.push(this.arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH * Track.INCH_TO_PIXEL / 2, this.SWITCH_ANGLE, a - this.SWITCH_ANGLE));
		path.push([full || this.options.connections[1] == undefined ? "L" : "M", arc_t[arc_t.length - 2] + Track.TRACK_WIDTH * Track.INCH_TO_PIXEL / 2, arc_t[arc_t.length - 1] + this.options.l * Track.INCH_TO_PIXEL / 2]);

		path.push(this.arcPath((this.options.d - Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL / 2, a, -a));

		if (full || this.options.connections[1] == undefined) {
			path.push(["z"]);
		}

		return path;
	}

	arcPath(r, a1, a2) {
		var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
			dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);
		return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
	}

	straightPath(l) {
		return (["M", +Track.TRACK_WIDTH / 2, Track.INCH_TO_PIXEL * l / 2, "l", 0, -Track.INCH_TO_PIXEL * l]);
	}

	getEndpoints(notransform) {
		var a = 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d];

		var endpoints = [
			{
				dx: 0,
				dy: this.options.l * Track.INCH_TO_PIXEL / 2,
				r: 0
			},
			{
				r: 180, dx: 0, dy: -this.options.l * Track.INCH_TO_PIXEL / 2
			},
			{
				dx: Track.INCH_TO_PIXEL * this.options.d / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2,
				dy: Track.INCH_TO_PIXEL * this.options.l / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2,
				r: 180 + 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d]
			}
		];

		if (!!notransform)
			return endpoints;

		return super.getEndpoints(endpoints);
	}

	toJSON() {
		return {
			_type: "SwitchTrack",
			options: this.options
		}
	}

	static fromJSON(json) {
		if (json._type != "SwitchTrack")
			return null;
		return new SwitchTrack(json.options);
	}
}

global.SwitchTrack = SwitchTrack;