var Class = require("Class.extend"),
    Track = require("./track"),
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

    toJSON: function () {
        return {
            _type: "StraightTrack",
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
