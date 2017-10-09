
/**
 * raphael.pan-zoom plugin 0.2.0
 * Copyright (c) 2012 @author Juan S. Escobar
 * https://github.com/escobar5
 *
 * licensed under the MIT license
 */
(function () {

    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },

        // ADDED: custom commands i added!
        moveLeft: function (steps) {
            this.move(steps, 0);
        },

        moveRight: function (steps) {
            this.move(- steps, 0);
        },

        moveUp: function (steps) {
            this.move(0, steps);
        },

        moveDown: function (steps) {
            this.move(0, - steps);
        },

        pan: function (deltaX, deltaY) {
        },

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        }
    },

        PanZoom = function (el, options) {
            var paper = el,
                container = paper.canvas.parentNode,
                me = this,
                settings = {},
                initialPos = { x: 0, y: 0 },
                deltaX = 0,
                deltaY = 0,
                mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

            this.enabled = false;
            this.dragThreshold = 5;
            this.dragTime = 0;
            this.repaintListeners = [];
            this.animationEnabled = true;

            options = options || {};

            settings.maxZoom = typeof options.maxZoom === "number" ? options.maxZoom : 10;
            settings.minZoom = typeof options.minZoom === "number" ? options.minZoom : 0;
            settings.initialZoom = typeof options.initialZoom === "number" ? options.initialZoom : 0;
            settings.initialPosition = options.initialPosition || { x: 0, y: 0 };
            settings.gestures = options.gestures || false;
            settings.onPan = options.onPan || null;
            settings.onZoom = options.onZoom || null;
            settings.panLimit = options.panLimit && true;

            this.currZoom = settings.initialZoom;
            this.currPos = settings.initialPosition;

            repaint();

            if (settings.gestures && typeof Hammer === "function") {
                var hammer = Hammer(container, {
                    'transform_min_scale': me.getZoomStep(),
                    'drag_block_horizontal': true,
                    'drag_block_vertical': true,
                    'transform_always_block': true,
                    'drag_max_touches': 1,
                    'drag_lock_to_axis': false
                });

                var initialZoom, initialPercentZoom, previousZoom, previousCenter, firstPinch;

                hammer.on("touch", function (event) {
                    initialZoom = me.currZoom;
                    initialPercentZoom = me.getZoomStep();
                    previousZoom = me.currZoom;
                    previousCenter = event.gesture.center;
                    firstPinch = true;
                });

                hammer.on("release", function (event) {
                });

                var pinching = function (event) {
                    setTimeout(function () {
                        var g = event.gesture,
                            newPercentZoom = initialPercentZoom * g.scale,
                            newZoom = - ((1 / newPercentZoom - 1) / me.getZoomStep()),
                            steps = newZoom - previousZoom;

                        if (steps !== 0) {
                            applyZoom(steps, getRelativePosition(g.center, container));
                            previousZoom = newZoom;
                        }

                        firstPinch = false;
                    }, 1);
                };

                var panning = function (event, pinching) {
                    setTimeout(function () {
                        if (pinching === "undefined") {
                            pinching = false;
                        }

                        var g = event.gesture,
                            center = g.center,
                            stepsX = center.pageX - previousCenter.pageX,
                            stepsY = center.pageY - previousCenter.pageY;

                        if ((!pinching || !firstPinch) && (pinching || firstPinch)) {
                            move(stepsX, stepsY);
                        }
                        previousCenter = center;
                    }, 1);
                };

                hammer.on("pinchin", function (event) {
                    panning(event, true);
                    pinching(event);

                    if (event.eventType === Hammer.EVENT_END && typeof settings.onZoom === "function") {
                        settings.onZoom(this);
                    }
                });

                hammer.on("pinchout", function (event) {
                    panning(event, true);
                    pinching(event);

                    if (event.eventType === Hammer.EVENT_END && typeof settings.onZoom === "function") {
                        settings.onZoom(this);
                    }
                });

                hammer.on("drag", function (event) {
                    panning(event);

                    if (event.eventType === Hammer.EVENT_END && typeof settings.onPan === "function") {
                        settings.onPan(this);
                    }
                });
            }

            container.onmousedown = function (e) {
                var evt = window.event || e;
                if (!me.enabled) return false;
                me.dragTime = 0;
                initialPos = getRelativePosition(evt, container);
                container.style.cursor = "move";
                container.onmousemove = dragging;
                document.onmousemove = function () { return false; };
                if (evt.preventDefault) evt.preventDefault();
                else evt.returnValue = false;
                return false;
            };

            container.onmouseup = function (e) {
                //Remove class framework independent
                document.onmousemove = null;
                container.style.cursor = "default";
                container.onmousemove = null;

                if (me.dragTime > 0 && typeof settings.onPan === "function") {
                    settings.onPan(this);
                }
            };

            if (container.attachEvent) //if IE (and Opera depending on user setting)
                container.attachEvent("on" + mousewheelevt, handleScroll);
            else if (container.addEventListener) //WC3 browsers
                container.addEventListener(mousewheelevt, handleScroll, false);

            function handleScroll(e) {
                if (!me.enabled) return false;
                var evt = window.event || e,
                    delta = evt.detail ? evt.detail : evt.wheelDelta * -1,
                    zoomCenter = getRelativePosition(evt, container);

                if (delta > 0) delta = -1;
                else if (delta < 0) delta = 1;

                document.onmousemove = function () {
                    if (typeof settings.onZoom === "function") {
                        settings.onZoom(this);
                    }
                    document.onmousemove = null;
                };

                applyZoom(delta, zoomCenter);
                if (evt.preventDefault) evt.preventDefault();
                else evt.returnValue = false;
                return false;
            }

            function setZoom(zoomLevel, centerPoint) {

                if (!me.enabled) return false;
                var previousZoom = me.currZoom;

                me.currZoom = zoomLevel;

                if (me.currZoom < settings.minZoom) {
                    me.currZoom = settings.minZoom;
                } else if (me.currZoom > settings.maxZoom) {
                    me.currZoom = settings.maxZoom;
                }

                centerPoint = centerPoint || { x: paper.width / 2, y: paper.height / 2 };

                var val = me.currZoom - previousZoom;

                var zoomStep = Math.pow(1.2, -me.currZoom);
                var zoomStepP = Math.pow(1.2, -previousZoom);
                if (val < 0) {
                    zoomStep = Math.pow(1.2, -previousZoom);
                    zoomStepP = Math.pow(1.2, -me.currZoom);
                }

                deltaX = (zoomStepP - zoomStep) * centerPoint.x * val;
                deltaY = (zoomStepP - zoomStep) * centerPoint.y * val;

                repaint(me.animationEnabled);
            }

            this.setZoom = setZoom;

            function applyZoom(val, centerPoint) {
                setZoom(me.currZoom + val, centerPoint);
            }

            this.applyZoom = applyZoom;

            function getZoomStep() {
                return Math.pow(1.2, -me.currZoom);
            }

            this.getZoomStep = getZoomStep;

            /**
             * Transforms the given x, y coordinate from in the paper to a x, y coordinate relative to the container.
             */
            function getPositionRelativeToContainer(x, y) {
                return {
                    'x': ((x - me.currPos.x) / me.getZoomStep()),
                    'y': ((y - me.currPos.y) / me.getZoomStep())
                };
            }

            this.getPositionRelativeToContainer = getPositionRelativeToContainer;

            function addRepaintListener(fn) {
                return this.repaintListeners.push(fn) - 1;
            }

            this.addRepaintListener = addRepaintListener;

            function removeRepaintListener(index) {
                this.repaintListeners.splice(index, 1);
            }

            this.removeRepaintListener = removeRepaintListener;

            function dragging(e) {
                setTimeout(function () {
                    if (!me.enabled) return false;
                    var evt = window.event || e,
                        newPoint = getRelativePosition(evt, container);

                    updatePos(newPoint);

                    repaint();
                    me.dragTime++;
                    if (evt.preventDefault) evt.preventDefault();
                    else evt.returnValue = false;
                    return false;
                }, 1);
            }

            /**
             * Move the viewBox for x number of pixels on the x-axis and y number of pixels on the y-axis
             */
            function move(x, y) {
                updatePos({
                    'x': initialPos.x + (x),
                    'y': initialPos.y + (y)
                });

                repaint();
            }

            this.move = move;

            function updatePos(newPoint) {
                // calculate the new width and height ... this is the width/height of what the viewbox will show.
                // the smaller the width/height, the higher the zoom level (the higher the zoomLevel, the less there is shown in the viewBox)
                var zoomPercentage = me.getZoomStep(),
                    newWidth = paper.width * zoomPercentage,
                    newHeight = paper.height * zoomPercentage;

                // newPoint and initialPos are points based on the current paper
                // we need points on the original paper ... when zooming you get more pixels for one pixel on the real paper!
                // for example original viewbox = 800, the new viewbox = 400 but the viewbox of 400 is still shown in the original paper (800)
                // so every original pixel of the paper is now 2 pixels in the new viewbox. When you want to calculate the distance between the two points
                // newPoint and initialPos by doing newPoint - initialPos then you get the distance in regard to the original paper (800) while the viewbox = 600
                // to get the distance to the current viewbox you need to current pixels / width original paper * width current viewbox.
                // + viewbox of 800 in a paper of 800 => 1px current viewbox = 1px original paper
                // + viewbox of 400 in a paper of 800 => 2px current viewbox = 1px original paper
                deltaX = (newWidth * (newPoint.x - initialPos.x) / paper.width) * -1;
                deltaY = (newHeight * (newPoint.y - initialPos.y) / paper.height) * -1;
                initialPos = newPoint;
            }

            function repaint(zooming) {
                // me.currPos is the x, y point of the viewBox, based on 100% view of the paper ... we need to add the delta to it.
                // if there is a delta then the viewBox is moved.

                me.currPos.x = me.currPos.x + deltaX;
                me.currPos.y = me.currPos.y + deltaY;

                var zoomStep = Math.pow(1.2, -me.currZoom);

                var zoomPercentage = zoomStep,
                    newWidth = paper.width * zoomPercentage,
                    newHeight = paper.height * zoomPercentage;

                if (me.currPos.x < 0 && settings.panLimit) me.currPos.x = 0;
                else if (me.currPos.x > paper.width - newWidth && settings.panLimit) { // paper.width is not allways the same to the real width and height of the svg ... maybe at custom boundaries?
                    me.currPos.x = paper.width - newWidth;
                }

                if (me.currPos.y < 0 && settings.panLimit) me.currPos.y = 0;
                else if (me.currPos.y > paper.height - newHeight && settings.panLimit) {
                    me.currPos.y = paper.height - newHeight;
                }

                paper.animateViewBox(me.currPos.x, me.currPos.y, newWidth, newHeight, zooming ? 250 : 0, "", function () {
                    animating = false;
                });

                var i;
                for (i = 0; i < me.repaintListeners.length; i++) {
                    if (typeof me.repaintListeners[i] !== "undefined") {
                        me.repaintListeners[i](me);
                    }
                }
            }
        };

    PanZoom.prototype = panZoomFunctions;

    /*
     * Returns the position of a x, y coordinate relative to given object, the given x, y coordinates are relative to the screens view port
     */
    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];

        return { x: x, y: y };
    }

    function findPos(obj) {
        var posX = obj.offsetLeft, posY = obj.offsetTop, posArray;
        while (obj.offsetParent) {
            if (obj == document.getElementsByTagName('body')[0]) { break; }
            else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }

    var intervalID;
    Raphael.fn.animateViewBox = function animateViewBox(x, y, w, h, duration, easing_function, callback) {
        var cx = this._viewBox ? this._viewBox[0] : 0,
            dx = x - cx,
            cy = this._viewBox ? this._viewBox[1] : 0,
            dy = y - cy,
            cw = this._viewBox ? this._viewBox[2] : this.width,
            dw = w - cw,
            ch = this._viewBox ? this._viewBox[3] : this.height,
            dh = h - ch,
            self = this;
        easing_function = easing_function || "linear";

        if (!!intervalID) {
            clearInterval(intervalID);
        }

        if (!duration) {
            self.setViewBox(x, y, w, h);
            return;
        }

        var interval = 25;
        var steps = duration / interval;
        var current_step = 0;
        var easing_formula = Raphael.easing_formulas[easing_function];

        intervalID = setInterval(function () {
            var ratio = current_step / steps;
            self.setViewBox(cx + dx * easing_formula(ratio),
                cy + dy * easing_formula(ratio),
                cw + dw * easing_formula(ratio),
                ch + dh * easing_formula(ratio), false);
            if (current_step++ >= steps) {
                clearInterval(intervalID);
                callback && callback();
            }
        }, interval);
    }

})();