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
      layout.tracks.forEach(function (item) {
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
    for (var i = 0; i < this.tracks.length; i++) {
      this.tracks[i].draw();
    }
  },

  GetBBox: function () {
    var xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
    for (var i = 0; i < this.tracks.length; i++) {
      var box = this.tracks[i].image.getBBox();
      xmin = Math.min(box.x, xmin);
      ymin = Math.min(box.y, ymin);
      xmax = Math.max(box.x2, xmax);
      ymax = Math.max(box.y2, ymax);
    }

    return { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax };
  }
});

module.exports = Layout;
