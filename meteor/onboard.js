(function($) {

    $.fn.isOnScreen = function(bounding) {

        var win = $(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        var win2 = $(bounding);

        var viewport2 = {
            top: win2.scrollTop(),
            left: win2.scrollLeft()
        };
        viewport2.right = viewport2.left + win2.width();
        viewport2.bottom = viewport2.top + win2.height();

        var bounds2 = this.offset();
        bounds2.right = bounds2.left + this.outerWidth();
        bounds2.bottom = bounds2.top + this.outerHeight();

        if (win2)
            return (!(viewport2.right < bounds2.left || viewport2.left > bounds2.right || viewport2.bottom < bounds2.top || viewport2.top > bounds2.bottom));
        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

    };

    var onboard = function() {
        var container,
            defaults = {
                margin: 10
            },

            scrollBox = false,
            topMask = $("<div/>").addClass("onboardMask top"),
            bottomMask = $("<div/>").addClass("onboardMask bottom"),
            leftMask = $("<div/>").addClass("onboardMask left"),
            rightMask = $("<div/>").addClass("onboardMask right"),
            bubble = $("<div/>").addClass("onboardBubble"),
            loader = $("<div/>").addClass("onboardLoaderWrap").html('<div class="onboardLoader"><div class="onboardDots"><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div><div class="onboardDot"></div></div></div>'),
            loaderMessage = $('<div/>').addClass("onboardLoaderMessage"),
            lastScroll = 0,
            holdingSteps,
            steps,
            position,
            clickThrough = false,

            prevButton = $("<button type='button'/>").addClass("btn").html("Back"),
            nextButton = $("<button type='button'/>").addClass("btn btn-success").html("Next"),
            arrow = $("<div/>").addClass("onboardBubble-arrow").addClass("top"),
            count = 20,

            getElement = function(i, start, callback) {
                if (!steps) {
                    return;
                }
                if (start) {
                    count = 100;
                }
                var element = $(steps[i].selector);
                if (!element.length || element.width() <= 0 && element.height() <= 0) {
                    if (count) {
                        loaderMessage.html('Waiting...');
                        loader.css({
                            opacity: 1,
                            'pointer-events': 'all'
                        });
                        count--;
                        setTimeout(function() {
                            getElement(i, false, callback);
                        }, 100);
                    } else {
                        console.log('Bad jquery selector:', steps[i].selector);
                        console.log('Exiting Tour...');
                        loaderMessage.html('Uh Oh! Something went wrong with this tour, but try, try again!');
                        setTimeout(function() {
                            clearGuide();
                        }, 8000);
                    }
                } else {
                    loader.css({
                        opacity: 0,
                        'pointer-events': 'none'
                    });
                    callback(element);
                }
            },

            gotoStep = function(i) {
                var delay = 0;
                scrollIntoView(function() {
                    if (steps) {
                        if (typeof steps[i].options != 'undefined') {
                            if (typeof steps[i].options.before != 'undefined') {
                                steps[i].options.before();
                            }
                            delay = angular.isDefined(steps[i].options.delay) ? steps[i].options.delay : delay;
                        }
                        setTimeout(function() {
                            positionMask(i);
                            positionBubble(i);
                        }, delay);
                    }
                });
            },
            nextStep = function() {
                if (steps) {
                    if (position > -1) {
                        if (typeof steps[position].options != 'undefined') {
                            if (typeof steps[position].options.after != 'undefined') {
                                steps[position].options.after();
                            }
                        }
                    }
                    position++;
                    if (position >= steps.length) {
                        clearGuide();
                    } else {
                        gotoStep(position);
                    }
                }
            },
            prevStep = function() {
                position--;
                if (position < 0) {
                    position = steps.length - 1;
                }
                gotoStep(position);
            },
            getElementAttrs = function(element) {
                return {
                    top: element.offset().top,
                    left: element.offset().left,
                    width: element.outerWidth(),
                    height: element.outerHeight()
                };
            },
            positionMask = function(i) {
                getElement(i, true, function(element) {
                    var margin = (steps[i].options && steps[i].options.margin) ? steps[i].options.margin : options.margin,
                        attrs = getElementAttrs(element),
                        top = attrs.top,
                        left = attrs.left,
                        width = attrs.width,
                        height = attrs.height;

                    topMask.css({
                        top: 0 - margin + 'px',
                        height: top + "px"
                    });

                    bottomMask.css({
                        top: (height + top + margin) + "px",
                        height: ($(document).height() - height - top - margin) + "px"
                    });

                    leftMask.css({
                        left: 0 - margin + "px",
                        width: left + "px",
                        top: (top - margin) + "px",
                        height: (height + margin * 2) + "px"
                    });

                    rightMask.css({
                        left: (left + width + margin) + "px",
                        top: (top - margin) + "px",
                        height: (height + margin * 2) + "px",
                        width: ($('html').width() - width - left - margin) + "px",
                    });
                });
            },
            positionBubble = function(i) {
                lastScroll = 0;

                $(".step", bubble).html(i + 1);
                if (steps) {
                    $(".onboard", bubble).html(steps[i].onboard);
                }

                getElement(i, true, function(element) {
                    var margin = (steps[i].options && steps[i].options.margin) ? steps[i].options.margin : options.margin,
                        top = element.offset().top,
                        left = element.offset().left,
                        width = element.outerWidth(),
                        height = element.outerHeight();

                    var css = {
                        opacity: 1
                    };

                    var theArrow = $(".onboardBubble-arrow", bubble);

                    theArrow
                        .removeClass('top bottom left right')
                        .css({
                            "top": '',
                            "bottom": '',
                            "left": '',
                            "right": ''
                        });

                    if (width > height) {

                        if ((top + height + bubble.outerHeight()) + margin * 2 > $('html').height()) {
                            theArrow.addClass('bottom');
                            css.top = top - bubble.outerHeight() - margin * 2 + "px";
                        } else {
                            theArrow.addClass('top');
                            css.top = top + height + margin * 2 + "px";
                        }

                        if ((left + bubble.outerWidth()) > $('html').width()) {
                            theArrow.css({
                                "right": margin + "px"
                            });
                            css.left = left + width - bubble.outerWidth() + "px";
                        } else {
                            theArrow.css({
                                "left": margin + "px"
                            });

                            css.left = left + "px";
                        }

                    } else {

                        if ((top + height + bubble.outerHeight()) > $('html').height()) {
                            theArrow.css({
                                "bottom": margin + "px"
                            });
                            css.top = (top + height - bubble.outerHeight()) + "px";
                        } else {
                            theArrow.css({
                                "top": margin + "px"
                            });
                            css.top = (top) + "px";
                        }

                        if ((left + bubble.outerWidth()) > $('html').width()) {
                            theArrow.addClass('right');
                            css.left = left - bubble.outerWidth() - margin * 2 + "px";
                        } else {
                            theArrow.addClass('left');
                            css.left = left + width + margin * 2 + "px";
                        }

                    }

                    bubble.animate(css, 400, 'linear', function() {
                        scrollIntoView();
                        if (steps) {
                            if (typeof steps[i].options != "undefined")
                                if (typeof steps[i].options.callback != "undefined") {
                                    steps[i].options.callback();
                                }
                        }
                    });

                    prevButton.removeClass("disabled");
                    nextButton.removeClass("disabled");

                    if (!position) {
                        prevButton.addClass("disabled");
                    }

                    if (position == (steps.length - 1)) {
                        nextButton.html("Close").addClass("btn-danger");
                    } else {
                        nextButton.html("Next").removeClass("btn-danger");
                    }


                    scrollIntoView();
                });
            },
            debounce = function(func, threshold, execAsap) {

                var timeout;

                return function debounced() {
                    var obj = this,
                        args = arguments;

                    function delayed() {
                        if (!execAsap)
                            func.apply(obj, args);
                        timeout = null;
                    }

                    if (timeout)
                        clearTimeout(timeout);
                    else if (execAsap)
                        func.apply(obj, args);

                    timeout = setTimeout(delayed, threshold || 100);
                };

            },
            updateScroll = debounce(function(scrollTop) {
                positionMask(position);
                positionBubble(position);
            }, 200),
            scrollIntoView = function(callback) {
                getElement(position, true, function(element) {
                    var scrollElementRuler = $(document);
                    var scrollElement = $('html, body');
                    if (scrollBox) {
                        scrollElementRuler = scrollBox;
                        scrollElement = scrollBox;
                    }

                    if ((scrollElementRuler.scrollTop() > element.offset().top) || ((scrollElementRuler.scrollTop() + scrollElementRuler.height()) < element.offset().top)) {
                        scrollElement.animate({
                            scrollTop: element.offset().top - 20
                        }, 500, null, function() {
                            if (callback)
                                callback();
                        });
                    } else {
                        if (callback)
                            callback();
                    }
                });
            },
            clearGuide = function() {

                steps = null;

                bubble.animate({
                    top: -(bubble.outerHeight() * 2) + 'px',
                }, 400, 'linear', function() {
                    bubble.removeAttr('style').remove();
                });

                loader.css({
                    opacity: 0,
                    'pointer-events': 'none'
                });

                topMask.add(bottomMask).add(leftMask).add(rightMask).css('opacity', '0');
                setTimeout(function() {
                    topMask.add(bottomMask).add(leftMask).add(rightMask).removeAttr('style').add(loader).remove();
                }, 500);

                if (scrollBox)
                    scrollBox.unbind('scroll');
            },
            getMaximumZIndex = function() {
                var max = 0;
                $("*").each(function() {
                    var current = parseInt($(this).css("zIndex"), 10);
                    if (current > max) {
                        max = current;
                    }
                });
                return max;
            };


        return {
            init: function(opts) {
                container = $(this);
                options = $.extend({}, defaults, opts);
                steps = [];
                holdingSteps = [];
                position = -1;
                zIndex = getMaximumZIndex();

                if (typeof opts != 'undefined') {
                    if (typeof opts.steps != 'undefined')
                        holdingSteps = opts.steps;
                    if (typeof opts.clickThrough != 'undefined')
                        clickThrough = opts.clickThrough;
                    if (typeof opts.scrollBox != 'undefined') {
                        scrollBox = $(opts.scrollBox);
                        scrollBox.scroll(function() {
                            updateScroll(scrollBox.scrollTop());
                        });
                    }
                    if (typeof opts.afterExit != 'undefined') {
                        afterExit = opts.afterExit;
                    }
                }


                topMask.add(bottomMask).add(leftMask).add(rightMask).css("z-index", zIndex + 1);
                loader.css("z-index", zIndex + 3);
                loader.append(loaderMessage);
                bubble.css("z-index", zIndex + 2).html("").append(arrow).append($("<div/>").addClass("step btn-primary").html("1")).append($("<div/>").addClass("onboard")).append($("<div/>").addClass("btn-group pull-right").append(prevButton).append(nextButton));

                prevButton.on("click", function() {
                    if (!$(this).hasClass("disabled")) {
                        prevStep();
                    }
                }).keypress(function(e) {
                    if (e.which == 13) { // Checks for the enter key
                        e.preventDefault(); // Stops IE from triggering the button to be clicked
                    }
                });
                nextButton.on("click", function() {
                    if (!$(this).hasClass("disabled")) {
                        nextStep();
                    }
                }).keypress(function(e) {
                    if (e.which == 13) { // Checks for the enter key
                        e.preventDefault(); // Stops IE from triggering the button to be clicked
                    }
                });

                var maskExit = true;
                if (typeof opts.maskExit != 'undefined') {
                    if (!opts.maskExit)
                        maskExit = false;
                }
                if (maskExit) {
                    topMask.add(bottomMask).add(leftMask).add(rightMask).on("click", function() {
                        clearGuide();
                        if (afterExit) {
                            afterExit();
                        }
                    });
                }

                if (clickThrough) {
                    topMask.add(bottomMask).add(leftMask).add(rightMask).css("pointer-events", "none");
                }

                return {
                    addStep: function(selector, onboard, options) {
                        holdingSteps.push({
                            selector: selector,
                            onboard: onboard,
                            options: options || {}
                        });
                    },
                    setOptions: function(opts) {
                        $(container).guide(opts);
                    },
                    stop: function() {
                        clearGuide();
                    },
                    start: function() {
                        container.append(topMask, bottomMask, leftMask, rightMask, bubble, loader);
                        topMask.add(bottomMask).add(leftMask).add(rightMask).animate({
                            opacity: 0.5
                        }, 500);
                        position = -1;
                        steps = [];

                        function addToSteps(step) {
                            steps.push({
                                selector: step.selector,
                                onboard: step.onboard,
                                options: step.options ? step.options : {}
                            });
                        }
                        $.each(holdingSteps, function(i, step) {
                            addToSteps(step);
                        });
                        nextStep();
                    },
                    next: function() {
                        nextStep();
                    },
                    previous: function() {
                        prevStep();
                    },
                    gotoStep: function(i) {
                        gotoStep(i);
                    }
                };
            },
        };
    }();

    $.fn.extend({
        onboard: onboard.init
    });
}(jQuery));
