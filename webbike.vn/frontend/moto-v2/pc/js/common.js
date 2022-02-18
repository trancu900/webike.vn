$(function() {
    var $w = $(window),
        $b = $('body');
    var FOLLOW_PRODUCT  = 1;
    var FOLLOW_CUSTOMER = 2;
    var url_login = $('#url_login').val();
    var common = {};
     /*  Init slider
    =================================================== */
    common.initSlider = function(selector, o) {
        if ('owlCarousel' in $.fn) {
            selector.each(function(){
                var _o = {
                    items:6,
                    loop:true,
                    lazyLoad: true,
                    dots: false,
                    nav: true,
                    loadedClass:'owl-loaded'
                };
                var self = $(this);

                var options = $.extend(true, {}, _o, o);
                if(self.hasClass('.owl-loaded')){
                    return;
                }

                selector.owlCarousel(options);
            })

        }
    }

    window.COMMON = window.COMMON || common;

    common.showLoading = function(selector){
        selector.append('<div id="menu-overlay" class="loading"></div>');
    }

    common.hideLoading = function(selector){
        selector.find('#menu-overlay').remove();
    }

     /* Prompt dialogs
    ==================================================*/
    common.alertify = null;

    common.alert = function(msg) {
        alert(msg || '');
    };

    common.confirm = function(msg, callback_ok, callback_ng) {
        var result = confirm(msg || '');

        if (!!result) {
            if (typeof callback_ok == 'function') {
                callback_ok.call(this);
            }
        } else {
            if (typeof callback_ng == 'function') {
                callback_ng.call(this);
            }
        }
    };

    common.prompt = function(msg, default_value, callback_ok, callback_ng) {
        var result = prompt(msg || '', default_value);

        if (result != null) {
            if (typeof callback_ok == 'function') {
                callback_ok.call(this, null, result);
            }
        } else {
            if (typeof callback_ng == 'function') {
                callback_ng.call(this);
            }
        }
    };

    common.notify = function(msg, callback) {
        // console.log(msg);
    };
    common.followProduct = function(obj){
        if($(obj).find('i').hasClass("unlike")){
            $(obj).find('i').removeClass('unlike');
            $(obj).find('i').addClass('liked');
        }else{
            $(obj).find('i').removeClass('like');
            $(obj).find('i').addClass('unlike');
        }
        var data    =   {
            'product_id':   $(obj).attr('data-id'),
            'data_type' :   $(obj).attr('data-type'),
            '_token'    :   $('#form_token').val()
        };
        $.ajax({
             data: data,
             method: "POST",
             url: $('#url_follow_product').val()
       })
       .done(function( data ) {
            //set message for product or for shop
            var follow_success = $(obj).attr('data-type') == FOLLOW_CUSTOMER ? LANG.follow_shop_successfully: LANG.follow_product_successfully;
            var follow_nosuccess = $(obj).attr('data-type') == FOLLOW_CUSTOMER ? LANG.follow_shop_nosuccessfully: LANG.follow_product_nosuccessfully;
            var follow_nologin = $(obj).attr('data-type') == FOLLOW_CUSTOMER ? LANG.follow_shop_nologin: LANG.follow_nologin;
           if(data != '2'){
               if (data == '1') {
                    if ('COMMON' in window) {
                        COMMON.notify(follow_success);
                    }
               } else {
                    if ('COMMON' in window) {
                           COMMON.notify(follow_nosuccess);
                        }
                   }
           } else {
                if($(obj).find('i').hasClass("unlike")){
                $(obj).find('i').removeClass('unlike');
                $(obj).find('i').addClass('liked');
            }else{
                $(obj).find('i').removeClass('like');
                $(obj).find('i').addClass('unlike');
            }
                COMMON.notify(follow_nologin);
           }
       })
        .fail(function() {
            if($(obj).find('i').hasClass("unlike")){
                $(obj).find('i').removeClass('unlike');
                $(obj).find('i').addClass('liked');
            }else{
                $(obj).find('i').removeClass('like');
                $(obj).find('i').addClass('unlike');
            }
        })
    }
    if ('alertify' in window) {
        common.resetAlertify = function() {
            alertify.okBtn('OK').cancelBtn('Cancel')
                .maxLogItems(2)
                .logPosition('bottom left')
                .closeLogOnClick(true)
                .delay(5000);
        }

        common.alertify = alertify;
        common.alert = alertify.alert;
        common.confirm = alertify.confirm;
        common.prompt = alertify.prompt;
        common.notify = function(msg, type) {
            switch (type) {
                case 'success':
                    alertify.success(msg);
                    break;
                case 'error':
                    alertify.error(msg);
                    break;
                default:
                    alertify.log(msg);
            }
        }
    }
    /*
    |--------------------------------------------------------------------------
    | Trigger reload window state
    |--------------------------------------------------------------------------
    */
    setTimeout(function() {
        $w.trigger('scroll');
    }, 200);
    function toggle_to_top_button() {
        $(this).scrollTop() > 50
            ? $("#back-to-top").addClass("visibled")
            : $("#back-to-top").removeClass("visibled");
    }
    function back_to_top() {
        $("html, body").animate(
            {
                scrollTop: 0
            },
            500
        );
    }
    $("#back-to-top").click(function() {
        back_to_top();
    });
    $(window).scroll(function() {
        toggle_to_top_button();
    });

    var language_selection = $("#language_selection");

    language_selection.find("a").click(function() {
        var key = 'zenli';
        var key_tmp = 'zenli_tmp';
        var value = $(this).data('zenli');

        // set cookies zenli when click on flag language
        var expires = new Date();
        expires.setTime(expires.getTime() + (31 * 24 * 60 * 60 * 1000)); // expire time: 31 day
        document.cookie = key + '=' + value +';path=/'+ ';expires=' + expires.toUTCString();

        expires.setTime(expires.getTime() + (31 * 24 * 60 * 60 * 1000)); // expire time: 31 day
        document.cookie = key_tmp + '=' + value +';path=/'+ ';expires=' + expires.toUTCString();
    });


    /*
    |--------------------------------------------------------------------------
    | Convert Number To Word
    |--------------------------------------------------------------------------
    */
    common.numberToWord = function(number){
        return num2Word2.convert(number);
    }

    const num2Word2 = function() {
        var t = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"],
            r = function(r, n) {
                var o = "",
                    a = Math.floor(r / 10),
                    e = r % 10;
                return a > 1 ? (o = " " + t[a] + " mươi", 1 == e && (o += " mốt")) : 1 == a ? (o = " mười", 1 == e && (o += " một")) : n && e > 0 && (o = " lẻ"), 5 == e && a >= 1 ? o += " lăm" : 4 == e && a >= 1 ? o += " tư" : (e > 1 || 1 == e && 0 == a) && (o += " " + t[e]), o
            },
            n = function(n, o) {
                var a = "",
                    e = Math.floor(n / 100),
                    n = n % 100;
                return o || e > 0 ? (a = " " + t[e] + " trăm", a += r(n, !0)) : a = r(n, !1), a
            },
            o = function(t, r) {
                var o = "",
                    a = Math.floor(t / 1e6),
                    t = t % 1e6;
                a > 0 && (o = n(a, r) + " triệu", r = !0);
                var e = Math.floor(t / 1e3),
                    t = t % 1e3;
                return e > 0 && (o += n(e, r) + " ngàn", r = !0), t > 0 && (o += n(t, r)), o
            };
        return {
            convert: function(r) {
                if (0 == r) return t[0];
                var n = "",
                    a = "";
                do ty = r % 1e9, r = Math.floor(r / 1e9), n = r > 0 ? o(ty, !0) + a + n : o(ty, !1) + a + n, a = " tỷ"; while (r > 0);
                return n.trim()
            }
        }
    }();


});