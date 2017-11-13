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

		if (this.options.d == 72) {
			this.options.l = 14.5;
		}

		this.type = Track.TRACK_TYPE.Switch;
	}


	static get SWITCH_TYPE() {
		return {
			LEFT: 0,
			RIGHT: 1
		}
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

		if (0 /*|| !!layout.options.ShowEndpoints*/) {
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
			a = 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d],
			angleM = this.options.type == SwitchTrack.SWITCH_TYPE.LEFT ? 1 : -1;

		var path = ["M", angleM * Track.TRACK_WIDTH * Track.INCH_TO_PIXEL / 2, this.options.l * Track.INCH_TO_PIXEL / 2];
		var arc_t = this.arcPath((this.options.d - Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL / 2, angleM == -1 ? 0 : 180, -angleM * a);
		var arc_t2 = this.arcPath((this.options.d + Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL / 2, angleM == -1 ? 0 : 180, -angleM * a);

		path.push(["l", 0, -this.options.l * Track.INCH_TO_PIXEL]);

		path.push([full || this.options.connections[1] == undefined ? "l" : "m", -angleM * Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, 0]);

		path.push(["l", 0, this.options.l * Track.INCH_TO_PIXEL - (this.options.d + Track.TRACK_WIDTH / 2) * Track.INCH_TO_PIXEL * Math.sin(this.SWITCH_ANGLE * Math.PI / 180) / 2]);

		path.push(this.arcPath(this.options.d * Track.INCH_TO_PIXEL / 2 + Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, (angleM == -1 ? 0 : 1) * 180 - angleM * this.SWITCH_ANGLE, -angleM * (a - this.SWITCH_ANGLE)));

		path.push([full || this.options.connections[2] == undefined ? "l" : "m", arc_t[arc_t.length - 2] - arc_t2[arc_t2.length - 2] - angleM * Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, arc_t[arc_t.length - 1] - arc_t2[arc_t2.length - 1]]);

		path.push(this.arcPath((this.options.d - Track.TRACK_WIDTH) * Track.INCH_TO_PIXEL / 2, angleM == -1 ? a : 180 - a, angleM * a));

		if (full || this.options.connections[0] == undefined) {
			path.push(["l", angleM * Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, 0]);
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
				r: 0,
				dx: 0,
				dy: this.options.l * Track.INCH_TO_PIXEL / 2
			},
			{
				r: 180,
				dx: 0,
				dy: +this.options.l * Track.INCH_TO_PIXEL / 2
			},
			{
				dx: (this.options.type == SwitchTrack.SWITCH_TYPE.RIGHT ? 1 : -1) * (Track.INCH_TO_PIXEL * this.options.d / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2),
				dy: Track.INCH_TO_PIXEL * this.options.l / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2,
				r: this.options.type == SwitchTrack.SWITCH_TYPE.RIGHT ? 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d] : - 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d]
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