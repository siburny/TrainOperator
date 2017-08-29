/* global global */
var Class = require("Class.extend"),
    Matrix = require("../matrix");

// Global constants
global.TRACK_TYPE = Object.freeze({
	STRAIGHT: 1,
	CURVE: 2
});
global.INCH_TO_PIXEL = 20;
global.TRACK_WIDTH = 1 * global.INCH_TO_PIXEL;

var Track = Class.extend('Track', {
    init: function (paper) {
        this.options = {
            x: 0,
            y: 0,
            r: 0,
            p: paper,
			connections: {}
        };
    },

    draw: function () {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath();
    },

    getPath: function () {
        var set = this.options.p.set();
        set.push(this.options.p.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(this.options.p.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
    },

    moveTo: function (x, y, r) {
        if (x != undefined && y != undefined && r != undefined) {
            this.options.x = x;
            this.options.y = y;
            this.options.r = r;
        }

		this.image.translate(this.options.x, this.options.y);
        this.image.rotate(this.options.r, 0, 0);
    },

    getMatrix: function () {
        if (this.image != undefined && this.image[0] != undefined)
            return this.image[0].matrix;
        var m = new Matrix();
        m.translate(this.options.x, this.options.y);
        m.rotate(this.options.r, 0, 0);
        return m;
    },

    connectTo: function (track, number1, number2) {
		var thisEndpoints = this.getEndpoints(),
			trackEndpoints = track.getEndpoints();

        if (number1 == undefined) {
            for(var i=0;i<thisEndpoints.length;i++) {
				if(this.options.connections[i] == undefined) {
					number1 = i;
					break;
				}
			}
			if(number1 == undefined)
				return; 
		}
        if (number2 == undefined) {
            for(var i=0;i<trackEndpoints.length;i++) {
				if(track.options.connections[i] == undefined) {
					number2 = i;
					break;
				}
			}
			if(number2 == undefined)
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
		
		this.options.connections[number1] = 1;
		track.options.connections[number2] = 1;
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
	},

    setPaper: function (p) {
        this.options.p = p;
    }
});

function getEndpoints(r, a1, a2) {
}



module.exports = Track;
