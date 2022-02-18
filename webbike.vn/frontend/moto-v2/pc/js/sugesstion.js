$(function() {
     /*
    |--------------------------------------------------------------------------
    | For top search
    |--------------------------------------------------------------------------
    */
    let action_form  = $('form#search').attr('action');
    var top_search = $('form#search');
    $(document).on('change','#type_search',function(){
        flag_search = $(this).val();
    })
    if (top_search.length) {
        var keyword = $('#keyword'),
            site_search = top_search.find('select'),
            btn_submit = $('#btn_submit'),
            flag_search =1;
        // init typeahead plugin
        if ('typeahead' in keyword) {
            var suggestions = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.nonword('title'),
                queryTokenizer: Bloodhound.tokenizers.nonword,
                remote: {
                    url: WVN.url('ajax_top_suggestion_json') + '?q=%keyword%',
                    wildcard: '%keyword%'
                }
            });

            keyword.typeahead({
                hint: false,
                highlight: true,
                wordsOnly: true,
                minLength: 1,
                classNames: {
                    hint: 'hint',
                    menu: 'suggestion-list',
                    open: 'open',
                    highlight: 'highlight',
                    cursor: 'active',
                    suggestion: 'suggestion-item',
                    selectable: 'selectable'
                }
            }, {
                name: 'q',
                display: function(item) {
                    return $.trim(item.title || item._query);
                },
                source: suggestions,
                limit: 100,
                templates: {
                    suggestion: function(item) {
                        return item.html;
                    },
                }
            }).on('typeahead:select', function(event, item) {
                if ('html' in item) {
                    var item = $(item.html),
                        href = item.is('a') ? item.attr('href') : item.find('a').attr('href');

                    if (!href) return;

                    var redirect_timeout = 0;

                    // track click event on items
                    if ('ga' in window) {
                        var click = 'click-results';

                        switch (true) {
                            case item.hasClass('brand'):
                                click = 'click-brand';
                                break;

                            case item.hasClass('series-product'):
                            case item.hasClass('series'):
                                click = 'click-series';
                                break;

                            case item.hasClass('type'):
                                click = 'click-type';
                                break;

                            case item.hasClass('product') && item.is(':not(.suggestion-hint)'):
                                click = 'click-product';
                                break;

                            default:
                                // clear search id from cookies when view all results
                                if (!item.is('a')) {
                                    // WVN.cookies.remove('search_id');
                                }
                        }

                        WVN.tracking('Search', click, href, function() {
                            window.location.href = href;
                        });

                        return;
                    }
                    window.location.href = href;
                }
            });

            // disabled selection for header and hint
            var suggestion_list = $('#search .suggestion-list');
            keyword.on('typeahead:render typeahead:idle typeahead:close', function(event, item) {
                if (event.type == 'typeahead:render') {
                    $('.suggestion-title, .suggestion-hint', suggestion_list).not(':has(a)').removeClass('selectable');
                    suggestion_list.find('a').on('click', function(e) {
                        e.preventDefault();
                    });
                }
               $('.loading').css('display','none');
            });

            // make loading indicator when requesting
            keyword.on('typeahead:asyncrequest', function() {
                $('.loading').css('display','block');
            }).on('input', function() {
                if ($.trim(keyword.val()) == '') {
                    $('.loading').css('display','none');
                }
            });
        }

        btn_submit.on('click', function (){
            flag_search = $('#type_search').val();
            var value = keyword.val().trim();
            if(value != ''){
                top_search.submit();
            }
            return false;
        })
        // handle search submit for shopping
        top_search.submit(function() {
            if(flag_search == 1){
                $('#search').removeAttr('target');
                //search motor;
                var value = keyword.val().trim();
                if(value != ''){
                    top_search.attr({
                        action:  action_form,
                        method: 'GET'
                    });
                    return true;
                }
                return false;
            }else if(flag_search == 2){
                $('#search').attr('target','_blank');
                //search shopping
                var value = keyword.val().trim();

                // track submit event
                // if ('ga' in window) {
                //     WVN.tracking('Search', 'submit', value);
                // }

                // http://www.webike.vn/shopping/ps/c/1000/honda/#!search&p.k=honda&p.c=1000
                // http://www.webike.vn/shopping/ps/honda/#!search&p.k=honda
                var search_url = BASE_SHOPPING + 'ps/',
                params = {
                    'p.k': value
                };
                search_url += (WVN.helpers.url_encode(value) + '/') + '#!search&' + $.param(params)
                 window.open(search_url, '_blank');
                return false;
            }

            if($(this).find('.search-choose').hasClass('hide')){
                $(this).find('.search-choose').removeClass('hide');
            }
            return false;
        });
    }
})