require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/classes\\web\\track\\track.js":[function(require,module,exports){
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

},{"../matrix":1,"./track":"/classes\\web\\track\\track.js","Class.extend":3,"extend":"extend"}],3:[function(require,module,exports){
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


},{}],"layout":[function(require,module,exports){
require("./track/straightTrack");

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
    
    LoadLayout: function(LoadLayout) {
        var self = this;
        $.get("/api/LoadLayout", function(data) {
			var layout = json.deserialize(data);
			layout.track.forEach(function(item) {
                item.setPaper(self.p);
            });
            extend(self, layout);
            
            if(!!LoadLayout)
                LoadLayout();
        });
    },
    
    Draw: function() {
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

},{"./track/straightTrack":2,"./track/track":"/classes\\web\\track\\track.js","class.extend":4,"extend":"extend","json-serialize":5}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1VzZXJzL01heC9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xhc3Nlcy93ZWIvdHJhY2svdHJhY2suanMiLCJjbGFzc2VzL3dlYi9tYXRyaXguanMiLCJjbGFzc2VzL3dlYi90cmFjay9zdHJhaWdodFRyYWNrLmpzIiwibm9kZV9tb2R1bGVzL0NsYXNzLmV4dGVuZC9saWIvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvanNvbi1zZXJpYWxpemUvanNvbi1zZXJpYWxpemUuanMiLCJleHRlbmQiLCJjbGFzc2VzL3dlYi9sYXlvdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIGdsb2JhbCAqL1xyXG52YXIgQ2xhc3MgPSByZXF1aXJlKFwiQ2xhc3MuZXh0ZW5kXCIpLFxyXG4gICAgTWF0cml4ID0gcmVxdWlyZShcIi4uL21hdHJpeFwiKTtcclxuXHJcbi8vIEdsb2JhbCBjb25zdGFudHNcclxuZ2xvYmFsLlRSQUNLX1RZUEUgPSBPYmplY3QuZnJlZXplKHtcclxuXHRTVFJBSUdIVDogMSxcclxuXHRDVVJWRTogMlxyXG59KTtcclxuZ2xvYmFsLklOQ0hfVE9fUElYRUwgPSAyMDtcclxuZ2xvYmFsLlRSQUNLX1dJRFRIID0gMSAqIGdsb2JhbC5JTkNIX1RPX1BJWEVMO1xyXG5cclxudmFyIFRyYWNrID0gQ2xhc3MuZXh0ZW5kKCdUcmFjaycsIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChwYXBlcikge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgeTogMCxcclxuICAgICAgICAgICAgcjogMCxcclxuICAgICAgICAgICAgcDogcGFwZXJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNvbm5lY3Rpb25zID0gW107XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UgIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aGlzLmltYWdlLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSB0aGlzLmdldFBhdGgoKTtcclxuICAgICAgICAvKlxyXG4gICAgICAgIHZhciB0cmFjayA9IFtdO1xyXG4gICAgICAgIGlmKHRoaXMudHlwZSA9PSBUUkFDS19UWVBFLlNUUkFJR0hUKSB7XHJcbiAgICAgICAgICAgIHRyYWNrID0gX2dldFN0cmFpZ2h0VHJhY2tQYXRoKHRoaXMubCpJTkNIX1RPX1BJWEVMKTtcclxuICAgICAgICB9IGVsc2UgaWYodGhpcy50eXBlID09IFRSQUNLX1RZUEUuQ1VSVkUpIHtcclxuICAgICAgICAgICAgdHJhY2sgPSBfZ2V0Q3VydmVUcmFja1BhdGgodGhpcy5vcHRpb25zLnAqSU5DSF9UT19QSVhFTCwgMjIuNSk7XHJcbiAgICAgICAgfVxyXG4gICAgXHRcclxuICAgICAgICBpZih0aGlzLmltYWdlID09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhpcy5pbWFnZSA9IHBhcGVyLnNldCgpO1xyXG4gICAgXHJcbiAgICAgICAgdmFyIHBhdGggPSBwYXBlci5wYXRoKHRyYWNrKS5hdHRyKHsgc3Ryb2tlOiAnI0NDQycsIGZpbGw6ICcjODg4JyB9KTtcclxuICAgICAgICB0aGlzLmltYWdlLnB1c2gocGF0aCk7XHJcbiAgICAgICAgLy90aGlzLmltYWdlLnB1c2gocGF0aC5nbG93KHsgY29sb3I6ICcjRkZGJywgd2lkdGg6IDIgfSkpO1xyXG4gICAgICAgICovXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBnZXRQYXRoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2V0ID0gdGhpcy5vcHRpb25zLnAuc2V0KCk7XHJcbiAgICAgICAgc2V0LnB1c2godGhpcy5vcHRpb25zLnAuY2lyY2xlKDAsIDAsIDUpLmF0dHIoeyBcInN0cm9rZVwiOiBcIiNmZmZcIiwgXCJmaWxsXCI6IFwiI2FhYVwiIH0pKTtcclxuICAgICAgICBzZXQucHVzaCh0aGlzLm9wdGlvbnMucC50ZXh0KDAsIC0yMCwgXCJNaXNzaW5nIGltYWdlXCIpLmF0dHIoeyBcImZpbGxcIjogXCIjYWFhXCIsIFwiZm9udC1zaXplXCI6IDE2IH0pKTtcclxuICAgICAgICByZXR1cm4gc2V0O1xyXG4gICAgfSxcclxuXHJcbiAgICBtb3ZlVG86IGZ1bmN0aW9uICh4LCB5LCByKSB7XHJcbiAgICAgICAgLyp0aGlzLm9wdGlvbnMueCA9IHg7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuaW1hZ2UudHJhbnNmb3JtKFtcInRcIiwgeCwgeV0pOyovXHJcblxyXG4gICAgICAgIGlmICh4ICE9IHVuZGVmaW5lZCAmJiB5ICE9IHVuZGVmaW5lZCAmJiByICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMueCA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy55ID0geTtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnIgPSByO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy90aGlzLmltYWdlLnRyYW5zZm9ybShbXCJ0XCIsIHRoaXMub3B0aW9ucy54LCB0aGlzLm9wdGlvbnMueSwgXCJyXCIsIHRoaXMub3B0aW9ucy5yLCB0aGlzLm9wdGlvbnMueCwgdGhpcy5vcHRpb25zLnldKTtcclxuXHRcdHRoaXMuaW1hZ2UudHJhbnNsYXRlKHRoaXMub3B0aW9ucy54LCB0aGlzLm9wdGlvbnMueSk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS5yb3RhdGUodGhpcy5vcHRpb25zLnIsIDAsIDApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRNYXRyaXg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKHRoaXMuaW1hZ2UgIT0gdW5kZWZpbmVkICYmIHRoaXMuaW1hZ2VbMF0gIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbWFnZVswXS5tYXRyaXg7XHJcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4KCk7XHJcbiAgICAgICAgbS50cmFuc2xhdGUodGhpcy5vcHRpb25zLngsIHRoaXMub3B0aW9ucy55KTtcclxuICAgICAgICBtLnJvdGF0ZSh0aGlzLm9wdGlvbnMuciwgMCwgMCk7XHJcbiAgICAgICAgcmV0dXJuIG07XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbm5lY3RUbzogZnVuY3Rpb24gKHRyYWNrLCBudW1iZXIxLCBudW1iZXIyKSB7XHJcbiAgICAgICAgaWYgKG51bWJlcjEgPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBudW1iZXIxID0gMDtcclxuICAgICAgICBpZiAobnVtYmVyMiA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIG51bWJlcjIgPSAwO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAvL3RoaXMub3B0aW9ucy5yID0gdHJhY2sub3B0aW9ucy5yO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB2YXIgYW5jaG9yMSA9IHRoaXMuZ2V0RW5kcG9pbnRzKClbbnVtYmVyMV07XHJcbiAgICAgICAgdmFyIGFuY2hvcjIgPSB0cmFjay5nZXRFbmRwb2ludHMoKVtudW1iZXIyXTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vcHRpb25zLnIgPSB0cmFjay5vcHRpb25zLnI7XHJcblx0XHRpZihhbmNob3IxLnIgKyBhbmNob3IyLnIgIT0gMTgwKSB7XHJcblx0XHRcdHRoaXMub3B0aW9ucy5yICs9IDE4MCArIGFuY2hvcjEuciAtIGFuY2hvcjIucjtcclxuXHRcdH1cclxuXHRcdHRoaXMub3B0aW9ucy5yICU9IDM2MDtcclxuXHRcdGFuY2hvcjEgPSB0aGlzLmdldEVuZHBvaW50cygpW251bWJlcjFdO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhhbmNob3IxKTtcclxuXHRcdC8vY29uc29sZS5sb2coYW5jaG9yMik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnggPSB0cmFjay5vcHRpb25zLnggKyBhbmNob3IyLmR4IC0gYW5jaG9yMS5keDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMueSA9IHRyYWNrLm9wdGlvbnMueSArIGFuY2hvcjIuZHkgLSBhbmNob3IxLmR5O1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZ2V0RW5kcG9pbnRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBnZXRFbmRwb2ludHMociwgYTEsIGEyKSB7XHJcblx0cmV0dXJuIFt7IGR4OiByICogTWF0aC5jb3MoYTEgKiBNYXRoLlBJIC8gMTgwKSAtIHIgKiBNYXRoLmNvcygoYTEgKyBhMi8yKSAqIE1hdGguUEkgLyAxODApLFxyXG5cdFx0XHQgZHk6IHIgKiBNYXRoLnNpbihhMSAqIE1hdGguUEkgLyAxODApIC0gciAqIE1hdGguc2luKChhMSArIGEyLzIpICogTWF0aC5QSSAvIDE4MCkgfV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hcmNQYXRoKHIsIGExLCBhMikge1xyXG5cdHZhciBkeCA9IHIgKiBNYXRoLmNvcyhhMSAqIE1hdGguUEkgLyAxODApIC0gciAqIE1hdGguY29zKChhMSArIGEyKSAqIE1hdGguUEkgLyAxODApLFxyXG5cdFx0ZHkgPSByICogTWF0aC5zaW4oYTEgKiBNYXRoLlBJIC8gMTgwKSAtIHIgKiBNYXRoLnNpbigoYTEgKyBhMikgKiBNYXRoLlBJIC8gMTgwKTtcclxuXHJcblx0XHRcclxuXHRyZXR1cm4gW1wiYVwiLCByLCByLCAwLCAwLCBhMiA+IDAgPyAxIDogMCwgZHgsIGR5XTtcclxufVxyXG5cclxuZnVuY3Rpb24gX2dldEN1cnZlVHJhY2tQYXRoKHIsIGEpIHtcclxuXHR2YXIgYW5jaG9yID0gZ2V0RW5kcG9pbnRzKHIsIDAsIGEpO1xyXG5cdHZhciBwYXRoID0gW1wiTVwiLCAtYW5jaG9yLmR4LCAtYW5jaG9yLmR5XTtcclxuXHRcclxuXHR2YXIgYXJjMSA9IF9hcmNQYXRoKHIsIDAsIGEpLFxyXG5cdFx0YXJjX3QgPSBfYXJjUGF0aChyIC0gMjAsIDAsIGEpLFxyXG5cdFx0YXJjMiA9IF9hcmNQYXRoKHIgLSAyMCwgYSwgLWEpO1xyXG5cclxuXHRwYXRoLnB1c2goYXJjMSk7XHJcblx0cGF0aC5wdXNoKFtcImxcIiwgMjAgKyBhcmNfdFthcmNfdC5sZW5ndGggLSAyXSAtIGFyYzFbYXJjMS5sZW5ndGggLSAyXSwgYXJjX3RbYXJjX3QubGVuZ3RoIC0gMV0gLSBhcmMxW2FyYzEubGVuZ3RoIC0gMV1dKTtcclxuXHRwYXRoLnB1c2goYXJjMik7XHJcblx0cGF0aC5wdXNoKFtcImxcIiwgLTIwLCAwXSk7XHJcblxyXG5cdHJldHVybiBwYXRoO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNrO1xyXG4iLCJmdW5jdGlvbiBNYXRyaXgoYSwgYiwgYywgZCwgZSwgZikge1xyXG4gICAgaWYgKGEgIT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuYSA9ICthO1xyXG4gICAgICAgIHRoaXMuYiA9ICtiO1xyXG4gICAgICAgIHRoaXMuYyA9ICtjO1xyXG4gICAgICAgIHRoaXMuZCA9ICtkO1xyXG4gICAgICAgIHRoaXMuZSA9ICtlO1xyXG4gICAgICAgIHRoaXMuZiA9ICtmO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmEgPSAxO1xyXG4gICAgICAgIHRoaXMuYiA9IDA7XHJcbiAgICAgICAgdGhpcy5jID0gMDtcclxuICAgICAgICB0aGlzLmQgPSAxO1xyXG4gICAgICAgIHRoaXMuZSA9IDA7XHJcbiAgICAgICAgdGhpcy5mID0gMDtcclxuICAgIH1cclxufVxyXG4oZnVuY3Rpb24gKG1hdHJpeHByb3RvKSB7XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXguYWRkXHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBBZGRzIGdpdmVuIG1hdHJpeCB0byBleGlzdGluZyBvbmUuXHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSBhIChudW1iZXIpXHJcbiAgICAgICAgLSBiIChudW1iZXIpXHJcbiAgICAgICAgLSBjIChudW1iZXIpXHJcbiAgICAgICAgLSBkIChudW1iZXIpXHJcbiAgICAgICAgLSBlIChudW1iZXIpXHJcbiAgICAgICAgLSBmIChudW1iZXIpXHJcbiAgICAgICAgb3JcclxuICAgICAgICAtIG1hdHJpeCAob2JqZWN0KSBATWF0cml4XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5hZGQgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgZSwgZikge1xyXG4gICAgICAgIHZhciBvdXQgPSBbW10sIFtdLCBbXV0sXHJcbiAgICAgICAgICAgIG0gPSBbW3RoaXMuYSwgdGhpcy5jLCB0aGlzLmVdLCBbdGhpcy5iLCB0aGlzLmQsIHRoaXMuZl0sIFswLCAwLCAxXV0sXHJcbiAgICAgICAgICAgIG1hdHJpeCA9IFtbYSwgYywgZV0sIFtiLCBkLCBmXSwgWzAsIDAsIDFdXSxcclxuICAgICAgICAgICAgeCwgeSwgeiwgcmVzO1xyXG5cclxuICAgICAgICBpZiAoYSAmJiBhIGluc3RhbmNlb2YgTWF0cml4KSB7XHJcbiAgICAgICAgICAgIG1hdHJpeCA9IFtbYS5hLCBhLmMsIGEuZV0sIFthLmIsIGEuZCwgYS5mXSwgWzAsIDAsIDFdXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoeCA9IDA7IHggPCAzOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IDM7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoeiA9IDA7IHogPCAzOyB6KyspIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gbVt4XVt6XSAqIG1hdHJpeFt6XVt5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dFt4XVt5XSA9IHJlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmEgPSBvdXRbMF1bMF07XHJcbiAgICAgICAgdGhpcy5iID0gb3V0WzFdWzBdO1xyXG4gICAgICAgIHRoaXMuYyA9IG91dFswXVsxXTtcclxuICAgICAgICB0aGlzLmQgPSBvdXRbMV1bMV07XHJcbiAgICAgICAgdGhpcy5lID0gb3V0WzBdWzJdO1xyXG4gICAgICAgIHRoaXMuZiA9IG91dFsxXVsyXTtcclxuICAgIH07XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXguaW52ZXJ0XHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm5zIGludmVydGVkIHZlcnNpb24gb2YgdGhlIG1hdHJpeFxyXG4gICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8uaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgICAgIHggPSBtZS5hICogbWUuZCAtIG1lLmIgKiBtZS5jO1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4KG1lLmQgLyB4LCAtbWUuYiAvIHgsIC1tZS5jIC8geCwgbWUuYSAvIHgsIChtZS5jICogbWUuZiAtIG1lLmQgKiBtZS5lKSAvIHgsIChtZS5iICogbWUuZSAtIG1lLmEgKiBtZS5mKSAvIHgpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5jbG9uZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUmV0dXJucyBjb3B5IG9mIHRoZSBtYXRyaXhcclxuICAgICAgICA9IChvYmplY3QpIEBNYXRyaXhcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4KHRoaXMuYSwgdGhpcy5iLCB0aGlzLmMsIHRoaXMuZCwgdGhpcy5lLCB0aGlzLmYpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC50cmFuc2xhdGVcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFRyYW5zbGF0ZSB0aGUgbWF0cml4XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by50cmFuc2xhdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG4gICAgICAgIHRoaXMuYWRkKDEsIDAsIDAsIDEsIHgsIHkpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5zY2FsZVxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogU2NhbGVzIHRoZSBtYXRyaXhcclxuICAgICAgICA+IFBhcmFtZXRlcnNcclxuICAgICAgICAtIHggKG51bWJlcilcclxuICAgICAgICAtIHkgKG51bWJlcikgI29wdGlvbmFsXHJcbiAgICAgICAgLSBjeCAobnVtYmVyKSAjb3B0aW9uYWxcclxuICAgICAgICAtIGN5IChudW1iZXIpICNvcHRpb25hbFxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8uc2NhbGUgPSBmdW5jdGlvbiAoeCwgeSwgY3gsIGN5KSB7XHJcbiAgICAgICAgeSA9PSBudWxsICYmICh5ID0geCk7XHJcbiAgICAgICAgKGN4IHx8IGN5KSAmJiB0aGlzLmFkZCgxLCAwLCAwLCAxLCBjeCwgY3kpO1xyXG4gICAgICAgIHRoaXMuYWRkKHgsIDAsIDAsIHksIDAsIDApO1xyXG4gICAgICAgIChjeCB8fCBjeSkgJiYgdGhpcy5hZGQoMSwgMCwgMCwgMSwgLWN4LCAtY3kpO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC5yb3RhdGVcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJvdGF0ZXMgdGhlIG1hdHJpeFxyXG4gICAgICAgID4gUGFyYW1ldGVyc1xyXG4gICAgICAgIC0gYSAobnVtYmVyKVxyXG4gICAgICAgIC0geCAobnVtYmVyKVxyXG4gICAgICAgIC0geSAobnVtYmVyKVxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8ucm90YXRlID0gZnVuY3Rpb24gKGEsIHgsIHkpIHtcclxuICAgICAgICBhID0gUi5yYWQoYSk7XHJcbiAgICAgICAgeCA9IHggfHwgMDtcclxuICAgICAgICB5ID0geSB8fCAwO1xyXG4gICAgICAgIHZhciBjb3MgPSArbWF0aC5jb3MoYSkudG9GaXhlZCg5KSxcclxuICAgICAgICAgICAgc2luID0gK21hdGguc2luKGEpLnRvRml4ZWQoOSk7XHJcbiAgICAgICAgdGhpcy5hZGQoY29zLCBzaW4sIC1zaW4sIGNvcywgeCwgeSk7XHJcbiAgICAgICAgdGhpcy5hZGQoMSwgMCwgMCwgMSwgLXgsIC15KTtcclxuICAgIH07XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXgueFxyXG4gICAgICAgIFsgbWV0aG9kIF1cclxuICAgICAgICAqKlxyXG4gICAgICAgICogUmV0dXJuIHggY29vcmRpbmF0ZSBmb3IgZ2l2ZW4gcG9pbnQgYWZ0ZXIgdHJhbnNmb3JtYXRpb24gZGVzY3JpYmVkIGJ5IHRoZSBtYXRyaXguIFNlZSBhbHNvIEBNYXRyaXgueVxyXG4gICAgICAgID4gUGFyYW1ldGVyc1xyXG4gICAgICAgIC0geCAobnVtYmVyKVxyXG4gICAgICAgIC0geSAobnVtYmVyKVxyXG4gICAgICAgID0gKG51bWJlcikgeFxyXG4gICAgXFwqL1xyXG4gICAgbWF0cml4cHJvdG8ueCA9IGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgICAgcmV0dXJuIHggKiB0aGlzLmEgKyB5ICogdGhpcy5jICsgdGhpcy5lO1xyXG4gICAgfTtcclxuICAgIC8qXFxcclxuICAgICAgICAqIE1hdHJpeC55XHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBSZXR1cm4geSBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC54XHJcbiAgICAgICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAgICAgLSB4IChudW1iZXIpXHJcbiAgICAgICAgLSB5IChudW1iZXIpXHJcbiAgICAgICAgPSAobnVtYmVyKSB5XHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by55ID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgICAgICByZXR1cm4geCAqIHRoaXMuYiArIHkgKiB0aGlzLmQgKyB0aGlzLmY7XHJcbiAgICB9O1xyXG4gICAgbWF0cml4cHJvdG8uZ2V0ID0gZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICByZXR1cm4gK3RoaXNbU3RyLmZyb21DaGFyQ29kZSg5NyArIGkpXS50b0ZpeGVkKDQpO1xyXG4gICAgfTtcclxuICAgIG1hdHJpeHByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBSLnN2ZyA/XHJcbiAgICAgICAgICAgIFwibWF0cml4KFwiICsgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMiksIHRoaXMuZ2V0KDMpLCB0aGlzLmdldCg0KSwgdGhpcy5nZXQoNSldLmpvaW4oKSArIFwiKVwiIDpcclxuICAgICAgICAgICAgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDMpLCAwLCAwXS5qb2luKCk7XHJcbiAgICB9O1xyXG4gICAgbWF0cml4cHJvdG8udG9GaWx0ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0Lk1hdHJpeChNMTE9XCIgKyB0aGlzLmdldCgwKSArXHJcbiAgICAgICAgICAgIFwiLCBNMTI9XCIgKyB0aGlzLmdldCgyKSArIFwiLCBNMjE9XCIgKyB0aGlzLmdldCgxKSArIFwiLCBNMjI9XCIgKyB0aGlzLmdldCgzKSArXHJcbiAgICAgICAgICAgIFwiLCBEeD1cIiArIHRoaXMuZ2V0KDQpICsgXCIsIER5PVwiICsgdGhpcy5nZXQoNSkgKyBcIiwgc2l6aW5nbWV0aG9kPSdhdXRvIGV4cGFuZCcpXCI7XHJcbiAgICB9O1xyXG4gICAgbWF0cml4cHJvdG8ub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy5lLnRvRml4ZWQoNCksIHRoaXMuZi50b0ZpeGVkKDQpXTtcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBub3JtKGEpIHtcclxuICAgICAgICByZXR1cm4gYVswXSAqIGFbMF0gKyBhWzFdICogYVsxXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShhKSB7XHJcbiAgICAgICAgdmFyIG1hZyA9IG1hdGguc3FydChub3JtKGEpKTtcclxuICAgICAgICBhWzBdICYmIChhWzBdIC89IG1hZyk7XHJcbiAgICAgICAgYVsxXSAmJiAoYVsxXSAvPSBtYWcpO1xyXG4gICAgfVxyXG4gICAgLypcXFxyXG4gICAgICAgICogTWF0cml4LnNwbGl0XHJcbiAgICAgICAgWyBtZXRob2QgXVxyXG4gICAgICAgICoqXHJcbiAgICAgICAgKiBTcGxpdHMgbWF0cml4IGludG8gcHJpbWl0aXZlIHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgICAgID0gKG9iamVjdCkgaW4gZm9ybWF0OlxyXG4gICAgICAgIG8gZHggKG51bWJlcikgdHJhbnNsYXRpb24gYnkgeFxyXG4gICAgICAgIG8gZHkgKG51bWJlcikgdHJhbnNsYXRpb24gYnkgeVxyXG4gICAgICAgIG8gc2NhbGV4IChudW1iZXIpIHNjYWxlIGJ5IHhcclxuICAgICAgICBvIHNjYWxleSAobnVtYmVyKSBzY2FsZSBieSB5XHJcbiAgICAgICAgbyBzaGVhciAobnVtYmVyKSBzaGVhclxyXG4gICAgICAgIG8gcm90YXRlIChudW1iZXIpIHJvdGF0aW9uIGluIGRlZ1xyXG4gICAgICAgIG8gaXNTaW1wbGUgKGJvb2xlYW4pIGNvdWxkIGl0IGJlIHJlcHJlc2VudGVkIHZpYSBzaW1wbGUgdHJhbnNmb3JtYXRpb25zXHJcbiAgICBcXCovXHJcbiAgICBtYXRyaXhwcm90by5zcGxpdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3V0ID0ge307XHJcbiAgICAgICAgLy8gdHJhbnNsYXRpb25cclxuICAgICAgICBvdXQuZHggPSB0aGlzLmU7XHJcbiAgICAgICAgb3V0LmR5ID0gdGhpcy5mO1xyXG5cclxuICAgICAgICAvLyBzY2FsZSBhbmQgc2hlYXJcclxuICAgICAgICB2YXIgcm93ID0gW1t0aGlzLmEsIHRoaXMuY10sIFt0aGlzLmIsIHRoaXMuZF1dO1xyXG4gICAgICAgIG91dC5zY2FsZXggPSBtYXRoLnNxcnQobm9ybShyb3dbMF0pKTtcclxuICAgICAgICBub3JtYWxpemUocm93WzBdKTtcclxuXHJcbiAgICAgICAgb3V0LnNoZWFyID0gcm93WzBdWzBdICogcm93WzFdWzBdICsgcm93WzBdWzFdICogcm93WzFdWzFdO1xyXG4gICAgICAgIHJvd1sxXSA9IFtyb3dbMV1bMF0gLSByb3dbMF1bMF0gKiBvdXQuc2hlYXIsIHJvd1sxXVsxXSAtIHJvd1swXVsxXSAqIG91dC5zaGVhcl07XHJcblxyXG4gICAgICAgIG91dC5zY2FsZXkgPSBtYXRoLnNxcnQobm9ybShyb3dbMV0pKTtcclxuICAgICAgICBub3JtYWxpemUocm93WzFdKTtcclxuICAgICAgICBvdXQuc2hlYXIgLz0gb3V0LnNjYWxleTtcclxuXHJcbiAgICAgICAgLy8gcm90YXRpb25cclxuICAgICAgICB2YXIgc2luID0gLXJvd1swXVsxXSxcclxuICAgICAgICAgICAgY29zID0gcm93WzFdWzFdO1xyXG4gICAgICAgIGlmIChjb3MgPCAwKSB7XHJcbiAgICAgICAgICAgIG91dC5yb3RhdGUgPSBSLmRlZyhtYXRoLmFjb3MoY29zKSk7XHJcbiAgICAgICAgICAgIGlmIChzaW4gPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBvdXQucm90YXRlID0gMzYwIC0gb3V0LnJvdGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG91dC5yb3RhdGUgPSBSLmRlZyhtYXRoLmFzaW4oc2luKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXQuaXNTaW1wbGUgPSAhK291dC5zaGVhci50b0ZpeGVkKDkpICYmIChvdXQuc2NhbGV4LnRvRml4ZWQoOSkgPT0gb3V0LnNjYWxleS50b0ZpeGVkKDkpIHx8ICFvdXQucm90YXRlKTtcclxuICAgICAgICBvdXQuaXNTdXBlclNpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgb3V0LnNjYWxleC50b0ZpeGVkKDkpID09IG91dC5zY2FsZXkudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcclxuICAgICAgICBvdXQubm9Sb3RhdGlvbiA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgIW91dC5yb3RhdGU7XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgIH07XHJcbiAgICAvKlxcXHJcbiAgICAgICAgKiBNYXRyaXgudG9UcmFuc2Zvcm1TdHJpbmdcclxuICAgICAgICBbIG1ldGhvZCBdXHJcbiAgICAgICAgKipcclxuICAgICAgICAqIFJldHVybiB0cmFuc2Zvcm0gc3RyaW5nIHRoYXQgcmVwcmVzZW50cyBnaXZlbiBtYXRyaXhcclxuICAgICAgICA9IChzdHJpbmcpIHRyYW5zZm9ybSBzdHJpbmdcclxuICAgIFxcKi9cclxuICAgIG1hdHJpeHByb3RvLnRvVHJhbnNmb3JtU3RyaW5nID0gZnVuY3Rpb24gKHNob3J0ZXIpIHtcclxuICAgICAgICB2YXIgcyA9IHNob3J0ZXIgfHwgdGhpc1tzcGxpdF0oKTtcclxuICAgICAgICBpZiAocy5pc1NpbXBsZSkge1xyXG4gICAgICAgICAgICBzLnNjYWxleCA9ICtzLnNjYWxleC50b0ZpeGVkKDQpO1xyXG4gICAgICAgICAgICBzLnNjYWxleSA9ICtzLnNjYWxleS50b0ZpeGVkKDQpO1xyXG4gICAgICAgICAgICBzLnJvdGF0ZSA9ICtzLnJvdGF0ZS50b0ZpeGVkKDQpO1xyXG4gICAgICAgICAgICByZXR1cm4gIChzLmR4IHx8IHMuZHkgPyBcInRcIiArIFtzLmR4LCBzLmR5XSA6IEUpICtcclxuICAgICAgICAgICAgICAgICAgICAocy5zY2FsZXggIT0gMSB8fCBzLnNjYWxleSAhPSAxID8gXCJzXCIgKyBbcy5zY2FsZXgsIHMuc2NhbGV5LCAwLCAwXSA6IEUpICtcclxuICAgICAgICAgICAgICAgICAgICAocy5yb3RhdGUgPyBcInJcIiArIFtzLnJvdGF0ZSwgMCwgMF0gOiBFKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJtXCIgKyBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMyksIHRoaXMuZ2V0KDQpLCB0aGlzLmdldCg1KV07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSkoTWF0cml4LnByb3RvdHlwZSk7XHJcblxyXG52YXIgbWF0aCA9IE1hdGgsXHJcbiAgICBtbWF4ID0gbWF0aC5tYXgsXHJcbiAgICBtbWluID0gbWF0aC5taW4sXHJcbiAgICBhYnMgPSBtYXRoLmFicyxcclxuICAgIHBvdyA9IG1hdGgucG93LFxyXG4gICAgUEkgPSBtYXRoLlBJO1xyXG5cclxuZnVuY3Rpb24gUigpIHtcclxufVxyXG4vKlxcXHJcbiAgICAqIFJhcGhhZWwucmFkXHJcbiAgICBbIG1ldGhvZCBdXHJcbiAgICAqKlxyXG4gICAgKiBUcmFuc2Zvcm0gYW5nbGUgdG8gcmFkaWFuc1xyXG4gICAgPiBQYXJhbWV0ZXJzXHJcbiAgICAtIGRlZyAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzXHJcbiAgICA9IChudW1iZXIpIGFuZ2xlIGluIHJhZGlhbnMuXHJcblxcKi9cclxuUi5yYWQgPSBmdW5jdGlvbiAoZGVnKSB7XHJcbiAgICByZXR1cm4gZGVnICUgMzYwICogUEkgLyAxODA7XHJcbn07XHJcbi8qXFxcclxuICAgICogUmFwaGFlbC5kZWdcclxuICAgIFsgbWV0aG9kIF1cclxuICAgICoqXHJcbiAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byBkZWdyZWVzXHJcbiAgICA+IFBhcmFtZXRlcnNcclxuICAgIC0gcmFkIChudW1iZXIpIGFuZ2xlIGluIHJhZGlhbnNcclxuICAgID0gKG51bWJlcikgYW5nbGUgaW4gZGVncmVlcy5cclxuXFwqL1xyXG5SLmRlZyA9IGZ1bmN0aW9uIChyYWQpIHtcclxuICAgIHJldHVybiBNYXRoLnJvdW5kICgocmFkICogMTgwIC8gUEklIDM2MCkqIDEwMDApIC8gMTAwMDtcclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hdHJpeDsiLCIvKiBnbG9iYWwgSU5DSF9UT19QSVhFTCAqL1xyXG4vKiBnbG9iYWwgVFJBQ0tfVFlQRSAqL1xyXG4vKiBnbG9iYWwgVFJBQ0tfV0lEVEggKi9cclxuLyogZ2xvYmFsIGdsb2JhbCAqL1xyXG52YXIgQ2xhc3MgPSByZXF1aXJlKFwiQ2xhc3MuZXh0ZW5kXCIpLFxyXG4gICAgVHJhY2sgPSByZXF1aXJlKFwiLi90cmFja1wiKSxcclxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCJleHRlbmRcIiksXHJcbiAgICBNYXRyaXggPSByZXF1aXJlKFwiLi4vbWF0cml4XCIpO1xyXG5cclxudmFyIFN0cmFpZ2h0VHJhY2sgPSBUcmFjay5leHRlbmQoJ1N0cmFpZ2h0VHJhY2snLCB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAocGFwZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAob3B0aW9ucyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHBhcGVyO1xyXG4gICAgICAgICAgICBwYXBlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3VwZXIocGFwZXIpO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMubCA9IDE7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBleHRlbmQodGhpcy5vcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50eXBlID0gVFJBQ0tfVFlQRS5TVFJBSUdIVDtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0UGFwZXI6IGZ1bmN0aW9uIChwKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnAgPSBwO1xyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UgIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aGlzLmltYWdlLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IHRoaXMub3B0aW9ucy5wLmdyb3VwKCk7XHJcblxyXG4gICAgICAgIHZhciB0cmFjayA9IHRoaXMuX2dldFN0cmFpZ2h0VHJhY2tQYXRoKHRoaXMub3B0aW9ucy5sICogSU5DSF9UT19QSVhFTCk7XHJcblxyXG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5vcHRpb25zLnAucGF0aCh0cmFjaykuYXR0cih7IHN0cm9rZTogJyNDQ0MnLCBmaWxsOiAnIzg4OCcgfSk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS5wdXNoKHBhdGgpO1xyXG5cclxuXHRcdHZhciBlbmRwb2ludHMgPSB0aGlzLmdldEVuZHBvaW50cyh0cnVlKTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZW5kcG9pbnRzLmxlbmd0aDsgaSsrKSB7XHJcblx0ICAgICAgICB0aGlzLmltYWdlLnB1c2godGhpcy5vcHRpb25zLnAuY2lyY2xlKGVuZHBvaW50c1tpXS5keCwgZW5kcG9pbnRzW2ldLmR5IC0gNiAqIE1hdGguc2lnbihlbmRwb2ludHNbaV0uZHkpIC8gMiwgMilcclxuXHRcdFx0XHQuYXR0cih7IFwic3Ryb2tlXCI6IFwiI2ZmZlwiLCBcImZpbGxcIjogXCIjYWFhXCIgfSkpO1xyXG4gICAgXHQgICAgdGhpcy5pbWFnZS5wdXNoKHRoaXMub3B0aW9ucy5wLnRleHQoZW5kcG9pbnRzW2ldLmR4LCBlbmRwb2ludHNbaV0uZHkgLSAyNSAqIE1hdGguc2lnbihlbmRwb2ludHNbaV0uZHkpIC8gMiwgaSlcclxuXHRcdFx0XHQudHJhbnNmb3JtKFtcInJcIiwgLXRoaXMub3B0aW9ucy5yXSlcclxuXHRcdFx0XHQuYXR0cih7IFwiZmlsbFwiOiBcIiNmZmZcIiwgXCJmb250LXNpemVcIjogMTYgfSkpO1xyXG5cdFx0fVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVUbygpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRFbmRwb2ludHM6IGZ1bmN0aW9uIChub3RyYW5zZm9ybSkge1xyXG4gICAgICAgIHZhciBlbmRwb2ludHMgPSBbXHJcbiAgICAgICAgICAgIHsgcjogMCwgZHg6IDAsIGR5OiAtdGhpcy5vcHRpb25zLmwgKiBJTkNIX1RPX1BJWEVMIC8gMiB9LFxyXG4gICAgICAgICAgICB7IHI6IDE4MCwgZHg6IDAsIGR5OiB0aGlzLm9wdGlvbnMubCAqIElOQ0hfVE9fUElYRUwgLyAyIH1cclxuICAgICAgICBdO1xyXG5cclxuXHRcdGlmKCEhbm90cmFuc2Zvcm0pXHJcblx0XHRcdHJldHVybiBlbmRwb2ludHM7XHJcblx0XHRcclxuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgoKTtcclxuICAgICAgICBtLnJvdGF0ZSh0aGlzLm9wdGlvbnMuciwgMCwgMCk7XHJcblxyXG4gICAgICAgIHZhciBlID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dmFyIHQgPSBlbmRwb2ludHNbaV0sXHJcblx0XHRcdFx0eCA9IHQuZHgsXHJcblx0XHRcdFx0eSA9IHQuZHk7XHJcblx0XHRcdHQuZHggPSBtLngoeCwgeSk7XHJcblx0XHRcdHQuZHkgPSBtLnkoeCwgeSk7XHJcblx0XHRcdGUucHVzaCh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBlO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZ2V0U3RyYWlnaHRUcmFja1BhdGg6IGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuICAgICAgICBpZiAodHJ1ZSlcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcIk1cIiwgLVRSQUNLX1dJRFRIIC8gMiwgbCAvIDJdKTtcclxuICAgICAgICBwYXRoLnB1c2goW1wibFwiLCAwLCAtbF0pO1xyXG4gICAgICAgIGlmICh0cnVlKVxyXG4gICAgICAgICAgICBwYXRoLnB1c2goW1wibFwiLCBUUkFDS19XSURUSCwgMF0pO1xyXG4gICAgICAgIHBhdGgucHVzaChbXCJsXCIsIDAsIGxdKTtcclxuICAgICAgICBpZiAodHJ1ZSlcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcImxcIiwgLVRSQUNLX1dJRFRILCAwXSk7XHJcbiAgICAgICAgaWYgKHRydWUpXHJcbiAgICAgICAgICAgIHBhdGgucHVzaChcInpcIik7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b0pTT046IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBfdHlwZTogXCJTdHJhaWdodFRyYWNrXCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9uc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSwgJ1N0cmFpZ2h0VHJhY2snKTtcclxuXHJcblN0cmFpZ2h0VHJhY2suZnJvbUpTT04gPSBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgaWYgKGpzb24uX3R5cGUgIT0gXCJTdHJhaWdodFRyYWNrXCIpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICByZXR1cm4gbmV3IFN0cmFpZ2h0VHJhY2soanNvbi5vcHRpb25zKTtcclxufVxyXG5cclxuZ2xvYmFsLlN0cmFpZ2h0VHJhY2sgPSBTdHJhaWdodFRyYWNrO1xyXG4iLCIoZnVuY3Rpb24oKXtcclxuICB2YXIgaW5pdGlhbGl6aW5nID0gZmFsc2UsIGZuVGVzdCA9IC94eXovLnRlc3QoZnVuY3Rpb24oKXt4eXo7fSkgPyAvXFxiX3N1cGVyXFxiLyA6IC8uKi87XHJcbiBcclxuICAvLyBUaGUgYmFzZSBDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxyXG4gIHRoaXMuQ2xhc3MgPSBmdW5jdGlvbigpe307XHJcbiBcclxuICAvLyBDcmVhdGUgYSBuZXcgQ2xhc3MgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgY2xhc3NcclxuICBDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihjbGFzc05hbWUsIHByb3ApIHtcclxuICAgIHZhciBfc3VwZXIgPSB0aGlzLnByb3RvdHlwZTtcclxuICAgXHJcbiAgICAvLyBJbnN0YW50aWF0ZSBhIGJhc2UgY2xhc3MgKGJ1dCBvbmx5IGNyZWF0ZSB0aGUgaW5zdGFuY2UsXHJcbiAgICAvLyBkb24ndCBydW4gdGhlIGluaXQgY29uc3RydWN0b3IpXHJcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xyXG4gICAgdmFyIHByb3RvdHlwZSA9IG5ldyB0aGlzKCk7IFxyXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcbiAgIFxyXG4gICAgLy8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcclxuICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcCkge1xyXG4gICAgICAvLyBDaGVjayBpZiB3ZSdyZSBvdmVyd3JpdGluZyBhbiBleGlzdGluZyBmdW5jdGlvblxyXG4gICAgICBwcm90b3R5cGVbbmFtZV0gPSB0eXBlb2YgcHJvcFtuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiZcclxuICAgICAgICB0eXBlb2YgX3N1cGVyW25hbWVdID09IFwiZnVuY3Rpb25cIiAmJiBmblRlc3QudGVzdChwcm9wW25hbWVdKSA/XHJcbiAgICAgICAgKGZ1bmN0aW9uKG5hbWUsIGZuKXtcclxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMuX3N1cGVyO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBBZGQgYSBuZXcgLl9zdXBlcigpIG1ldGhvZCB0aGF0IGlzIHRoZSBzYW1lIG1ldGhvZFxyXG4gICAgICAgICAgICAvLyBidXQgb24gdGhlIHN1cGVyLWNsYXNzXHJcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gX3N1cGVyW25hbWVdO1xyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBUaGUgbWV0aG9kIG9ubHkgbmVlZCB0byBiZSBib3VuZCB0ZW1wb3JhcmlseSwgc28gd2VcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGl0IHdoZW4gd2UncmUgZG9uZSBleGVjdXRpbmdcclxuICAgICAgICAgICAgdmFyIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7ICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSB0bXA7XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pKG5hbWUsIHByb3BbbmFtZV0pIDpcclxuICAgICAgICBwcm9wW25hbWVdO1xyXG4gICAgfVxyXG4gICBcclxuICAgIC8vIFRoZSBkdW1teSBjbGFzcyBjb25zdHJ1Y3RvclxyXG4gICAgZnVuY3Rpb24gQ2xhc3MoKSB7XHJcbiAgICAgIC8vIEFsbCBjb25zdHJ1Y3Rpb24gaXMgYWN0dWFsbHkgZG9uZSBpbiB0aGUgaW5pdCBtZXRob2RcclxuICAgICAgaWYgKCAhaW5pdGlhbGl6aW5nICYmIHRoaXMuaW5pdCApXHJcbiAgICAgICAgdGhpcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgIFxyXG4gICAgLy8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcclxuICAgIENsYXNzLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcclxuICAgXHJcbiAgICAvLyBFbmZvcmNlIHRoZSBjb25zdHJ1Y3RvciB0byBiZSB3aGF0IHdlIGV4cGVjdFxyXG5cclxuICAgIHZhciBmdW5jID0gbmV3IEZ1bmN0aW9uKFxyXG4gICAgICAgIFwicmV0dXJuIGZ1bmN0aW9uIFwiICsgY2xhc3NOYW1lICsgXCIoKXsgfVwiXHJcbiAgICApKCk7XHJcbiAgICBDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBmdW5jO1xyXG4gXHJcbiAgICAvLyBBbmQgbWFrZSB0aGlzIGNsYXNzIGV4dGVuZGFibGVcclxuICAgIENsYXNzLmV4dGVuZCA9IGFyZ3VtZW50cy5jYWxsZWU7XHJcbiAgIFxyXG4gICAgcmV0dXJuIENsYXNzO1xyXG4gIH07XHJcblxyXG4gIC8vSSBvbmx5IGFkZGVkIHRoaXMgbGluZVxyXG4gIG1vZHVsZS5leHBvcnRzID0gQ2xhc3M7XHJcbn0pKCk7XHJcbiIsIi8qXG4gIEpTT04tU2VyaWFsaXplLmpzIDEuMS4zXG4gIChjKSAyMDExLCAyMDEyIEtldmluIE1hbGFrb2ZmIC0gaHR0cDovL2ttYWxha29mZi5naXRodWIuY29tL2pzb24tc2VyaWFsaXplL1xuICBMaWNlbnNlOiBNSVQgKGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwKVxuKi9cbihmdW5jdGlvbigpIHtcbiAgcmV0dXJuIChmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgLy8gQU1EXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgcmV0dXJuIGRlZmluZSgnanNvbi1zZXJpYWxpemUnLCBmYWN0b3J5KTtcbiAgICB9XG4gICAgLy8gQ29tbW9uSlMvTm9kZUpTIG9yIE5vIExvYWRlclxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGZhY3RvcnkuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0pKGZ1bmN0aW9uKCkgey8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG5cbi8qXG4gIEpTT04tU2VyaWFsaXplLmpzIDEuMS4zXG4gIChjKSAyMDExLCAyMDEyIEtldmluIE1hbGFrb2ZmIC0gaHR0cDovL2ttYWxha29mZi5naXRodWIuY29tL2pzb24tc2VyaWFsaXplL1xuICBMaWNlbnNlOiBNSVQgKGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwKVxuICovXG52YXIgSlNPTlMsIGlzQXJyYXksIGlzRW1wdHksIGtleVBhdGgsIHJvb3QsIHN0cmluZ0hhc0lTTzg2MDFEYXRlU2lnbmF0dXJlO1xuXG5yb290ID0gdGhpcztcblxuSlNPTlMgPSB0aGlzLkpTT05TID0gdHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnID8gZXhwb3J0cyA6IHt9O1xuXG5KU09OUy5WRVJTSU9OID0gXCIxLjEuM1wiO1xuXG5KU09OUy5UWVBFX0ZJRUxEID0gXCJfdHlwZVwiO1xuXG5KU09OUy5OQU1FU1BBQ0VfUk9PVFMgPSBbcm9vdF07XG5cbmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuaXNBcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gb2JqLmNvbnN0cnVjdG9yID09PSBBcnJheTtcbn07XG5cbnN0cmluZ0hhc0lTTzg2MDFEYXRlU2lnbmF0dXJlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHJldHVybiAoc3RyaW5nLmxlbmd0aCA+PSAxOSkgJiYgKHN0cmluZ1s0XSA9PT0gXCItXCIpICYmIChzdHJpbmdbN10gPT09IFwiLVwiKSAmJiAoc3RyaW5nWzEwXSA9PT0gXCJUXCIpICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSBcIlpcIik7XG59O1xuXG5rZXlQYXRoID0gZnVuY3Rpb24ob2JqZWN0LCBrZXlwYXRoKSB7XG4gIHZhciBjdXJyZW50X29iamVjdCwgaSwga2V5LCBrZXlwYXRoX2NvbXBvbmVudHMsIGw7XG4gIGtleXBhdGhfY29tcG9uZW50cyA9IGtleXBhdGguc3BsaXQoXCIuXCIpO1xuICBpZiAoa2V5cGF0aF9jb21wb25lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiAoKG9iamVjdCBpbnN0YW5jZW9mIE9iamVjdCkgJiYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXlwYXRoKSkgPyBvYmplY3Rba2V5cGF0aF0gOiB2b2lkIDApO1xuICB9XG4gIGN1cnJlbnRfb2JqZWN0ID0gb2JqZWN0O1xuICBsID0ga2V5cGF0aF9jb21wb25lbnRzLmxlbmd0aDtcbiAgZm9yIChpIGluIGtleXBhdGhfY29tcG9uZW50cykge1xuICAgIGtleSA9IGtleXBhdGhfY29tcG9uZW50c1tpXTtcbiAgICBrZXkgPSBrZXlwYXRoX2NvbXBvbmVudHNbaV07XG4gICAgaWYgKCEoa2V5IGluIGN1cnJlbnRfb2JqZWN0KSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmICgrK2kgPT09IGwpIHtcbiAgICAgIHJldHVybiBjdXJyZW50X29iamVjdFtrZXldO1xuICAgIH1cbiAgICBjdXJyZW50X29iamVjdCA9IGN1cnJlbnRfb2JqZWN0W2tleV07XG4gICAgaWYgKCFjdXJyZW50X29iamVjdCB8fCAoIShjdXJyZW50X29iamVjdCBpbnN0YW5jZW9mIE9iamVjdCkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbkpTT05TLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKG9iaiwgb3B0aW9ucykge1xuICB2YXIgaiwga2V5LCBsZW4sIHJlc3VsdCwgdmFsdWU7XG4gIGlmICghb2JqIHx8ICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgaWYgKG9iai50b0pTT04pIHtcbiAgICByZXR1cm4gb2JqLnRvSlNPTigpO1xuICB9XG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBvYmoubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhbHVlID0gb2JqW2pdO1xuICAgICAgcmVzdWx0LnB1c2goSlNPTlMuc2VyaWFsaXplKHZhbHVlKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzRW1wdHkob2JqKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHt9O1xuICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIHJlc3VsdFtrZXldID0gSlNPTlMuc2VyaWFsaXplKHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkpTT05TLmRlc2VyaWFsaXplID0gZnVuY3Rpb24oanNvbiwgb3B0aW9ucykge1xuICB2YXIgY29uc3RydWN0b3Jfb3Jfcm9vdCwgZGF0ZSwgZSwgZXJyb3IsIGluc3RhbmNlLCBqLCBqc29uX2FzX0pTT04sIGpzb25fdHlwZSwgaywga2V5LCBsZW4sIGxlbjEsIG5hbWVzcGFjZV9yb290LCByZWYsIHJlc3VsdCwgdHlwZSwgdmFsdWU7XG4gIGpzb25fdHlwZSA9IHR5cGVvZiBqc29uO1xuICBpZiAoanNvbl90eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKGpzb24ubGVuZ3RoICYmIChqc29uWzBdID09PSBcIntcIikgfHwgKGpzb25bMF0gPT09IFwiW1wiKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAganNvbl9hc19KU09OID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgaWYgKGpzb25fYXNfSlNPTikge1xuICAgICAgICAgIGpzb24gPSBqc29uX2FzX0pTT047XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGUgPSBlcnJvcjtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBKU09OOiBcIiArIGpzb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShvcHRpb25zICYmIG9wdGlvbnMuc2tpcF9kYXRlcykgJiYgc3RyaW5nSGFzSVNPODYwMURhdGVTaWduYXR1cmUoanNvbikpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShqc29uKTtcbiAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAodW5kZWZpbmVkKSB7fVxuICAgIH1cbiAgfVxuICBpZiAoKGpzb25fdHlwZSAhPT0gXCJvYmplY3RcIikgfHwgaXNFbXB0eShqc29uKSkge1xuICAgIHJldHVybiBqc29uO1xuICB9XG4gIGlmIChpc0FycmF5KGpzb24pKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0ganNvbi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFsdWUgPSBqc29uW2pdO1xuICAgICAgcmVzdWx0LnB1c2goSlNPTlMuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBlbHNlIGlmICgob3B0aW9ucyAmJiBvcHRpb25zLnNraXBfdHlwZV9maWVsZCkgfHwgIWpzb24uaGFzT3duUHJvcGVydHkoSlNPTlMuVFlQRV9GSUVMRCkpIHtcbiAgICByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGtleSBpbiBqc29uKSB7XG4gICAgICB2YWx1ZSA9IGpzb25ba2V5XTtcbiAgICAgIHJlc3VsdFtrZXldID0gSlNPTlMuZGVzZXJpYWxpemUodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IGVsc2Uge1xuICAgIHR5cGUgPSBqc29uW0pTT05TLlRZUEVfRklFTERdO1xuICAgIHJlZiA9IEpTT05TLk5BTUVTUEFDRV9ST09UUztcbiAgICBmb3IgKGsgPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgbmFtZXNwYWNlX3Jvb3QgPSByZWZba107XG4gICAgICBjb25zdHJ1Y3Rvcl9vcl9yb290ID0ga2V5UGF0aChuYW1lc3BhY2Vfcm9vdCwgdHlwZSk7XG4gICAgICBpZiAoIWNvbnN0cnVjdG9yX29yX3Jvb3QpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RydWN0b3Jfb3Jfcm9vdC5mcm9tSlNPTikge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3Jfb3Jfcm9vdC5mcm9tSlNPTihqc29uKTtcbiAgICAgIH0gZWxzZSBpZiAoY29uc3RydWN0b3Jfb3Jfcm9vdC5wcm90b3R5cGUgJiYgY29uc3RydWN0b3Jfb3Jfcm9vdC5wcm90b3R5cGUucGFyc2UpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBuZXcgY29uc3RydWN0b3Jfb3Jfcm9vdCgpO1xuICAgICAgICBpZiAoaW5zdGFuY2Uuc2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnNldChpbnN0YW5jZS5wYXJzZShqc29uKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBhcnNlKGpzb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcbjsgcmV0dXJuIEpTT05TO30pO1xufSkuY2FsbCh0aGlzKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsInJlcXVpcmUoXCIuL3RyYWNrL3N0cmFpZ2h0VHJhY2tcIik7XHJcblxyXG52YXIgLy9mcyA9IHJlcXVpcmUoJ2ZzJyksXHJcbiAgICAvL3htbDJqcyA9IHJlcXVpcmUoJ3htbDJqcycpLFxyXG4gICAgVHJhY2sgPSByZXF1aXJlKFwiLi90cmFjay90cmFja1wiKSxcclxuICAgIENsYXNzID0gcmVxdWlyZShcImNsYXNzLmV4dGVuZFwiKSxcclxuICAgIGV4dGVuZCA9IHJlcXVpcmUoXCJleHRlbmRcIiksXHJcblx0XHRqc29uID0gcmVxdWlyZShcImpzb24tc2VyaWFsaXplXCIpO1xyXG5cclxudmFyIExheW91dCA9IENsYXNzLmV4dGVuZCgnTGF5b3V0Jywge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKHBhcGVyKSB7XHJcblx0XHRcdHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLnRyYWNrID0gW107XHJcblx0XHRcdHRoaXMucCA9IHBhcGVyO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgU2hvd0dyaWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcGF0aCA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgc3RhcnQgPSAtMTAwMCxcclxuICAgICAgICAgICAgZW5kID0gMjAwMDtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDUwKSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChbXCJNXCIsIHN0YXJ0LCBpXSk7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChbXCJMXCIsIGVuZCwgaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gNTApIHtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcIk1cIiwgaSwgc3RhcnRdKTtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKFtcIkxcIiwgaSwgZW5kXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucC5wYXRoKHBhdGgpLmF0dHIoeyBcInN0cm9rZVwiOiBcIiNDQ0NcIiwgXCJzdHJva2Utd2lkdGhcIjogMC4yIH0pO1xyXG4gICAgICAgIHRoaXMucC5wYXRoKFtcIk1cIiwgMCwgc3RhcnQsIFwiTFwiLCAwLCBlbmQsIFwiTVwiLCBzdGFydCwgMCwgXCJMXCIsIGVuZCwgMF0pLmF0dHIoeyBcInN0cm9rZVwiOiBcIiNDQ0NcIiwgXCJzdHJva2Utd2lkdGhcIjogMSB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIExvYWRMYXlvdXQ6IGZ1bmN0aW9uKExvYWRMYXlvdXQpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgJC5nZXQoXCIvYXBpL0xvYWRMYXlvdXRcIiwgZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHR2YXIgbGF5b3V0ID0ganNvbi5kZXNlcmlhbGl6ZShkYXRhKTtcclxuXHRcdFx0bGF5b3V0LnRyYWNrLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5zZXRQYXBlcihzZWxmLnApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZXh0ZW5kKHNlbGYsIGxheW91dCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZighIUxvYWRMYXlvdXQpXHJcbiAgICAgICAgICAgICAgICBMb2FkTGF5b3V0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBEcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDtpPHRoaXMudHJhY2subGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgIHRoaXMudHJhY2tbaV0uZHJhdygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExheW91dDtcclxuXHJcbnZhciBsb29wID0gW10sXHJcblx0dHJhY2sgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRTZWdtZW50QnlFbmRwb2ludChpZCkge1xyXG5cdGZvciAodmFyIHBhcnQgaW4gdHJhY2subGF5b3V0LnBhcnRzLnBhcnQpIHtcclxuXHRcdGZvciAodmFyIGVuZCBpbiB0cmFjay5sYXlvdXQucGFydHMucGFydFtwYXJ0XS5lbmRwb2ludE5ycy5lbmRwb2ludE5yKSB7XHJcblx0XHRcdGlmICh0cmFjay5sYXlvdXQucGFydHMucGFydFtwYXJ0XS5lbmRwb2ludE5ycy5lbmRwb2ludE5yW2VuZF0gPT0gaWQpXHJcblx0XHRcdFx0cmV0dXJuIHBhcnQ7XHJcblx0XHR9O1xyXG5cdH1cclxuXHRyZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gZmluZExvb3BSZWN1cnNpdmUoaW5wdXQpIHtcclxuXHRpZiAobG9vcC5sZW5ndGggPiAzKSB7XHJcblx0XHRpZihsb29wW2xvb3AubGVuZ3RoLTFdLmNvbm5lY3Rpb25zLmluZGV4T2YobG9vcFswXS5pZCkgPiAtMSlcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJmb3VuZCBsb29wXCIsIGxvb3ApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRpZiAoaW5wdXQubGVuZ3RoID09IDApXHJcblx0XHRyZXR1cm47XHJcblx0Zm9yICh2YXIgaiA9IDA7IGogPCBsb29wW2xvb3AubGVuZ3RoIC0gMV0uY29ubmVjdGlvbnMubGVuZ3RoOyBqKyspIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInRlc3RpbmdcIiwgbG9vcFtsb29wLmxlbmd0aCAtIDFdLmNvbm5lY3Rpb25zW2pdLCBpbnB1dFtpXS5pZCk7XHJcblx0XHRcdGlmIChsb29wW2xvb3AubGVuZ3RoIC0gMV0uY29ubmVjdGlvbnNbal0gPT0gaW5wdXRbaV0uaWQpIHtcclxuXHRcdFx0XHRsb29wLnB1c2goaW5wdXQuc3BsaWNlKGksIDEpWzBdKTtcclxuXHRcdFx0XHRmaW5kTG9vcFJlY3Vyc2l2ZShpbnB1dCk7XHJcblx0XHRcdFx0aW5wdXQuc3BsaWNlKGksIDAsIGxvb3AucG9wKCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL2lmIChsb29wW2xvb3AubGVuZ3RoLTFdLmluZGV4T2Yoc2VnLmlkKSlcclxuXHRcdC8vXHRmaW5kTG9vcHMoaW5wdXQpO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmluZExvb3BzKGlucHV0KSB7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xyXG5cdFx0dmFyIGl0ZW0gPSBpbnB1dC5zcGxpY2UoaSwgMSlbMF07XHJcblx0XHRsb29wWzBdID0gaXRlbTtcclxuXHRcdGZpbmRMb29wUmVjdXJzaXZlKGlucHV0KTtcclxuXHRcdGlucHV0LnNwbGljZShpLCAxLCBpdGVtKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRDb25uZWN0ZWROb2RlKGlkKSB7XHJcblx0Zm9yICh2YXIgY29ubiBpbiB0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbikge1xyXG5cdFx0aWYgKHRyYWNrLmxheW91dC5jb25uZWN0aW9ucy5jb25uZWN0aW9uW2Nvbm5dLiQuZW5kcG9pbnQxID09IGlkKSB7XHJcblx0XHRcdHJldHVybiB0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MjtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHRyYWNrLmxheW91dC5jb25uZWN0aW9ucy5jb25uZWN0aW9uW2Nvbm5dLiQuZW5kcG9pbnQyID09IGlkKSB7XHJcblx0XHRcdHJldHVybiB0cmFjay5sYXlvdXQuY29ubmVjdGlvbnMuY29ubmVjdGlvbltjb25uXS4kLmVuZHBvaW50MTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpbmRTZWdtZW50cygpIHtcclxuXHR0cmFjay5sYXlvdXQucGFydHMucGFydC5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0LCBpbmRleCkge1xyXG5cdFx0dmFyIHNlZ21lbnQgPSB7IGlkOiBpbmRleCwgY29ubmVjdGlvbnM6IFtdIH07XHJcblx0XHRwYXJ0LmVuZHBvaW50TnJzLmVuZHBvaW50TnIuZm9yRWFjaChmdW5jdGlvbiAoZW5kKSB7XHJcblx0XHRcdHZhciBjb25uZWN0ZWROb2RlID0gZmluZENvbm5lY3RlZE5vZGUoZW5kKTtcclxuXHRcdFx0aWYgKCEhY29ubmVjdGVkTm9kZSkge1xyXG5cdFx0XHRcdHZhciBjb25uID0gZmluZFNlZ21lbnRCeUVuZHBvaW50KGNvbm5lY3RlZE5vZGUpO1xyXG5cdFx0XHRcdGlmICghIWNvbm4pIHtcclxuXHRcdFx0XHRcdHNlZ21lbnQuY29ubmVjdGlvbnMucHVzaCgrY29ubik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgcGFydFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xyXG5cdH0pO1xyXG5cdGZpbmRMb29wcyhzZWdtZW50cyk7XHJcbn1cclxuIl19
