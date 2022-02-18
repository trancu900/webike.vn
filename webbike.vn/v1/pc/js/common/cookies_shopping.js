/*
|--------------------------------------------------------------------------
| General scripts storing cookies for shopping
|--------------------------------------------------------------------------
*/

$(function() {

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
}(jQuery));
