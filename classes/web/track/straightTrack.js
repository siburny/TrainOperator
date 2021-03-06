var Class = require("Class.extend");
var Track = require("./track"),
  extend = require("extend");

class StraightTrack extends Track {
  constructor(paper, options) {
    if (options == undefined) {
      options = paper;
      paper = undefined;
    }
    super(paper);

    this.options.l = 1;

    if (options != undefined) {
      extend(this.options, options)
    }

    this.type = Track.TRACK_TYPE.STRAIGHT;
  }

  draw() {
    if (this.image != undefined)
      this.image.clear();
    this.image = this.options.p.group();
    this.image.node.setAttribute("class", "track");
    this.image.node.setAttribute("id", this.options.id);

    var track = this._getStraightTrackPath(this.options.l * Track.INCH_TO_PIXEL);
    var background = this._getStraightTrackPath(this.options.l * Track.INCH_TO_PIXEL, true);

    this.image.push(this.options.p.path(background).attr({ stroke: 'none' }));
    this.image.push(this.options.p.path(track).attr({ stroke: '#CCC' }));

    if (1 || !!layout.options.ShowEndpoints) {
      var endpoints = this.getEndpoints(true);
      for (var i = 0; i < endpoints.length; i++) {
        this.image.push(this.options.p.circle(endpoints[i].dx, endpoints[i].dy - 6 * Math.sign(endpoints[i].dy) / 2, 2)
          .attr({ "stroke": "#fff", "fill": "#aaa" }));
        this.image.push(this.options.p.text(endpoints[i].dx, endpoints[i].dy - 25 * Math.sign(endpoints[i].dy) / 2, i)
          .transform(["r", -this.options.r])
          .attr({ "fill": "#fff", "font-size": 16 }));
      }
    }

    this.moveTo();
  }

  getEndpoints() {
    var endpoints = [
      { r: 0, dx: 0, dy: this.options.l * Track.INCH_TO_PIXEL / 2 },
      { r: 180, dx: 0, dy: -this.options.l * Track.INCH_TO_PIXEL / 2 }
    ];

    return endpoints;
  }

  _getStraightTrackPath(l, full) {
    if (full === undefined) {
      full = false;
    }

    var path = [];
    path.push(["M", -Track.TRACK_WIDTH * Track.INCH_TO_PIXEL / 2, l / 2]);
    path.push(["l", 0, -l]);
    path.push([full || this.options.connections[1] == undefined ? "l" : "m", Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, 0]);
    path.push(["l", 0, l]);
    path.push([full || this.options.connections[0] == undefined ? "l" : "m", -Track.TRACK_WIDTH * Track.INCH_TO_PIXEL, 0]);
    if (full || this.options.connections[1] == undefined)
      path.push(["z"]);

    return path;
  }

  toJSON() {
    return {
      _type: "StraightTrack",
      options: this.options
    }
  }

  static fromJSON(json) {
    if (json._type != "StraightTrack")
      return null;
    if (!!json.id) {
      json.options.id = json.id;
    }
    return new StraightTrack(json.options);
  }
}

global.StraightTrack = StraightTrack;
