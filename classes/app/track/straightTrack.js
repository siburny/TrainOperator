var Track = require("./track"),
    extend = require("extend");

var StraightTrack = Track.extend('StraightTrack', {
    init: function (options) {
        this._super(options);

        //default
        this.options.l = 1;

        if (options != undefined) {
            extend(this.options, options)
        }

        this.type = Track.TRACK_TYPE.STRAIGHT;
    },

    getEndpoints: function (notransform) {
        var endpoints = [
            { r: 0, dx: 0, dy: this.options.l * Track.INCH_TO_PIXEL / 2 },
            { r: 180, dx: 0, dy: -this.options.l * Track.INCH_TO_PIXEL / 2 }
        ];

		if (!!notransform)
			return endpoints;

		return this._super(endpoints);
    },

    toJSON: function () {
        return {
            _type: "StraightTrack",
            id: this.id,
            options: this.options
        }
    }
}, 'StraightTrack');

StraightTrack.fromJSON = function (json) {
    if (json._type != "StraightTrack")
        return null;
    return new StraightTrack(json.options);
}

module.exports = StraightTrack;
