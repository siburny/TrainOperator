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
            p: paper
        };

        this.connections = [];
    },
    
    draw: function () {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath();
        /*
        var track = [];
        if(this.type == TRACK_TYPE.STRAIGHT) {
            track = _getStraightTrackPath(this.l*INCH_TO_PIXEL);
        } else if(this.type == TRACK_TYPE.CURVE) {
            track = _getCurveTrackPath(this.options.p*INCH_TO_PIXEL, 22.5);
        }
    	
        if(this.image == undefined)
            this.image = paper.set();
    
        var path = paper.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);
        //this.image.push(path.glow({ color: '#FFF', width: 2 }));
        */
    },
    
    getPath: function() {
        var set = this.options.p.set();
        set.push(this.options.p.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(this.options.p.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
    },

    moveTo: function (x, y, r) {
        /*this.options.x = x;
        this.options.y = y;
        this.image.transform(["t", x, y]);*/

        if (x != undefined && y != undefined && r != undefined) {
            this.options.x = x;
            this.options.y = y;
            this.options.r = r;
        }

        //this.image.transform(["t", this.options.x, this.options.y, "r", this.options.r, this.options.x, this.options.y]);
		this.image.translate(this.options.x, this.options.y);
        this.image.rotate(this.options.r, 0, 0);
    },

    getMatrix: function() {
        if(this.image != undefined && this.image[0] != undefined)
            return this.image[0].matrix;
        var m = new Matrix();
        m.translate(this.options.x, this.options.y);
        m.rotate(this.options.r, 0, 0);
        return m;
    },

    connectTo: function (track, number1, number2) {
        if (number1 == undefined)
            number1 = 0;
        if (number2 == undefined)
            number2 = 0;
            
        //this.options.r = track.options.r;
            
        var anchor1 = this.getEndpoints()[number1];
        var anchor2 = track.getEndpoints()[number2];
		
		this.options.r = track.options.r;
		if(anchor1.r + anchor2.r != 180) {
			this.options.r += 180 + anchor1.r - anchor2.r;
		}
		this.options.r %= 360;
		anchor1 = this.getEndpoints()[number1];
		//console.log(anchor1);
		//console.log(anchor2);
        
        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;
    },
    
    getEndpoints: function() {
        return null;
    }
});

function getEndpoints(r, a1, a2) {
	return [{ dx: r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2/2) * Math.PI / 180),
			 dy: r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2/2) * Math.PI / 180) }];
}

function _arcPath(r, a1, a2) {
	var dx = r * Math.cos(a1 * Math.PI / 180) - r * Math.cos((a1 + a2) * Math.PI / 180),
		dy = r * Math.sin(a1 * Math.PI / 180) - r * Math.sin((a1 + a2) * Math.PI / 180);

		
	return ["a", r, r, 0, 0, a2 > 0 ? 1 : 0, dx, dy];
}

function _getCurveTrackPath(r, a) {
	var anchor = getEndpoints(r, 0, a);
	var path = ["M", -anchor.dx, -anchor.dy];
	
	var arc1 = _arcPath(r, 0, a),
		arc_t = _arcPath(r - 20, 0, a),
		arc2 = _arcPath(r - 20, a, -a);

	path.push(arc1);
	path.push(["l", 20 + arc_t[arc_t.length - 2] - arc1[arc1.length - 2], arc_t[arc_t.length - 1] - arc1[arc1.length - 1]]);
	path.push(arc2);
	path.push(["l", -20, 0]);

	return path;
}

module.exports = Track;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../matrix":1,"Class.extend":3}],1:[function(require,module,exports){
function Matrix(a, b, c, d, e, f) {
    if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
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
/* global INCH_TO_PIXEL */
/* global TRACK_TYPE */
/* global TRACK_WIDTH */
/* global global */
var Class = require("Class.extend"),
    Track = require("./track"),
    extend = require("extend"),
    Matrix = require("../matrix");

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

    setPaper: function (p) {
        this.options.p = p;
    },

    draw: function () {
        if (this.image != undefined)
            this.image.clear();
        this.image = this.options.p.group();

        var track = this._getStraightTrackPath(this.options.l * INCH_TO_PIXEL);

        var path = this.options.p.path(track).attr({ stroke: '#CCC', fill: '#888' });
        this.image.push(path);

		var endpoints = this.getEndpoints(true);
		for (var i = 0; i < endpoints.length; i++) {
	        this.image.push(this.options.p.circle(endpoints[i].dx, endpoints[i].dy - 6 * Math.sign(endpoints[i].dy) / 2, 2)
				.attr({ "stroke": "#fff", "fill": "#aaa" }));
    	    this.image.push(this.options.p.text(endpoints[i].dx, endpoints[i].dy - 25 * Math.sign(endpoints[i].dy) / 2, i)
				.transform(["r", -this.options.r])
				.attr({ "fill": "#fff", "font-size": 16 }));
		}

        this.moveTo();
    },

    getEndpoints: function (notransform) {
        var endpoints = [
            { r: 0, dx: 0, dy: -this.options.l * INCH_TO_PIXEL / 2 },
            { r: 180, dx: 0, dy: this.options.l * INCH_TO_PIXEL / 2 }
        ];

		if(!!notransform)
			return endpoints;
		
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

    _getStraightTrackPath: function (l) {
        var path = [];
        if (true)
            path.push(["M", -TRACK_WIDTH / 2, l / 2]);
        path.push(["l", 0, -l]);
        if (true)
            path.push(["l", TRACK_WIDTH, 0]);
        path.push(["l", 0, l]);
        if (true)
            path.push(["l", -TRACK_WIDTH, 0]);
        if (true)
            path.push("z");

        return path;
    },

    toJSON: function () {
        return {
            _type: "StraightTrack",
            options: this.options
        }
    }
}, 'StraightTrack');

StraightTrack.fromJSON = function (json) {
    if (json._type != "StraightTrack")
        return null;
    return new StraightTrack(json.options);
}

