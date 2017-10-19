class Track {
    constructor(paper) {
        this.options = {
            x: 0,
            y: 0,
            r: 0,
            p: paper,
            connections: {}
        };
    }

    
    static get TRACK_TYPE() {
        return {
            STRAIGHT: 1,
            CURVE: 2,
            SWITCH: 3
        };
    }
    static get INCH_TO_PIXEL() {
        return 20;
    }
    static get TRACK_WIDTH() {
        return 1;
    }


    draw() {
        if (this.image != undefined)
            this.image.remove();
        this.image = this.getPath();
    }

    getPath() {
        var set = this.options.p.set();
        set.push(this.options.p.circle(0, 0, 5).attr({ "stroke": "#fff", "fill": "#aaa" }));
        set.push(this.options.p.text(0, -20, "Missing image").attr({ "fill": "#aaa", "font-size": 16 }));
        return set;
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

    getMatrix() {
        if (this.image != undefined && this.image[0] != undefined)
            return this.image[0].matrix;
        var m = new Matrix();
        m.translate(this.options.x, this.options.y);
        m.rotate(this.options.r, 0, 0);
        return m;
    }

    setPaper(p) {
        this.options.p = p;
    }
}

module.exports = Track;
