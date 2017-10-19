var Track = require("./track"),
	extend = require("extend");

var CurvesToCircle = Object.freeze({
	36: 12,
	54: 16,
	72: 16,
});

var SwitchTrack = Track.extend('SwitchTrack', {
	init: function (options) {
		this._super(options);

		this.options.d = 36;
		this.options.l = 10;
		this.options.type = SwitchTrack.SWITCH_TYPE.LEFT;
		this.type = Track.TRACK_TYPE.SWITCH;

		if (options != undefined) {
			extend(this.options, options)
		}
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
				dx: 0,
				dy: -this.options.l * Track.INCH_TO_PIXEL / 2,
				r: 180
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

	toJSON: function () {
		return {
			_type: "SwitchTrack",
			id: this.id,
			options: this.options
		}
	}
});

SwitchTrack.fromJSON = function (json) {
	if (json._type != "SwitchTrack")
		return null;
	return new SwitchTrack(json.options);
}

SwitchTrack.SWITCH_TYPE = Object.freeze({
	LEFT: 0,
	RIGHT: 1
});

module.exports = SwitchTrack;

