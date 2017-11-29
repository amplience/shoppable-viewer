require('./sass/shared.scss');

module.exports = {
    generateId() {
        var text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    isMobile() {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        )
            return true;
        return false;
    },
    isTouchDevice() {
        return 'ontouchstart' in document.documentElement || 'ontouchstart' in window;
    },

    isMouseDevice() {
        return 'onmousemove' in document.documentElement || 'onmousemove' in window;
    },

    touchHelpers({elem, evt, callback}) {

        let emulatedEvents = {
            tap() {
                let seconds = new Date().getTime() / 1000;
                let coords = {
                    x: null,
                    y: null
                };

                let touchStart = function (e) {
                    seconds = new Date().getTime() / 1000;
                    coords = {
                        x: e.touches[0].pageX - e.target.offsetLeft,
                        y: e.touches[0].pageY - e.target.offsetTop
                    }
                };

                let touchEnd = function (e) {
                    let newCoords = {
                        x: e.changedTouches[0].pageX - e.target.offsetLeft,
                        y: e.changedTouches[0].pageY - e.target.offsetTop
                    };

                    if ((new Date().getTime() / 1000 - seconds) <= 0.5
                        && Math.abs(newCoords.x - coords.x) < 2
                        && Math.abs(newCoords.y - coords.y) < 2) {
                        callback();
                    }
                };

                elem.addEventListener('touchstart', touchStart);
                elem.addEventListener('touchend', touchEnd);

                return [
                    {
                        elem,
                        evt: 'touchstart',
                        callback: touchStart
                    },
                    {
                        elem,
                        evt: 'touchend',
                        callback: touchEnd
                    }
                ];
            },
            doubletap() {
                let tapped = false;
                let doubleTap = function (e) {
                    if (!tapped) {
                        tapped = setTimeout(function () {
                            tapped = false;
                        }, 350);   //
                    }
                    else {
                        clearTimeout(tapped); //stop single tap callback
                        tapped = false;

                        callback();
                    }
                    e.preventDefault();

                }

                elem.addEventListener('touchstart', doubleTap);

                return [
                    {
                        elem,
                        evt: 'touchstart',
                        callback: doubleTap
                    }
                ];
            }
        };

        if (emulatedEvents[evt]) {
            return emulatedEvents[evt]();
        }

        else {
            elem.addEventListener(evt, callback);
            return [
                {
                    elem,
                    evt,
                    callback
                }
            ];
        }
    },

    singleLineString: function (strings) {
        var values = Array.prototype.slice.call(arguments, 1);

        // Interweave the strings with the
        // substitution vars first.
        var output = '';
        for (var i = 0; i < values.length; i++) {
            output += strings[i] + values[i];
        }
        output += strings[values.length];

        // Split on newlines.
        var lines = output.split(/(?:\r\n|\n|\r)/);

        // Rip out the leading whitespace.
        return lines.map(function (line) {
            return line.replace(/^\s+/gm, '');
        }).join('').trim();
    }
}
