function StraightTrack(options) {
    Track.call(this, options);
    
	this.options.l = 1;

	if (options != undefined) {
		$.extend(this.options, options)
	}

	this.type = TRACK_TYPE.STRAIGHT;
}

StraightTrack.prototype = new Track();

StraightTrack.prototype.constructor = StraightTrack;

StraightTrack.prototype.draw = function (paper) {
	if (this.image != undefined)
		this.image.remove();
	this.image = paper.set();

	var track = this._getStraightTrackPath(this.options.l * INCH_TO_PIXEL);

	var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888'});
	this.image.push(path);
	this.moveTo();
}

StraightTrack.prototype.getAnchors = function() {
    return [
        { dx: 0, dy: -this.options.l*INCH_TO_PIXEL/2 },
        { dx: 0, dy: this.options.l*INCH_TO_PIXEL/2 }
    ];
            var m = track.image[0].matrix.clone();
        
        console.log(m.x(0, -100), m.y(0, -100));

}

StraightTrack.prototype._getStraightTrackPath = function (l) {
	var path = [];
	if(true)
		path.push(["M", -TRACK_WIDTH / 2, l / 2]);
	path.push(["l", 0, -l]);
	if(true)
		path.push(["l", TRACK_WIDTH, 0]);
	path.push(["l", 0, l]);
	if(true)
		path.push(["l", -TRACK_WIDTH, 0]);
	if(true)
		path.push("z");

	return path;
}

StraightTrack.prototype.moveTo = function (x, y, r) {
	if (x != undefined && y != undefined && r != undefined) {
		this.options.x = x;
		this.options.y = y;
		this.options.r = r;
	}

	this.image.transform(["t", this.options.x, this.options.y, "r", this.options.r]);
}
