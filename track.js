

function Track(id)
{
	this.id = id;
	this.connections = [];
}

Track.prototype.AddConnection = function(id) {
	this.connections.push(id);
}

exports = Track;