global.StraightTrack = StraightTrack;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../matrix":1,"./track":"/classes\\track\\track.js","Class.extend":3,"extend":"extend"}],3:[function(require,module,exports){
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(className, prop) {
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

},{}],4:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],5:[function(require,module,exports){
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


},{}],"jsmix":[function(require,module,exports){
(function(){
    /**
     * JSMix Class
     * @param {Object|string} obj or JSON string data
     */
    function JSMix(data) {
        if(!(this instanceof JSMix)) {
            return new JSMix(data);
        }
        if ( !(data instanceof Object) ) {
            data = JSON.parse(data);
        }
        this.data = data || {};
    }
    
    /**
     * Method to map object prototype with a path in the data object
     * @param {prototype} prototype of the object to be mapped onto the data
     * @param {string} path to where the data objects are. Example: employees/*
     */
    JSMix.prototype.withObject = function(prototype, path) {
        if ( emptyPath(path) ) {
            this.data = mix(prototype, this.data);
        } else {
            this.data = mixRecursive(prototype, this.data, path.split('.'));
        }
        return this;
    }

    /**
     * Returns the mixed object
     */
    JSMix.prototype.build = function() {
        return this.data;
    }


    function mixRecursive(prototype, parent, parts) {
        var newParts = Array.from(parts);
        var currentPart = newParts.shift();
        if ( parts.length === 0 ) {
            return mix(prototype, parent);
        }
        if ( isObject(parent[currentPart]) || currentPart === '*') {
            if ( notArray(parent[currentPart]) && currentPart !== '*' ) {
                parent[currentPart] = mixRecursive(prototype, parent[currentPart], newParts);
            } else {
                if ( currentPart === '*' ) {
                    for (var property in parent) {
                        if (parent.hasOwnProperty(property)) {
                            parent[property] = mixRecursive(prototype, parent[property], newParts);
                        }
                    }
                } else {
                    if ( newParts[0] === '*' ) {
                        newParts.shift();
                    }
                    parent[currentPart].forEach( function (value, index) {
                        parent[currentPart][index] = mixRecursive(prototype, parent[currentPart][index], newParts);
                    });
                }
            }
        }
        return parent;
    }

        
    function mix(prototype, data) {
		var target;
		if(prototype == undefined && !!data._type)
			target = eval("new "+data._type+"()");
		else
			target = Object.create(prototype);
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                target[property] = data[property];
            }
        }
        return target;
    }
    
    function emptyPath(path) {
        if ( path === undefined || path === '' ) {
            return true;
        }
        return false;
    }
    
    function notArray(object) {
        if ( object instanceof Array ) {
            return false;
        }
        return true;
    }
    
    function isObject(input) {
        if ( input instanceof Object ) {
            return true;
        }
        return false;
    }

    // NodeJS
    if (typeof exports == "object" && typeof module == "object"){
        module.exports = JSMix;
    }
    // AMD (RequireJS)
    else if (typeof define == "function" && define.amd){
        return define([], JSMix);
    }
    // Global
    else{
        window.JSMix = JSMix;
    }    
    //Array.from polyfill from MDN
    
    // Production steps of ECMA-262, Edition 6, 22.1.2.1
    // Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
    if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
        };
    
        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
        // 1. Let C be the this value.
        var C = this;
    
        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);
    
        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
            throw new TypeError("Array.from requires an array-like object - not null or undefined");
        }
    
        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
            // 5. else      
            // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
            if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
    
            // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 2) {
            T = arguments[2];
            }
        }
    
        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);
    
        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);
    
        // 16. Let k be 0.
        var k = 0;
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;
        while (k < len) {
            kValue = items[k];
            if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            } else {
            A[k] = kValue;
            }
            k += 1;
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;
        // 20. Return A.
        return A;
        };
    }());
    }    

})();
},{}],"layout":[function(require,module,exports){
require("./track/straightTrack");

var //fs = require('fs'),
    //xml2js = require('xml2js'),
    Track = require("./track/track"),
    Class = require("class.extend"),
    extend = require("extend"),
    JSMix = require("jsmix"),
	json = require("json-serialize");

var Layout = Class.extend('Layout', {
    init: function (paper) {
        this._loaded = false;
        this.track = [];
        if(paper == undefined)
            this.LoadLayout();
        else
            this.p = paper;
    },
    
    LoadLayout: function() {
        var self = this;
        db.findOne({"type": "track"}, function(err, docs) {
            if(docs == null) {
                console.log("Loading demo tracks ...");
                self.LoadDemoTrack();
                self._loaded = true;
            }
        });
    },
    
    LoadDemoTrack: function() {
        var t1 = new StraightTrack(this.p, {x:100,y:100,r:30,l:10});
            t2 = new StraightTrack(this.p, {l:10}),
            t3 = new StraightTrack(this.p, {l:5});
            
        t2.connectTo(t1, 0, 1);
        t3.connectTo(t1, 0, 0);
        this.AddTrack(t1);
        this.AddTrack(t2);
        this.AddTrack(t3);
    },

    AddTrack: function (track) {
        if (!(track instanceof Track))
            throw new Error("Invalid track class.");

        this.track.push(track);
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
    
    ClientLoadLayout: function(ClientLoadLayout) {
        var self = this;
        $.get("/api/LoadLayout", function(data) {
            
            //var layout = JSMix(data).withObject(undefined, "*.*").build();
			var layout = json.deserialize(data);
			layout.track.forEach(function(item) {
                item.setPaper(self.p);
            });
            extend(self, layout);
            
            if(!!ClientLoadLayout)
                ClientLoadLayout();
        });
    },
    
    ClientDraw: function() {
        for(var i=0;i<this.track.length;i++) {
           this.track[i].draw();
        }
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

},{"./track/straightTrack":2,"./track/track":"/classes\\track\\track.js","class.extend":4,"extend":"extend","jsmix":"jsmix","json-serialize":5}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1VzZXJzL21heHIvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvdHJhY2svdHJhY2suanMiLCJjbGFzc2VzL21hdHJpeC5qcyIsImNsYXNzZXMvdHJhY2svc3RyYWlnaHRUcmFjay5qcyIsIm5vZGVfbW9kdWxlcy9DbGFzcy5leHRlbmQvbGliL2NsYXNzLmpzIiwibm9kZV9tb2R1bGVzL2pzb24tc2VyaWFsaXplL2pzb24tc2VyaWFsaXplLmpzIiwiZXh0ZW5kIiwianNtaXgiLCJjbGFzc2VzL2xheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgZ2xvYmFsICovXHJcbnZhciBDbGFzcyA9IHJlcXVpcmUoXCJDbGFzcy5leHRlbmRcIiksXHJcbiAgICBNYXRyaXggPSByZXF1aXJlKFwiLi4vbWF0cml4XCIpO1xyXG5cclxuLy8gR2xvYmFsIGNvbnN0YW50c1xyXG5nbG9iYWwuVFJBQ0tfVFlQRSA9IE9iamVjdC5mcmVlemUoe1xyXG5cdFNUUkFJR0hUOiAxLFxyXG5cdENVUlZFOiAyXHJcbn0pO1xyXG5nbG9iYWwuSU5DSF9UT19QSVhFTCA9IDIwO1xyXG5nbG9iYWwuVFJBQ0tfV0lEVEggPSAxICogZ2xvYmFsLklOQ0hfVE9fUElYRUw7XHJcblxyXG52YXIgVHJhY2sgPSBDbGFzcy5leHRlbmQoJ1RyYWNrJywge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKHBhcGVyKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgICAgICByOiAwLFxyXG4gICAgICAgICAgICBwOiBwYXBlclxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbWFnZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRoaXMuaW1hZ2UucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IHRoaXMuZ2V0UGF0aCgpO1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgdmFyIHRyYWNrID0gW107XHJcbiAgICAgICAgaWYodGhpcy50eXBlID09IFRSQUNLX1RZUEUuU1RSQUlHSFQpIHtcclxuICAgICAgICAgICAgdHJhY2sgPSBfZ2V0U3RyYWlnaHRUcmFja1BhdGgodGhpcy5sKklOQ0hfVE9fUElYRUwpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0aGlzLnR5cGUgPT0gVFJBQ0tfVFlQRS5DVVJWRSkge1xyXG4gICAgICAgICAgICB0cmFjayA9IF9nZXRDdXJ2ZVRyYWNrUGF0aCh0aGlzLm9wdGlvbnMucCpJTkNIX1RPX1BJWEVMLCAyMi41KTtcclxuICAgICAgICB9XHJcbiAgICBcdFxyXG4gICAgICAgIGlmKHRoaXMuaW1hZ2UgPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aGlzLmltYWdlID0gcGFwZXIuc2V0KCk7XHJcbiAgICBcclxuICAgICAgICB2YXIgcGF0aCA9IHBhcGVyLnBhdGgodHJhY2spLmF0dHIoeyBzdHJva2U6ICcjQ0NDJywgZmlsbDogJyM4ODgnIH0pO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UucHVzaChwYXRoKTtcclxuICAgICAgICAvL3RoaXMuaW1hZ2UucHVzaChwYXRoLmdsb3coeyBjb2xvcjogJyNGRkYnLCB3aWR0aDogMiB9KSk7XHJcbiAgICAgICAgKi9cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGdldFBhdGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZXQgPSB0aGlzLm9wdGlvbnMucC5zZXQoKTtcclxuICAgICAgICBzZXQucHVzaCh0aGlzLm9wdGlvbnMucC5jaXJjbGUoMCwgMCwgNSkuYXR0cih7IFwic3Ryb2tlXCI6IFwiI2ZmZlwiLCBcImZpbGxcIjogXCIjYWFhXCIgfSkpO1xyXG4gICAgICAgIHNldC5wdXNoKHRoaXMub3B0aW9ucy5wLnRleHQoMCwgLTIwLCBcIk1pc3NpbmcgaW1hZ2VcIikuYXR0cih7IFwiZmlsbFwiOiBcIiNhYWFcIiwgXCJmb250LXNpemVcIjogMTYgfSkpO1xyXG4gICAgICAgIHJldHVybiBzZXQ7XHJcbiAgICB9LFxyXG5cclxuICAgIG1vdmVUbzogZnVuY3Rpb24gKHgsIHksIHIpIHtcclxuICAgICAgICAvKnRoaXMub3B0aW9ucy54ID0geDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS50cmFuc2Zvcm0oW1widFwiLCB4LCB5XSk7Ki9cclxuXHJcbiAgICAgICAgaWYgKHggIT0gdW5kZWZpbmVkICYmIHkgIT0gdW5kZWZpbmVkICYmIHIgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy54ID0geDtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnkgPSB5O1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuciA9IHI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RoaXMuaW1hZ2UudHJhbnNmb3JtKFtcInRcIiwgdGhpcy5vcHRpb25zLngsIHRoaXMub3B0aW9ucy55LCBcInJcIiwgdGhpcy5vcHRpb25zLnIsIHRoaXMub3B0aW9ucy54LCB0aGlzLm9wdGlvbnMueV0pO1xyXG5cdFx0dGhpcy5pbWFnZS50cmFuc2xhdGUodGhpcy5vcHRpb25zLngsIHRoaXMub3B0aW9ucy55KTtcclxuICAgICAgICB0aGlzLmltYWdlLnJvdGF0ZSh0aGlzLm9wdGlvbnMuciwgMCwgMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE1hdHJpeDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYodGhpcy5pbWFnZSAhPSB1bmRlZmluZWQgJiYgdGhpcy5pbWFnZVswXSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmltYWdlWzBdLm1hdHJpeDtcclxuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgoKTtcclxuICAgICAgICBtLnRyYW5zbGF0ZSh0aGlzLm9wdGlvbnMueCwgdGhpcy5vcHRpb25zLnkpO1xyXG4gICAgICAgIG0ucm90YXRlKHRoaXMub3B0aW9ucy5yLCAwLCAwKTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH0sXHJcblxyXG4gICAgY29ubmVjdFRvOiBmdW5jdGlvbiAodHJhY2ssIG51bWJlcjEsIG51bWJlcjIpIHtcclxuICAgICAgICBpZiAobnVtYmVyMSA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIG51bWJlcjEgPSAwO1xyXG4gICAgICAgIGlmIChudW1iZXIyID09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgbnVtYmVyMiA9IDA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vdGhpcy5vcHRpb25zLnIgPSB0cmFjay5vcHRpb25zLnI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHZhciBhbmNob3IxID0gdGhpcy5nZXRFbmRwb2ludHMoKVtudW1iZXIxXTtcclxuICAgICAgICB2YXIgYW5jaG9yMiA9IHRyYWNrLmdldEVuZHBvaW50cygpW251bWJlcjJdO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9wdGlvbnMuciA9IHRyYWNrLm9wdGlvbnMucjtcclxuXHRcdGlmKGFuY2hvcjEuciArIGFuY2hvcjIuciAhPSAxODApIHtcclxuXHRcdFx0dGhpcy5vcHRpb25zLnIgKz0gMTgwICsgYW5jaG9yMS5yIC0gYW5jaG9yMi5yO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5vcHRpb25zLnIgJT0gMzYwO1xyXG5cdFx0YW5jaG9yMSA9IHRoaXMuZ2V0RW5kcG9pbnRzKClbbnVtYmVyMV07XHJcblx0XHQvL2NvbnNvbGUubG9nKGFuY2hvcjEpO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhhbmNob3IyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9wdGlvbnMueCA9IHRyYWNrLm9wdGlvbnMueCArIGFuY2hvcjIuZHggLSBhbmNob3IxLmR4O1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy55ID0gdHJhY2sub3B0aW9ucy55ICsgYW5jaG9yMi5keSAtIGFuY2hvcjEuZHk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBnZXRFbmRwb2ludHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGdldEVuZHBvaW50cyhyLCBhMSwgYTIpIHtcclxuXHRyZXR1cm4gW3sgZHg6IHIgKiBNYXRoLmNvcyhhMSAqIE1hdGguUEkgLyAxODApIC0gciAqIE1hdGguY29zKChhMSArIGEyLzIpICogTWF0aC5QSSAvIDE4MCksXHJcblx0XHRcdCBkeTogciAqIE1hdGguc2luKGExICogTWF0aC5QSSAvIDE4MCkgLSByICogTWF0aC5zaW4oKGExICsgYTIvMikgKiBNYXRoLlBJIC8gMTgwKSB9XTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2FyY1BhdGgociwgYTEsIGEyKSB7XHJcblx0dmFyIGR4ID0gciAqIE1hdGguY29zKGExICogTWF0aC5QSSAvIDE4MCkgLSByICogTWF0aC5jb3MoKGExICsgYTIpICogTWF0aC5QSSAvIDE4MCksXHJcblx0XHRkeSA9IHIgKiBNYXRoLnNpbihhMSAqIE1hdGguUEkgLyAxODApIC0gciAqIE1hdGguc2luKChhMSArIGEyKSAqIE1hdGguUEkgLyAxODApO1xyXG5cclxuXHRcdFxyXG5cdHJldHVybiBbXCJhXCIsIHIsIHIsIDAsIDAsIGEyID4gMCA/IDEgOiAwLCBkeCwgZHldO1xyXG59XHJcblxyXG5mdW5jdGlvbiBfZ2V0Q3VydmVUcmFja1BhdGgociwgYSkge1xyXG5cdHZhciBhbmNob3IgPSBnZXRFbmRwb2ludHMociwgMCwgYSk7XHJcblx0dmFyIHBhdGggPSBbXCJNXCIsIC1hbmNob3IuZHgsIC1hbmNob3IuZHldO1xyXG5cdFxyXG5cdHZhciBhcmMxID0gX2FyY1BhdGgociwgMCwgYSksXHJcblx0XHRhcmNfdCA9IF9hcmNQYXRoKHIgLSAyMCwgMCwgYSksXHJcblx0XHRhcmMyID0gX2FyY1BhdGgociAtIDIwLCBhLCAtYSk7XHJcblxyXG5cdHBhdGgucHVzaChhcmMxKTtcclxuXHRwYXRoLnB1c2goW1wibFwiLCAyMCArIGFyY190W2FyY190Lmxlbmd0aCAtIDJdIC0gYXJjMVthcmMxLmxlbmd0aCAtIDJdLCBhcmNfdFthcmNfdC5sZW5ndGggLSAxXSAtIGFyYzFbYXJjMS5sZW5ndGggLSAxXV0pO1xyXG5cdHBhdGgucHVzaChhcmMyKTtcclxuXHRwYXRoLnB1c2goW1wibFwiLCAtMjAsIDBdKTtcclxuXHJcblx0cmV0dXJuIHBhdGg7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJhY2s7XHJcbiIsImZ1bmN0aW9uIE1hdHJpeChhLCBiLCBjLCBkLCBlLCBmKSB7XHJcbiAgICBpZiAoYSAhPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5hID0gK2E7XHJcbiAgICAgICAgdGhpcy5iID0gK2I7XHJcbiAgICAgICAgdGhpcy5jID0gK2M7XHJcbiAgICAgICAgdGhpcy5kID0gK2Q7XHJcbiAgICAgICAgdGhpcy5lID0gK2U7XHJcbiAgICAgICAgdGhpcy5mID0gK2Y7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYSA9IDE7XHJcbiAgICAgICAgdGhpcy5iID0gMDtcclxuICAgICAgICB0aGlzLmMgPSAwO1xyXG4gICAgICAgIHRoaXMuZCA9IDE7XHJcbiAgICAgICAgdGhpcy5lID0gMDtcclxuICAgICAgICB0aGlzLmYgPSAwO1xyXG4gICAgfVxyXG59XHJcbihmdW5jdGlvbiAobWF0cml4cHJvdG8pIHtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5hZGRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIEFkZHMgZ2l2ZW4gbWF0cml4IHRvIGV4aXN0aW5nIG9uZS5cclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIGEgKG51bWJlcilcclxuICAgICAgICAtIGIgKG51bWJlcilcclxuICAgICAgICAtIGMgKG51bWJlcilcclxuICAgICAgICAtIGQgKG51bWJlcilcclxuICAgICAgICAtIGUgKG51bWJlcilcclxuICAgICAgICAtIGYgKG51bWJlcilcclxuICAgICAgICBvclxyXG4gICAgICAgIC0gbWF0cml4IChvYmplY3QpIEBNYXRyaXhcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLmFkZCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlLCBmKSB7XHJcbiAgICAgICAgdmFyIG91dCA9IFtbXSwgW10sIFtdXSxcclxuICAgICAgICAgICAgbSA9IFtbdGhpcy5hLCB0aGlzLmMsIHRoaXMuZV0sIFt0aGlzLmIsIHRoaXMuZCwgdGhpcy5mXSwgWzAsIDAsIDFdXSxcclxuICAgICAgICAgICAgbWF0cml4ID0gW1thLCBjLCBlXSwgW2IsIGQsIGZdLCBbMCwgMCwgMV1dLFxyXG4gICAgICAgICAgICB4LCB5LCB6LCByZXM7XHJcblxyXG4gICAgICAgIGlmIChhICYmIGEgaW5zdGFuY2VvZiBNYXRyaXgpIHtcclxuICAgICAgICAgICAgbWF0cml4ID0gW1thLmEsIGEuYywgYS5lXSwgW2EuYiwgYS5kLCBhLmZdLCBbMCwgMCwgMV1dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IDM7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgMzsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh6ID0gMDsgeiA8IDM7IHorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBtW3hdW3pdICogbWF0cml4W3pdW3ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0W3hdW3ldID0gcmVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYSA9IG91dFswXVswXTtcclxuICAgICAgICB0aGlzLmIgPSBvdXRbMV1bMF07XHJcbiAgICAgICAgdGhpcy5jID0gb3V0WzBdWzFdO1xyXG4gICAgICAgIHRoaXMuZCA9IG91dFsxXVsxXTtcclxuICAgICAgICB0aGlzLmUgPSBvdXRbMF1bMl07XHJcbiAgICAgICAgdGhpcy5mID0gb3V0WzFdWzJdO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5pbnZlcnRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJldHVybnMgaW52ZXJ0ZWQgdmVyc2lvbiBvZiB0aGUgbWF0cml4XHJcbiAgICAgICAgPSAob2JqZWN0KSBATWF0cml4XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5pbnZlcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAgICAgeCA9IG1lLmEgKiBtZS5kIC0gbWUuYiAqIG1lLmM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgobWUuZCAvIHgsIC1tZS5iIC8geCwgLW1lLmMgLyB4LCBtZS5hIC8geCwgKG1lLmMgKiBtZS5mIC0gbWUuZCAqIG1lLmUpIC8geCwgKG1lLmIgKiBtZS5lIC0gbWUuYSAqIG1lLmYpIC8geCk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LmNsb25lXHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm5zIGNvcHkgb2YgdGhlIG1hdHJpeFxyXG4gICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgodGhpcy5hLCB0aGlzLmIsIHRoaXMuYywgdGhpcy5kLCB0aGlzLmUsIHRoaXMuZik7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnRyYW5zbGF0ZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogVHJhbnNsYXRlIHRoZSBtYXRyaXhcclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIHggKG51bWJlcilcclxuICAgICAgICAtIHkgKG51bWJlcilcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgICAgdGhpcy5hZGQoMSwgMCwgMCwgMSwgeCwgeSk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnNjYWxlXHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBTY2FsZXMgdGhlIG1hdHJpeFxyXG4gICAgICAgID4gUGFyYW1ldGVyc1xyXG4gICAgICAgIC0geCAobnVtYmVyKVxyXG4gICAgICAgIC0geSAobnVtYmVyKSAjb3B0aW9uYWxcclxuICAgICAgICAtIGN4IChudW1iZXIpICNvcHRpb25hbFxyXG4gICAgICAgIC0gY3kgKG51bWJlcikgI29wdGlvbmFsXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5zY2FsZSA9IGZ1bmN0aW9uICh4LCB5LCBjeCwgY3kpIHtcclxuICAgICAgICB5ID09IG51bGwgJiYgKHkgPSB4KTtcclxuICAgICAgICAoY3ggfHwgY3kpICYmIHRoaXMuYWRkKDEsIDAsIDAsIDEsIGN4LCBjeSk7XHJcbiAgICAgICAgdGhpcy5hZGQoeCwgMCwgMCwgeSwgMCwgMCk7XHJcbiAgICAgICAgKGN4IHx8IGN5KSAmJiB0aGlzLmFkZCgxLCAwLCAwLCAxLCAtY3gsIC1jeSk7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnJvdGF0ZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUm90YXRlcyB0aGUgbWF0cml4XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSBhIChudW1iZXIpXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5yb3RhdGUgPSBmdW5jdGlvbiAoYSwgeCwgeSkge1xyXG4gICAgICAgIGEgPSBSLnJhZChhKTtcclxuICAgICAgICB4ID0geCB8fCAwO1xyXG4gICAgICAgIHkgPSB5IHx8IDA7XHJcbiAgICAgICAgdmFyIGNvcyA9ICttYXRoLmNvcyhhKS50b0ZpeGVkKDkpLFxyXG4gICAgICAgICAgICBzaW4gPSArbWF0aC5zaW4oYSkudG9GaXhlZCg5KTtcclxuICAgICAgICB0aGlzLmFkZChjb3MsIHNpbiwgLXNpbiwgY29zLCB4LCB5KTtcclxuICAgICAgICB0aGlzLmFkZCgxLCAwLCAwLCAxLCAteCwgLXkpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC54XHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm4geCBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC55XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICAgICAgPSAobnVtYmVyKSB4XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by54ID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgICAgICByZXR1cm4geCAqIHRoaXMuYSArIHkgKiB0aGlzLmMgKyB0aGlzLmU7XHJcbiAgICB9O1xyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnlcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJldHVybiB5IGNvb3JkaW5hdGUgZm9yIGdpdmVuIHBvaW50IGFmdGVyIHRyYW5zZm9ybWF0aW9uIGRlc2NyaWJlZCBieSB0aGUgbWF0cml4LiBTZWUgYWxzbyBATWF0cml4LnhcclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIHggKG51bWJlcilcclxuICAgICAgICAtIHkgKG51bWJlcilcclxuICAgICAgICA9IChudW1iZXIpIHlcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnkgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG4gICAgICAgIHJldHVybiB4ICogdGhpcy5iICsgeSAqIHRoaXMuZCArIHRoaXMuZjtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by5nZXQgPSBmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgIHJldHVybiArdGhpc1tTdHIuZnJvbUNoYXJDb2RlKDk3ICsgaSldLnRvRml4ZWQoNCk7XHJcbiAgICB9O1xyXG4gICAgbWF0cml4cHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFIuc3ZnID9cclxuICAgICAgICAgICAgXCJtYXRyaXgoXCIgKyBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMyksIHRoaXMuZ2V0KDQpLCB0aGlzLmdldCg1KV0uam9pbigpICsgXCIpXCIgOlxyXG4gICAgICAgICAgICBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMyksIDAsIDBdLmpvaW4oKTtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by50b0ZpbHRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuTWF0cml4KE0xMT1cIiArIHRoaXMuZ2V0KDApICtcclxuICAgICAgICAgICAgXCIsIE0xMj1cIiArIHRoaXMuZ2V0KDIpICsgXCIsIE0yMT1cIiArIHRoaXMuZ2V0KDEpICsgXCIsIE0yMj1cIiArIHRoaXMuZ2V0KDMpICtcclxuICAgICAgICAgICAgXCIsIER4PVwiICsgdGhpcy5nZXQoNCkgKyBcIiwgRHk9XCIgKyB0aGlzLmdldCg1KSArIFwiLCBzaXppbmdtZXRob2Q9J2F1dG8gZXhwYW5kJylcIjtcclxuICAgIH07XHJcbiAgICBtYXRyaXhwcm90by5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFt0aGlzLmUudG9GaXhlZCg0KSwgdGhpcy5mLnRvRml4ZWQoNCldO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIG5vcm0oYSkge1xyXG4gICAgICAgIHJldHVybiBhWzBdICogYVswXSArIGFbMV0gKiBhWzFdO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKGEpIHtcclxuICAgICAgICB2YXIgbWFnID0gbWF0aC5zcXJ0KG5vcm0oYSkpO1xyXG4gICAgICAgIGFbMF0gJiYgKGFbMF0gLz0gbWFnKTtcclxuICAgICAgICBhWzFdICYmIChhWzFdIC89IG1hZyk7XHJcbiAgICB9XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXguc3BsaXRcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFNwbGl0cyBtYXRyaXggaW50byBwcmltaXRpdmUgdHJhbnNmb3JtYXRpb25zXHJcbiAgICAgICAgPSAob2JqZWN0KSBpbiBmb3JtYXQ6XHJcbiAgICAgICAgbyBkeCAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB4XHJcbiAgICAgICAgbyBkeSAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB5XHJcbiAgICAgICAgbyBzY2FsZXggKG51bWJlcikgc2NhbGUgYnkgeFxyXG4gICAgICAgIG8gc2NhbGV5IChudW1iZXIpIHNjYWxlIGJ5IHlcclxuICAgICAgICBvIHNoZWFyIChudW1iZXIpIHNoZWFyXHJcbiAgICAgICAgbyByb3RhdGUgKG51bWJlcikgcm90YXRpb24gaW4gZGVnXHJcbiAgICAgICAgbyBpc1NpbXBsZSAoYm9vbGVhbikgY291bGQgaXQgYmUgcmVwcmVzZW50ZWQgdmlhIHNpbXBsZSB0cmFuc2Zvcm1hdGlvbnNcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnNwbGl0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvdXQgPSB7fTtcclxuICAgICAgICAvLyB0cmFuc2xhdGlvblxyXG4gICAgICAgIG91dC5keCA9IHRoaXMuZTtcclxuICAgICAgICBvdXQuZHkgPSB0aGlzLmY7XHJcblxyXG4gICAgICAgIC8vIHNjYWxlIGFuZCBzaGVhclxyXG4gICAgICAgIHZhciByb3cgPSBbW3RoaXMuYSwgdGhpcy5jXSwgW3RoaXMuYiwgdGhpcy5kXV07XHJcbiAgICAgICAgb3V0LnNjYWxleCA9IG1hdGguc3FydChub3JtKHJvd1swXSkpO1xyXG4gICAgICAgIG5vcm1hbGl6ZShyb3dbMF0pO1xyXG5cclxuICAgICAgICBvdXQuc2hlYXIgPSByb3dbMF1bMF0gKiByb3dbMV1bMF0gKyByb3dbMF1bMV0gKiByb3dbMV1bMV07XHJcbiAgICAgICAgcm93WzFdID0gW3Jvd1sxXVswXSAtIHJvd1swXVswXSAqIG91dC5zaGVhciwgcm93WzFdWzFdIC0gcm93WzBdWzFdICogb3V0LnNoZWFyXTtcclxuXHJcbiAgICAgICAgb3V0LnNjYWxleSA9IG1hdGguc3FydChub3JtKHJvd1sxXSkpO1xyXG4gICAgICAgIG5vcm1hbGl6ZShyb3dbMV0pO1xyXG4gICAgICAgIG91dC5zaGVhciAvPSBvdXQuc2NhbGV5O1xyXG5cclxuICAgICAgICAvLyByb3RhdGlvblxyXG4gICAgICAgIHZhciBzaW4gPSAtcm93WzBdWzFdLFxyXG4gICAgICAgICAgICBjb3MgPSByb3dbMV1bMV07XHJcbiAgICAgICAgaWYgKGNvcyA8IDApIHtcclxuICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYWNvcyhjb3MpKTtcclxuICAgICAgICAgICAgaWYgKHNpbiA8IDApIHtcclxuICAgICAgICAgICAgICAgIG91dC5yb3RhdGUgPSAzNjAgLSBvdXQucm90YXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYXNpbihzaW4pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dC5pc1NpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgKG91dC5zY2FsZXgudG9GaXhlZCg5KSA9PSBvdXQuc2NhbGV5LnRvRml4ZWQoOSkgfHwgIW91dC5yb3RhdGUpO1xyXG4gICAgICAgIG91dC5pc1N1cGVyU2ltcGxlID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiBvdXQuc2NhbGV4LnRvRml4ZWQoOSkgPT0gb3V0LnNjYWxleS50b0ZpeGVkKDkpICYmICFvdXQucm90YXRlO1xyXG4gICAgICAgIG91dC5ub1JvdGF0aW9uID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC50b1RyYW5zZm9ybVN0cmluZ1xyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUmV0dXJuIHRyYW5zZm9ybSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGdpdmVuIG1hdHJpeFxyXG4gICAgICAgID0gKHN0cmluZykgdHJhbnNmb3JtIHN0cmluZ1xyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8udG9UcmFuc2Zvcm1TdHJpbmcgPSBmdW5jdGlvbiAoc2hvcnRlcikge1xyXG4gICAgICAgIHZhciBzID0gc2hvcnRlciB8fCB0aGlzW3NwbGl0XSgpO1xyXG4gICAgICAgIGlmIChzLmlzU2ltcGxlKSB7XHJcbiAgICAgICAgICAgIHMuc2NhbGV4ID0gK3Muc2NhbGV4LnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHMuc2NhbGV5ID0gK3Muc2NhbGV5LnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHMucm90YXRlID0gK3Mucm90YXRlLnRvRml4ZWQoNCk7XHJcbiAgICAgICAgICAgIHJldHVybiAgKHMuZHggfHwgcy5keSA/IFwidFwiICsgW3MuZHgsIHMuZHldIDogRSkgK1xyXG4gICAgICAgICAgICAgICAgICAgIChzLnNjYWxleCAhPSAxIHx8IHMuc2NhbGV5ICE9IDEgPyBcInNcIiArIFtzLnNjYWxleCwgcy5zY2FsZXksIDAsIDBdIDogRSkgK1xyXG4gICAgICAgICAgICAgICAgICAgIChzLnJvdGF0ZSA/IFwiclwiICsgW3Mucm90YXRlLCAwLCAwXSA6IEUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIm1cIiArIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgzKSwgdGhpcy5nZXQoNCksIHRoaXMuZ2V0KDUpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KShNYXRyaXgucHJvdG90eXBlKTtcclxuXHJcbnZhciBtYXRoID0gTWF0aCxcclxuICAgIG1tYXggPSBtYXRoLm1heCxcclxuICAgIG1taW4gPSBtYXRoLm1pbixcclxuICAgIGFicyA9IG1hdGguYWJzLFxyXG4gICAgcG93ID0gbWF0aC5wb3csXHJcbiAgICBQSSA9IG1hdGguUEk7XHJcblxyXG5mdW5jdGlvbiBSKCkge1xyXG59XHJcbi8qXFxcclxuICAgICogUmFwaGFlbC5yYWRcclxuICAgIFsgbWV0aG9kIF1cclxuICAgICoqXHJcbiAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byByYWRpYW5zXHJcbiAgICA+IFBhcmFtZXRlcnNcclxuICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcclxuICAgID0gKG51bWJlcikgYW5nbGUgaW4gcmFkaWFucy5cclxuXFwqL1xyXG5SLnJhZCA9IGZ1bmN0aW9uIChkZWcpIHtcclxuICAgIHJldHVybiBkZWcgJSAzNjAgKiBQSSAvIDE4MDtcclxufTtcclxuLypcXFxyXG4gICAgKiBSYXBoYWVsLmRlZ1xyXG4gICAgWyBtZXRob2QgXVxyXG4gICAgKipcclxuICAgICogVHJhbnNmb3JtIGFuZ2xlIHRvIGRlZ3JlZXNcclxuICAgID4gUGFyYW1ldGVyc1xyXG4gICAgLSByYWQgKG51bWJlcikgYW5nbGUgaW4gcmFkaWFuc1xyXG4gICAgPSAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzLlxyXG5cXCovXHJcblIuZGVnID0gZnVuY3Rpb24gKHJhZCkge1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQgKChyYWQgKiAxODAgLyBQSSUgMzYwKSogMTAwMCkgLyAxMDAwO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWF0cml4OyIsIi8qIGdsb2JhbCBJTkNIX1RPX1BJWEVMICovXHJcbi8qIGdsb2JhbCBUUkFDS19UWVBFICovXHJcbi8qIGdsb2JhbCBUUkFDS19XSURUSCAqL1xyXG4vKiBnbG9iYWwgZ2xvYmFsICovXHJcbnZhciBDbGFzcyA9IHJlcXVpcmUoXCJDbGFzcy5leHRlbmRcIiksXHJcbiAgICBUcmFjayA9IHJlcXVpcmUoXCIuL3RyYWNrXCIpLFxyXG4gICAgZXh0ZW5kID0gcmVxdWlyZShcImV4dGVuZFwiKSxcclxuICAgIE1hdHJpeCA9IHJlcXVpcmUoXCIuLi9tYXRyaXhcIik7XHJcblxyXG52YXIgU3RyYWlnaHRUcmFjayA9IFRyYWNrLmV4dGVuZCgnU3RyYWlnaHRUcmFjaycsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChwYXBlciwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gcGFwZXI7XHJcbiAgICAgICAgICAgIHBhcGVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdXBlcihwYXBlcik7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5sID0gMTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSBUUkFDS19UWVBFLlNUUkFJR0hUO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRQYXBlcjogZnVuY3Rpb24gKHApIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMucCA9IHA7XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbWFnZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRoaXMuaW1hZ2UuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmltYWdlID0gdGhpcy5vcHRpb25zLnAuZ3JvdXAoKTtcclxuXHJcbiAgICAgICAgdmFyIHRyYWNrID0gdGhpcy5fZ2V0U3RyYWlnaHRUcmFja1BhdGgodGhpcy5vcHRpb25zLmwgKiBJTkNIX1RPX1BJWEVMKTtcclxuXHJcbiAgICAgICAgdmFyIHBhdGggPSB0aGlzLm9wdGlvbnMucC5wYXRoKHRyYWNrKS5hdHRyKHsgc3Ryb2tlOiAnI0NDQycsIGZpbGw6ICcjODg4JyB9KTtcclxuICAgICAgICB0aGlzLmltYWdlLnB1c2gocGF0aCk7XHJcblxyXG5cdFx0dmFyIGVuZHBvaW50cyA9IHRoaXMuZ2V0RW5kcG9pbnRzKHRydWUpO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHQgICAgICAgIHRoaXMuaW1hZ2UucHVzaCh0aGlzLm9wdGlvbnMucC5jaXJjbGUoZW5kcG9pbnRzW2ldLmR4LCBlbmRwb2ludHNbaV0uZHkgLSA2ICogTWF0aC5zaWduKGVuZHBvaW50c1tpXS5keSkgLyAyLCAyKVxyXG5cdFx0XHRcdC5hdHRyKHsgXCJzdHJva2VcIjogXCIjZmZmXCIsIFwiZmlsbFwiOiBcIiNhYWFcIiB9KSk7XHJcbiAgICBcdCAgICB0aGlzLmltYWdlLnB1c2godGhpcy5vcHRpb25zLnAudGV4dChlbmRwb2ludHNbaV0uZHgsIGVuZHBvaW50c1tpXS5keSAtIDI1ICogTWF0aC5zaWduKGVuZHBvaW50c1tpXS5keSkgLyAyLCBpKVxyXG5cdFx0XHRcdC50cmFuc2Zvcm0oW1wiclwiLCAtdGhpcy5vcHRpb25zLnJdKVxyXG5cdFx0XHRcdC5hdHRyKHsgXCJmaWxsXCI6IFwiI2ZmZlwiLCBcImZvbnQtc2l6ZVwiOiAxNiB9KSk7XHJcblx0XHR9XHJcblxyXG4gICAgICAgIHRoaXMubW92ZVRvKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEVuZHBvaW50czogZnVuY3Rpb24gKG5vdHJhbnNmb3JtKSB7XHJcbiAgICAgICAgdmFyIGVuZHBvaW50cyA9IFtcclxuICAgICAgICAgICAgeyByOiAwLCBkeDogMCwgZHk6IC10aGlzLm9wdGlvbnMubCAqIElOQ0hfVE9fUElYRUwgLyAyIH0sXHJcbiAgICAgICAgICAgIHsgcjogMTgwLCBkeDogMCwgZHk6IHRoaXMub3B0aW9ucy5sICogSU5DSF9UT19QSVhFTCAvIDIgfVxyXG4gICAgICAgIF07XHJcblxyXG5cdFx0aWYoISFub3RyYW5zZm9ybSlcclxuXHRcdFx0cmV0dXJuIGVuZHBvaW50cztcclxuXHRcdFxyXG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeCgpO1xyXG4gICAgICAgIG0ucm90YXRlKHRoaXMub3B0aW9ucy5yLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdmFyIGUgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVuZHBvaW50cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgdCA9IGVuZHBvaW50c1tpXSxcclxuXHRcdFx0XHR4ID0gdC5keCxcclxuXHRcdFx0XHR5ID0gdC5keTtcclxuXHRcdFx0dC5keCA9IG0ueCh4LCB5KTtcclxuXHRcdFx0dC5keSA9IG0ueSh4LCB5KTtcclxuXHRcdFx0ZS5wdXNoKHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9LFxyXG5cclxuICAgIF9nZXRTdHJhaWdodFRyYWNrUGF0aDogZnVuY3Rpb24gKGwpIHtcclxuICAgICAgICB2YXIgcGF0aCA9IFtdO1xyXG4gICAgICAgIGlmICh0cnVlKVxyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wiTVwiLCAtVFJBQ0tfV0lEVEggLyAyLCBsIC8gMl0pO1xyXG4gICAgICAgIHBhdGgucHVzaChbXCJsXCIsIDAsIC1sXSk7XHJcbiAgICAgICAgaWYgKHRydWUpXHJcbiAgICAgICAgICAgIHBhdGgucHVzaChbXCJsXCIsIFRSQUNLX1dJRFRILCAwXSk7XHJcbiAgICAgICAgcGF0aC5wdXNoKFtcImxcIiwgMCwgbF0pO1xyXG4gICAgICAgIGlmICh0cnVlKVxyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wibFwiLCAtVFJBQ0tfV0lEVEgsIDBdKTtcclxuICAgICAgICBpZiAodHJ1ZSlcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFwielwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIF90eXBlOiBcIlN0cmFpZ2h0VHJhY2tcIixcclxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59LCAnU3RyYWlnaHRUcmFjaycpO1xyXG5cclxuU3RyYWlnaHRUcmFjay5mcm9tSlNPTiA9IGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICBpZiAoanNvbi5fdHlwZSAhPSBcIlN0cmFpZ2h0VHJhY2tcIilcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIHJldHVybiBuZXcgU3RyYWlnaHRUcmFjayhqc29uLm9wdGlvbnMpO1xyXG59XHJcblxyXG5nbG9iYWwuU3RyYWlnaHRUcmFjayA9IFN0cmFpZ2h0VHJhY2s7XHJcbiIsIihmdW5jdGlvbigpe1xyXG4gIHZhciBpbml0aWFsaXppbmcgPSBmYWxzZSwgZm5UZXN0ID0gL3h5ei8udGVzdChmdW5jdGlvbigpe3h5ejt9KSA/IC9cXGJfc3VwZXJcXGIvIDogLy4qLztcclxuIFxyXG4gIC8vIFRoZSBiYXNlIENsYXNzIGltcGxlbWVudGF0aW9uIChkb2VzIG5vdGhpbmcpXHJcbiAgdGhpcy5DbGFzcyA9IGZ1bmN0aW9uKCl7fTtcclxuIFxyXG4gIC8vIENyZWF0ZSBhIG5ldyBDbGFzcyB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBjbGFzc1xyXG4gIENsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgcHJvcCkge1xyXG4gICAgdmFyIF9zdXBlciA9IHRoaXMucHJvdG90eXBlO1xyXG4gICBcclxuICAgIC8vIEluc3RhbnRpYXRlIGEgYmFzZSBjbGFzcyAoYnV0IG9ubHkgY3JlYXRlIHRoZSBpbnN0YW5jZSxcclxuICAgIC8vIGRvbid0IHJ1biB0aGUgaW5pdCBjb25zdHJ1Y3RvcilcclxuICAgIGluaXRpYWxpemluZyA9IHRydWU7XHJcbiAgICB2YXIgcHJvdG90eXBlID0gbmV3IHRoaXMoKTsgXHJcbiAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuICAgXHJcbiAgICAvLyBDb3B5IHRoZSBwcm9wZXJ0aWVzIG92ZXIgb250byB0aGUgbmV3IHByb3RvdHlwZVxyXG4gICAgZm9yICh2YXIgbmFtZSBpbiBwcm9wKSB7XHJcbiAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIG92ZXJ3cml0aW5nIGFuIGV4aXN0aW5nIGZ1bmN0aW9uXHJcbiAgICAgIHByb3RvdHlwZVtuYW1lXSA9IHR5cGVvZiBwcm9wW25hbWVdID09IFwiZnVuY3Rpb25cIiAmJlxyXG4gICAgICAgIHR5cGVvZiBfc3VwZXJbbmFtZV0gPT0gXCJmdW5jdGlvblwiICYmIGZuVGVzdC50ZXN0KHByb3BbbmFtZV0pID9cclxuICAgICAgICAoZnVuY3Rpb24obmFtZSwgZm4pe1xyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgdG1wID0gdGhpcy5fc3VwZXI7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXHJcbiAgICAgICAgICAgIC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcclxuICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFRoZSBtZXRob2Qgb25seSBuZWVkIHRvIGJlIGJvdW5kIHRlbXBvcmFyaWx5LCBzbyB3ZVxyXG4gICAgICAgICAgICAvLyByZW1vdmUgaXQgd2hlbiB3ZSdyZSBkb25lIGV4ZWN1dGluZ1xyXG4gICAgICAgICAgICB2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLl9zdXBlciA9IHRtcDtcclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSkobmFtZSwgcHJvcFtuYW1lXSkgOlxyXG4gICAgICAgIHByb3BbbmFtZV07XHJcbiAgICB9XHJcbiAgIFxyXG4gICAgLy8gVGhlIGR1bW15IGNsYXNzIGNvbnN0cnVjdG9yXHJcbiAgICBmdW5jdGlvbiBDbGFzcygpIHtcclxuICAgICAgLy8gQWxsIGNvbnN0cnVjdGlvbiBpcyBhY3R1YWxseSBkb25lIGluIHRoZSBpbml0IG1ldGhvZFxyXG4gICAgICBpZiAoICFpbml0aWFsaXppbmcgJiYgdGhpcy5pbml0IClcclxuICAgICAgICB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxuICAgXHJcbiAgICAvLyBQb3B1bGF0ZSBvdXIgY29uc3RydWN0ZWQgcHJvdG90eXBlIG9iamVjdFxyXG4gICAgQ2xhc3MucHJvdG90eXBlID0gcHJvdG90eXBlO1xyXG4gICBcclxuICAgIC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XHJcblxyXG4gICAgdmFyIGZ1bmMgPSBuZXcgRnVuY3Rpb24oXHJcbiAgICAgICAgXCJyZXR1cm4gZnVuY3Rpb24gXCIgKyBjbGFzc05hbWUgKyBcIigpeyB9XCJcclxuICAgICkoKTtcclxuICAgIENsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGZ1bmM7XHJcbiBcclxuICAgIC8vIEFuZCBtYWtlIHRoaXMgY2xhc3MgZXh0ZW5kYWJsZVxyXG4gICAgQ2xhc3MuZXh0ZW5kID0gYXJndW1lbnRzLmNhbGxlZTtcclxuICAgXHJcbiAgICByZXR1cm4gQ2xhc3M7XHJcbiAgfTtcclxuXHJcbiAgLy9JIG9ubHkgYWRkZWQgdGhpcyBsaW5lXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBDbGFzcztcclxufSkoKTtcclxuIiwiLypcbiAgSlNPTi1TZXJpYWxpemUuanMgMS4xLjNcbiAgKGMpIDIwMTEsIDIwMTIgS2V2aW4gTWFsYWtvZmYgLSBodHRwOi8va21hbGFrb2ZmLmdpdGh1Yi5jb20vanNvbi1zZXJpYWxpemUvXG4gIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4qL1xuKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAvLyBBTURcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICByZXR1cm4gZGVmaW5lKCdqc29uLXNlcmlhbGl6ZScsIGZhY3RvcnkpO1xuICAgIH1cbiAgICAvLyBDb21tb25KUy9Ob2RlSlMgb3IgTm8gTG9hZGVyXG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gZmFjdG9yeS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSkoZnVuY3Rpb24oKSB7Ly8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEwLjBcblxuLypcbiAgSlNPTi1TZXJpYWxpemUuanMgMS4xLjNcbiAgKGMpIDIwMTEsIDIwMTIgS2V2aW4gTWFsYWtvZmYgLSBodHRwOi8va21hbGFrb2ZmLmdpdGh1Yi5jb20vanNvbi1zZXJpYWxpemUvXG4gIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG4gKi9cbnZhciBKU09OUywgaXNBcnJheSwgaXNFbXB0eSwga2V5UGF0aCwgcm9vdCwgc3RyaW5nSGFzSVNPODYwMURhdGVTaWduYXR1cmU7XG5cbnJvb3QgPSB0aGlzO1xuXG5KU09OUyA9IHRoaXMuSlNPTlMgPSB0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzIDoge307XG5cbkpTT05TLlZFUlNJT04gPSBcIjEuMS4zXCI7XG5cbkpTT05TLlRZUEVfRklFTEQgPSBcIl90eXBlXCI7XG5cbkpTT05TLk5BTUVTUEFDRV9ST09UUyA9IFtyb290XTtcblxuaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5pc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBvYmouY29uc3RydWN0b3IgPT09IEFycmF5O1xufTtcblxuc3RyaW5nSGFzSVNPODYwMURhdGVTaWduYXR1cmUgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgcmV0dXJuIChzdHJpbmcubGVuZ3RoID49IDE5KSAmJiAoc3RyaW5nWzRdID09PSBcIi1cIikgJiYgKHN0cmluZ1s3XSA9PT0gXCItXCIpICYmIChzdHJpbmdbMTBdID09PSBcIlRcIikgJiYgKHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09IFwiWlwiKTtcbn07XG5cbmtleVBhdGggPSBmdW5jdGlvbihvYmplY3QsIGtleXBhdGgpIHtcbiAgdmFyIGN1cnJlbnRfb2JqZWN0LCBpLCBrZXksIGtleXBhdGhfY29tcG9uZW50cywgbDtcbiAga2V5cGF0aF9jb21wb25lbnRzID0ga2V5cGF0aC5zcGxpdChcIi5cIik7XG4gIGlmIChrZXlwYXRoX2NvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuICgob2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0KSAmJiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleXBhdGgpKSA/IG9iamVjdFtrZXlwYXRoXSA6IHZvaWQgMCk7XG4gIH1cbiAgY3VycmVudF9vYmplY3QgPSBvYmplY3Q7XG4gIGwgPSBrZXlwYXRoX2NvbXBvbmVudHMubGVuZ3RoO1xuICBmb3IgKGkgaW4ga2V5cGF0aF9jb21wb25lbnRzKSB7XG4gICAga2V5ID0ga2V5cGF0aF9jb21wb25lbnRzW2ldO1xuICAgIGtleSA9IGtleXBhdGhfY29tcG9uZW50c1tpXTtcbiAgICBpZiAoIShrZXkgaW4gY3VycmVudF9vYmplY3QpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKCsraSA9PT0gbCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRfb2JqZWN0W2tleV07XG4gICAgfVxuICAgIGN1cnJlbnRfb2JqZWN0ID0gY3VycmVudF9vYmplY3Rba2V5XTtcbiAgICBpZiAoIWN1cnJlbnRfb2JqZWN0IHx8ICghKGN1cnJlbnRfb2JqZWN0IGluc3RhbmNlb2YgT2JqZWN0KSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuSlNPTlMuc2VyaWFsaXplID0gZnVuY3Rpb24ob2JqLCBvcHRpb25zKSB7XG4gIHZhciBqLCBrZXksIGxlbiwgcmVzdWx0LCB2YWx1ZTtcbiAgaWYgKCFvYmogfHwgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICBpZiAob2JqLnRvSlNPTikge1xuICAgIHJldHVybiBvYmoudG9KU09OKCk7XG4gIH1cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFsdWUgPSBvYmpbal07XG4gICAgICByZXN1bHQucHVzaChKU09OUy5zZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNFbXB0eShvYmopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0ge307XG4gICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgcmVzdWx0W2tleV0gPSBKU09OUy5zZXJpYWxpemUodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuSlNPTlMuZGVzZXJpYWxpemUgPSBmdW5jdGlvbihqc29uLCBvcHRpb25zKSB7XG4gIHZhciBjb25zdHJ1Y3Rvcl9vcl9yb290LCBkYXRlLCBlLCBlcnJvciwgaW5zdGFuY2UsIGosIGpzb25fYXNfSlNPTiwganNvbl90eXBlLCBrLCBrZXksIGxlbiwgbGVuMSwgbmFtZXNwYWNlX3Jvb3QsIHJlZiwgcmVzdWx0LCB0eXBlLCB2YWx1ZTtcbiAganNvbl90eXBlID0gdHlwZW9mIGpzb247XG4gIGlmIChqc29uX3R5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoanNvbi5sZW5ndGggJiYgKGpzb25bMF0gPT09IFwie1wiKSB8fCAoanNvblswXSA9PT0gXCJbXCIpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBqc29uX2FzX0pTT04gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICBpZiAoanNvbl9hc19KU09OKSB7XG4gICAgICAgICAganNvbiA9IGpzb25fYXNfSlNPTjtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgZSA9IGVycm9yO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIEpTT046IFwiICsganNvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghKG9wdGlvbnMgJiYgb3B0aW9ucy5za2lwX2RhdGVzKSAmJiBzdHJpbmdIYXNJU084NjAxRGF0ZVNpZ25hdHVyZShqc29uKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGpzb24pO1xuICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoICh1bmRlZmluZWQpIHt9XG4gICAgfVxuICB9XG4gIGlmICgoanNvbl90eXBlICE9PSBcIm9iamVjdFwiKSB8fCBpc0VtcHR5KGpzb24pKSB7XG4gICAgcmV0dXJuIGpzb247XG4gIH1cbiAgaWYgKGlzQXJyYXkoanNvbikpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBqc29uLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YWx1ZSA9IGpzb25bal07XG4gICAgICByZXN1bHQucHVzaChKU09OUy5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGVsc2UgaWYgKChvcHRpb25zICYmIG9wdGlvbnMuc2tpcF90eXBlX2ZpZWxkKSB8fCAhanNvbi5oYXNPd25Qcm9wZXJ0eShKU09OUy5UWVBFX0ZJRUxEKSkge1xuICAgIHJlc3VsdCA9IHt9O1xuICAgIGZvciAoa2V5IGluIGpzb24pIHtcbiAgICAgIHZhbHVlID0ganNvbltrZXldO1xuICAgICAgcmVzdWx0W2tleV0gPSBKU09OUy5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSB7XG4gICAgdHlwZSA9IGpzb25bSlNPTlMuVFlQRV9GSUVMRF07XG4gICAgcmVmID0gSlNPTlMuTkFNRVNQQUNFX1JPT1RTO1xuICAgIGZvciAoayA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBuYW1lc3BhY2Vfcm9vdCA9IHJlZltrXTtcbiAgICAgIGNvbnN0cnVjdG9yX29yX3Jvb3QgPSBrZXlQYXRoKG5hbWVzcGFjZV9yb290LCB0eXBlKTtcbiAgICAgIGlmICghY29uc3RydWN0b3Jfb3Jfcm9vdCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJ1Y3Rvcl9vcl9yb290LmZyb21KU09OKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvcl9vcl9yb290LmZyb21KU09OKGpzb24pO1xuICAgICAgfSBlbHNlIGlmIChjb25zdHJ1Y3Rvcl9vcl9yb290LnByb3RvdHlwZSAmJiBjb25zdHJ1Y3Rvcl9vcl9yb290LnByb3RvdHlwZS5wYXJzZSkge1xuICAgICAgICBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3Rvcl9vcl9yb290KCk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5zZXQpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2Uuc2V0KGluc3RhbmNlLnBhcnNlKGpzb24pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2UucGFyc2UoanNvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuOyByZXR1cm4gSlNPTlM7fSk7XG59KS5jYWxsKHRoaXMpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiKGZ1bmN0aW9uKCl7XHJcbiAgICAvKipcclxuICAgICAqIEpTTWl4IENsYXNzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IG9iaiBvciBKU09OIHN0cmluZyBkYXRhXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEpTTWl4KGRhdGEpIHtcclxuICAgICAgICBpZighKHRoaXMgaW5zdGFuY2VvZiBKU01peCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBKU01peChkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhKGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpICkge1xyXG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YSB8fCB7fTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXRob2QgdG8gbWFwIG9iamVjdCBwcm90b3R5cGUgd2l0aCBhIHBhdGggaW4gdGhlIGRhdGEgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge3Byb3RvdHlwZX0gcHJvdG90eXBlIG9mIHRoZSBvYmplY3QgdG8gYmUgbWFwcGVkIG9udG8gdGhlIGRhdGFcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIHRvIHdoZXJlIHRoZSBkYXRhIG9iamVjdHMgYXJlLiBFeGFtcGxlOiBlbXBsb3llZXMvKlxyXG4gICAgICovXHJcbiAgICBKU01peC5wcm90b3R5cGUud2l0aE9iamVjdCA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcGF0aCkge1xyXG4gICAgICAgIGlmICggZW1wdHlQYXRoKHBhdGgpICkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBtaXgocHJvdG90eXBlLCB0aGlzLmRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG1peFJlY3Vyc2l2ZShwcm90b3R5cGUsIHRoaXMuZGF0YSwgcGF0aC5zcGxpdCgnLicpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtaXhlZCBvYmplY3RcclxuICAgICAqL1xyXG4gICAgSlNNaXgucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gbWl4UmVjdXJzaXZlKHByb3RvdHlwZSwgcGFyZW50LCBwYXJ0cykge1xyXG4gICAgICAgIHZhciBuZXdQYXJ0cyA9IEFycmF5LmZyb20ocGFydHMpO1xyXG4gICAgICAgIHZhciBjdXJyZW50UGFydCA9IG5ld1BhcnRzLnNoaWZ0KCk7XHJcbiAgICAgICAgaWYgKCBwYXJ0cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtaXgocHJvdG90eXBlLCBwYXJlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGlzT2JqZWN0KHBhcmVudFtjdXJyZW50UGFydF0pIHx8IGN1cnJlbnRQYXJ0ID09PSAnKicpIHtcclxuICAgICAgICAgICAgaWYgKCBub3RBcnJheShwYXJlbnRbY3VycmVudFBhcnRdKSAmJiBjdXJyZW50UGFydCAhPT0gJyonICkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50W2N1cnJlbnRQYXJ0XSA9IG1peFJlY3Vyc2l2ZShwcm90b3R5cGUsIHBhcmVudFtjdXJyZW50UGFydF0sIG5ld1BhcnRzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICggY3VycmVudFBhcnQgPT09ICcqJyApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmVudC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFtwcm9wZXJ0eV0gPSBtaXhSZWN1cnNpdmUocHJvdG90eXBlLCBwYXJlbnRbcHJvcGVydHldLCBuZXdQYXJ0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3UGFydHNbMF0gPT09ICcqJyApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGFydHMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50W2N1cnJlbnRQYXJ0XS5mb3JFYWNoKCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFtjdXJyZW50UGFydF1baW5kZXhdID0gbWl4UmVjdXJzaXZlKHByb3RvdHlwZSwgcGFyZW50W2N1cnJlbnRQYXJ0XVtpbmRleF0sIG5ld1BhcnRzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgICAgICBcclxuICAgIGZ1bmN0aW9uIG1peChwcm90b3R5cGUsIGRhdGEpIHtcclxuXHRcdHZhciB0YXJnZXQ7XHJcblx0XHRpZihwcm90b3R5cGUgPT0gdW5kZWZpbmVkICYmICEhZGF0YS5fdHlwZSlcclxuXHRcdFx0dGFyZ2V0ID0gZXZhbChcIm5ldyBcIitkYXRhLl90eXBlK1wiKClcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRhcmdldCA9IE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcclxuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BlcnR5XSA9IGRhdGFbcHJvcGVydHldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGVtcHR5UGF0aChwYXRoKSB7XHJcbiAgICAgICAgaWYgKCBwYXRoID09PSB1bmRlZmluZWQgfHwgcGF0aCA9PT0gJycgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIG5vdEFycmF5KG9iamVjdCkge1xyXG4gICAgICAgIGlmICggb2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KGlucHV0KSB7XHJcbiAgICAgICAgaWYgKCBpbnB1dCBpbnN0YW5jZW9mIE9iamVjdCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOb2RlSlNcclxuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIil7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBKU01peDtcclxuICAgIH1cclxuICAgIC8vIEFNRCAoUmVxdWlyZUpTKVxyXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCl7XHJcbiAgICAgICAgcmV0dXJuIGRlZmluZShbXSwgSlNNaXgpO1xyXG4gICAgfVxyXG4gICAgLy8gR2xvYmFsXHJcbiAgICBlbHNle1xyXG4gICAgICAgIHdpbmRvdy5KU01peCA9IEpTTWl4O1xyXG4gICAgfSAgICBcclxuICAgIC8vQXJyYXkuZnJvbSBwb2x5ZmlsbCBmcm9tIE1ETlxyXG4gICAgXHJcbiAgICAvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDYsIDIyLjEuMi4xXHJcbiAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1hcnJheS5mcm9tXHJcbiAgICBpZiAoIUFycmF5LmZyb20pIHtcclxuICAgIEFycmF5LmZyb20gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XHJcbiAgICAgICAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbiAoZm4pIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nIHx8IHRvU3RyLmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHRvSW50ZWdlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBudW1iZXIgPSBOdW1iZXIodmFsdWUpO1xyXG4gICAgICAgIGlmIChpc05hTihudW1iZXIpKSB7IHJldHVybiAwOyB9XHJcbiAgICAgICAgaWYgKG51bWJlciA9PT0gMCB8fCAhaXNGaW5pdGUobnVtYmVyKSkgeyByZXR1cm4gbnVtYmVyOyB9XHJcbiAgICAgICAgcmV0dXJuIChudW1iZXIgPiAwID8gMSA6IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xyXG4gICAgICAgIHZhciB0b0xlbmd0aCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBsZW4gPSB0b0ludGVnZXIodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW4sIDApLCBtYXhTYWZlSW50ZWdlcik7XHJcbiAgICAgICAgfTtcclxuICAgIFxyXG4gICAgICAgIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XHJcbiAgICAgICAgLy8gMS4gTGV0IEMgYmUgdGhlIHRoaXMgdmFsdWUuXHJcbiAgICAgICAgdmFyIEMgPSB0aGlzO1xyXG4gICAgXHJcbiAgICAgICAgLy8gMi4gTGV0IGl0ZW1zIGJlIFRvT2JqZWN0KGFycmF5TGlrZSkuXHJcbiAgICAgICAgdmFyIGl0ZW1zID0gT2JqZWN0KGFycmF5TGlrZSk7XHJcbiAgICBcclxuICAgICAgICAvLyAzLiBSZXR1cm5JZkFicnVwdChpdGVtcykuXHJcbiAgICAgICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcnJheS5mcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIC8vIDQuIElmIG1hcGZuIGlzIHVuZGVmaW5lZCwgdGhlbiBsZXQgbWFwcGluZyBiZSBmYWxzZS5cclxuICAgICAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgdW5kZWZpbmVkO1xyXG4gICAgICAgIHZhciBUO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIC8vIDUuIGVsc2UgICAgICBcclxuICAgICAgICAgICAgLy8gNS4gYSBJZiBJc0NhbGxhYmxlKG1hcGZuKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxyXG4gICAgICAgICAgICBpZiAoIWlzQ2FsbGFibGUobWFwRm4pKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LmZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICAvLyA1LiBiLiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICBUID0gYXJndW1lbnRzWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgLy8gMTAuIExldCBsZW5WYWx1ZSBiZSBHZXQoaXRlbXMsIFwibGVuZ3RoXCIpLlxyXG4gICAgICAgIC8vIDExLiBMZXQgbGVuIGJlIFRvTGVuZ3RoKGxlblZhbHVlKS5cclxuICAgICAgICB2YXIgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcclxuICAgIFxyXG4gICAgICAgIC8vIDEzLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cclxuICAgICAgICAvLyAxMy4gYS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NvbnN0cnVjdF1dIGludGVybmFsIG1ldGhvZCBvZiBDIHdpdGggYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbSBsZW4uXHJcbiAgICAgICAgLy8gMTQuIGEuIEVsc2UsIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXHJcbiAgICAgICAgdmFyIEEgPSBpc0NhbGxhYmxlKEMpID8gT2JqZWN0KG5ldyBDKGxlbikpIDogbmV3IEFycmF5KGxlbik7XHJcbiAgICBcclxuICAgICAgICAvLyAxNi4gTGV0IGsgYmUgMC5cclxuICAgICAgICB2YXIgayA9IDA7XHJcbiAgICAgICAgLy8gMTcuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcclxuICAgICAgICB2YXIga1ZhbHVlO1xyXG4gICAgICAgIHdoaWxlIChrIDwgbGVuKSB7XHJcbiAgICAgICAgICAgIGtWYWx1ZSA9IGl0ZW1zW2tdO1xyXG4gICAgICAgICAgICBpZiAobWFwRm4pIHtcclxuICAgICAgICAgICAgQVtrXSA9IHR5cGVvZiBUID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGtWYWx1ZSwgaykgOiBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIEFba10gPSBrVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgayArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAxOC4gTGV0IHB1dFN0YXR1cyBiZSBQdXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cclxuICAgICAgICBBLmxlbmd0aCA9IGxlbjtcclxuICAgICAgICAvLyAyMC4gUmV0dXJuIEEuXHJcbiAgICAgICAgcmV0dXJuIEE7XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcbiAgICB9ICAgIFxyXG5cclxufSkoKTsiLCJyZXF1aXJlKFwiLi90cmFjay9zdHJhaWdodFRyYWNrXCIpO1xyXG5cclxudmFyIC8vZnMgPSByZXF1aXJlKCdmcycpLFxyXG4gICAgLy94bWwyanMgPSByZXF1aXJlKCd4bWwyanMnKSxcclxuICAgIFRyYWNrID0gcmVxdWlyZShcIi4vdHJhY2svdHJhY2tcIiksXHJcbiAgICBDbGFzcyA9IHJlcXVpcmUoXCJjbGFzcy5leHRlbmRcIiksXHJcbiAgICBleHRlbmQgPSByZXF1aXJlKFwiZXh0ZW5kXCIpLFxyXG4gICAgSlNNaXggPSByZXF1aXJlKFwianNtaXhcIiksXHJcblx0anNvbiA9IHJlcXVpcmUoXCJqc29uLXNlcmlhbGl6ZVwiKTtcclxuXHJcbnZhciBMYXlvdXQgPSBDbGFzcy5leHRlbmQoJ0xheW91dCcsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChwYXBlcikge1xyXG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJhY2sgPSBbXTtcclxuICAgICAgICBpZihwYXBlciA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRoaXMuTG9hZExheW91dCgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5wID0gcGFwZXI7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBMb2FkTGF5b3V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgZGIuZmluZE9uZSh7XCJ0eXBlXCI6IFwidHJhY2tcIn0sIGZ1bmN0aW9uKGVyciwgZG9jcykge1xyXG4gICAgICAgICAgICBpZihkb2NzID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyBkZW1vIHRyYWNrcyAuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLkxvYWREZW1vVHJhY2soKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuX2xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIExvYWREZW1vVHJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0MSA9IG5ldyBTdHJhaWdodFRyYWNrKHRoaXMucCwge3g6MTAwLHk6MTAwLHI6MzAsbDoxMH0pO1xyXG4gICAgICAgICAgICB0MiA9IG5ldyBTdHJhaWdodFRyYWNrKHRoaXMucCwge2w6MTB9KSxcclxuICAgICAgICAgICAgdDMgPSBuZXcgU3RyYWlnaHRUcmFjayh0aGlzLnAsIHtsOjV9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdDIuY29ubmVjdFRvKHQxLCAwLCAxKTtcclxuICAgICAgICB0My5jb25uZWN0VG8odDEsIDAsIDApO1xyXG4gICAgICAgIHRoaXMuQWRkVHJhY2sodDEpO1xyXG4gICAgICAgIHRoaXMuQWRkVHJhY2sodDIpO1xyXG4gICAgICAgIHRoaXMuQWRkVHJhY2sodDMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBBZGRUcmFjazogZnVuY3Rpb24gKHRyYWNrKSB7XHJcbiAgICAgICAgaWYgKCEodHJhY2sgaW5zdGFuY2VvZiBUcmFjaykpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdHJhY2sgY2xhc3MuXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnRyYWNrLnB1c2godHJhY2spO1xyXG4gICAgfSxcclxuXHJcbiAgICBQYXJzZTogZnVuY3Rpb24gKHRleHQpIHtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqKiBDTElFTlQgRlVOQ1RJT05TICoqKi8gICAgXHJcbiAgICBDbGllbnRTaG93R3JpZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBwYXRoID0gW107XHJcblxyXG4gICAgICAgIHZhciBzdGFydCA9IC0xMDAwLFxyXG4gICAgICAgICAgICBlbmQgPSAyMDAwO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gNTApIHtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcIk1cIiwgc3RhcnQsIGldKTtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcIkxcIiwgZW5kLCBpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSA1MCkge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wiTVwiLCBpLCBzdGFydF0pO1xyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wiTFwiLCBpLCBlbmRdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wLnBhdGgocGF0aCkuYXR0cih7IFwic3Ryb2tlXCI6IFwiI0NDQ1wiLCBcInN0cm9rZS13aWR0aFwiOiAwLjIgfSk7XHJcbiAgICAgICAgdGhpcy5wLnBhdGgoW1wiTVwiLCAwLCBzdGFydCwgXCJMXCIsIDAsIGVuZCwgXCJNXCIsIHN0YXJ0LCAwLCBcIkxcIiwgZW5kLCAwXSkuYXR0cih7IFwic3Ryb2tlXCI6IFwiI0NDQ1wiLCBcInN0cm9rZS13aWR0aFwiOiAxIH0pO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgQ2xpZW50TG9hZExheW91dDogZnVuY3Rpb24oQ2xpZW50TG9hZExheW91dCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAkLmdldChcIi9hcGkvTG9hZExheW91dFwiLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL3ZhciBsYXlvdXQgPSBKU01peChkYXRhKS53aXRoT2JqZWN0KHVuZGVmaW5lZCwgXCIqLipcIikuYnVpbGQoKTtcclxuXHRcdFx0dmFyIGxheW91dCA9IGpzb24uZGVzZXJpYWxpemUoZGF0YSk7XHJcblx0XHRcdGxheW91dC50cmFjay5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uc2V0UGFwZXIoc2VsZi5wKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGV4dGVuZChzZWxmLCBsYXlvdXQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoISFDbGllbnRMb2FkTGF5b3V0KVxyXG4gICAgICAgICAgICAgICAgQ2xpZW50TG9hZExheW91dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgQ2xpZW50RHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7aTx0aGlzLnRyYWNrLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICB0aGlzLnRyYWNrW2ldLmRyYXcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXQ7XHJcblxyXG52YXIgbG9vcCA9IFtdLFxyXG5cdHRyYWNrID0ge307XHJcblxyXG5mdW5jdGlvbiBmaW5kU2VnbWVudEJ5RW5kcG9pbnQoaWQpIHtcclxuXHRmb3IgKHZhciBwYXJ0IGluIHRyYWNrLmxheW91dC5wYXJ0cy5wYXJ0KSB7XHJcblx0XHRmb3IgKHZhciBlbmQgaW4gdHJhY2subGF5b3V0LnBhcnRzLnBhcnRbcGFydF0uZW5kcG9pbnROcnMuZW5kcG9pbnROcikge1xyXG5cdFx0XHRpZiAodHJhY2subGF5b3V0LnBhcnRzLnBhcnRbcGFydF0uZW5kcG9pbnROcnMuZW5kcG9pbnROcltlbmRdID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiBwYXJ0O1xyXG5cdFx0fTtcclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRMb29wUmVjdXJzaXZlKGlucHV0KSB7XHJcblx0aWYgKGxvb3AubGVuZ3RoID4gMykge1xyXG5cdFx0aWYobG9vcFtsb29wLmxlbmd0aC0xXS5jb25uZWN0aW9ucy5pbmRleE9mKGxvb3BbMF0uaWQpID4gLTEpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiZm91bmQgbG9vcFwiLCBsb29wKTtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYgKGlucHV0Lmxlbmd0aCA9PSAwKVxyXG5cdFx0cmV0dXJuO1xyXG5cdGZvciAodmFyIGogPSAwOyBqIDwgbG9vcFtsb29wLmxlbmd0aCAtIDFdLmNvbm5lY3Rpb25zLmxlbmd0aDsgaisrKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJ0ZXN0aW5nXCIsIGxvb3BbbG9vcC5sZW5ndGggLSAxXS5jb25uZWN0aW9uc1tqXSwgaW5wdXRbaV0uaWQpO1xyXG5cdFx0XHRpZiAobG9vcFtsb29wLmxlbmd0aCAtIDFdLmNvbm5lY3Rpb25zW2pdID09IGlucHV0W2ldLmlkKSB7XHJcblx0XHRcdFx0bG9vcC5wdXNoKGlucHV0LnNwbGljZShpLCAxKVswXSk7XHJcblx0XHRcdFx0ZmluZExvb3BSZWN1cnNpdmUoaW5wdXQpO1xyXG5cdFx0XHRcdGlucHV0LnNwbGljZShpLCAwLCBsb29wLnBvcCgpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9pZiAobG9vcFtsb29wLmxlbmd0aC0xXS5pbmRleE9mKHNlZy5pZCkpXHJcblx0XHQvL1x0ZmluZExvb3BzKGlucHV0KTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRMb29wcyhpbnB1dCkge1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHRcdHZhciBpdGVtID0gaW5wdXQuc3BsaWNlKGksIDEpWzBdO1xyXG5cdFx0bG9vcFswXSA9IGl0ZW07XHJcblx0XHRmaW5kTG9vcFJlY3Vyc2l2ZShpbnB1dCk7XHJcblx0XHRpbnB1dC5zcGxpY2UoaSwgMSwgaXRlbSk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kQ29ubmVjdGVkTm9kZShpZCkge1xyXG5cdGZvciAodmFyIGNvbm4gaW4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb24pIHtcclxuXHRcdGlmICh0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MSA9PSBpZCkge1xyXG5cdFx0XHRyZXR1cm4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb25bY29ubl0uJC5lbmRwb2ludDI7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmICh0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MiA9PSBpZCkge1xyXG5cdFx0XHRyZXR1cm4gdHJhY2subGF5b3V0LmNvbm5lY3Rpb25zLmNvbm5lY3Rpb25bY29ubl0uJC5lbmRwb2ludDE7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kU2VnbWVudHMoKSB7XHJcblx0dHJhY2subGF5b3V0LnBhcnRzLnBhcnQuZm9yRWFjaChmdW5jdGlvbiAocGFydCwgaW5kZXgpIHtcclxuXHRcdHZhciBzZWdtZW50ID0geyBpZDogaW5kZXgsIGNvbm5lY3Rpb25zOiBbXSB9O1xyXG5cdFx0cGFydC5lbmRwb2ludE5ycy5lbmRwb2ludE5yLmZvckVhY2goZnVuY3Rpb24gKGVuZCkge1xyXG5cdFx0XHR2YXIgY29ubmVjdGVkTm9kZSA9IGZpbmRDb25uZWN0ZWROb2RlKGVuZCk7XHJcblx0XHRcdGlmICghIWNvbm5lY3RlZE5vZGUpIHtcclxuXHRcdFx0XHR2YXIgY29ubiA9IGZpbmRTZWdtZW50QnlFbmRwb2ludChjb25uZWN0ZWROb2RlKTtcclxuXHRcdFx0XHRpZiAoISFjb25uKSB7XHJcblx0XHRcdFx0XHRzZWdtZW50LmNvbm5lY3Rpb25zLnB1c2goK2Nvbm4pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmaW5kIHBhcnRcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0c2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHR9KTtcclxuXHRmaW5kTG9vcHMoc2VnbWVudHMpO1xyXG59XHJcbiJdfQ==
