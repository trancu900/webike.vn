/*
|--------------------------------------------------------------------------
| Common JS for 3rd-party plugins
|--------------------------------------------------------------------------
|
| This file is used for third-party plugins, such as Google Analytics.
|
*/

(function() {
    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

    // turn off built-in form validation
    // for (var f = document.forms, i = f.length; i--;) f[i].setAttribute('novalidate', true);

    // scrolling hack by removing pointer-events
    // see http://www.thecssninja.com/css/pointer-events-60fps
    var body = document.body,
        timer;

    window.addEventListener('scroll', function() {
        clearTimeout(timer);
        if (!body.classList.contains('no-click')) {
            body.classList.add('no-click');
        }

        timer = setTimeout(function() {
            body.classList.remove('no-click');
        }, 50);
    }, false);
}());

/*
|--------------------------------------------------------------------------
| Init jquery plugins
|--------------------------------------------------------------------------
*/

$(function() {

    /*
    |--------------------------------------------------------------------------
    | Override cookies helper
    |--------------------------------------------------------------------------
    */

    if ('Cookies' in window) {
        WVN.cookies = Cookies.noConflict();
        WVN.cookies.json = true;
        WVN.cookies.path = '/';
    }

    /*
    |--------------------------------------------------------------------------
    | Override WVN helpers using alertify
    |--------------------------------------------------------------------------
    */
   // if ('alertify' in window) {
   //      common.resetAlertify = function() {
   //          alertify.okBtn('OK').cancelBtn('Cancel')
   //              .maxLogItems(2)
   //              .logPosition('bottom left')
   //              .closeLogOnClick(true)
   //              .delay(5000);
   //      }

   //      common.alertify = alertify;
   //      common.alert = alertify.alert;
   //      common.confirm = alertify.confirm;
   //      common.prompt = alertify.prompt;
   //      common.notify = function(msg, type) {
   //          switch (type) {
   //              case 'success':
   //                  alertify.success(msg);
   //                  break;
   //              case 'error':
   //                  alertify.error(msg);
   //                  break;
   //              default:
   //                  alertify.log(msg);
   //          }
   //      }
   //  }
    // if ('alertify' in window) {

    //     alertify.set({
    //         labels: {
    //             ok: 'OK',
    //             cancel: 'Cancel'
    //         },
    //         delay: 5000,
    //         buttonReverse: !!(navigator.platform.indexOf('Win') > -1),
    //         buttonFocus: 'ok'
    //     });

    //     WVN.alert = alertify.alert;
    //     WVN.confirm = alertify.confirm;
    //     WVN.prompt = alertify.prompt;
    //     WVN.notify = alertify.log;

    // }

    /*
    |--------------------------------------------------------------------------
    | Override WVN helpers using Maps API
    |--------------------------------------------------------------------------
    | Google Maps API required, callback parameter points to below function
    */

    window.init_google_maps = function() {
        var old_method = WVN.createMap;

        WVN.createMap = function(target, address, name, w, h) {
            if ($.isArray(address) && address.length == 2) {
                var LatLng = new google.maps.LatLng(address[0], address[1]);
                return generateMap(LatLng);
            }

            //定義一個Geocoder物件
            var geocoder = new google.maps.Geocoder(),
                location = {
                    address: address
                };

            geocoder.geocode(location, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var LatLng = results.shift().geometry.location;
                    return generateMap(LatLng);
                } else {
                    return old_method(target, address, name, w, h);
                }
            });

            function generateMap(LatLng) {
                var mapOptions = {
                        zoom: 15,
                        panControl: false,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center: LatLng
                    },
                    $target = $(target).empty(),
                    container = $('<div />').css({
                        width: (w || 198) + 'px',
                        height: (h || 245) + 'px',
                        display: 'block'
                    }).appendTo($target);

                // init map and marker
                var map = new google.maps.Map(container.get(0), mapOptions);
                var marker = new google.maps.Marker({
                    draggable: false,
                    position: LatLng,
                    map: map
                });

                marker.addListener('click', function() {
                    window.open('https://www.google.com/maps/place/' + encodeURIComponent(address));
                });

                return container.attr('title', name);
            }
        }

        $(window).trigger('mapsready');
    }

    /*
    |--------------------------------------------------------------------------
    | Override smooth scroll
    |--------------------------------------------------------------------------
    */

    WVN.scrollTo = function(target, speed, offsetTop) {
        target = $(target ? target : 'html');

        var speed = speed || 400,
            position = target.offset().top;

        $('body, html').animate({
            scrollTop: position - (offsetTop || 0)
        }, speed, 'swing');

        return target;
    }

    /*
    |--------------------------------------------------------------------------
    | Override jquery select2 with default options
    |--------------------------------------------------------------------------
    */

    if ('select2' in $.fn) {
        WVN.select2 = function(target, options, data) {
            var select_inputs = $(target),
                default_options = {
                    language: WVN.language,
                    matcher: function(params, data) {
                        if ($.trim(params.term) === '') {
                            return data;
                        }

                        if (data.children && data.children.length > 0) {
                            var match = $.extend(true, {}, data),
                                matcher = arguments.callee;

                            for (var c = data.children.length - 1; c >= 0; c--) {
                                var child = data.children[c],
                                    matches = matcher(params, child);

                                if (matches == null) {
                                    match.children.splice(c, 1);
                                }
                            }

                            if (match.children.length > 0) {
                                return match;
                            }

                            return matcher(params, match);
                        }

                        var original = WVN.helpers.remove_accents(data.text).replace(/\W+/g, '');
                        var term = WVN.helpers.remove_accents(params.term).replace(/\W+/g, '');

                        if (original.indexOf(term) > -1) {
                            return data;
                        }

                        return null;
                    }
                };

            // extend default
            if (typeof options == 'object') {
                $.extend(default_options, options);
            } else if (typeof options == 'string') {
                default_options[options] = data;
            }

            // init for each element
            return select_inputs.each(function() {
                var self = $(this),
                    self_options = $.extend({}, default_options);

                // hide default search in dropdown
                if (self.is('[data-hide-search]')) {
                    self_options.minimumResultsForSearch = Infinity;
                }

                // init select2
                self.attr('data-placeholder', self.attr('placeholder'))
                    .select2(self_options);
            });
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Override jquery raty with default options
    |--------------------------------------------------------------------------
    */

    if ('raty' in $.fn) {
        $.fn.raty.defaults.path = BASE + '/frontend/img/vendor';
        $.fn.raty.defaults.readOnly = true;
        $.fn.raty.defaults.cancel = false;
        $.fn.raty.defaults.space = false;
        $.fn.raty.defaults.half = true;
        $.fn.raty.defaults.hints = [1, 2, 3, 4, 5];

        WVN.ratings = function(target, options, hide_label) {
            return $(target).each(function() {
                var self = $(this),
                    score = parseFloat(self.data('ratings'), 10) || 0,
                    self_options = $.extend({}, options);

                self_options.score = score;

                if (!hide_label && !self.is('[data-hide-label]')) {
                    self.html('<b class="highlight">' + score.toFixed(2) + '</b> ');
                }

                self.raty(self_options);
            });
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Override truncate function
    |--------------------------------------------------------------------------
    */

    if ('dotdotdot' in $.fn) {
        var default_options = {
            ellipsis: '... '
        }

        WVN.truncate = function(target, options) {
            var self_options = $.extend({}, default_options, options);
            $(target).dotdotdot(self_options).css('overflow', '');
            return target;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Override timezone
    |--------------------------------------------------------------------------
    */

    if ('jstz' in window) {
        WVN.timezone = jstz.determine().name();
    }

    /*
    |--------------------------------------------------------------------------
    | Override jquery validation
    |--------------------------------------------------------------------------
    */

    // if ('validator' in $) {
    //     var validator = $.validator;

    //     validator.setDefaults({
    //         errorElement: 'p',
    //         errorClass: 'message form-error',
    //         validClass: 'message form-valid',
    //         ignore: ':hidden, [formnovalidate], [disabled]',

    //         // prevent validation on input's events
    //         // this will allow validation on submit
    //         onfocusout: false,
    //         onkeyup: false,
    //         onclick: false,

    //         // place error messages
    //         errorPlacement: function(error, element) {
    //             var element = $(element),
    //                 target = element.closest('.form-group');

    //             if (!target.length || target.find('input:not(:radio),textarea,select').length > 1) {
    //                 target = element.parent();
    //             }

    //             if (target.length) {
    //                 target.append(error);
    //             } else {
    //                 error.insertAfter(element);
    //             }
    //         },

    //         // highlight error messages
    //         highlight: function(element, errorClass, validClass) {
    //             var element = $(element),
    //                 target = element.closest('.form-group');

    //             if (!target.length || target.find('input:not(:radio),select,textarea').length > 1) {
    //                 target = element.parent();
    //             }

    //             target.addClass(errorClass).removeClass(validClass);
    //         },

    //         // unhighlight error messages
    //         unhighlight: function(element, errorClass, validClass) {
    //             var element = $(element),
    //                 target = element.closest('.form-group');

    //             if (!target.length || target.find('input:not(:radio),select,textarea').length > 1) {
    //                 target = element.parent();
    //             }

    //             target.removeClass(errorClass).addClass(validClass);
    //         }
    //     });
    // }

    /*
    |--------------------------------------------------------------------------
    | WYSIWYG Editors
    |--------------------------------------------------------------------------
    */

    if ('trumbowyg' in $.fn) {
        // create HTML editor objects
        // http://alex-d.github.io/Trumbowyg/
        WVN.createEditor = function(target, options) {
            return $(target).each(function() {
                var self = $(this),
                    self_options = $.extend(true, {
                        fullscreenable: true,
                        autogrow: true,
                        removeformatPasted: true,
                        resetCss: true,
                        mobile: true,
                        tablet: true,
                        btns: ['bold', 'italic', 'underline', '|', 'link', 'viewHTML']
                    }, options);

                self.trumbowyg(self_options);
            });
        }
    }
});

/*
|--------------------------------------------------------------------------
| Common JS for modules
|--------------------------------------------------------------------------
|
| This file is used for module initialization, such as top slider module.
|
*/

(function($) {
    var DEFAULT_DISPLAY_TIMEOUT = 6000;

    window.MODULES = {

        /*
        |--------------------------------------------------------------------------
        | Module top-slider
        |--------------------------------------------------------------------------
        */

        initTopSlider: function() {
            var top_slider = $('#top-slider-container');

            if (top_slider.length && 'slick' in top_slider) {
                top_slider.slick({
                    accessibility: false,
                    arrows: true,
                    autoplay: true,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    dots: true,
                    speed: 500,
                    touchThreshold: 100
                });
            }

            return top_slider;
        },

        initTopVNSlider: function() {
            var topvn_slider = $('#slider_topvn');

            if (topvn_slider.length && 'slick' in topvn_slider) {
            	topvn_slider.slick({
            		accessibility: false,
                    arrows: false,
                    autoplay: true,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    dots: true,
                    speed: 500,
                    touchThreshold: 100
                });
            }

            return topvn_slider;
        },

        /*
        |--------------------------------------------------------------------------
        | Module Brand-slider
        |--------------------------------------------------------------------------
        */

        initBrandSlider: function() {
            var brand_slider = $('#brand-slider');

            if (brand_slider.length && 'slick' in brand_slider) {
            	brand_slider.slick({
                    accessibility: false,
                    arrows: true,
                    autoplay: false,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    speed: 500,
                    touchThreshold: 100
                });
            }

            return brand_slider;
        },

        /*
        |--------------------------------------------------------------------------
        | Module top-motor-banners
        |--------------------------------------------------------------------------
        */

        initTopMotorBanners: function() {
            var top_banners = $('#top-motor-banners-container');

            if (top_banners.length && 'slick' in top_banners) {
                top_banners.slick({
                    accessibility: false,
                    arrows: false,
                    autoplay: true,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    speed: 500,
                    touchThreshold: 100
                });
            }

            return top_banners;
        },

        /*
        |--------------------------------------------------------------------------
        | Module top-motor-makers
        |--------------------------------------------------------------------------
        */

        initTopMotorMakers: function() {
            var motor_makers = $('#top-motor-makers-container');

            if (motor_makers.length && 'slick' in motor_makers) {
                motor_makers.slick({
                    accessibility: false,
                    autoplay: true,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    slidesToShow: 7,
                    slidesToScroll: 7,
                    speed: 500,
                    touchThreshold: 100
                });
            }

            return motor_makers;
        },

        /*
        |--------------------------------------------------------------------------
        | Module top-motor-types
        |--------------------------------------------------------------------------
        */

        initTopMotorTypes: function() {
            var top_motor_types = $('#top-motor-types-container');

            if (top_motor_types.length && 'slick' in top_motor_types) {
                top_motor_types.slick({
                    accessibility: false,
                    slidesToShow: 5,
                    slidesToScroll: 5,
                    speed: 500
                });
            }

            return top_motor_types;
        },

        /*
        |--------------------------------------------------------------------------
        | Module featured-motors
        | Module featured-equipments
        |--------------------------------------------------------------------------
        */

        initFeaturedModules: function() {
            var slider_modules = $('.module.featured .slider');

            if (slider_modules.length && 'slick' in slider_modules) {
                slider_modules.slick({
                    accessibility: false,
                    draggable: false,
                    speed: 500
                });

                WVN.truncate(slider_modules.find('label'), {
                    after: '.badge'
                });
            }

            return slider_modules;
        },

        /*
        |--------------------------------------------------------------------------
        | Module bottom-motor-makers
        |--------------------------------------------------------------------------
        */

        initBottomMotorMakers: function() {
            var motor_makers = $('#bottom-motor-makers-container');

            if (motor_makers.length && 'slick' in motor_makers) {
                motor_makers.slick({
                    accessibility: false,
                    arrows: false,
                    autoplay: true,
                    autoplaySpeed: DEFAULT_DISPLAY_TIMEOUT,
                    slidesToShow: 8,
                    slidesToScroll: 8,
                    speed: 800,
                    touchThreshold: 100
                });
            }

            return motor_makers;
        },

        /*
        |--------------------------------------------------------------------------
        | Module recently-viewed-items
        |--------------------------------------------------------------------------
        */

        initRecentlyViewedItemsModule: function() {
            var parent = $('#recently-viewed-items'),
                slider_modules = $('#recently-viewed-items-container'),
                footer = parent.find('.module_footer'),
                footer_next = footer.find('.module-arrow.next'),
                footer_prev = footer.find('.module-arrow.prev'),
                pages = slider_modules.find('.page');

            if (slider_modules.length) {
                if (pages.length > 1 && 'slick' in slider_modules) {
                    slider_modules.slick({
                        accessibility: false,
                        arrows: false,
                        draggable: false,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        speed: 500
                    });

                    // for next button
                    footer_next.click(function() {
                        slider_modules.slick('slickNext');
                        return false;
                    });

                    // for previous button
                    footer_prev.click(function() {
                        slider_modules.slick('slickPrev');
                        return false;
                    });
                } else {
                    footer.slideUp();
                }

                WVN.truncate(slider_modules.find('label'));
            }

            return slider_modules;
        },

        /*
        |--------------------------------------------------------------------------
        | Modules product-grid
        |--------------------------------------------------------------------------
        */

        initProductGridModules: function() {
            var slider_modules = $('.module .product-grid.slider');

            if (slider_modules.length && 'slick' in slider_modules) {
                slider_modules.slick({
                    accessibility: false,
                    draggable: false,
                    speed: 500
                });

                WVN.truncate(slider_modules.find('label'));
            }

            return slider_modules;
        },

        /*
        |--------------------------------------------------------------------------
        | Modules body-media-feed
        |--------------------------------------------------------------------------
        */

        initBodyMediaFeedModule: function() {
            var media_module = $('#body-media-feed');

            if (media_module.length && 'slick' in media_module) {
                WVN.truncate(media_module.find('.sub h4'));
            }

            var height = 36;
            media_module.find('.sub .block').each(function() {
                $(this).find('h5').each(function() {
                    height = Math.max(height, $(this).height())
                }).css('height', height);
                height = 36;
            })

            return media_module;
        },

        /*
        |--------------------------------------------------------------------------
        | Modules body-media-feed
        |--------------------------------------------------------------------------
        */

        initQuickContactModule: function() {
            var form = $('#quick-contact form'),
                input = form.find('input[name="phone_number"]');

            if (form.length) {
                // preset phone number value
                if (input.val() == '') {
                    input.val(WVN.cookies.get('quick-contact-number'));
                }

                // submit handler
                form.submit(function() {
                    var data = form.serialize();

                    form.find('input, button').prop('disabled', true);
                    form.addClass('disabled');

                    if (input.val() != '') {
                        var xhr = $.post(WVN.url('ajax_quick_contact'), data, function(json) {
                            if ('id' in json && json.id) {
                                WVN.alert(WVN.trans('quick_contact_msg_success'));
                                WVN.cookies.set('quick-contact-number', input.val());
                            }
                        }, 'json');

                        xhr.fail(function(jqXHR, textStatus, error) {
                            if (jqXHR.status == 422) {
                                quickError();
                            }
                        });
                    } else {
                        quickError();
                    }

                    return false;
                });

                // error
                function quickError(msg) {
                    msg = msg || WVN.trans('quick_contact_msg_invalid_phone');
                    // show error
                    WVN.alert(msg, function() {
                        form.find('input, button').prop('disabled', false);
                        form.removeClass('disabled');
                        input.focus();
                    });
                }
            }

            return form;
        },

        startLoading: function() {
            $('.spinner').css('display', 'block');
        },

        stopLoading: function() {
            $('.spinner').css('display', 'none');
        },
    }

}(jQuery));

/*
|--------------------------------------------------------------------------
| Common JS scripts
|--------------------------------------------------------------------------
|
| This file is used for global functionalities, such as top menus etc.
|
*/

!(function() {
    // init top menu as soon as possible
    // for more options, see http://goo.gl/bWIepb
    // var top_menus = $('ul.top-menu').superfish({
    //     delay: false,
    //     animation: {
    //         opacity: 'show'
    //     },
    //     animationOut: {
    //         opacity: 'hide'
    //     },
    //     pathLevels: 2,
    //     speed: 'fast',
    //     speedOut: 100,
    //     cssArrows: false,
    //     popUpSelector: 'ul:not(.popup),.sf-mega'
    // })

    // Sub menu for menu-nav
    // var top_menus_moto = $('ul.menu-motor-nav').superfish({
    //     delay: false,
    //     animation: {
    //         opacity: 'show'
    //     },
    //     animationOut: {
    //         opacity: 'hide'
    //     },
    //     pathLevels: 2,
    //     speed: 'fast',
    //     speedOut: 100,
    //     cssArrows: false,
    //     popUpSelector: 'ul:not(.popup),.sf-mega'
    // })
    // End Sub menu for menu-nav


    /*
    |--------------------------------------------------------------------------
    | Lazyload images & fix broken image
    |--------------------------------------------------------------------------
    */
    var DEFAULT_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // fix broken images
    document.body.addEventListener('error', function(e) {
        var broken_img = $(e.target);

        if (broken_img.is('img')) {
            broken_img.attr({
                src: DEFAULT_IMG,
                alt: 'No photo',
                rel: 'nofollow',
                'data-original': broken_img.attr('src')
            }).addClass('broken').closest('figure').addClass('placeholder');
        }
    }, true);

    // remove placeholder bg
    document.body.addEventListener('load', function(e) {
        var loaded_img = $(e.target);

        if (loaded_img.is('img')) {
            loaded_img.closest('figure').addClass('loaded');
        }
    }, true);

    // lazyload for thumbnail
    // var lazyload = $('figure img').each(function() {
    //     var img = $(this).addClass('static');
    //     if (img.is(':hidden')) return;

    //     img.attr({
    //         'data-src-retina': img.attr('src'),
    //         'data-src': img.attr('src'),
    //         'src': DEFAULT_IMG
    //     }).unveil(200);
    // });

    /*
    |--------------------------------------------------------------------------
    | Hack for lazyload jquery
    |--------------------------------------------------------------------------
    |
    | See http://samsaffron.com/archive/2012/02/17/stop-paying-your-jquery-tax
    */

    if ('_q' in window) {
        $.each(window._q, function(index, f) {
            $(f)
        });

        delete _q;
    }

})();

// the rest things should be initialized later
$(function() {
    var $w = $(window),
        $b = $('body'),
        header = $('#top');

    /*
    |--------------------------------------------------------------------------
    | AJAX setup
    |--------------------------------------------------------------------------
    */

    $.ajaxSetup({
        statusCode: {
            401: function() {
                // redirect when 401 Unauthorized
                WVN.alert(WVN.trans('msg_login_prompt'), function() {
                    window.location = WVN.url('ajax_redirect_to_login');
                });
            }
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Update timezone
    |--------------------------------------------------------------------------
    */

    if (!WVN.cookies.get('timezone')) {
        $.post(WVN.url('ajax_update_timezone'), {
            timezone: WVN.timezone
        }, 'json');
    }

    /*
    |--------------------------------------------------------------------------
    | Common UI
    |--------------------------------------------------------------------------
    */

    var overlay = $('<div class="overlay" style="display: none;"></div>').appendTo('body');

    if (Modernizr.touch) {
        overlay.css('cursor', 'pointer');
    }

    var overlay_item = $('ul.top-menu').find('li[data-overlay]');

    // override for menu login popup
    /*
    overlay_item.find(' > a').click(function() {
        var menu_link = $(this),
            parent = menu_link.closest('li'),
            is_open = menu_link.data('open'),
            target = menu_link.siblings('ul');

        // prevent click when it is already open
        if (is_open) return false;

        // turn on open flag
        menu_link.data('open', true);
        parent.addClass('top');

        // show overlay
        overlay.stop(0, 0).fadeIn(50, function() {
            target.fadeIn(200).show().find('input:first').focus();
        });

        // hide popup when click on overlay
        overlay.off('click').one('click', function() {
            menu_link.data('open', false);
            target.fadeOut(100, function() {
                overlay.fadeOut(50);
                parent.removeClass('top');
            });
        });

        return false;
    });
    */
    // stars rating using raty plugin
    WVN.ratings('.ratings');

    // for checkbox lists
    $('ul.checkbox-list input:disabled').closest('li').addClass('disabled');
    $('ul.checkbox-list li.disabled input').prop('disabled', true);

    // init for autocomplete with select2
    WVN.select2('input[autocomplete], select[autocomplete]');

    /*
    |--------------------------------------------------------------------------
    | For top search
    |--------------------------------------------------------------------------
    */

    // var top_search = $('form#search');

    // if (top_search.length) {
    //     var keyword = $('#keyword'),
    //         site_search = top_search.find('select'),
    //         btn_search_moto = $('#btn-search-moto'),
    //         btn_search_shopping = $('#btn-search-shopping');

    //     // init typeahead plugin
    //     if ('typeahead' in keyword) {
    //         var suggestions = new Bloodhound({
    //             datumTokenizer: Bloodhound.tokenizers.obj.nonword('title'),
    //             queryTokenizer: Bloodhound.tokenizers.nonword,
    //             remote: {
    //                 url: WVN.url('ajax_top_suggestion_json') + '?q=%keyword%',
    //                 wildcard: '%keyword%'
    //             }
    //         });

    //         keyword.typeahead({
    //             hint: false,
    //             highlight: true,
    //             wordsOnly: true,
    //             minLength: 1,
    //             classNames: {
    //                 hint: 'hint',
    //                 menu: 'suggestion-list',
    //                 open: 'open',
    //                 highlight: 'highlight',
    //                 cursor: 'active',
    //                 suggestion: 'suggestion-item',
    //                 selectable: 'selectable'
    //             }
    //         }, {
    //             name: 'q',
    //             display: function(item) {
    //                 return $.trim(item.title || item._query);
    //             },
    //             source: suggestions,
    //             limit: 100,
    //             templates: {
    //                 suggestion: function(item) {
    //                     return item.html;
    //                 },
    //             }
    //         }).on('typeahead:select', function(event, item) {
    //             if ('html' in item) {
    //                 var item = $(item.html),
    //                     href = item.is('a') ? item.attr('href') : item.find('a').attr('href');

    //                 if (!href) return;

    //                 var redirect_timeout = 0;

    //                 // track click event on items
    //                 if ('ga' in window) {
    //                     var click = 'click-results';

    //                     switch (true) {
    //                         case item.hasClass('brand'):
    //                             click = 'click-brand';
    //                             break;

    //                         case item.hasClass('series-product'):
    //                         case item.hasClass('series'):
    //                             click = 'click-series';
    //                             break;

    //                         case item.hasClass('type'):
    //                             click = 'click-type';
    //                             break;

    //                         case item.hasClass('product') && item.is(':not(.suggestion-hint)'):
    //                             click = 'click-product';
    //                             break;

    //                         default:
    //                             // clear search id from cookies when view all results
    //                             if (!item.is('a')) {
    //                                 // WVN.cookies.remove('search_id');
    //                             }
    //                     }

    //                     WVN.tracking('Search', click, href, function() {
    //                         window.location.href = href;
    //                     });

    //                     return;
    //                 }

    //                 // redirect to target page
    //                 window.location.href = href;
    //             }
    //         });

    //         // disabled selection for header and hint
    //         // var suggestion_list = $('#search .suggestion-list');
    //         // keyword.on('typeahead:render typeahead:idle typeahead:close', function(event, item) {
    //         //     if (event.type == 'typeahead:render') {
    //         //         $('.suggestion-title, .suggestion-hint', suggestion_list).not(':has(a)').removeClass('selectable');

    //         //         suggestion_list.find('a').on('click', function(e) {
    //         //             e.preventDefault();
    //         //         });
    //         //     }

    //         //     keyword.removeClass('loading');
    //         // });

    //         // make loading indicator when requesting
    //         // keyword.on('typeahead:asyncrequest', function() {
    //         //     keyword.addClass('loading');
    //         // }).on('input', function() {
    //         //     if ($.trim(keyword.val()) == '') {
    //         //         keyword.removeClass('loading');
    //         //     }
    //         // });
    //     }

        // var flag_search = 0;
        // btn_search_moto.on('click', function (){
        //     var value = keyword.val().trim();
        //     if(value != ''){
        //         flag_search = 1;
        //         top_search.submit();
        //     }
        //     return false;
        // })

        // btn_search_shopping.on('click', function (){
        //     var value = keyword.val().trim();
        //     if(value != ''){
        //         flag_search = 2;
        //         top_search.submit();
        //     }
        //     return false;
        // })

        // // handle search submit for shopping
        // top_search.submit(function() {
        //   if(flag_search==1){
        //         //search motor;
        //         var value = keyword.val().trim();
        //         if(value != ''){
        //             return true;
        //         }
        //         return false;
        //     }else if(flag_search==2){
        //         //search shopping
        //         var value = keyword.val().trim();

        //         // track submit event
        //         if ('ga' in window) {
        //             // WVN.tracking('Search', 'submit', value);
        //         }

        //         // for shopping search
        //         // Sample:
        //         // http://www.webike.vn/shopping/ps/c/1000/honda/#!search&p.k=honda&p.c=1000
        //         // http://www.webike.vn/shopping/ps/honda/#!search&p.k=honda
        //         var search_url = BASE_SHOPPING + 'ps/',
        //         params = {
        //             'p.k': value
        //         };

        //         // add keyword to url
        //         search_url += (WVN.helpers.url_encode(value) + '/');

        //         // set form action
        //         top_search.attr({
        //             action: search_url + '#!search&' + $.param(params),
        //             method: 'post'
        //         });
        //         return true;
        //     }

        //     if($(this).find('.search-choose').hasClass('hide')){
        //         $(this).find('.search-choose').removeClass('hide');
        //     }
        //   return false;
        // });
    // }


    /*
    |--------------------------------------------------------------------------
    | Trigger reload window state
    |--------------------------------------------------------------------------
    */

    setTimeout(function() {
        $w.trigger('scroll');
    }, 200);

    /*
    |--------------------------------------------------------------------------
    | Process Quick Contact
    |--------------------------------------------------------------------------
    */
    var form = $('form#quick-contact'),
    btnSubmit = form.find('button'),
    input = form.find('input[name="phone_number"]');

    btnSubmit.on('click', function() {
        if(getCookie("quick-contact-number") && getCookie("quick-contact-number") == input.val()){
            WVN.alert(WVN.trans('quick_contact_msg_exists'));
            return false;
        }

        // submit handler
        var data = form.serialize();
        if (input.val() != '') {
            var xhr = $.post(WVN.url('ajax_quick_contact'), data, function(json) {
                if ('id' in json && json.id) {
                    WVN.alert(WVN.trans('quick_contact_msg_success'));
                    setCookie("quick-contact-number", input.val());
                    input.val('');
                }
            }, 'json');

            xhr.fail(function(jqXHR, textStatus, error) {
                if (jqXHR.status == 422) {
                    quickError();
                }
            });
        } else {
          quickError();
        }

        return false;
    });

    form.submit(function(){
      btnSubmit.submit();
    });

    // Show error
    function quickError(msg) {
        msg = msg || WVN.trans('quick_contact_msg_invalid_phone');
        alert(msg);
        input.focus();
    }

    // Set cookies
    function setCookie(key, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000)); // expire time: 1 day
        document.cookie = key + '=' + value +';path=/'+ ';expires=' + expires.toUTCString();
    }

    // Get cookies
    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    // Init select2
    if($(".select-box").length){
        $('.select-box').each(function() {
            $(this).select2({
                width: '100%',
                placeholder: $(this).attr('placeholder'),
            });
        });
    }

    // Search price tool
    $("#myScrollspy a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            } , 400, function(){
                window.location.hash = hash;
            });
        }
    });
    $('.switch-brand').click(function () {
        $(".ct-search-block").hide();
        $(".ct-search-block2").show();
        $(".switch-brand").addClass("active");
        $(".switch-moto").removeClass("active");
    });
    $('.switch-moto').click(function () {
        $(".ct-search-block").show();
        $(".ct-search-block2").hide();
        $(".switch-brand").removeClass("active");
        $(".switch-moto").addClass("active");
    });


    $('.img-slider-for').slick({
        slidesToShow: 1,
        arrows: false,
        fade: true,
        adaptiveHeight: true,
        mobileFirst: true,
        asNavFor: '.img-slider-nav'
    });

    $('.img-slider-nav').slick({
        slidesToShow: 3,
        asNavFor: '.img-slider-for',
        centerMode: true,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 925,
                settings: {
                    slidesToShow: 3,
                    asNavFor: '.img-slider-for',
                    centerMode: true,
                    focusOnSelect: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow:3,
                    asNavFor: '.img-slider-for',
                    centerMode: true,
                    focusOnSelect: true
                }
            }
        ]
    });

    // Slide for list series
    $('.list-part-series, .list-modol-series').slick(
        {
            slidesToShow: 5,
            slidesToScroll: 5,
            autoplay: false,
        }
    );

    // filter list on page list
    filterlist('#list-brand-filter','#filter-brand-list');
    filterlist('#list-type-filter','#filter-type-list');
    filterlist('#list-city-filter','#filter-city-list');
    function filterlist(listfilter, checkboxlist){
        $(listfilter).on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $(checkboxlist).find('li').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    }

    $('#view-cell-bike-list').click(function () {
        $(".list-bike-page-list").addClass("active");
        $("#view-cell-bike-list").addClass("active");
        $("#view-grid-bike-list").removeClass("active");
    });
    $('#view-grid-bike-list').click(function () {
        $(".list-bike-page-list").removeClass("active");
        $("#view-grid-bike-list").addClass("active");
        $("#view-cell-bike-list").removeClass("active");
    });

    $('.btn-module-title').click(function () {
        $(this).parents().eq(1).find('.module-body').toggle();
    });
});