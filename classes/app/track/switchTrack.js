var Track = require("./track"),
	extend = require("extend");

class SwitchTrack extends Track {
	constructor(options) {
		super(options);

		this.options.d = 36;
		this.options.l = 10;
		this.options.type = SwitchTrack.SWITCH_TYPE.LEFT;
		this.type = Track.TRACK_TYPE.SWITCH;

		if (options != undefined) {
			extend(this.options, options)
		}
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


	getEndpoints(notransform) {
		var a = 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d];

		var endpoints = [
			{
				r: 0, dx: 0, dy: this.options.l * Track.INCH_TO_PIXEL / 2
			},
			{
				r: 180, dx: 0, dy: -this.options.l * Track.INCH_TO_PIXEL / 2
			},
			{
				dx: (this.options.type == SwitchTrack.SWITCH_TYPE.RIGHT ? 1 : -1) * (Track.INCH_TO_PIXEL * this.options.d / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2),
				dy: Track.INCH_TO_PIXEL * this.options.l / 2 - Track.INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2,
				r: this.options.type == SwitchTrack.SWITCH_TYPE.RIGHT ? 180 - 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d] : 180 + 360 / SwitchTrack.CURVES_TO_CIRCLE[this.options.d]
			}
		];

		if (!!notransform)
			return endpoints;

		return super.getEndpoints(endpoints);
	}

	toJSON() {
		return {
			_type: "SwitchTrack",
			id: this.id,
			options: this.options
		}
	}
}

SwitchTrack.fromJSON = function (json) {
	if (json._type != "SwitchTrack")
		return null;
	return new SwitchTrack(json.options);
}

module.exports = SwitchTrack;

