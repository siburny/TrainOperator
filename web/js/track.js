var TRACK_TYPE = Object.freeze({
	STRAIGHT: 1,
	CURVE: 2
});
var INCH_TO_PIXEL = 20;
var TRACK_WIDTH = 1*INCH_TO_PIXEL;

var Track = Class.extend({
    init: function () {
        this.options = {
            x: 0,
            y: 0,
            r: 0
        };

        this.connections = [];
    },
    
    draw: function (paper) {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath(paper);
        /*
        var track = [];
        if(this.type == TRACK_TYPE.STRAIGHT) {
            track = _getStraightTrackPath(this.l*INCH_TO_PIXEL);
        } else if(this.type == TRACK_TYPE.CURVE) {
            track = _getCurveTrackPath(this.r*INCH_TO_PIXEL, 22.5);
        }
    	
        if(this.image == undefined)
            this.image = paper.set();
    
        var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);
        //this.image.push(path.glow({ color: '#FFF', width: 2 }));
        */
    },
    
    getPath: function(paper) {
        var set = paper.set();
        set.push(paper.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(paper.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
    },

    moveTo: function (x, y, r) {
        this.options.x = x;
        this.options.y = y;
        this.image.transform(["t", x, y]);
    },

    connectTo: function (track, number) {
        if (number == undefined)
            number = 0;
            
        console.log(track.getAnchors()[number]);
        return;    
        var anchor1 = track.getAnchors()[number],
            anchor2 = this.getAnchors()[0];

        this.options.x = track.options.x - anchor1.dx + anchor2.dx;
        this.options.y = track.options.y - anchor1.dy + anchor2.dy;
    
        //console.log(anchor);
    }
});

function _getAnchor(r, a1, a2) {
	return [{ dx: r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2/2) * Math.PI / 180),
			 dy: r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2/2) * Math.PI / 180) }];
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
