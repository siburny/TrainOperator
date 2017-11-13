var Matrix = require('../matrix');

class Track {
    constructor(options) {
        this.options = {
            x: 0,
            y: 0,
            r: 0,
            connections: []
        };

        if (!!options && 'id' in options) {
            this.id = options.id;
            delete options.id;
        }
    }


    static get TRACK_TYPE() {
        return {
            STRAIGHT: 1,
            CURVE: 2,
            SWITCH: 3
        }
    }
    static get INCH_TO_PIXEL() {
        return 20
    }
    static get TRACK_WIDTH() {
        return 1 * Track.INCH_TO_PIXEL;
    }


    moveTo(x, y, r) {
        if (x != undefined && y != undefined && r != undefined) {
            this.options.x = x;
            this.options.y = y;
            this.options.r = r;
        }

        this.image.translate(this.options.x, this.options.y);
        this.image.rotate(this.options.r, 0, 0);
    }

    connectTo(track, number1, number2) {
        var thisEndpoints = this.getEndpoints(),
            trackEndpoints = track.getEndpoints();

        if (number1 == undefined) {
            for (var i = 0; i < thisEndpoints.length; i++) {
                if (this.options.connections[i] == undefined) {
                    number1 = i;
                    break;
                }
            }
            if (number1 == undefined)
                return;
        }
        if (number2 == undefined) {
            for (var i = 0; i < trackEndpoints.length; i++) {
                if (track.options.connections[i] == undefined) {
                    number2 = i;
                    break;
                }
            }
            if (number2 == undefined)
                return;
        }

        var anchor1 = thisEndpoints[number1];
        var anchor2 = trackEndpoints[number2];

        this.options.r = track.options.r;
        this.options.r += 180 + anchor1.r - anchor2.r;
        this.options.r %= 360;
        anchor1 = this.getEndpoints()[number1];

        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;

        this.options.connections[number1] = track.id;
        track.options.connections[number2] = this.id;

        this.endpoints = this.getEndpoints();
    }

    repositionTo(track) {
        var thisEndpoints = this.getEndpoints(),
            trackEndpoints = track.getEndpoints();

        let number1, number2;

        for (var i = 0; i < thisEndpoints.length; i++) {
            if (this.options.connections[i] == track.id) {
                number1 = i;
                break;
            }
        }
        if (number1 == undefined)
            return;
        for (var i = 0; i < trackEndpoints.length; i++) {
            if (track.options.connections[i] == this.id) {
                number2 = i;
                break;
            }
        }
        if (number2 == undefined)
            return;

        var anchor1 = thisEndpoints[number1];
        var anchor2 = trackEndpoints[number2];

        this.options.r = track.options.r;
        this.options.r += 180 + anchor1.r - anchor2.r;
        this.options.r %= 360;
        anchor1 = this.getEndpoints()[number1];

        this.options.x = track.options.x + anchor2.dx - anchor1.dx;
        this.options.y = track.options.y + anchor2.dy - anchor1.dy;
    }

    getEndpoints(endpoints) {
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
    }
}

module.exports = Track;
