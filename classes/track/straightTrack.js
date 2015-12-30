/* global layout */
/* global INCH_TO_PIXEL */
/* global TRACK_TYPE */
/* global TRACK_WIDTH */
/* global global */
var Class = require("Class.extend"),
    Track = require("./track"),
    extend = require("extend");

var StraightTrack = Track.extend('StraightTrack', {
    init: function (paper, options) {
        if (options == undefined) {
            options = paper;
            paper = undefined;
        }
        this._super(paper);

        this.options.l = 1;

        if (options != undefined) {
            extend(this.options, options)
        }

        this.type = TRACK_TYPE.STRAIGHT;
    },

    draw: function () {
        if (this.image != undefined)
            this.image.clear();
        this.image = this.options.p.group();

        var track = this._getStraightTrackPath(this.options.l * INCH_TO_PIXEL);

        var path = this.options.p.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);

		if (!!layout.options.ShowEndpoints) {
			var endpoints = this.getEndpoints(true);
			for (var i = 0; i < endpoints.length; i++) {
				this.image.push(this.options.p.circle(endpoints[i].dx, endpoints[i].dy - 6 * Math.sign(endpoints[i].dy) / 2, 2)
					.attr({ "stroke": "#fff", "fill": "#aaa" }));
				this.image.push(this.options.p.text(endpoints[i].dx, endpoints[i].dy - 25 * Math.sign(endpoints[i].dy) / 2, i)
					.transform(["r", -this.options.r])
					.attr({ "fill": "#fff", "font-size": 16 }));
			}
		}

        this.moveTo();
    },

    getEndpoints: function (notransform) {
        var endpoints = [
            { r: 0, dx: 0, dy: this.options.l * INCH_TO_PIXEL / 2 },
            { r: 180, dx: 0, dy: -this.options.l * INCH_TO_PIXEL / 2 }
        ];

		if (!!notransform)
			return endpoints;

		return this._super(endpoints);
    },

    _getStraightTrackPath: function (l) {
        var path = [];
		path.push(["M", -TRACK_WIDTH / 2, l / 2]);
        path.push(["l", 0, -l]);
		path.push([this.options.connections[1] == undefined ? "l" : "l", TRACK_WIDTH, 0]);
        path.push(["l", 0, l]);
		path.push([this.options.connections[0] == undefined ? "l" : "l", -TRACK_WIDTH, 0]);
		if (this.options.connections[0] == undefined)
			path.push(["z"]);

        return path;
    },

    toJSON: function () {
        return {
            _type: "StraightTrack",
            options: this.options
        }
    }
});

StraightTrack.fromJSON = function (json) {
    if (json._type != "StraightTrack")
        return null;
    return new StraightTrack(json.options);
}

global.StraightTrack = StraightTrack;
