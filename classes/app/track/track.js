var Class = require("Class.extend");
var Matrix = require('../matrix');

var Track = Class.extend('Track', {
    init: function (options) {
        this.options = {
            x: 0,
            y: 0,
            r: 0,
			connections: {}
        };

        if('id' in options) {
            this.id = options.id;
            delete options.id;
        }
    },

    moveTo: function (x, y, r) {
        /*this.options.x = x;
        this.options.y = y;
        this.image.transform(["t", x, y]);*/

        if (x != undefined && y != undefined && r != undefined) {
            this.options.x = x;
            this.options.y = y;
            this.options.r = r;
        }

        //this.image.transform(["t", this.options.x, this.options.y, "r", this.options.r, this.options.x, this.options.y]);
        this.image.translate(this.options.x, this.options.y);
        this.image.rotate(this.options.r, 0, 0);
    },

    connectTo: function (track, number1, number2) {
        var thisEndpoints = this.getEndpoints(),
            trackEndpoints = track.getEndpoints();

        if (number1 == undefined) {
            for (var i = 0; i < thisEndpoints.length; i++) {
                if (this.options.connections[i] == undefined) {
                    number1 = i;
                    break;
                }
            }
            if (number1 == undefined)
                return;
        }
        if (number2 == undefined) {
            for (var i = 0; i < trackEndpoints.length; i++) {
                if (track.options.connections[i] == undefined) {
                    number2 = i;
                    break;
                }
            }
            if (number2 == undefined)
                return;
        }

        var anchor1 = thisEndpoints[number1];
        var anchor2 = trackEndpoints[number2];

        this.options.r = track.options.r;
        if (anchor1.r + anchor2.r != 180) {
            this.options.r += 180 + anchor1.r + anchor2.r;
        }
        this.options.r %= 360;
        anchor1 = this.getEndpoints()[number1];

        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;

        this.options.connections[number1] = track.id;
        track.options.connections[number2] = this.id;

        this.endpoints = this.getEndpoints();
    },

    getEndpoints: function (endpoints) {
        var m = new Matrix();
        m.rotate(this.options.r, 0, 0);

        var e = [];
        for (var i = 0; i < endpoints.length; i++) {
            var t = endpoints[i],
                x = t.dx,
                y = t.dy;
            t.dx = m.x(x, y);
            t.dy = m.y(x, y);
            e.push(t);
        }

        return e;
    }
});

function getEndpoints(r, a1, a2) {
    return [{
        dx: r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2 / 2) * Math.PI / 180),
        dy: r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2 / 2) * Math.PI / 180)
    }];
}

function _arcPath(r, a1, a2) {
    var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
        dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);


    return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
}

function _getCurveTrackPath(r, a) {
    var anchor = getEndpoints(r, 0, a);
    var path = ["M", -anchor.dx, -anchor.dy];

    var arc1 = _arcPath(r, 0, a),
        arc_t = _arcPath(r - 20, 0, a),
        arc2 = _arcPath(r - 20, a, -a);

    path.push(arc1);
    path.push(["l", 20 + arc_t[arc_t.length - 2] - arc1[arc1.length - 2], arc_t[arc_t.length - 1] - arc1[arc1.length - 1]]);
    path.push(arc2);
    path.push(["l", -20, 0]);

    return path;
}

// Global constants
Track.TRACK_TYPE = Object.freeze({
    STRAIGHT: 1,
    CURVE: 2
});
Track.INCH_TO_PIXEL = 20;
Track.TRACK_WIDTH = 1 * Track.INCH_TO_PIXEL;

module.exports = Track;
