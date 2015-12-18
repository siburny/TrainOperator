function Layout(r) {
	this.r = r;
	this.tracks = [];
}

Layout.prototype.ShowGrid = function() {
	var path = [];

	var start = -1000,
		end = 2000;
	
	for(var i=start;i<end;i+=50)
	{
		path.push(["M",start,i]);
		path.push(["L",end,i]);
	}
	for(var i=start;i<end;i+=50)
	{
		path.push(["M",i,start]);
		path.push(["L",i,end]);
	}
	this.r.path(path).attr({"stroke": "#CCC", "stroke-width": 0.2});
	this.r.path(["M",0,start,"L",0,end,"M",start,0,"L",end,0]).attr({"stroke": "#CCC", "stroke-width": 1});
}

Layout.prototype.AddTrack = function(track, options) {
	if(!(track instanceof Track))
		throw new Error("Invalid track class.");
		
	this.tracks.push(track);
	track.draw(this.r);
}
