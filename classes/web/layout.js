var Track = require("./track/track"),
  StraightTrack = require("./track/straightTrack"),
  CurveTrack = require("./track/curveTrack"),
  SwitchTrack = require("./track/switchTrack"),
  Class = require("class.extend"),
  extend = require("extend"),
  json = require("json-serialize");

var Layout = Class.extend('Layout', {
  init: function (paper) {
    this._loaded = false;
    this.p = paper;
  },

  ShowGrid: function () {
    var path = [];

    var start = -1000,
      end = 2000;

    for (var i = start; i < end; i += 50) {
      path.push(["M", start, i]);
      path.push(["L", end, i]);
    }
    for (var i = start; i < end; i += 50) {
      path.push(["M", i, start]);
      path.push(["L", i, end]);
    }
    this.p.path(path).attr({ "stroke": "#CCC", "stroke-width": 0.2 });
    this.p.path(["M", 0, start, "L", 0, end, "M", start, 0, "L", end, 0]).attr({ "stroke": "#CCC", "stroke-width": 1 });
  },

  LoadLayout: function (callback) {
    var self = this;
    $.get("/api/LoadLayout", function (data) {
      var layout = json.deserialize(data);
      layout.track.forEach(function (item) {
        item.setPaper(self.p);
      });
      extend(self, layout);

      if (!!callback) {
        callback();
      }
    });
  },

  Draw: function () {
    if (!!this.options.ShowGrid) {
      this.ShowGrid();
    }

    //this.image.push(path.glow({ color: '#FFF', width: 2 }));
    for (var i = 0; i < this.track.length; i++) {
      this.track[i].draw();
    }
  },

  GetBBox: function () {
    var xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
    for (var i = 0; i < this.track.length; i++) {
      var box = this.track[i].image.getBBox();
      xmin = Math.min(box.x, xmin);
      ymin = Math.min(box.y, ymin);
      xmax = Math.max(box.x2, xmax);
      ymax = Math.max(box.y2, ymax);
    }

    return { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax };
  }
});

module.exports = Layout;

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
    if (loop[loop.length - 1].connections.indexOf(loop[0].id) > -1) {
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
