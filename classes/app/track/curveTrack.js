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
	init: function (options) {
        this._super(options);

		this.options.d = 36;
		this.type = Track.TRACK_TYPE.CURVE;

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
			_type: "CurveTrack",
			id: this.id,
            options: this.options
        }
    }
});

CurveTrack.fromJSON = function (json) {
    if (json._type != "CurveTrack")
        return null;
    return new CurveTrack(json.options);
}

module.exports = CurveTrack;