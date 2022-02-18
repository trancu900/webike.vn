   /*
    |--------------------------------------------------------------------------
    | Javascript for advanced search
    |--------------------------------------------------------------------------
    */

    WVN.initAdvancedSearch = function(selector) {
        // components
        var form = $(selector);

        if (form.hasClass('search-initialized')) {
            return;
        }
        var url_search_series =$('#url_search_series').val();
        var module = form.closest('.module'),
            search_brand = form.find('#search_brand'),
            search_capacity = form.find('#search_capacity'),
            search_series = form.find('#search_series'),
            search_price_to = form.find('#search_price_to'),
            search_province = form.find('#search_province'),

            url_search_series = form.find('#url_search_series').val();



        var apply_btn = form.find('button[id="btnAdvanceSearch"]').click(apply_search);

        function apply_search(event) {
            event.preventDefault();
            window.location =createParam();
        }

        function createParam() {
            var route = form.attr('action');
            var url = new Array();

            var conditionNew = $('#condition_new').is(':checked');
            var conditionUsed = $('#condition_used').is(':checked');
            var selected_condition = null;
            if(conditionNew && conditionUsed){
                selected_condition = null;

            }
            else if(conditionNew){
                selected_condition = 0
            }
            else if(conditionUsed){
                selected_condition = 1
            }
            (selected_condition == null) ? $('#search_condition').attr('name','') : $('#search_condition').val(selected_condition);
             search_condition=$('#search_condition');
            //Brand
            if ("-1" != search_brand.val()) {
                url.push($.param({ mc: search_brand.val() }));
            }

            //Series
            if ("-1" != search_series.val()) {
                url.push($.param({ sc: search_series.val() }));
            }

            //Capacity
            if ("-1" != search_capacity.val()) {
                url.push($.param({ cc: search_capacity.val() }));
            }
            //Price to
            if ("-1" != search_price_to.val()) {
                url.push($.param({ price_to: search_price_to.val() }));
            }
            //Location
            if ("-1" != search_province.val()) {
                url.push($.param({ loc: search_province.val() }));
            }
            //Condition
            if ("" != search_condition.val()) {
                url.push($.param({ new: search_condition.val() }));
            }
            if (url.length > 0) {
                route += '?' + url.join("&");
            }
            return route;
        }

        // data variables
        var xhr = null,
            series_data = [],
            selected_brand = search_brand.val(),
            selected_series = search_series.val(),
            selected_capacity = search_capacity.val();


        /*
        |--------------------------------------------------------------------------
        | Helper functions
        |--------------------------------------------------------------------------
        */

        // function initForm() {
        // }
        // initForm();

        return form.addClass('search-initialized');
    };
     // var url_search_series =$('#url_search_series').val();
            var search_brand = $('#search_brand'),
            search_capacity = $('#search_capacity'),
            search_series = $('#search_series'),
            search_province = $('#search_province'),
            xhr =null,
            xhr_request = null;
        $(document).on('change','#search_brand',function(event,flag){
            if(flag == false) {
                return;
            }
            selected_capacity = search_capacity.val() == -1 ? null : search_capacity.val();
            selected_brand = search_brand.val() == -1 ? null : search_brand.val();
            if(selected_brand === null){
                selected_capacity =null;
                search_capacity.val('-1').trigger('change',[false]);
            }

            var ajax_options = {
                mc: selected_brand
            };
            if (xhr) {
                  xhr.abort();
              }
            reset_disabled_state(true);
            xhr = $.getJSON(url_search_series, ajax_options);
            xhr.done(function(data) {
                renderCapacity(data['capacity']);
                 if(selected_capacity === null && selected_brand === null){
                    renderSeries("");
                }else{
                    renderSeries(data['series']);
                }

                renderProvince(data['province']);
                reset_disabled_state(false);
            });
            xhr.fail(function() {
                reset_disabled_state(false);
            });
        });
        $(document).on('change','#search_series',function(){
            selected_capacity = search_capacity.val() == -1 ? null : search_capacity.val();
            selected_brand  = search_brand.val() == -1 ? null : search_brand.val();
            selected_series  = search_series.val() == -1 ? null : search_series.val();
            manufacturer_code  = $('option:selected', this).attr('data-manufacturer');
             if(selected_series == null){
                return;
            }
            if (xhr_request) {
                  xhr_request.abort();
            }
            var ajax_options = {
                cc: selected_capacity,
                mc :selected_brand,
                sc : selected_series,
            };
            reset_disabled_state(true);
            xhr_request = $.getJSON(url_search_series, ajax_options);
            xhr_request.done(function(data) {
                if(data['capacity'] !=""){
                    search_capacity.val(data['capacity'][0].capacity_range).trigger('change',[false]);
                }
                // $('#search_brand option[value='+manufacturer_code+']').attr('selected','selected');
                search_brand.val(manufacturer_code).trigger('change',[false]);
                renderProvince(data['province']);
            });
            xhr_request.fail(function() {
                reset_disabled_state(false);
            });
        })
        $(document).on('change','#search_capacity',function(event,flag){
            if(flag == false) {
                return;
            }
            selected_capacity = search_capacity.val() == -1 ? null : search_capacity.val();
            selected_brand  = search_brand.val() == -1 ? null : search_brand.val();
            if(selected_capacity == null && selected_brand == null){
                renderSeries("");
                return;
            }
             if (xhr_request) {
                  xhr_request.abort();
              }
            var ajax_options = {
                cc: selected_capacity,
                mc :selected_brand
            };
              reset_disabled_state(true);
            xhr_request = $.getJSON(url_search_series, ajax_options);
            xhr_request.done(function(data) {
                console.log(data);
                reset_disabled_state(false);
                renderSeries(data['series']);
                renderProvince(data['province']);
            });
            xhr_request.fail(function() {
                reset_disabled_state(false);
            });
        })
        $(document).on('change','#search_condition',function(){
            selected_capacity = search_capacity.val() == -1 ? null : search_capacity.val();
            selected_brand  = search_brand.val() == -1 ? null : search_brand.val();
            selected_series  = search_series.val() == -1 ? null : search_series.val();
             if (xhr_request) {
                  xhr_request.abort();
              }
            var ajax_options = {
                cc: selected_capacity,
                mc :selected_brand,
                sc :selected_series,
            };
            if(selected_brand != -1){
                reset_disabled_state(true);
                xhr_request = $.getJSON(url_search_series, ajax_options);
                xhr_request.done(function(data) {
                    renderProvince(data['province']);
                    if(selected_series ==""){
                        renderSeries(data['series']);
                    }
                    if(selected_capacity ==""){
                        renderCapacity(data['capacity']);
                    }
                     reset_disabled_state(false);
                });
                xhr_request.fail(function() {
                    reset_disabled_state(false);
                });
            }
        })
        $(document).on('change','#search_province',function(){
            selected_capacity = search_capacity.val() == -1 ? null : search_capacity.val();
            selected_brand  = search_brand.val() == -1 ? null : search_brand.val();
            selected_series  = search_series.val() == -1 ? null : search_series.val();
            selected_province  = search_province.val() == -1 ? null : search_province.val();
             if (xhr_request) {
                  xhr_request.abort();
              }
            var ajax_options = {
                cc: selected_capacity,
                mc :selected_brand,
                sc :selected_series,
                loc :selected_province
            };
            if(selected_brand != ""){
                reset_disabled_state(true);
                xhr_request = $.getJSON(url_search_series, ajax_options);
                xhr_request.done(function(data) {
                    if(selected_series ==""){
                        renderSeries(data['series']);
                    }
                    if(selected_capacity ==""){
                        renderSeries(data['capacity']);
                    }
                     reset_disabled_state(false);
                });
                xhr_request.fail(function() {
                    reset_disabled_state(false);
                });
            }
        })
        function reset_disabled_state(disabled) {
            disabled = disabled ? true : false;
            $.each([
                search_brand,
                search_capacity,
                search_series,
                search_province,
            ], function(i, e) {
                    var should_disabled = disabled || (e.children(':enabled:not([value="-1"])').length == 0);
                    if (should_disabled) {
                        e.prop("disabled",true );
                        e.closest('.btn-block').addClass('loading');
                    } else {
                        e.prop('disabled',false);
                         e.closest('.btn-block').removeClass('loading');
                    }
                    if (!disabled) {
                        if (e != search_series && e != search_capacity) {
                            if (should_disabled) {
                                e.val('-1');
                            }
                        }
                    }
                     e.closest('.btn-block').removeClass('loading');
                });

        }
        function renderCapacity(capacity_json) {
             var html ='<option value="-1">'+label_capacity+'</option>';
            if (capacity_json.length >0 || capacity_json !="") {
                $.each(capacity_json, function() {
                    var capacity = this;
                      html +='<option value='+ capacity.capacity_range +'>'+capacity.capacity_range_display+'</option>'
                });
            }
            search_capacity.html(html);
            reset_disabled_state(false);
        }
        function renderSeries(series_json) {
            var html ='<option value="-1">'+label_series+'</option>';
            if (series_json.length >0 || series_json !="") {
                $.each(series_json, function() {
                    var series = this;
                     html +='<option data-manufacturer='+series.manufacturer_code+' value='+ series.series_code +'>'+series.series_name+'</option>'
                });
            }
            search_series.html(html);
            reset_disabled_state(false);
        }
        function renderProvince(province_json) {
            var html ='<option value="">'+label_province+'</option>';
            if (province_json.length >0 || province_json !="") {
                $.each(province_json, function() {
                    var province = this;
                     html +='<option value='+ province.province_code +'>'+province.province_name+'</option>'
                });
            }
            search_province.html(html);
            reset_disabled_state(false);
        }
        function setParam(field, param) {
            var arg = new Array();
            $.each(field.find("input:checked"), function(index, value) {
                arg.push($(value).val());
            })
            arg = arg.sort(function(a, b) {
                return a - b
            });
            var url = '';
            if (arg.length > 0) {
                url = param + '=' + arg.join("_");
            }
            return url;
        }