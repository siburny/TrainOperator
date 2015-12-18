var //fs = require('fs'),
    //xml2js = require('xml2js'),
	track = require("./track");

function layout() {
	this.pieces = [];
}

layout.prototype.AddTrack = function(properties) {
	
}

layout.prototype.Parse = function(text)
{
	loadLayout(text);
}





exports = layout;

var loop = [],
	track = {};

function findSegmentByEndpoint(id) {
	for (var part in track.layout.parts.part) {
		for (var end in track.layout.parts.part[part].endpointNrs.endpointNr) {
			if (track.layout.parts.part[part].endpointNrs.endpointNr[end] == id)
				return part;
		};
	}
	return null;
}

function findLoopRecursive(input) {
	if (loop.length > 3) {
		if(loop[loop.length-1].connections.indexOf(loop[0].id) > -1)
		{
			console.log("found loop", loop);
		}
	}
	if (input.length == 0)
		return;
	for (var j = 0; j < loop[loop.length - 1].connections.length; j++) {
		for (var i = 0; i < input.length; i++) {
			//console.log("testing", loop[loop.length - 1].connections[j], input[i].id);
			if (loop[loop.length - 1].connections[j] == input[i].id) {
				loop.push(input.splice(i, 1)[0]);
				findLoopRecursive(input);
				input.splice(i, 0, loop.pop());
			}
		}
		//if (loop[loop.length-1].indexOf(seg.id))
		//	findLoops(input);
	}
}

function findLoops(input) {
	for (var i = 0; i < input.length; i++) {
		var item = input.splice(i, 1)[0];
		loop[0] = item;
		findLoopRecursive(input);
		input.splice(i, 1, item);
	}
}

function findConnectedNode(id) {
	for (var conn in track.layout.connections.connection) {
		if (track.layout.connections.connection[conn].$.endpoint1 == id) {
			return track.layout.connections.connection[conn].$.endpoint2;
		}
		else if (track.layout.connections.connection[conn].$.endpoint2 == id) {
			return track.layout.connections.connection[conn].$.endpoint1;
		}
	}
	return null;
}

function findSegments() {
	track.layout.parts.part.forEach(function (part, index) {
		var segment = { id: index, connections: [] };
		part.endpointNrs.endpointNr.forEach(function (end) {
			var connectedNode = findConnectedNode(end);
			if (!!connectedNode) {
				var conn = findSegmentByEndpoint(connectedNode);
				if (!!conn) {
					segment.connections.push(+conn);
				}
				else
					throw new Error("Can't find part");
			}
		});
		segments.push(segment);
	});
	findLoops(segments);
}
