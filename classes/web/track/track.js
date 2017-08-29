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
            p: paper
        };

        this.connections = [];
    },
    
    draw: function () {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath();
        /*
        var track = [];
        if(this.type == TRACK_TYPE.STRAIGHT) {
            track = _getStraightTrackPath(this.l*INCH_TO_PIXEL);
        } else if(this.type == TRACK_TYPE.CURVE) {
            track = _getCurveTrackPath(this.options.p*INCH_TO_PIXEL, 22.5);
        }
    	
        if(this.image == undefined)
            this.image = paper.set();
    
        var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);
        //this.image.push(path.glow({ color: '#FFF', width: 2 }));
        */
    },
    
    getPath: function() {
        var set = this.options.p.set();
        set.push(this.options.p.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(this.options.p.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
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

    getMatrix: function() {
        if(this.image != undefined && this.image[0] != undefined)
            return this.image[0].matrix;
        var m = new Matrix();
        m.translate(this.options.x, this.options.y);
        m.rotate(this.options.r, 0, 0);
        return m;
    },

    connectTo: function (track, number1, number2) {
        if (number1 == undefined)
            number1 = 0;
        if (number2 == undefined)
            number2 = 0;
            
        //this.options.r = track.options.r;
            
        var anchor1 = this.getEndpoints()[number1];
        var anchor2 = track.getEndpoints()[number2];
		
		this.options.r = track.options.r;
		if(anchor1.r + anchor2.r != 180) {
			this.options.r += 180 + anchor1.r - anchor2.r;
		}
		this.options.r %= 360;
		anchor1 = this.getEndpoints()[number1];
		//console.log(anchor1);
		//console.log(anchor2);
        
        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;
    },
    
    getEndpoints: function() {
        return null;
    }
});

function getEndpoints(r, a1, a2) {
	return [{ dx: r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2/2) * Math.PI / 180),
			 dy: r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2/2) * Math.PI / 180) }];
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

module.exports = Track;
