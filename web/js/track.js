var TRACK_TYPE = Object.freeze({
	STRAIGHT: 1,
	CURVE: 2
});
var INCH_TO_PIXEL = 20;
var TRACK_WIDTH = 1*INCH_TO_PIXEL;

function Track(type, options) {
	if (type in TRACK_TYPE) {
		throw new Error("Invalid track type.");
	}
	
	var defaults = {
		x: 0,
		y: 0,
		l: 1,
		r: 1
	};

	if(options != undefined) {
		$.extend(defaults, options)
	}
	
	this.type = type;
	this.x = defaults.x;
	this.y = defaults.y;
	this.l = defaults.l;
	this.r = defaults.r;
	this.a = defaults.a;
	this.a = defaults.a
	
	this.image = paper.set();
	this.connections = [];
}

Track.prototype.draw = function (paper) {
	var track = [];
	if(this.type == TRACK_TYPE.STRAIGHT) {
		track = _getStraightTrackPath(this.l*INCH_TO_PIXEL);
	} else if(this.type == TRACK_TYPE.CURVE) {
		track = _getCurveTrackPath(this.r*INCH_TO_PIXEL, 22.5);
	}
	
	var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888' });
	this.image.push(path);
	this.image.push(path.glow({ color: '#FFF', width: 2 }));
	
}

Track.prototype.moveTo = function(x, y) {
	this.x = x;
	this.y = y;
	this.image.transform(["t",x,y]);
}

Track.prototype.getAnchor = function() {
	if(this.type == TRACK_TYPE.STRAIGHT) {
		return [
			{ dx: 0, dy: this.l/2 },
			{ dx: 0, dy: this.l/2 }
		];
	}
	var a1 = -this.a/2,
		a2 = this.a;
	return { dx: r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2/2) * Math.PI / 180),
			 dy: r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2/2) * Math.PI / 180) };
}



function _getStraightTrackPath(l) {
	return ["M",-TRACK_WIDTH/2,l/2,"l", 0, -l, "l", TRACK_WIDTH, 0, "l", 0, l, "l", -TRACK_WIDTH, 0];
}

function _arcPath(r, a1, a2) {
	var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
		dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);

		
	return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
}

function _getCurveTrackPath(r, a) {
	var anchor = _getAnchor(r, 0, a);
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
