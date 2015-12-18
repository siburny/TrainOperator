
StraightTrack.prototype = new Track();

StraightTrack.prototype.constructor = StraightTrack;

function StraightTrack(options) {
	this.options.l = 1;

	if (options != undefined) {
		$.extend(this.options, options)
	}

	this.type = TRACK_TYPE.STRAIGHT;
}

StraightTrack.prototype.draw = function (paper) {
	if (this.image != undefined)
		this.image.remove();
	this.image = paper.set();

	var track = this._getStraightTrackPath(this.options.l * INCH_TO_PIXEL);

	var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888'});
	this.image.push(path);
	this.moveTo();
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
		
	console.log(path);
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
