require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/classes\\track\\track.js":[function(require,module,exports){
(function (global){
/* global global */
var Class = require("Class.extend"),
    Matrix = require("../matrix");

// Global constants
global.TRACK_TYPE = Object.freeze({
	STRAIGHT: 1,
	CURVE: 2
});
global.INCH_TO_PIXEL = 20;
global.TRACK_WIDTH = 1 * global.INCH_TO_PIXEL;

var Track = Class.extend('Track', {
    init: function (paper) {
        this.options = {
            x: 0,
            y: 0,
            r: 0,
            p: paper,
			connections: {}
        };
    },

    draw: function () {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath();
    },

    getPath: function () {
        var set = this.options.p.set();
        set.push(this.options.p.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(this.options.p.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
    },

    moveTo: function (x, y, r) {
        if (x != undefined && y != undefined && r != undefined) {
            this.options.x = x;
            this.options.y = y;
            this.options.r = r;
        }

		this.image.translate(this.options.x, this.options.y);
        this.image.rotate(this.options.r, 0, 0);
    },

    getMatrix: function () {
        if (this.image != undefined && this.image[0] != undefined)
            return this.image[0].matrix;
        var m = new Matrix();
        m.translate(this.options.x, this.options.y);
        m.rotate(this.options.r, 0, 0);
        return m;
    },

    connectTo: function (track, number1, number2) {
		var thisEndpoints = this.getEndpoints(),
			trackEndpoints = track.getEndpoints();

        if (number1 == undefined) {
            for(var i=0;i<thisEndpoints.length;i++) {
				if(this.options.connections[i] == undefined) {
					number1 = i;
					break;
				}
			}
			if(number1 == undefined)
				return; 
		}
        if (number2 == undefined) {
            for(var i=0;i<trackEndpoints.length;i++) {
				if(track.options.connections[i] == undefined) {
					number2 = i;
					break;
				}
			}
			if(number2 == undefined)
				return; 
		}

        var anchor1 = thisEndpoints[number1];
        var anchor2 = trackEndpoints[number2];

		this.options.r = track.options.r;
		if (anchor1.r + anchor2.r != 180) {
			this.options.r += 180 + anchor1.r + anchor2.r;
		}
		this.options.r %= 360;
		anchor1 = this.getEndpoints()[number1];

        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;
		
		this.options.connections[number1] = 1;
		track.options.connections[number2] = 1;
    },

	getEndpoints: function (endpoints) {
        var m = new Matrix();
        m.rotate(this.options.r, 0, 0);

        var e = [];
        for (var i = 0; i < endpoints.length; i++) {
			var t = endpoints[i],
				x = t.dx,
				y = t.dy;
			t.dx = m.x(x, y);
			t.dy = m.y(x, y);
			e.push(t);
        }

        return e;
	},

    setPaper: function (p) {
        this.options.p = p;
    }
});

function getEndpoints(r, a1, a2) {
}



module.exports = Track;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../matrix":1,"Class.extend":4}],1:[function(require,module,exports){
function Matrix() {
    if (arguments.length == 6) {
        this.a = +arguments[0];
        this.b = +arguments[1];
        this.c = +arguments[2];
        this.d = +arguments[3];
        this.e = +arguments[4];
        this.f = +arguments[5];
    } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    }
}
(function (matrixproto) {
    /*\
        * Matrix.add
        [ method ]
        **
        * Adds given matrix to existing one.
        > Parameters
        - a (number)
        - b (number)
        - c (number)
        - d (number)
        - e (number)
        - f (number)
        or
        - matrix (object) @Matrix
    \*/
    matrixproto.add = function (a, b, c, d, e, f) {
        var out = [[], [], []],
            m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
            matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
            x, y, z, res;

        if (a && a instanceof Matrix) {
            matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
        }

        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                res = 0;
                for (z = 0; z < 3; z++) {
                    res += m[x][z] * matrix[z][y];
                }
                out[x][y] = res;
            }
        }
        this.a = out[0][0];
        this.b = out[1][0];
        this.c = out[0][1];
        this.d = out[1][1];
        this.e = out[0][2];
        this.f = out[1][2];
    };
    /*\
        * Matrix.invert
        [ method ]
        **
        * Returns inverted version of the matrix
        = (object) @Matrix
    \*/
    matrixproto.invert = function () {
        var me = this,
            x = me.a * me.d - me.b * me.c;
        return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
    };
    /*\
        * Matrix.clone
        [ method ]
        **
        * Returns copy of the matrix
        = (object) @Matrix
    \*/
    matrixproto.clone = function () {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    /*\
        * Matrix.translate
        [ method ]
        **
        * Translate the matrix
        > Parameters
        - x (number)
        - y (number)
    \*/
    matrixproto.translate = function (x, y) {
        this.add(1, 0, 0, 1, x, y);
    };
    /*\
        * Matrix.scale
        [ method ]
        **
        * Scales the matrix
        > Parameters
        - x (number)
        - y (number) #optional
        - cx (number) #optional
        - cy (number) #optional
    \*/
    matrixproto.scale = function (x, y, cx, cy) {
        y == null && (y = x);
        (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
        this.add(x, 0, 0, y, 0, 0);
        (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
    };
    /*\
        * Matrix.rotate
        [ method ]
        **
        * Rotates the matrix
        > Parameters
        - a (number)
        - x (number)
        - y (number)
    \*/
    matrixproto.rotate = function (a, x, y) {
        a = R.rad(a);
        x = x || 0;
        y = y || 0;
        var cos = +math.cos(a).toFixed(9),
            sin = +math.sin(a).toFixed(9);
        this.add(cos, sin, -sin, cos, x, y);
        this.add(1, 0, 0, 1, -x, -y);
    };
    /*\
        * Matrix.x
        [ method ]
        **
        * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
        > Parameters
        - x (number)
        - y (number)
        = (number) x
    \*/
    matrixproto.x = function (x, y) {
        return x * this.a + y * this.c + this.e;
    };
    /*\
        * Matrix.y
        [ method ]
        **
        * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
        > Parameters
        - x (number)
        - y (number)
        = (number) y
    \*/
    matrixproto.y = function (x, y) {
        return x * this.b + y * this.d + this.f;
    };
    matrixproto.get = function (i) {
        return +this[Str.fromCharCode(97 + i)].toFixed(4);
    };
    matrixproto.toString = function () {
        return R.svg ?
            "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
            [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
    };
    matrixproto.toFilter = function () {
        return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
            ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
            ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
    };
    matrixproto.offset = function () {
        return [this.e.toFixed(4), this.f.toFixed(4)];
    };
    function norm(a) {
        return a[0] * a[0] + a[1] * a[1];
    }
    function normalize(a) {
        var mag = math.sqrt(norm(a));
        a[0] && (a[0] /= mag);
        a[1] && (a[1] /= mag);
    }
    /*\
        * Matrix.split
        [ method ]
        **
        * Splits matrix into primitive transformations
        = (object) in format:
        o dx (number) translation by x
        o dy (number) translation by y
        o scalex (number) scale by x
        o scaley (number) scale by y
        o shear (number) shear
        o rotate (number) rotation in deg
        o isSimple (boolean) could it be represented via simple transformations
    \*/
    matrixproto.split = function () {
        var out = {};
        // translation
        out.dx = this.e;
        out.dy = this.f;

        // scale and shear
        var row = [[this.a, this.c], [this.b, this.d]];
        out.scalex = math.sqrt(norm(row[0]));
        normalize(row[0]);

        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

        out.scaley = math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaley;

        // rotation
        var sin = -row[0][1],
            cos = row[1][1];
        if (cos < 0) {
            out.rotate = R.deg(math.acos(cos));
            if (sin < 0) {
                out.rotate = 360 - out.rotate;
            }
        } else {
            out.rotate = R.deg(math.asin(sin));
        }

        out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
        out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
        out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
        return out;
    };
    /*\
        * Matrix.toTransformString
        [ method ]
        **
        * Return transform string that represents given matrix
        = (string) transform string
    \*/
    matrixproto.toTransformString = function (shorter) {
        var s = shorter || this[split]();
        if (s.isSimple) {
            s.scalex = +s.scalex.toFixed(4);
            s.scaley = +s.scaley.toFixed(4);
            s.rotate = +s.rotate.toFixed(4);
            return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) +
                    (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                    (s.rotate ? "r" + [s.rotate, 0, 0] : E);
        } else {
            return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
        }
    };
})(Matrix.prototype);

var math = Math,
    mmax = math.max,
    mmin = math.min,
    abs = math.abs,
    pow = math.pow,
    PI = math.PI;

function R() {
}
/*\
    * Raphael.rad
    [ method ]
    **
    * Transform angle to radians
    > Parameters
    - deg (number) angle in degrees
    = (number) angle in radians.
\*/
R.rad = function (deg) {
    return deg % 360 * PI / 180;
};
/*\
    * Raphael.deg
    [ method ]
    **
    * Transform angle to degrees
    > Parameters
    - rad (number) angle in radians
    = (number) angle in degrees.
\*/
R.deg = function (rad) {
    return Math.round ((rad * 180 / PI% 360)* 1000) / 1000;
};


module.exports = Matrix;
},{}],2:[function(require,module,exports){
(function (global){
/* global layout */
/* global TRACK_WIDTH */
/* global global */
/* global INCH_TO_PIXEL */
/* global TRACK_TYPE */
var Track = require("./track"),
    extend = require("extend");

var CurvesToCircle = Object.freeze({
	27: 8,
	36: 12,
	45: 12,
	54: 16,
	63: 16,
	72: 16,
	81: 16,
	90: 16,
	99: 16,
	108: 16
});

var CurveTrack = Track.extend('CurveTrack', {
	init: function (paper, options) {
        if (options == undefined) {
            options = paper;
            paper = undefined;
        }
        this._super(paper);

		this.options.d = 36;
		this.type = TRACK_TYPE.CURVE;

        if (options != undefined) {
            extend(this.options, options)
        }
	},

    draw: function () {
        if (this.image != undefined)
            this.image.clear();
        this.image = this.options.p.group();

        var track = this._getCurveTrackPath();

        var path = this.options.p.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);

		if (!!layout.options.ShowEndpoints) {
			var endpoints = this.getEndpoints(true);
			for (var i = 0; i < endpoints.length; i++) {
				var arc = this._arcPath(this.options.d * INCH_TO_PIXEL / 2 + TRACK_WIDTH / 2, endpoints[i].r % 180, - 0.5 * Math.sign(endpoints[i].dy))
				var dx = arc[arc.length - 2],
					dy = arc[arc.length - 1];

				this.image.push(this.options.p.circle(endpoints[i].dx - dx, endpoints[i].dy - dy, 2)
					.attr({ "stroke": "#fff", "fill": "#aaa" }));

				arc = this._arcPath(this.options.d * INCH_TO_PIXEL / 2 + TRACK_WIDTH / 2, endpoints[i].r % 180, - 2 * Math.sign(endpoints[i].dy))
				dx = arc[arc.length - 2], dy = arc[arc.length - 1];
				this.image.push(this.options.p.text(endpoints[i].dx - dx, endpoints[i].dy - dy, i)
					.transform(["r", -this.options.r])
					.attr({ "fill": "#fff", "font-size": 16 }));
			}
		}

        this.moveTo();
    },

	_getCurveTrackPath: function () {
		var anchor = this.getEndpoints(true)[0],
			a = 360 / CurvesToCircle[this.options.d];
		var path = ["M", anchor.dx - TRACK_WIDTH / 2, anchor.dy];
		
		var arc1 = this._arcPath(this.options.d * INCH_TO_PIXEL / 2 + TRACK_WIDTH / 2, 0, a),
			arc_t = this._arcPath(this.options.d * INCH_TO_PIXEL / 2 - TRACK_WIDTH / 2, 0, a),
			arc2 = this._arcPath(this.options.d * INCH_TO_PIXEL / 2 - TRACK_WIDTH / 2, a, -a);

		path.push(arc1);
		path.push(["l", TRACK_WIDTH + arc_t[arc_t.length - 2] - arc1[arc1.length - 2], arc_t[arc_t.length - 1] - arc1[arc1.length - 1]]);
		path.push(arc2);
		path.push(["l", -TRACK_WIDTH, 0]);
		
		path.push(["z"]);

		return path;
	},

	_arcPath: function(r, a1, a2) {
		var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
		dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);
		
		return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
	},


    getEndpoints: function (notransform) {
		var a = 360 / CurvesToCircle[this.options.d] / 2;

        var endpoints = [
			{
				dx: INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2 - INCH_TO_PIXEL * this.options.d * Math.cos((a - a) * Math.PI / 180) / 2,
				dy: INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2 - INCH_TO_PIXEL * this.options.d * Math.sin((a - a) * Math.PI / 180) / 2,
				r: 0
			},
			{
				dx: INCH_TO_PIXEL * this.options.d * Math.cos(a * Math.PI / 180) / 2 - INCH_TO_PIXEL * this.options.d * Math.cos((a + a) * Math.PI / 180) / 2,
				dy: INCH_TO_PIXEL * this.options.d * Math.sin(a * Math.PI / 180) / 2 - INCH_TO_PIXEL * this.options.d * Math.sin((a + a) * Math.PI / 180) / 2,
				r: 180 + 360 / CurvesToCircle[this.options.d]
			}
        ];

		if (!!notransform)
			return endpoints;

		return this._super(endpoints);
    },

    toJSON: function () {
        return {
            _type: "CurveTrack",
            options: this.options
        }
    }
});

CurveTrack.fromJSON = function (json) {
    if (json._type != "CurveTrack")
        return null;
    return new CurveTrack(json.options);
}

global.CurveTrack = CurveTrack;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./track":"/classes\\track\\track.js","extend":"extend"}],3:[function(require,module,exports){
(function (global){
/* global layout */
/* global INCH_TO_PIXEL */
/* global TRACK_TYPE */
/* global TRACK_WIDTH */
/* global global */
var Class = require("Class.extend"),
    Track = require("./track"),
    extend = require("extend");

var StraightTrack = Track.extend('StraightTrack', {
    init: function (paper, options) {
        if (options == undefined) {
            options = paper;
            paper = undefined;
        }
        this._super(paper);

        this.options.l = 1;

        if (options != undefined) {
            extend(this.options, options)
        }

        this.type = TRACK_TYPE.STRAIGHT;
    },

    draw: function () {
        if (this.image != undefined)
            this.image.clear();
        this.image = this.options.p.group();

        var track = this._getStraightTrackPath(this.options.l * INCH_TO_PIXEL);

        var path = this.options.p.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);

		if (!!layout.options.ShowEndpoints) {
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
    },

    getEndpoints: function (notransform) {
        var endpoints = [
            { r: 0, dx: 0, dy: this.options.l * INCH_TO_PIXEL / 2 },
            { r: 180, dx: 0, dy: -this.options.l * INCH_TO_PIXEL / 2 }
        ];

		if (!!notransform)
			return endpoints;

		return this._super(endpoints);
    },

    _getStraightTrackPath: function (l) {
        var path = [];
		path.push(["M", -TRACK_WIDTH / 2, l / 2]);
        path.push(["l", 0, -l]);
		path.push([this.options.connections[1] == undefined ? "l" : "l", TRACK_WIDTH, 0]);
        path.push(["l", 0, l]);
		path.push([this.options.connections[0] == undefined ? "l" : "l", -TRACK_WIDTH, 0]);
		if (this.options.connections[0] == undefined)
			path.push(["z"]);

        return path;
    },

    toJSON: function () {
        return {
            _type: "StraightTrack",
            options: this.options
        }
    }
});

StraightTrack.fromJSON = function (json) {
    if (json._type != "StraightTrack")
        return null;
    return new StraightTrack(json.options);
}

global.StraightTrack = StraightTrack;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./track":"/classes\\track\\track.js","Class.extend":4,"extend":"extend"}],4:[function(require,module,exports){
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(className, prop) {
    if(prop == undefined) {
        prop = className;
       className = "Class";
    }

    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    var func = new Function(
        "return function " + className + "(){ }"
    )();
    Class.prototype.constructor = func;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };

  //I only added this line
  module.exports = Class;
})();

},{}],5:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],6:[function(require,module,exports){
/*
  JSON-Serialize.js 1.1.3
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/json-serialize/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('json-serialize', factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {// Generated by CoffeeScript 1.10.0

/*
  JSON-Serialize.js 1.1.3
  (c) 2011, 2012 Kevin Malakoff - http://kmalakoff.github.com/json-serialize/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
var JSONS, isArray, isEmpty, keyPath, root, stringHasISO8601DateSignature;

root = this;

JSONS = this.JSONS = typeof exports !== 'undefined' ? exports : {};

JSONS.VERSION = "1.1.3";

JSONS.TYPE_FIELD = "_type";

JSONS.NAMESPACE_ROOTS = [root];

isEmpty = function(obj) {
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

isArray = function(obj) {
  return obj.constructor === Array;
};

stringHasISO8601DateSignature = function(string) {
  return (string.length >= 19) && (string[4] === "-") && (string[7] === "-") && (string[10] === "T") && (string[string.length - 1] === "Z");
};

keyPath = function(object, keypath) {
  var current_object, i, key, keypath_components, l;
  keypath_components = keypath.split(".");
  if (keypath_components.length === 1) {
    return ((object instanceof Object) && (object.hasOwnProperty(keypath)) ? object[keypath] : void 0);
  }
  current_object = object;
  l = keypath_components.length;
  for (i in keypath_components) {
    key = keypath_components[i];
    key = keypath_components[i];
    if (!(key in current_object)) {
      break;
    }
    if (++i === l) {
      return current_object[key];
    }
    current_object = current_object[key];
    if (!current_object || (!(current_object instanceof Object))) {
      break;
    }
  }
  return void 0;
};

JSONS.serialize = function(obj, options) {
  var j, key, len, result, value;
  if (!obj || (typeof obj !== "object")) {
    return obj;
  }
  if (obj.toJSON) {
    return obj.toJSON();
  }
  if (isArray(obj)) {
    result = [];
    for (j = 0, len = obj.length; j < len; j++) {
      value = obj[j];
      result.push(JSONS.serialize(value));
    }
  } else if (isEmpty(obj)) {
    return null;
  } else {
    result = {};
    for (key in obj) {
      value = obj[key];
      result[key] = JSONS.serialize(value);
    }
  }
  return result;
};

JSONS.deserialize = function(json, options) {
  var constructor_or_root, date, e, error, instance, j, json_as_JSON, json_type, k, key, len, len1, namespace_root, ref, result, type, value;
  json_type = typeof json;
  if (json_type === "string") {
    if (json.length && (json[0] === "{") || (json[0] === "[")) {
      try {
        json_as_JSON = JSON.parse(json);
        if (json_as_JSON) {
          json = json_as_JSON;
        }
      } catch (error) {
        e = error;
        throw new TypeError("Unable to parse JSON: " + json);
      }
    } else if (!(options && options.skip_dates) && stringHasISO8601DateSignature(json)) {
      try {
        date = new Date(json);
        if (date) {
          return date;
        }
      } catch (undefined) {}
    }
  }
  if ((json_type !== "object") || isEmpty(json)) {
    return json;
  }
  if (isArray(json)) {
    result = [];
    for (j = 0, len = json.length; j < len; j++) {
      value = json[j];
      result.push(JSONS.deserialize(value));
    }
    return result;
  } else if ((options && options.skip_type_field) || !json.hasOwnProperty(JSONS.TYPE_FIELD)) {
    result = {};
    for (key in json) {
      value = json[key];
      result[key] = JSONS.deserialize(value);
    }
    return result;
  } else {
    type = json[JSONS.TYPE_FIELD];
    ref = JSONS.NAMESPACE_ROOTS;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      namespace_root = ref[k];
      constructor_or_root = keyPath(namespace_root, type);
      if (!constructor_or_root) {
        continue;
      }
      if (constructor_or_root.fromJSON) {
        return constructor_or_root.fromJSON(json);
      } else if (constructor_or_root.prototype && constructor_or_root.prototype.parse) {
        instance = new constructor_or_root();
        if (instance.set) {
          return instance.set(instance.parse(json));
        }
        return instance.parse(json);
      }
    }
    return null;
  }
};
; return JSONS;});
}).call(this);
},{}],"extend":[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],"layout":[function(require,module,exports){
/* global CurveTrack */
/* global db */
/* global StraightTrack */
require("./track/straightTrack");
require("./track/curveTrack");

var //fs = require('fs'),
    //xml2js = require('xml2js'),
    Track = require("./track/track"),
    Class = require("class.extend"),
    extend = require("extend"),
	json = require("json-serialize");

var Layout = Class.extend('Layout', {
    init: function (paper) {
        this._loaded = false;
        this.track = [];
		this.options = {};
        if (paper == undefined)
            this.LoadLayout();
        else
            this.p = paper;
    },

    LoadLayout: function () {
        var self = this;
        db.findOne({ "type": "track" }, function (err, docs) {
            if (docs == null) {
                console.log("Loading demo tracks ...");
                self.LoadDemoTrack();
                self._loaded = true;
            }
        });
		db.findOne({ "type": "options" }, function (err, docs) {
			var defauts = {
				ShowGrid: true,
				ShowDynamicGrid: false,
				ShowEndpoints: false
			};
			
            if (docs == null) {
				extend(self.options, defauts);
            }
        });
	},

    LoadDemoTrack: function () {
        var t1 = new StraightTrack(this.p, { x: 400, y: 100, r: 30, l: 10 }),
            t2 = new StraightTrack(this.p, { l: 10 });

        t2.connectTo(t1, 0, 1);
        this.AddTrack(t1);
        this.AddTrack(t2);

		var t_old = t2;
		for (var i = 0; i < 11; i++) {
			var t = new CurveTrack(this.p, { d: 36 });
			t.connectTo(t_old);
			this.AddTrack(t);
			t_old = t;
		}
	},

    AddTrack: function (track) {
        if (!(track instanceof Track))
            throw new Error("Invalid track class.");

        this.track.push(track);
		track.id = this.track.indexOf(track); 
    },

    Parse: function (text) {
    },

    /*** CLIENT FUNCTIONS ***/
    ClientShowGrid: function () {
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

    ClientLoadLayout: function (ClientLoadLayout) {
        var self = this;
        $.get("/api/LoadLayout", function (data) {

			var layout = json.deserialize(data);
			layout.track.forEach(function (item) {
                item.setPaper(self.p);
            });
            extend(self, layout);

            if (!!ClientLoadLayout)
                ClientLoadLayout();
        });
    },

    ClientDraw: function () {
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

},{"./track/curveTrack":2,"./track/straightTrack":3,"./track/track":"/classes\\track\\track.js","class.extend":5,"extend":"extend","json-serialize":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1VzZXJzL21heHIvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvdHJhY2svdHJhY2suanMiLCJjbGFzc2VzL21hdHJpeC5qcyIsImNsYXNzZXMvdHJhY2svY3VydmVUcmFjay5qcyIsImNsYXNzZXMvdHJhY2svc3RyYWlnaHRUcmFjay5qcyIsIm5vZGVfbW9kdWxlcy9DbGFzcy5leHRlbmQvbGliL2NsYXNzLmpzIiwibm9kZV9tb2R1bGVzL2pzb24tc2VyaWFsaXplL2pzb24tc2VyaWFsaXplLmpzIiwiZXh0ZW5kIiwiY2xhc3Nlcy9sYXlvdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGdsb2JhbCBnbG9iYWwgKi9cclxudmFyIENsYXNzID0gcmVxdWlyZShcIkNsYXNzLmV4dGVuZFwiKSxcclxuICAgIE1hdHJpeCA9IHJlcXVpcmUoXCIuLi9tYXRyaXhcIik7XHJcblxyXG4vLyBHbG9iYWwgY29uc3RhbnRzXHJcbmdsb2JhbC5UUkFDS19UWVBFID0gT2JqZWN0LmZyZWV6ZSh7XHJcblx0U1RSQUlHSFQ6IDEsXHJcblx0Q1VSVkU6IDJcclxufSk7XHJcbmdsb2JhbC5JTkNIX1RPX1BJWEVMID0gMjA7XHJcbmdsb2JhbC5UUkFDS19XSURUSCA9IDEgKiBnbG9iYWwuSU5DSF9UT19QSVhFTDtcclxuXHJcbnZhciBUcmFjayA9IENsYXNzLmV4dGVuZCgnVHJhY2snLCB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAocGFwZXIpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgIHI6IDAsXHJcbiAgICAgICAgICAgIHA6IHBhcGVyLFxyXG5cdFx0XHRjb25uZWN0aW9uczoge31cclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UgIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aGlzLmltYWdlLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0aGlzLmdldFBhdGgoKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0UGF0aDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZXQgPSB0aGlzLm9wdGlvbnMucC5zZXQoKTtcclxuICAgICAgICBzZXQucHVzaCh0aGlzLm9wdGlvbnMucC5jaXJjbGUoMCwgMCwgNSkuYXR0cih7IFwic3Ryb2tlXCI6IFwiI2ZmZlwiLCBcImZpbGxcIjogXCIjYWFhXCIgfSkpO1xyXG4gICAgICAgIHNldC5wdXNoKHRoaXMub3B0aW9ucy5wLnRleHQoMCwgLTIwLCBcIk1pc3NpbmcgaW1hZ2VcIikuYXR0cih7IFwiZmlsbFwiOiBcIiNhYWFcIiwgXCJmb250LXNpemVcIjogMTYgfSkpO1xyXG4gICAgICAgIHJldHVybiBzZXQ7XHJcbiAgICB9LFxyXG5cclxuICAgIG1vdmVUbzogZnVuY3Rpb24gKHgsIHksIHIpIHtcclxuICAgICAgICBpZiAoeCAhPSB1bmRlZmluZWQgJiYgeSAhPSB1bmRlZmluZWQgJiYgciAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnggPSB4O1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMueSA9IHk7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yID0gcjtcclxuICAgICAgICB9XHJcblxyXG5cdFx0dGhpcy5pbWFnZS50cmFuc2xhdGUodGhpcy5vcHRpb25zLngsIHRoaXMub3B0aW9ucy55KTtcclxuICAgICAgICB0aGlzLmltYWdlLnJvdGF0ZSh0aGlzLm9wdGlvbnMuciwgMCwgMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE1hdHJpeDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmltYWdlICE9IHVuZGVmaW5lZCAmJiB0aGlzLmltYWdlWzBdICE9IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2VbMF0ubWF0cml4O1xyXG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeCgpO1xyXG4gICAgICAgIG0udHJhbnNsYXRlKHRoaXMub3B0aW9ucy54LCB0aGlzLm9wdGlvbnMueSk7XHJcbiAgICAgICAgbS5yb3RhdGUodGhpcy5vcHRpb25zLnIsIDAsIDApO1xyXG4gICAgICAgIHJldHVybiBtO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb25uZWN0VG86IGZ1bmN0aW9uICh0cmFjaywgbnVtYmVyMSwgbnVtYmVyMikge1xyXG5cdFx0dmFyIHRoaXNFbmRwb2ludHMgPSB0aGlzLmdldEVuZHBvaW50cygpLFxyXG5cdFx0XHR0cmFja0VuZHBvaW50cyA9IHRyYWNrLmdldEVuZHBvaW50cygpO1xyXG5cclxuICAgICAgICBpZiAobnVtYmVyMSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yKHZhciBpPTA7aTx0aGlzRW5kcG9pbnRzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0XHRpZih0aGlzLm9wdGlvbnMuY29ubmVjdGlvbnNbaV0gPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRudW1iZXIxID0gaTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihudW1iZXIxID09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRyZXR1cm47IFxyXG5cdFx0fVxyXG4gICAgICAgIGlmIChudW1iZXIyID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IodmFyIGk9MDtpPHRyYWNrRW5kcG9pbnRzLmxlbmd0aDtpKyspIHtcclxuXHRcdFx0XHRpZih0cmFjay5vcHRpb25zLmNvbm5lY3Rpb25zW2ldID09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0bnVtYmVyMiA9IGk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYobnVtYmVyMiA9PSB1bmRlZmluZWQpXHJcblx0XHRcdFx0cmV0dXJuOyBcclxuXHRcdH1cclxuXHJcbiAgICAgICAgdmFyIGFuY2hvcjEgPSB0aGlzRW5kcG9pbnRzW251bWJlcjFdO1xyXG4gICAgICAgIHZhciBhbmNob3IyID0gdHJhY2tFbmRwb2ludHNbbnVtYmVyMl07XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zLnIgPSB0cmFjay5vcHRpb25zLnI7XHJcblx0XHRpZiAoYW5jaG9yMS5yICsgYW5jaG9yMi5yICE9IDE4MCkge1xyXG5cdFx0XHR0aGlzLm9wdGlvbnMuciArPSAxODAgKyBhbmNob3IxLnIgKyBhbmNob3IyLnI7XHJcblx0XHR9XHJcblx0XHR0aGlzLm9wdGlvbnMuciAlPSAzNjA7XHJcblx0XHRhbmNob3IxID0gdGhpcy5nZXRFbmRwb2ludHMoKVtudW1iZXIxXTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnggPSB0cmFjay5vcHRpb25zLnggKyBhbmNob3IyLmR4IC0gYW5jaG9yMS5keDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMueSA9IHRyYWNrLm9wdGlvbnMueSArIGFuY2hvcjIuZHkgLSBhbmNob3IxLmR5O1xyXG5cdFx0XHJcblx0XHR0aGlzLm9wdGlvbnMuY29ubmVjdGlvbnNbbnVtYmVyMV0gPSAxO1xyXG5cdFx0dHJhY2sub3B0aW9ucy5jb25uZWN0aW9uc1tudW1iZXIyXSA9IDE7XHJcbiAgICB9LFxyXG5cclxuXHRnZXRFbmRwb2ludHM6IGZ1bmN0aW9uIChlbmRwb2ludHMpIHtcclxuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgoKTtcclxuICAgICAgICBtLnJvdGF0ZSh0aGlzLm9wdGlvbnMuciwgMCwgMCk7XHJcblxyXG4gICAgICAgIHZhciBlID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dmFyIHQgPSBlbmRwb2ludHNbaV0sXHJcblx0XHRcdFx0eCA9IHQuZHgsXHJcblx0XHRcdFx0eSA9IHQuZHk7XHJcblx0XHRcdHQuZHggPSBtLngoeCwgeSk7XHJcblx0XHRcdHQuZHkgPSBtLnkoeCwgeSk7XHJcblx0XHRcdGUucHVzaCh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlO1xyXG5cdH0sXHJcblxyXG4gICAgc2V0UGFwZXI6IGZ1bmN0aW9uIChwKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnAgPSBwO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGdldEVuZHBvaW50cyhyLCBhMSwgYTIpIHtcclxufVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNrO1xyXG4iLCJmdW5jdGlvbiBNYXRyaXgoKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA2KSB7XHJcbiAgICAgICAgdGhpcy5hID0gK2FyZ3VtZW50c1swXTtcclxuICAgICAgICB0aGlzLmIgPSArYXJndW1lbnRzWzFdO1xyXG4gICAgICAgIHRoaXMuYyA9ICthcmd1bWVudHNbMl07XHJcbiAgICAgICAgdGhpcy5kID0gK2FyZ3VtZW50c1szXTtcclxuICAgICAgICB0aGlzLmUgPSArYXJndW1lbnRzWzRdO1xyXG4gICAgICAgIHRoaXMuZiA9ICthcmd1bWVudHNbNV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYSA9IDE7XHJcbiAgICAgICAgdGhpcy5iID0gMDtcclxuICAgICAgICB0aGlzLmMgPSAwO1xyXG4gICAgICAgIHRoaXMuZCA9IDE7XHJcbiAgICAgICAgdGhpcy5lID0gMDtcclxuICAgICAgICB0aGlzLmYgPSAwO1xyXG4gICAgfVxyXG59XHJcbihmdW5jdGlvbiAobWF0cml4cHJvdG8pIHtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5hZGRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIEFkZHMgZ2l2ZW4gbWF0cml4IHRvIGV4aXN0aW5nIG9uZS5cclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIGEgKG51bWJlcilcclxuICAgICAgICAtIGIgKG51bWJlcilcclxuICAgICAgICAtIGMgKG51bWJlcilcclxuICAgICAgICAtIGQgKG51bWJlcilcclxuICAgICAgICAtIGUgKG51bWJlcilcclxuICAgICAgICAtIGYgKG51bWJlcilcclxuICAgICAgICBvclxyXG4gICAgICAgIC0gbWF0cml4IChvYmplY3QpIEBNYXRyaXhcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLmFkZCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlLCBmKSB7XHJcbiAgICAgICAgdmFyIG91dCA9IFtbXSwgW10sIFtdXSxcclxuICAgICAgICAgICAgbSA9IFtbdGhpcy5hLCB0aGlzLmMsIHRoaXMuZV0sIFt0aGlzLmIsIHRoaXMuZCwgdGhpcy5mXSwgWzAsIDAsIDFdXSxcclxuICAgICAgICAgICAgbWF0cml4ID0gW1thLCBjLCBlXSwgW2IsIGQsIGZdLCBbMCwgMCwgMV1dLFxyXG4gICAgICAgICAgICB4LCB5LCB6LCByZXM7XHJcblxyXG4gICAgICAgIGlmIChhICYmIGEgaW5zdGFuY2VvZiBNYXRyaXgpIHtcclxuICAgICAgICAgICAgbWF0cml4ID0gW1thLmEsIGEuYywgYS5lXSwgW2EuYiwgYS5kLCBhLmZdLCBbMCwgMCwgMV1dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IDM7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgMzsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh6ID0gMDsgeiA8IDM7IHorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBtW3hdW3pdICogbWF0cml4W3pdW3ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0W3hdW3ldID0gcmVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYSA9IG91dFswXVswXTtcclxuICAgICAgICB0aGlzLmIgPSBvdXRbMV1bMF07XHJcbiAgICAgICAgdGhpcy5jID0gb3V0WzBdWzFdO1xyXG4gICAgICAgIHRoaXMuZCA9IG91dFsxXVsxXTtcclxuICAgICAgICB0aGlzLmUgPSBvdXRbMF1bMl07XHJcbiAgICAgICAgdGhpcy5mID0gb3V0WzFdWzJdO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5pbnZlcnRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJldHVybnMgaW52ZXJ0ZWQgdmVyc2lvbiBvZiB0aGUgbWF0cml4XHJcbiAgICAgICAgPSAob2JqZWN0KSBATWF0cml4XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5pbnZlcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAgICAgeCA9IG1lLmEgKiBtZS5kIC0gbWUuYiAqIG1lLmM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgobWUuZCAvIHgsIC1tZS5iIC8geCwgLW1lLmMgLyB4LCBtZS5hIC8geCwgKG1lLmMgKiBtZS5mIC0gbWUuZCAqIG1lLmUpIC8geCwgKG1lLmIgKiBtZS5lIC0gbWUuYSAqIG1lLmYpIC8geCk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LmNsb25lXHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm5zIGNvcHkgb2YgdGhlIG1hdHJpeFxyXG4gICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgodGhpcy5hLCB0aGlzLmIsIHRoaXMuYywgdGhpcy5kLCB0aGlzLmUsIHRoaXMuZik7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnRyYW5zbGF0ZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogVHJhbnNsYXRlIHRoZSBtYXRyaXhcclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIHggKG51bWJlcilcclxuICAgICAgICAtIHkgKG51bWJlcilcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgICAgdGhpcy5hZGQoMSwgMCwgMCwgMSwgeCwgeSk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnNjYWxlXHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBTY2FsZXMgdGhlIG1hdHJpeFxyXG4gICAgICAgID4gUGFyYW1ldGVyc1xyXG4gICAgICAgIC0geCAobnVtYmVyKVxyXG4gICAgICAgIC0geSAobnVtYmVyKSAjb3B0aW9uYWxcclxuICAgICAgICAtIGN4IChudW1iZXIpICNvcHRpb25hbFxyXG4gICAgICAgIC0gY3kgKG51bWJlcikgI29wdGlvbmFsXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5zY2FsZSA9IGZ1bmN0aW9uICh4LCB5LCBjeCwgY3kpIHtcclxuICAgICAgICB5ID09IG51bGwgJiYgKHkgPSB4KTtcclxuICAgICAgICAoY3ggfHwgY3kpICYmIHRoaXMuYWRkKDEsIDAsIDAsIDEsIGN4LCBjeSk7XHJcbiAgICAgICAgdGhpcy5hZGQoeCwgMCwgMCwgeSwgMCwgMCk7XHJcbiAgICAgICAgKGN4IHx8IGN5KSAmJiB0aGlzLmFkZCgxLCAwLCAwLCAxLCAtY3gsIC1jeSk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnJvdGF0ZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUm90YXRlcyB0aGUgbWF0cml4XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSBhIChudW1iZXIpXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5yb3RhdGUgPSBmdW5jdGlvbiAoYSwgeCwgeSkge1xyXG4gICAgICAgIGEgPSBSLnJhZChhKTtcclxuICAgICAgICB4ID0geCB8fCAwO1xyXG4gICAgICAgIHkgPSB5IHx8IDA7XHJcbiAgICAgICAgdmFyIGNvcyA9ICttYXRoLmNvcyhhKS50b0ZpeGVkKDkpLFxyXG4gICAgICAgICAgICBzaW4gPSArbWF0aC5zaW4oYSkudG9GaXhlZCg5KTtcclxuICAgICAgICB0aGlzLmFkZChjb3MsIHNpbiwgLXNpbiwgY29zLCB4LCB5KTtcclxuICAgICAgICB0aGlzLmFkZCgxLCAwLCAwLCAxLCAteCwgLXkpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC54XHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm4geCBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC55XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICAgICAgPSAobnVtYmVyKSB4XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by54ID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgICAgICByZXR1cm4geCAqIHRoaXMuYSArIHkgKiB0aGlzLmMgKyB0aGlzLmU7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnlcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJldHVybiB5IGNvb3JkaW5hdGUgZm9yIGdpdmVuIHBvaW50IGFmdGVyIHRyYW5zZm9ybWF0aW9uIGRlc2NyaWJlZCBieSB0aGUgbWF0cml4LiBTZWUgYWxzbyBATWF0cml4LnhcclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIHggKG51bWJlcilcclxuICAgICAgICAtIHkgKG51bWJlcilcclxuICAgICAgICA9IChudW1iZXIpIHlcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnkgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG4gICAgICAgIHJldHVybiB4ICogdGhpcy5iICsgeSAqIHRoaXMuZCArIHRoaXMuZjtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by5nZXQgPSBmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgIHJldHVybiArdGhpc1tTdHIuZnJvbUNoYXJDb2RlKDk3ICsgaSldLnRvRml4ZWQoNCk7XHJcbiAgICB9O1xyXG4gICAgbWF0cml4cHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFIuc3ZnID9cclxuICAgICAgICAgICAgXCJtYXRyaXgoXCIgKyBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMyksIHRoaXMuZ2V0KDQpLCB0aGlzLmdldCg1KV0uam9pbigpICsgXCIpXCIgOlxyXG4gICAgICAgICAgICBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMyksIDAsIDBdLmpvaW4oKTtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by50b0ZpbHRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuTWF0cml4KE0xMT1cIiArIHRoaXMuZ2V0KDApICtcclxuICAgICAgICAgICAgXCIsIE0xMj1cIiArIHRoaXMuZ2V0KDIpICsgXCIsIE0yMT1cIiArIHRoaXMuZ2V0KDEpICsgXCIsIE0yMj1cIiArIHRoaXMuZ2V0KDMpICtcclxuICAgICAgICAgICAgXCIsIER4PVwiICsgdGhpcy5nZXQoNCkgKyBcIiwgRHk9XCIgKyB0aGlzLmdldCg1KSArIFwiLCBzaXppbmdtZXRob2Q9J2F1dG8gZXhwYW5kJylcIjtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmUudG9GaXhlZCg0KSwgdGhpcy5mLnRvRml4ZWQoNCldO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIG5vcm0oYSkge1xyXG4gICAgICAgIHJldHVybiBhWzBdICogYVswXSArIGFbMV0gKiBhWzFdO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKGEpIHtcclxuICAgICAgICB2YXIgbWFnID0gbWF0aC5zcXJ0KG5vcm0oYSkpO1xyXG4gICAgICAgIGFbMF0gJiYgKGFbMF0gLz0gbWFnKTtcclxuICAgICAgICBhWzFdICYmIChhWzFdIC89IG1hZyk7XHJcbiAgICB9XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXguc3BsaXRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFNwbGl0cyBtYXRyaXggaW50byBwcmltaXRpdmUgdHJhbnNmb3JtYXRpb25zXHJcbiAgICAgICAgPSAob2JqZWN0KSBpbiBmb3JtYXQ6XHJcbiAgICAgICAgbyBkeCAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB4XHJcbiAgICAgICAgbyBkeSAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB5XHJcbiAgICAgICAgbyBzY2FsZXggKG51bWJlcikgc2NhbGUgYnkgeFxyXG4gICAgICAgIG8gc2NhbGV5IChudW1iZXIpIHNjYWxlIGJ5IHlcclxuICAgICAgICBvIHNoZWFyIChudW1iZXIpIHNoZWFyXHJcbiAgICAgICAgbyByb3RhdGUgKG51bWJlcikgcm90YXRpb24gaW4gZGVnXHJcbiAgICAgICAgbyBpc1NpbXBsZSAoYm9vbGVhbikgY291bGQgaXQgYmUgcmVwcmVzZW50ZWQgdmlhIHNpbXBsZSB0cmFuc2Zvcm1hdGlvbnNcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnNwbGl0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvdXQgPSB7fTtcclxuICAgICAgICAvLyB0cmFuc2xhdGlvblxyXG4gICAgICAgIG91dC5keCA9IHRoaXMuZTtcclxuICAgICAgICBvdXQuZHkgPSB0aGlzLmY7XHJcblxyXG4gICAgICAgIC8vIHNjYWxlIGFuZCBzaGVhclxyXG4gICAgICAgIHZhciByb3cgPSBbW3RoaXMuYSwgdGhpcy5jXSwgW3RoaXMuYiwgdGhpcy5kXV07XHJcbiAgICAgICAgb3V0LnNjYWxleCA9IG1hdGguc3FydChub3JtKHJvd1swXSkpO1xyXG4gICAgICAgIG5vcm1hbGl6ZShyb3dbMF0pO1xyXG5cclxuICAgICAgICBvdXQuc2hlYXIgPSByb3dbMF1bMF0gKiByb3dbMV1bMF0gKyByb3dbMF1bMV0gKiByb3dbMV1bMV07XHJcbiAgICAgICAgcm93WzFdID0gW3Jvd1sxXVswXSAtIHJvd1swXVswXSAqIG91dC5zaGVhciwgcm93WzFdWzFdIC0gcm93WzBdWzFdICogb3V0LnNoZWFyXTtcclxuXHJcbiAgICAgICAgb3V0LnNjYWxleSA9IG1hdGguc3FydChub3JtKHJvd1sxXSkpO1xyXG4gICAgICAgIG5vcm1hbGl6ZShyb3dbMV0pO1xyXG4gICAgICAgIG91dC5zaGVhciAvPSBvdXQuc2NhbGV5O1xyXG5cclxuICAgICAgICAvLyByb3RhdGlvblxyXG4gICAgICAgIHZhciBzaW4gPSAtcm93WzBdWzFdLFxyXG4gICAgICAgICAgICBjb3MgPSByb3dbMV1bMV07XHJcbiAgICAgICAgaWYgKGNvcyA8IDApIHtcclxuICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYWNvcyhjb3MpKTtcclxuICAgICAgICAgICAgaWYgKHNpbiA8IDApIHtcclxuICAgICAgICAgICAgICAgIG91dC5yb3RhdGUgPSAzNjAgLSBvdXQucm90YXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYXNpbihzaW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dC5pc1NpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgKG91dC5zY2FsZXgudG9GaXhlZCg5KSA9PSBvdXQuc2NhbGV5LnRvRml4ZWQoOSkgfHwgIW91dC5yb3RhdGUpO1xyXG4gICAgICAgIG91dC5pc1N1cGVyU2ltcGxlID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiBvdXQuc2NhbGV4LnRvRml4ZWQoOSkgPT0gb3V0LnNjYWxleS50b0ZpeGVkKDkpICYmICFvdXQucm90YXRlO1xyXG4gICAgICAgIG91dC5ub1JvdGF0aW9uID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC50b1RyYW5zZm9ybVN0cmluZ1xyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUmV0dXJuIHRyYW5zZm9ybSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGdpdmVuIG1hdHJpeFxyXG4gICAgICAgID0gKHN0cmluZykgdHJhbnNmb3JtIHN0cmluZ1xyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8udG9UcmFuc2Zvcm1TdHJpbmcgPSBmdW5jdGlvbiAoc2hvcnRlcikge1xyXG4gICAgICAgIHZhciBzID0gc2hvcnRlciB8fCB0aGlzW3NwbGl0XSgpO1xyXG4gICAgICAgIGlmIChzLmlzU2ltcGxlKSB7XHJcbiAgICAgICAgICAgIHMuc2NhbGV4ID0gK3Muc2NhbGV4LnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHMuc2NhbGV5ID0gK3Muc2NhbGV5LnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHMucm90YXRlID0gK3Mucm90YXRlLnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHJldHVybiAgKHMuZHggfHwgcy5keSA/IFwidFwiICsgW3MuZHgsIHMuZHldIDogRSkgK1xyXG4gICAgICAgICAgICAgICAgICAgIChzLnNjYWxleCAhPSAxIHx8IHMuc2NhbGV5ICE9IDEgPyBcInNcIiArIFtzLnNjYWxleCwgcy5zY2FsZXksIDAsIDBdIDogRSkgK1xyXG4gICAgICAgICAgICAgICAgICAgIChzLnJvdGF0ZSA/IFwiclwiICsgW3Mucm90YXRlLCAwLCAwXSA6IEUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIm1cIiArIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgzKSwgdGhpcy5nZXQoNCksIHRoaXMuZ2V0KDUpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KShNYXRyaXgucHJvdG90eXBlKTtcclxuXHJcbnZhciBtYXRoID0gTWF0aCxcclxuICAgIG1tYXggPSBtYXRoLm1heCxcclxuICAgIG1taW4gPSBtYXRoLm1pbixcclxuICAgIGFicyA9IG1hdGguYWJzLFxyXG4gICAgcG93ID0gbWF0aC5wb3csXHJcbiAgICBQSSA9IG1hdGguUEk7XHJcblxyXG5mdW5jdGlvbiBSKCkge1xyXG59XHJcbi8qXFxcclxuICAgICogUmFwaGFlbC5yYWRcclxuICAgIFsgbWV0aG9kIF1cclxuICAgICoqXHJcbiAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byByYWRpYW5zXHJcbiAgICA+IFBhcmFtZXRlcnNcclxuICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcclxuICAgID0gKG51bWJlcikgYW5nbGUgaW4gcmFkaWFucy5cclxuXFwqL1xyXG5SLnJhZCA9IGZ1bmN0aW9uIChkZWcpIHtcclxuICAgIHJldHVybiBkZWcgJSAzNjAgKiBQSSAvIDE4MDtcclxufTtcclxuLypcXFxyXG4gICAgKiBSYXBoYWVsLmRlZ1xyXG4gICAgWyBtZXRob2QgXVxyXG4gICAgKipcclxuICAgICogVHJhbnNmb3JtIGFuZ2xlIHRvIGRlZ3JlZXNcclxuICAgID4gUGFyYW1ldGVyc1xyXG4gICAgLSByYWQgKG51bWJlcikgYW5nbGUgaW4gcmFkaWFuc1xyXG4gICAgPSAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzLlxyXG5cXCovXHJcblIuZGVnID0gZnVuY3Rpb24gKHJhZCkge1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQgKChyYWQgKiAxODAgLyBQSSUgMzYwKSogMTAwMCkgLyAxMDAwO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWF0cml4OyIsIi8qIGdsb2JhbCBsYXlvdXQgKi9cclxuLyogZ2xvYmFsIFRSQUNLX1dJRFRIICovXHJcbi8qIGdsb2JhbCBnbG9iYWwgKi9cclxuLyogZ2xvYmFsIElOQ0hfVE9fUElYRUwgKi9cclxuLyogZ2xvYmFsIFRSQUNLX1RZUEUgKi9cclxudmFyIFRyYWNrID0gcmVxdWlyZShcIi4vdHJhY2tcIiksXHJcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiZXh0ZW5kXCIpO1xyXG5cclxudmFyIEN1cnZlc1RvQ2lyY2xlID0gT2JqZWN0LmZyZWV6ZSh7XHJcblx0Mjc6IDgsXHJcblx0MzY6IDEyLFxyXG5cdDQ1OiAxMixcclxuXHQ1NDogMTYsXHJcblx0NjM6IDE2LFxyXG5cdDcyOiAxNixcclxuXHQ4MTogMTYsXHJcblx0OTA6IDE2LFxyXG5cdDk5OiAxNixcclxuXHQxMDg6IDE2XHJcbn0pO1xyXG5cclxudmFyIEN1cnZlVHJhY2sgPSBUcmFjay5leHRlbmQoJ0N1cnZlVHJhY2snLCB7XHJcblx0aW5pdDogZnVuY3Rpb24gKHBhcGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBwYXBlcjtcclxuICAgICAgICAgICAgcGFwZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N1cGVyKHBhcGVyKTtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMuZCA9IDM2O1xyXG5cdFx0dGhpcy50eXBlID0gVFJBQ0tfVFlQRS5DVVJWRTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICAgICAgfVxyXG5cdH0sXHJcblxyXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmltYWdlICE9IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhpcy5pbWFnZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0aGlzLm9wdGlvbnMucC5ncm91cCgpO1xyXG5cclxuICAgICAgICB2YXIgdHJhY2sgPSB0aGlzLl9nZXRDdXJ2ZVRyYWNrUGF0aCgpO1xyXG5cclxuICAgICAgICB2YXIgcGF0aCA9IHRoaXMub3B0aW9ucy5wLnBhdGgodHJhY2spLmF0dHIoeyBzdHJva2U6ICcjQ0NDJywgZmlsbDogJyM4ODgnIH0pO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UucHVzaChwYXRoKTtcclxuXHJcblx0XHRpZiAoISFsYXlvdXQub3B0aW9ucy5TaG93RW5kcG9pbnRzKSB7XHJcblx0XHRcdHZhciBlbmRwb2ludHMgPSB0aGlzLmdldEVuZHBvaW50cyh0cnVlKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgYXJjID0gdGhpcy5fYXJjUGF0aCh0aGlzLm9wdGlvbnMuZCAqIElOQ0hfVE9fUElYRUwgLyAyICsgVFJBQ0tfV0lEVEggLyAyLCBlbmRwb2ludHNbaV0uciAlIDE4MCwgLSAwLjUgKiBNYXRoLnNpZ24oZW5kcG9pbnRzW2ldLmR5KSlcclxuXHRcdFx0XHR2YXIgZHggPSBhcmNbYXJjLmxlbmd0aCAtIDJdLFxyXG5cdFx0XHRcdFx0ZHkgPSBhcmNbYXJjLmxlbmd0aCAtIDFdO1xyXG5cclxuXHRcdFx0XHR0aGlzLmltYWdlLnB1c2godGhpcy5vcHRpb25zLnAuY2lyY2xlKGVuZHBvaW50c1tpXS5keCAtIGR4LCBlbmRwb2ludHNbaV0uZHkgLSBkeSwgMilcclxuXHRcdFx0XHRcdC5hdHRyKHsgXCJzdHJva2VcIjogXCIjZmZmXCIsIFwiZmlsbFwiOiBcIiNhYWFcIiB9KSk7XHJcblxyXG5cdFx0XHRcdGFyYyA9IHRoaXMuX2FyY1BhdGgodGhpcy5vcHRpb25zLmQgKiBJTkNIX1RPX1BJWEVMIC8gMiArIFRSQUNLX1dJRFRIIC8gMiwgZW5kcG9pbnRzW2ldLnIgJSAxODAsIC0gMiAqIE1hdGguc2lnbihlbmRwb2ludHNbaV0uZHkpKVxyXG5cdFx0XHRcdGR4ID0gYXJjW2FyYy5sZW5ndGggLSAyXSwgZHkgPSBhcmNbYXJjLmxlbmd0aCAtIDFdO1xyXG5cdFx0XHRcdHRoaXMuaW1hZ2UucHVzaCh0aGlzLm9wdGlvbnMucC50ZXh0KGVuZHBvaW50c1tpXS5keCAtIGR4LCBlbmRwb2ludHNbaV0uZHkgLSBkeSwgaSlcclxuXHRcdFx0XHRcdC50cmFuc2Zvcm0oW1wiclwiLCAtdGhpcy5vcHRpb25zLnJdKVxyXG5cdFx0XHRcdFx0LmF0dHIoeyBcImZpbGxcIjogXCIjZmZmXCIsIFwiZm9udC1zaXplXCI6IDE2IH0pKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVUbygpO1xyXG4gICAgfSxcclxuXHJcblx0X2dldEN1cnZlVHJhY2tQYXRoOiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgYW5jaG9yID0gdGhpcy5nZXRFbmRwb2ludHModHJ1ZSlbMF0sXHJcblx0XHRcdGEgPSAzNjAgLyBDdXJ2ZXNUb0NpcmNsZVt0aGlzLm9wdGlvbnMuZF07XHJcblx0XHR2YXIgcGF0aCA9IFtcIk1cIiwgYW5jaG9yLmR4IC0gVFJBQ0tfV0lEVEggLyAyLCBhbmNob3IuZHldO1xyXG5cdFx0XHJcblx0XHR2YXIgYXJjMSA9IHRoaXMuX2FyY1BhdGgodGhpcy5vcHRpb25zLmQgKiBJTkNIX1RPX1BJWEVMIC8gMiArIFRSQUNLX1dJRFRIIC8gMiwgMCwgYSksXHJcblx0XHRcdGFyY190ID0gdGhpcy5fYXJjUGF0aCh0aGlzLm9wdGlvbnMuZCAqIElOQ0hfVE9fUElYRUwgLyAyIC0gVFJBQ0tfV0lEVEggLyAyLCAwLCBhKSxcclxuXHRcdFx0YXJjMiA9IHRoaXMuX2FyY1BhdGgodGhpcy5vcHRpb25zLmQgKiBJTkNIX1RPX1BJWEVMIC8gMiAtIFRSQUNLX1dJRFRIIC8gMiwgYSwgLWEpO1xyXG5cclxuXHRcdHBhdGgucHVzaChhcmMxKTtcclxuXHRcdHBhdGgucHVzaChbXCJsXCIsIFRSQUNLX1dJRFRIICsgYXJjX3RbYXJjX3QubGVuZ3RoIC0gMl0gLSBhcmMxW2FyYzEubGVuZ3RoIC0gMl0sIGFyY190W2FyY190Lmxlbmd0aCAtIDFdIC0gYXJjMVthcmMxLmxlbmd0aCAtIDFdXSk7XHJcblx0XHRwYXRoLnB1c2goYXJjMik7XHJcblx0XHRwYXRoLnB1c2goW1wibFwiLCAtVFJBQ0tfV0lEVEgsIDBdKTtcclxuXHRcdFxyXG5cdFx0cGF0aC5wdXNoKFtcInpcIl0pO1xyXG5cclxuXHRcdHJldHVybiBwYXRoO1xyXG5cdH0sXHJcblxyXG5cdF9hcmNQYXRoOiBmdW5jdGlvbihyLCBhMSwgYTIpIHtcclxuXHRcdHZhciBkeCA9IHIgKiBNYXRoLmNvcyhhMSAqIE1hdGguUEkgLyAxODApIC0gciAqIE1hdGguY29zKChhMSArIGEyKSAqIE1hdGguUEkgLyAxODApLFxyXG5cdFx0ZHkgPSByICogTWF0aC5zaW4oYTEgKiBNYXRoLlBJIC8gMTgwKSAtIHIgKiBNYXRoLnNpbigoYTEgKyBhMikgKiBNYXRoLlBJIC8gMTgwKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIFtcImFcIiwgciwgciwgMCwgMCwgYTIgPiAwID8gMSA6IDAsIGR4LCBkeV07XHJcblx0fSxcclxuXHJcblxyXG4gICAgZ2V0RW5kcG9pbnRzOiBmdW5jdGlvbiAobm90cmFuc2Zvcm0pIHtcclxuXHRcdHZhciBhID0gMzYwIC8gQ3VydmVzVG9DaXJjbGVbdGhpcy5vcHRpb25zLmRdIC8gMjtcclxuXHJcbiAgICAgICAgdmFyIGVuZHBvaW50cyA9IFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGR4OiBJTkNIX1RPX1BJWEVMICogdGhpcy5vcHRpb25zLmQgKiBNYXRoLmNvcyhhICogTWF0aC5QSSAvIDE4MCkgLyAyIC0gSU5DSF9UT19QSVhFTCAqIHRoaXMub3B0aW9ucy5kICogTWF0aC5jb3MoKGEgLSBhKSAqIE1hdGguUEkgLyAxODApIC8gMixcclxuXHRcdFx0XHRkeTogSU5DSF9UT19QSVhFTCAqIHRoaXMub3B0aW9ucy5kICogTWF0aC5zaW4oYSAqIE1hdGguUEkgLyAxODApIC8gMiAtIElOQ0hfVE9fUElYRUwgKiB0aGlzLm9wdGlvbnMuZCAqIE1hdGguc2luKChhIC0gYSkgKiBNYXRoLlBJIC8gMTgwKSAvIDIsXHJcblx0XHRcdFx0cjogMFxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZHg6IElOQ0hfVE9fUElYRUwgKiB0aGlzLm9wdGlvbnMuZCAqIE1hdGguY29zKGEgKiBNYXRoLlBJIC8gMTgwKSAvIDIgLSBJTkNIX1RPX1BJWEVMICogdGhpcy5vcHRpb25zLmQgKiBNYXRoLmNvcygoYSArIGEpICogTWF0aC5QSSAvIDE4MCkgLyAyLFxyXG5cdFx0XHRcdGR5OiBJTkNIX1RPX1BJWEVMICogdGhpcy5vcHRpb25zLmQgKiBNYXRoLnNpbihhICogTWF0aC5QSSAvIDE4MCkgLyAyIC0gSU5DSF9UT19QSVhFTCAqIHRoaXMub3B0aW9ucy5kICogTWF0aC5zaW4oKGEgKyBhKSAqIE1hdGguUEkgLyAxODApIC8gMixcclxuXHRcdFx0XHRyOiAxODAgKyAzNjAgLyBDdXJ2ZXNUb0NpcmNsZVt0aGlzLm9wdGlvbnMuZF1cclxuXHRcdFx0fVxyXG4gICAgICAgIF07XHJcblxyXG5cdFx0aWYgKCEhbm90cmFuc2Zvcm0pXHJcblx0XHRcdHJldHVybiBlbmRwb2ludHM7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX3N1cGVyKGVuZHBvaW50cyk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIF90eXBlOiBcIkN1cnZlVHJhY2tcIixcclxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkN1cnZlVHJhY2suZnJvbUpTT04gPSBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgaWYgKGpzb24uX3R5cGUgIT0gXCJDdXJ2ZVRyYWNrXCIpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICByZXR1cm4gbmV3IEN1cnZlVHJhY2soanNvbi5vcHRpb25zKTtcclxufVxyXG5cclxuZ2xvYmFsLkN1cnZlVHJhY2sgPSBDdXJ2ZVRyYWNrOyIsIi8qIGdsb2JhbCBsYXlvdXQgKi9cclxuLyogZ2xvYmFsIElOQ0hfVE9fUElYRUwgKi9cclxuLyogZ2xvYmFsIFRSQUNLX1RZUEUgKi9cclxuLyogZ2xvYmFsIFRSQUNLX1dJRFRIICovXHJcbi8qIGdsb2JhbCBnbG9iYWwgKi9cclxudmFyIENsYXNzID0gcmVxdWlyZShcIkNsYXNzLmV4dGVuZFwiKSxcclxuICAgIFRyYWNrID0gcmVxdWlyZShcIi4vdHJhY2tcIiksXHJcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiZXh0ZW5kXCIpO1xyXG5cclxudmFyIFN0cmFpZ2h0VHJhY2sgPSBUcmFjay5leHRlbmQoJ1N0cmFpZ2h0VHJhY2snLCB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAocGFwZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAob3B0aW9ucyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcGVyO1xyXG4gICAgICAgICAgICBwYXBlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3VwZXIocGFwZXIpO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMubCA9IDE7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBleHRlbmQodGhpcy5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50eXBlID0gVFJBQ0tfVFlQRS5TVFJBSUdIVDtcclxuICAgIH0sXHJcblxyXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmltYWdlICE9IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhpcy5pbWFnZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0aGlzLm9wdGlvbnMucC5ncm91cCgpO1xyXG5cclxuICAgICAgICB2YXIgdHJhY2sgPSB0aGlzLl9nZXRTdHJhaWdodFRyYWNrUGF0aCh0aGlzLm9wdGlvbnMubCAqIElOQ0hfVE9fUElYRUwpO1xyXG5cclxuICAgICAgICB2YXIgcGF0aCA9IHRoaXMub3B0aW9ucy5wLnBhdGgodHJhY2spLmF0dHIoeyBzdHJva2U6ICcjQ0NDJywgZmlsbDogJyM4ODgnIH0pO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UucHVzaChwYXRoKTtcclxuXHJcblx0XHRpZiAoISFsYXlvdXQub3B0aW9ucy5TaG93RW5kcG9pbnRzKSB7XHJcblx0XHRcdHZhciBlbmRwb2ludHMgPSB0aGlzLmdldEVuZHBvaW50cyh0cnVlKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR0aGlzLmltYWdlLnB1c2godGhpcy5vcHRpb25zLnAuY2lyY2xlKGVuZHBvaW50c1tpXS5keCwgZW5kcG9pbnRzW2ldLmR5IC0gNiAqIE1hdGguc2lnbihlbmRwb2ludHNbaV0uZHkpIC8gMiwgMilcclxuXHRcdFx0XHRcdC5hdHRyKHsgXCJzdHJva2VcIjogXCIjZmZmXCIsIFwiZmlsbFwiOiBcIiNhYWFcIiB9KSk7XHJcblx0XHRcdFx0dGhpcy5pbWFnZS5wdXNoKHRoaXMub3B0aW9ucy5wLnRleHQoZW5kcG9pbnRzW2ldLmR4LCBlbmRwb2ludHNbaV0uZHkgLSAyNSAqIE1hdGguc2lnbihlbmRwb2ludHNbaV0uZHkpIC8gMiwgaSlcclxuXHRcdFx0XHRcdC50cmFuc2Zvcm0oW1wiclwiLCAtdGhpcy5vcHRpb25zLnJdKVxyXG5cdFx0XHRcdFx0LmF0dHIoeyBcImZpbGxcIjogXCIjZmZmXCIsIFwiZm9udC1zaXplXCI6IDE2IH0pKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVUbygpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRFbmRwb2ludHM6IGZ1bmN0aW9uIChub3RyYW5zZm9ybSkge1xyXG4gICAgICAgIHZhciBlbmRwb2ludHMgPSBbXHJcbiAgICAgICAgICAgIHsgcjogMCwgZHg6IDAsIGR5OiB0aGlzLm9wdGlvbnMubCAqIElOQ0hfVE9fUElYRUwgLyAyIH0sXHJcbiAgICAgICAgICAgIHsgcjogMTgwLCBkeDogMCwgZHk6IC10aGlzLm9wdGlvbnMubCAqIElOQ0hfVE9fUElYRUwgLyAyIH1cclxuICAgICAgICBdO1xyXG5cclxuXHRcdGlmICghIW5vdHJhbnNmb3JtKVxyXG5cdFx0XHRyZXR1cm4gZW5kcG9pbnRzO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9zdXBlcihlbmRwb2ludHMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZ2V0U3RyYWlnaHRUcmFja1BhdGg6IGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuXHRcdHBhdGgucHVzaChbXCJNXCIsIC1UUkFDS19XSURUSCAvIDIsIGwgLyAyXSk7XHJcbiAgICAgICAgcGF0aC5wdXNoKFtcImxcIiwgMCwgLWxdKTtcclxuXHRcdHBhdGgucHVzaChbdGhpcy5vcHRpb25zLmNvbm5lY3Rpb25zWzFdID09IHVuZGVmaW5lZCA/IFwibFwiIDogXCJsXCIsIFRSQUNLX1dJRFRILCAwXSk7XHJcbiAgICAgICAgcGF0aC5wdXNoKFtcImxcIiwgMCwgbF0pO1xyXG5cdFx0cGF0aC5wdXNoKFt0aGlzLm9wdGlvbnMuY29ubmVjdGlvbnNbMF0gPT0gdW5kZWZpbmVkID8gXCJsXCIgOiBcImxcIiwgLVRSQUNLX1dJRFRILCAwXSk7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmNvbm5lY3Rpb25zWzBdID09IHVuZGVmaW5lZClcclxuXHRcdFx0cGF0aC5wdXNoKFtcInpcIl0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH0sXHJcblxyXG4gICAgdG9KU09OOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgX3R5cGU6IFwiU3RyYWlnaHRUcmFja1wiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnNcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuU3RyYWlnaHRUcmFjay5mcm9tSlNPTiA9IGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICBpZiAoanNvbi5fdHlwZSAhPSBcIlN0cmFpZ2h0VHJhY2tcIilcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIHJldHVybiBuZXcgU3RyYWlnaHRUcmFjayhqc29uLm9wdGlvbnMpO1xyXG59XHJcblxyXG5nbG9iYWwuU3RyYWlnaHRUcmFjayA9IFN0cmFpZ2h0VHJhY2s7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIHZhciBpbml0aWFsaXppbmcgPSBmYWxzZSwgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcclxuXHJcbiAgLy8gVGhlIGJhc2UgQ2xhc3MgaW1wbGVtZW50YXRpb24gKGRvZXMgbm90aGluZylcclxuICB0aGlzLkNsYXNzID0gZnVuY3Rpb24oKXt9O1xyXG5cclxuICAvLyBDcmVhdGUgYSBuZXcgQ2xhc3MgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgY2xhc3NcclxuICBDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihjbGFzc05hbWUsIHByb3ApIHtcclxuICAgIGlmKHByb3AgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcHJvcCA9IGNsYXNzTmFtZTtcclxuICAgICAgIGNsYXNzTmFtZSA9IFwiQ2xhc3NcIjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgX3N1cGVyID0gdGhpcy5wcm90b3R5cGU7XHJcblxyXG4gICAgLy8gSW5zdGFudGlhdGUgYSBiYXNlIGNsYXNzIChidXQgb25seSBjcmVhdGUgdGhlIGluc3RhbmNlLFxyXG4gICAgLy8gZG9uJ3QgcnVuIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxyXG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcclxuICAgIHZhciBwcm90b3R5cGUgPSBuZXcgdGhpcygpO1xyXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcclxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcCkge1xyXG4gICAgICAvLyBDaGVjayBpZiB3ZSdyZSBvdmVyd3JpdGluZyBhbiBleGlzdGluZyBmdW5jdGlvblxyXG4gICAgICBwcm90b3R5cGVbbmFtZV0gPSB0eXBlb2YgcHJvcFtuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiZcclxuICAgICAgICB0eXBlb2YgX3N1cGVyW25hbWVdID09IFwiZnVuY3Rpb25cIiAmJiBmblRlc3QudGVzdChwcm9wW25hbWVdKSA/XHJcbiAgICAgICAgKGZ1bmN0aW9uKG5hbWUsIGZuKXtcclxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGEgbmV3IC5fc3VwZXIoKSBtZXRob2QgdGhhdCBpcyB0aGUgc2FtZSBtZXRob2RcclxuICAgICAgICAgICAgLy8gYnV0IG9uIHRoZSBzdXBlci1jbGFzc1xyXG4gICAgICAgICAgICB0aGlzLl9zdXBlciA9IF9zdXBlcltuYW1lXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtZXRob2Qgb25seSBuZWVkIHRvIGJlIGJvdW5kIHRlbXBvcmFyaWx5LCBzbyB3ZVxyXG4gICAgICAgICAgICAvLyByZW1vdmUgaXQgd2hlbiB3ZSdyZSBkb25lIGV4ZWN1dGluZ1xyXG4gICAgICAgICAgICB2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSB0bXA7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9KShuYW1lLCBwcm9wW25hbWVdKSA6XHJcbiAgICAgICAgcHJvcFtuYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgZHVtbXkgY2xhc3MgY29uc3RydWN0b3JcclxuICAgIGZ1bmN0aW9uIENsYXNzKCkge1xyXG4gICAgICAvLyBBbGwgY29uc3RydWN0aW9uIGlzIGFjdHVhbGx5IGRvbmUgaW4gdGhlIGluaXQgbWV0aG9kXHJcbiAgICAgIGlmICggIWluaXRpYWxpemluZyAmJiB0aGlzLmluaXQgKVxyXG4gICAgICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvcHVsYXRlIG91ciBjb25zdHJ1Y3RlZCBwcm90b3R5cGUgb2JqZWN0XHJcbiAgICBDbGFzcy5wcm90b3R5cGUgPSBwcm90b3R5cGU7XHJcblxyXG4gICAgLy8gRW5mb3JjZSB0aGUgY29uc3RydWN0b3IgdG8gYmUgd2hhdCB3ZSBleHBlY3RcclxuICAgIHZhciBmdW5jID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgIFwicmV0dXJuIGZ1bmN0aW9uIFwiICsgY2xhc3NOYW1lICsgXCIoKXsgfVwiXHJcbiAgICApKCk7XHJcbiAgICBDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBmdW5jO1xyXG5cclxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxyXG4gICAgQ2xhc3MuZXh0ZW5kID0gYXJndW1lbnRzLmNhbGxlZTtcclxuXHJcbiAgICByZXR1cm4gQ2xhc3M7XHJcbiAgfTtcclxuXHJcbiAgLy9JIG9ubHkgYWRkZWQgdGhpcyBsaW5lXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBDbGFzcztcclxufSkoKTtcclxuIiwiLypcbiAgSlNPTi1TZXJpYWxpemUuanMgMS4xLjNcbiAgKGMpIDIwMTEsIDIwMTIgS2V2aW4gTWFsYWtvZmYgLSBodHRwOi8va21hbGFrb2ZmLmdpdGh1Yi5jb20vanNvbi1zZXJpYWxpemUvXG4gIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4qL1xuKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAvLyBBTURcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICByZXR1cm4gZGVmaW5lKCdqc29uLXNlcmlhbGl6ZScsIGZhY3RvcnkpO1xuICAgIH1cbiAgICAvLyBDb21tb25KUy9Ob2RlSlMgb3IgTm8gTG9hZGVyXG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gZmFjdG9yeS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSkoZnVuY3Rpb24oKSB7Ly8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEwLjBcblxuLypcbiAgSlNPTi1TZXJpYWxpemUuanMgMS4xLjNcbiAgKGMpIDIwMTEsIDIwMTIgS2V2aW4gTWFsYWtvZmYgLSBodHRwOi8va21hbGFrb2ZmLmdpdGh1Yi5jb20vanNvbi1zZXJpYWxpemUvXG4gIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4gKi9cbnZhciBKU09OUywgaXNBcnJheSwgaXNFbXB0eSwga2V5UGF0aCwgcm9vdCwgc3RyaW5nSGFzSVNPODYwMURhdGVTaWduYXR1cmU7XG5cbnJvb3QgPSB0aGlzO1xuXG5KU09OUyA9IHRoaXMuSlNPTlMgPSB0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzIDoge307XG5cbkpTT05TLlZFUlNJT04gPSBcIjEuMS4zXCI7XG5cbkpTT05TLlRZUEVfRklFTEQgPSBcIl90eXBlXCI7XG5cbkpTT05TLk5BTUVTUEFDRV9ST09UUyA9IFtyb290XTtcblxuaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5pc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBvYmouY29uc3RydWN0b3IgPT09IEFycmF5O1xufTtcblxuc3RyaW5nSGFzSVNPODYwMURhdGVTaWduYXR1cmUgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgcmV0dXJuIChzdHJpbmcubGVuZ3RoID49IDE5KSAmJiAoc3RyaW5nWzRdID09PSBcIi1cIikgJiYgKHN0cmluZ1s3XSA9PT0gXCItXCIpICYmIChzdHJpbmdbMTBdID09PSBcIlRcIikgJiYgKHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09IFwiWlwiKTtcbn07XG5cbmtleVBhdGggPSBmdW5jdGlvbihvYmplY3QsIGtleXBhdGgpIHtcbiAgdmFyIGN1cnJlbnRfb2JqZWN0LCBpLCBrZXksIGtleXBhdGhfY29tcG9uZW50cywgbDtcbiAga2V5cGF0aF9jb21wb25lbnRzID0ga2V5cGF0aC5zcGxpdChcIi5cIik7XG4gIGlmIChrZXlwYXRoX2NvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuICgob2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0KSAmJiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleXBhdGgpKSA/IG9iamVjdFtrZXlwYXRoXSA6IHZvaWQgMCk7XG4gIH1cbiAgY3VycmVudF9vYmplY3QgPSBvYmplY3Q7XG4gIGwgPSBrZXlwYXRoX2NvbXBvbmVudHMubGVuZ3RoO1xuICBmb3IgKGkgaW4ga2V5cGF0aF9jb21wb25lbnRzKSB7XG4gICAga2V5ID0ga2V5cGF0aF9jb21wb25lbnRzW2ldO1xuICAgIGtleSA9IGtleXBhdGhfY29tcG9uZW50c1tpXTtcbiAgICBpZiAoIShrZXkgaW4gY3VycmVudF9vYmplY3QpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKCsraSA9PT0gbCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRfb2JqZWN0W2tleV07XG4gICAgfVxuICAgIGN1cnJlbnRfb2JqZWN0ID0gY3VycmVudF9vYmplY3Rba2V5XTtcbiAgICBpZiAoIWN1cnJlbnRfb2JqZWN0IHx8ICghKGN1cnJlbnRfb2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0KSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuSlNPTlMuc2VyaWFsaXplID0gZnVuY3Rpb24ob2JqLCBvcHRpb25zKSB7XG4gIHZhciBqLCBrZXksIGxlbiwgcmVzdWx0LCB2YWx1ZTtcbiAgaWYgKCFvYmogfHwgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICBpZiAob2JqLnRvSlNPTikge1xuICAgIHJldHVybiBvYmoudG9KU09OKCk7XG4gIH1cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFsdWUgPSBvYmpbal07XG4gICAgICByZXN1bHQucHVzaChKU09OUy5zZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNFbXB0eShvYmopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0ge307XG4gICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgcmVzdWx0W2tleV0gPSBKU09OUy5zZXJpYWxpemUodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuSlNPTlMuZGVzZXJpYWxpemUgPSBmdW5jdGlvbihqc29uLCBvcHRpb25zKSB7XG4gIHZhciBjb25zdHJ1Y3Rvcl9vcl9yb290LCBkYXRlLCBlLCBlcnJvciwgaW5zdGFuY2UsIGosIGpzb25fYXNfSlNPTiwganNvbl90eXBlLCBrLCBrZXksIGxlbiwgbGVuMSwgbmFtZXNwYWNlX3Jvb3QsIHJlZiwgcmVzdWx0LCB0eXBlLCB2YWx1ZTtcbiAganNvbl90eXBlID0gdHlwZW9mIGpzb247XG4gIGlmIChqc29uX3R5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoanNvbi5sZW5ndGggJiYgKGpzb25bMF0gPT09IFwie1wiKSB8fCAoanNvblswXSA9PT0gXCJbXCIpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBqc29uX2FzX0pTT04gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICBpZiAoanNvbl9hc19KU09OKSB7XG4gICAgICAgICAganNvbiA9IGpzb25fYXNfSlNPTjtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgZSA9IGVycm9yO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIEpTT046IFwiICsganNvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghKG9wdGlvbnMgJiYgb3B0aW9ucy5za2lwX2RhdGVzKSAmJiBzdHJpbmdIYXNJU084NjAxRGF0ZVNpZ25hdHVyZShqc29uKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGpzb24pO1xuICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoICh1bmRlZmluZWQpIHt9XG4gICAgfVxuICB9XG4gIGlmICgoanNvbl90eXBlICE9PSBcIm9iamVjdFwiKSB8fCBpc0VtcHR5KGpzb24pKSB7XG4gICAgcmV0dXJuIGpzb247XG4gIH1cbiAgaWYgKGlzQXJyYXkoanNvbikpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBqc29uLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YWx1ZSA9IGpzb25bal07XG4gICAgICByZXN1bHQucHVzaChKU09OUy5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGVsc2UgaWYgKChvcHRpb25zICYmIG9wdGlvbnMuc2tpcF90eXBlX2ZpZWxkKSB8fCAhanNvbi5oYXNPd25Qcm9wZXJ0eShKU09OUy5UWVBFX0ZJRUxEKSkge1xuICAgIHJlc3VsdCA9IHt9O1xuICAgIGZvciAoa2V5IGluIGpzb24pIHtcbiAgICAgIHZhbHVlID0ganNvbltrZXldO1xuICAgICAgcmVzdWx0W2tleV0gPSBKU09OUy5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSB7XG4gICAgdHlwZSA9IGpzb25bSlNPTlMuVFlQRV9GSUVMRF07XG4gICAgcmVmID0gSlNPTlMuTkFNRVNQQUNFX1JPT1RTO1xuICAgIGZvciAoayA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBuYW1lc3BhY2Vfcm9vdCA9IHJlZltrXTtcbiAgICAgIGNvbnN0cnVjdG9yX29yX3Jvb3QgPSBrZXlQYXRoKG5hbWVzcGFjZV9yb290LCB0eXBlKTtcbiAgICAgIGlmICghY29uc3RydWN0b3Jfb3Jfcm9vdCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJ1Y3Rvcl9vcl9yb290LmZyb21KU09OKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvcl9vcl9yb290LmZyb21KU09OKGpzb24pO1xuICAgICAgfSBlbHNlIGlmIChjb25zdHJ1Y3Rvcl9vcl9yb290LnByb3RvdHlwZSAmJiBjb25zdHJ1Y3Rvcl9vcl9yb290LnByb3RvdHlwZS5wYXJzZSkge1xuICAgICAgICBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3Rvcl9vcl9yb290KCk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5zZXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2Uuc2V0KGluc3RhbmNlLnBhcnNlKGpzb24pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2UucGFyc2UoanNvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuOyByZXR1cm4gSlNPTlM7fSk7XG59KS5jYWxsKHRoaXMpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiLyogZ2xvYmFsIEN1cnZlVHJhY2sgKi9cclxuLyogZ2xvYmFsIGRiICovXHJcbi8qIGdsb2JhbCBTdHJhaWdodFRyYWNrICovXHJcbnJlcXVpcmUoXCIuL3RyYWNrL3N0cmFpZ2h0VHJhY2tcIik7XHJcbnJlcXVpcmUoXCIuL3RyYWNrL2N1cnZlVHJhY2tcIik7XHJcblxyXG52YXIgLy9mcyA9IHJlcXVpcmUoJ2ZzJyksXHJcbiAgICAvL3htbDJqcyA9IHJlcXVpcmUoJ3htbDJqcycpLFxyXG4gICAgVHJhY2sgPSByZXF1aXJlKFwiLi90cmFjay90cmFja1wiKSxcclxuICAgIENsYXNzID0gcmVxdWlyZShcImNsYXNzLmV4dGVuZFwiKSxcclxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCJleHRlbmRcIiksXHJcblx0anNvbiA9IHJlcXVpcmUoXCJqc29uLXNlcmlhbGl6ZVwiKTtcclxuXHJcbnZhciBMYXlvdXQgPSBDbGFzcy5leHRlbmQoJ0xheW91dCcsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChwYXBlcikge1xyXG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJhY2sgPSBbXTtcclxuXHRcdHRoaXMub3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIGlmIChwYXBlciA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRoaXMuTG9hZExheW91dCgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5wID0gcGFwZXI7XHJcbiAgICB9LFxyXG5cclxuICAgIExvYWRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgZGIuZmluZE9uZSh7IFwidHlwZVwiOiBcInRyYWNrXCIgfSwgZnVuY3Rpb24gKGVyciwgZG9jcykge1xyXG4gICAgICAgICAgICBpZiAoZG9jcyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvYWRpbmcgZGVtbyB0cmFja3MgLi4uXCIpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5Mb2FkRGVtb1RyYWNrKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLl9sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblx0XHRkYi5maW5kT25lKHsgXCJ0eXBlXCI6IFwib3B0aW9uc1wiIH0sIGZ1bmN0aW9uIChlcnIsIGRvY3MpIHtcclxuXHRcdFx0dmFyIGRlZmF1dHMgPSB7XHJcblx0XHRcdFx0U2hvd0dyaWQ6IHRydWUsXHJcblx0XHRcdFx0U2hvd0R5bmFtaWNHcmlkOiBmYWxzZSxcclxuXHRcdFx0XHRTaG93RW5kcG9pbnRzOiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuICAgICAgICAgICAgaWYgKGRvY3MgPT0gbnVsbCkge1xyXG5cdFx0XHRcdGV4dGVuZChzZWxmLm9wdGlvbnMsIGRlZmF1dHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblx0fSxcclxuXHJcbiAgICBMb2FkRGVtb1RyYWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHQxID0gbmV3IFN0cmFpZ2h0VHJhY2sodGhpcy5wLCB7IHg6IDQwMCwgeTogMTAwLCByOiAzMCwgbDogMTAgfSksXHJcbiAgICAgICAgICAgIHQyID0gbmV3IFN0cmFpZ2h0VHJhY2sodGhpcy5wLCB7IGw6IDEwIH0pO1xyXG5cclxuICAgICAgICB0Mi5jb25uZWN0VG8odDEsIDAsIDEpO1xyXG4gICAgICAgIHRoaXMuQWRkVHJhY2sodDEpO1xyXG4gICAgICAgIHRoaXMuQWRkVHJhY2sodDIpO1xyXG5cclxuXHRcdHZhciB0X29sZCA9IHQyO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMTsgaSsrKSB7XHJcblx0XHRcdHZhciB0ID0gbmV3IEN1cnZlVHJhY2sodGhpcy5wLCB7IGQ6IDM2IH0pO1xyXG5cdFx0XHR0LmNvbm5lY3RUbyh0X29sZCk7XHJcblx0XHRcdHRoaXMuQWRkVHJhY2sodCk7XHJcblx0XHRcdHRfb2xkID0gdDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuICAgIEFkZFRyYWNrOiBmdW5jdGlvbiAodHJhY2spIHtcclxuICAgICAgICBpZiAoISh0cmFjayBpbnN0YW5jZW9mIFRyYWNrKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB0cmFjayBjbGFzcy5cIik7XHJcblxyXG4gICAgICAgIHRoaXMudHJhY2sucHVzaCh0cmFjayk7XHJcblx0XHR0cmFjay5pZCA9IHRoaXMudHJhY2suaW5kZXhPZih0cmFjayk7IFxyXG4gICAgfSxcclxuXHJcbiAgICBQYXJzZTogZnVuY3Rpb24gKHRleHQpIHtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqKiBDTElFTlQgRlVOQ1RJT05TICoqKi9cclxuICAgIENsaWVudFNob3dHcmlkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gLTEwMDAsXHJcbiAgICAgICAgICAgIGVuZCA9IDIwMDA7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSA1MCkge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wiTVwiLCBzdGFydCwgaV0pO1xyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wiTFwiLCBlbmQsIGldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDUwKSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChbXCJNXCIsIGksIHN0YXJ0XSk7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChbXCJMXCIsIGksIGVuZF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnAucGF0aChwYXRoKS5hdHRyKHsgXCJzdHJva2VcIjogXCIjQ0NDXCIsIFwic3Ryb2tlLXdpZHRoXCI6IDAuMiB9KTtcclxuICAgICAgICB0aGlzLnAucGF0aChbXCJNXCIsIDAsIHN0YXJ0LCBcIkxcIiwgMCwgZW5kLCBcIk1cIiwgc3RhcnQsIDAsIFwiTFwiLCBlbmQsIDBdKS5hdHRyKHsgXCJzdHJva2VcIjogXCIjQ0NDXCIsIFwic3Ryb2tlLXdpZHRoXCI6IDEgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIENsaWVudExvYWRMYXlvdXQ6IGZ1bmN0aW9uIChDbGllbnRMb2FkTGF5b3V0KSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICQuZ2V0KFwiL2FwaS9Mb2FkTGF5b3V0XCIsIGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG5cdFx0XHR2YXIgbGF5b3V0ID0ganNvbi5kZXNlcmlhbGl6ZShkYXRhKTtcclxuXHRcdFx0bGF5b3V0LnRyYWNrLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uc2V0UGFwZXIoc2VsZi5wKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGV4dGVuZChzZWxmLCBsYXlvdXQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEhQ2xpZW50TG9hZExheW91dClcclxuICAgICAgICAgICAgICAgIENsaWVudExvYWRMYXlvdXQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgQ2xpZW50RHJhdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vdGhpcy5pbWFnZS5wdXNoKHBhdGguZ2xvdyh7IGNvbG9yOiAnI0ZGRicsIHdpZHRoOiAyIH0pKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhY2subGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dGhpcy50cmFja1tpXS5kcmF3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHRcclxuXHRHZXRCQm94OiBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgeG1pbiA9IEluZmluaXR5LCB5bWluID0gSW5maW5pdHksIHhtYXggPSAtSW5maW5pdHksIHltYXggPSAtSW5maW5pdHk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYWNrLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBib3ggPSB0aGlzLnRyYWNrW2ldLmltYWdlLmdldEJCb3goKTtcclxuXHRcdFx0eG1pbiA9IE1hdGgubWluKGJveC54LCB4bWluKTtcclxuXHRcdFx0eW1pbiA9IE1hdGgubWluKGJveC55LCB5bWluKTtcclxuXHRcdFx0eG1heCA9IE1hdGgubWF4KGJveC54MiwgeG1heCk7XHJcblx0XHRcdHltYXggPSBNYXRoLm1heChib3gueTIsIHltYXgpO1xyXG4gICAgICAgIH1cclxuXHJcblx0XHRyZXR1cm4geyB4bWluOiB4bWluLCB5bWluOiB5bWluLCB4bWF4OiB4bWF4LCB5bWF4OiB5bWF4IH07XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0O1xyXG5cclxudmFyIGxvb3AgPSBbXSxcclxuXHR0cmFjayA9IHt9O1xyXG5cclxuZnVuY3Rpb24gZmluZFNlZ21lbnRCeUVuZHBvaW50KGlkKSB7XHJcblx0Zm9yICh2YXIgcGFydCBpbiB0cmFjay5sYXlvdXQucGFydHMucGFydCkge1xyXG5cdFx0Zm9yICh2YXIgZW5kIGluIHRyYWNrLmxheW91dC5wYXJ0cy5wYXJ0W3BhcnRdLmVuZHBvaW50TnJzLmVuZHBvaW50TnIpIHtcclxuXHRcdFx0aWYgKHRyYWNrLmxheW91dC5wYXJ0cy5wYXJ0W3BhcnRdLmVuZHBvaW50TnJzLmVuZHBvaW50TnJbZW5kXSA9PSBpZClcclxuXHRcdFx0XHRyZXR1cm4gcGFydDtcclxuXHRcdH07XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kTG9vcFJlY3Vyc2l2ZShpbnB1dCkge1xyXG5cdGlmIChsb29wLmxlbmd0aCA+IDMpIHtcclxuXHRcdGlmIChsb29wW2xvb3AubGVuZ3RoIC0gMV0uY29ubmVjdGlvbnMuaW5kZXhPZihsb29wWzBdLmlkKSA+IC0xKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiZm91bmQgbG9vcFwiLCBsb29wKTtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKGlucHV0Lmxlbmd0aCA9PSAwKVxyXG5cdFx0cmV0dXJuO1xyXG5cdGZvciAodmFyIGogPSAwOyBqIDwgbG9vcFtsb29wLmxlbmd0aCAtIDFdLmNvbm5lY3Rpb25zLmxlbmd0aDsgaisrKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJ0ZXN0aW5nXCIsIGxvb3BbbG9vcC5sZW5ndGggLSAxXS5jb25uZWN0aW9uc1tqXSwgaW5wdXRbaV0uaWQpO1xyXG5cdFx0XHRpZiAobG9vcFtsb29wLmxlbmd0aCAtIDFdLmNvbm5lY3Rpb25zW2pdID09IGlucHV0W2ldLmlkKSB7XHJcblx0XHRcdFx0bG9vcC5wdXNoKGlucHV0LnNwbGljZShpLCAxKVswXSk7XHJcblx0XHRcdFx0ZmluZExvb3BSZWN1cnNpdmUoaW5wdXQpO1xyXG5cdFx0XHRcdGlucHV0LnNwbGljZShpLCAwLCBsb29wLnBvcCgpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9pZiAobG9vcFtsb29wLmxlbmd0aC0xXS5pbmRleE9mKHNlZy5pZCkpXHJcblx0XHQvL1x0ZmluZExvb3BzKGlucHV0KTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRMb29wcyhpbnB1dCkge1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHRcdHZhciBpdGVtID0gaW5wdXQuc3BsaWNlKGksIDEpWzBdO1xyXG5cdFx0bG9vcFswXSA9IGl0ZW07XHJcblx0XHRmaW5kTG9vcFJlY3Vyc2l2ZShpbnB1dCk7XHJcblx0XHRpbnB1dC5zcGxpY2UoaSwgMSwgaXRlbSk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kQ29ubmVjdGVkTm9kZShpZCkge1xyXG5cdGZvciAodmFyIGNvbm4gaW4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb24pIHtcclxuXHRcdGlmICh0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MSA9PSBpZCkge1xyXG5cdFx0XHRyZXR1cm4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb25bY29ubl0uJC5lbmRwb2ludDI7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmICh0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MiA9PSBpZCkge1xyXG5cdFx0XHRyZXR1cm4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb25bY29ubl0uJC5lbmRwb2ludDE7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kU2VnbWVudHMoKSB7XHJcblx0dHJhY2subGF5b3V0LnBhcnRzLnBhcnQuZm9yRWFjaChmdW5jdGlvbiAocGFydCwgaW5kZXgpIHtcclxuXHRcdHZhciBzZWdtZW50ID0geyBpZDogaW5kZXgsIGNvbm5lY3Rpb25zOiBbXSB9O1xyXG5cdFx0cGFydC5lbmRwb2ludE5ycy5lbmRwb2ludE5yLmZvckVhY2goZnVuY3Rpb24gKGVuZCkge1xyXG5cdFx0XHR2YXIgY29ubmVjdGVkTm9kZSA9IGZpbmRDb25uZWN0ZWROb2RlKGVuZCk7XHJcblx0XHRcdGlmICghIWNvbm5lY3RlZE5vZGUpIHtcclxuXHRcdFx0XHR2YXIgY29ubiA9IGZpbmRTZWdtZW50QnlFbmRwb2ludChjb25uZWN0ZWROb2RlKTtcclxuXHRcdFx0XHRpZiAoISFjb25uKSB7XHJcblx0XHRcdFx0XHRzZWdtZW50LmNvbm5lY3Rpb25zLnB1c2goK2Nvbm4pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmaW5kIHBhcnRcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0c2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHR9KTtcclxuXHRmaW5kTG9vcHMoc2VnbWVudHMpO1xyXG59XHJcbiJdfQ==
