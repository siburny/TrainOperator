function Layout(r) {
	this.r = r;
	this.tracks = [];
}

Layout.prototype.AddTrack = function(track) {
	if(!(track instanceof Track))
		throw new Error("Invalid track class.");
	track.draw(this.r);
	
	this.tracks.push(track);
}
