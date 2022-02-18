(function ($) {

    /*
    |--------------------------------------------------------------------------
    | Define
    |--------------------------------------------------------------------------
    */
    var form            = $('#product-editor'),
    check_valid         = false,
    INITIALIZED         = false;

    var EDIT_MODE       = ('edit_mode' in window && window.edit_mode),
    UPLOAD_URL          = WVN.url('ajax_upload_product_photo'),
    CHECK_PHONE_URL     = WVN.routes['ajax_check_phone_exist'],
    manage_product_url  = $("#manage_product").val(),

    manufacturer_code   = form.find('[name="manufacturer_code"]'),
    series_code         = form.find('[name="series_code"]'),
    model_year          = form.find('[name="model_year"]'),
    model_color_code    = form.find('[name="color_code"]'),
    condition_old       = form.find('.condition_old'),
    condition_new       = form.find('.condition_new'),
    product_condition   = form.find('[name="product_condition"]'),
    product_odo         = form.find('[name="odo_code"]'),
    model_origin_code   = form.find('[name="origin_code"]'),
    province_code       = form.find('[name="province_code"]'),
    district_code       = form.find('[name="district_code"]'),
    number_plate         = form.find('[name="number_plate"]'),
    product_description = form.find('[name="product_description"]'),
    other_description   = form.find('[name="product_other_description"]'),

    contact_price       = form.find('[name="contact_price"]'),
    product_price       = form.find('[name="product_price_tmp"]'),
    product_price_hide  = form.find('[name="product_price"]'),
    
    contact_name        = form.find('[name="contact_name"]'),
    pass                = form.find('[name="passwd"]'),
    confirmPass         = form.find('[name="confirmPasswd"]'),
    contact_phone       = form.find('[name="contact_phone"]'),

    // for Tra Gop
    installment_active   = form.find('[name="installment_active"]'),
    installment_unactive = form.find('[name="installment_unactive"]'),
    installment_flag     = form.find('[name="installment_flag"]'),

    // for Test Drive
    testdrive_active    = form.find('[name="testdrive_active"]'),
    testdrive_unactive  = form.find('[name="testdrive_unactive"]'),
    test_drive_flag     = form.find('[name="test_drive_flag"]'),
    
    url_signup_firebase = $('#sign_up_get_firebase'),
    verify_phone        = $('.verify-phone').find('a'),
    is_shop             = $('#check_shop'),

    submit_btn          = $('#submit_btn'),
    cancel_btn          = $('#cancel_btn'),
    save_hide_btn       = $('#save_hide_btn'),
    
    photos_holder       = $('#photo_holder'),
    max_photos          = parseInt(photos_holder.data('max-photos')) || null,
    ADD_CLASS           = 'add_more',
    add_more            = photos_holder.find('div.add_more'),
    add_more_template   = add_more.clone(true).off();

    var cur_manufacturer_code = '';
    var cur_series_code = '';
    var cur_model_year = '';
    var cur_color_code = '';

    var manufacturer_name = '';
    var series_name = '';
    var year_name = '';
    var color_name = '';

    var arr_title = {
        manufacturer_name: "",
        series_name: "",
        color_name: "",
        year_name: ""
    };

    var suggest_title = {
        manufacturer_name: "",
        series_name: "",
        color_name: "",
        year_name: "",
        province_name: ""
    };

    var filter_brand    = "filter-brand-list";
    var filter_series   = "filter-series-list";
    var filter_year     = "filter-year-list";
    var filter_color    = "filter-color-list";
    var filter_district = "filter-district";
    var temp_description = $("#temp_description");

    // Define tip
    var block_notice = $("#block_notice"),
        product_other_description = $("#product_other_description");

    var name_not_year = 'Không rõ đời xe';
    
    // Data variables
    var s_timer;
    var xhr = {},
        cache = {},

        // plugin flag
        has_validator = ('validate' in form),

        // editor flags
        change_flag = false,
        uploading_flag = false,
        saving_flag = false,

        flag_phone_checked = false,
        has_shop = true,
        is_new = false,

        validator = null,
        blank_option = '<option value=""></option>',
        // for photo upload
        hidden_upload = $('<input type="hidden" name="uploaded_photos" />').appendTo(form),
        photos_data = {},
        photo_index = 0;

    // prevent changing page when data is unsaved
    window.onbeforeunload = function(event) {
        if (change_flag || uploading_flag || saving_flag) {
            return WVN.trans('msg_product_unsave_data');
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize form
    |--------------------------------------------------------------------------
    */
    var OwlCarousel_Title = $("#suggest-title");
    OwlCarousel_Title.owlCarousel({
        slideBy: 1,
        autoWidth: true,
        center: false, 
        autoplay: false,
        items: 1, 
        smartSpeed: 200,
        loop: false,
        stagePadding: 30,
        nav: true,
        dots: false,
        lazyLoad: true,
        loadedClass:'owl-loaded'
    });

    //editor
    var textareas = WVN.createEditor('textarea.wysiwyg');
    hiddenFilter([filter_color]);
    handleChangeDescription(product_description);
    handlePrice(product_price);
    handlePhone(contact_phone);

    /*
    |--------------------------------------------------------------------------
    | Initialize selectize for selects
    |--------------------------------------------------------------------------
    */

    if(form.find('select').length){
        form.find('select').each(function() {
            WVN.select2($(this), {width: '100%'});
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize Upload Photo
    |--------------------------------------------------------------------------
    */
    // retrieve last uploaded photos
    if ('UPLOADED_PHOTOS' in window && UPLOADED_PHOTOS.length) {
        for (var i = 0; i < UPLOADED_PHOTOS.length; i++) {
            photos_data[i] = UPLOADED_PHOTOS[i];
        }
    }

    initUploader(photos_holder.find('div.' + ADD_CLASS).find('input:file'));

    if (EDIT_MODE) {
        photo_index = Object.keys(photos_data).length;

        if (Object.keys(photos_data).length == max_photos) {
            add_more.hide();
        }

        photos_holder.find('div.item-photo .has-photo').each(function(i, e) {
            (function(item) {
                item.click(function() {
                    deletePhoto(item.attr('data-index'));
                    item.parent().remove();
                });
            }($(this)));
        });
    }

    // init jQuery File Upload plugin
    function initUploader(input) {
        var parent = input.closest('.upload'),
            link = parent.find('a'),
            link_icon = link.find('.icon'),
            img = parent.find('img');

        if ('fileupload' in input) {
            // init plugin
            input.fileupload({
                url: UPLOAD_URL,
                dropZone: parent,
                fileInput: input,
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(jpg|jpeg|png|gif|bmp)$/i,
                singleFileUploads: false,
                limitMultiFileUploads: 1,
            }).on("fileuploadprocessfail", function(e, data) {
                parent.removeClass('loading');
                uploading_flag = false;
                return WVN.alert(LANG.msg_product_upload_failed);
            });

            // for upload jXhr started
            input.on('fileuploadchange', function(e, data) {
                if ((Object.keys(photos_data).length + data.files.length) > max_photos) {
                    // get limit file from selected
                    data.files = data.files.slice(0, max_photos - Object.keys(photos_data).length);
                }
            });

            // for upload jXhr started
            input.on('fileuploadadd', function(e, data) {
                // update layout & turn on upload flag
                parent.removeClass('has-photo').addClass('loading');
                uploading_flag = true;
            });

            // for upload jXhr progress bar
            input.on('fileuploadprogressall', function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                link.text(progress + '%');
            });

            // for upload jXhr success
            input.on('fileuploaddone', function(e, data) {
                if (data.result.files.length) {
                    div_photos = $('<div/>');
                    $.each(data.result.files, function(index, file) {
                        // catch for error
                        if ('error' in file) {
                            return WVN.alert(file.error);
                        }

                        if (isNaN(photo_index)) {
                            photo_index = 0;
                        }

                        // set new index data
                        photos_data[photo_index] = file;

                        node = $('<div class="item-photo"/>').attr('data-index', photo_index)
                            .append($('<label class="upload has-photo"/>')
                                .append($('<figure class="thumbnail placeholder loaded"/>')
                                    .append($('<img src="' + file.url + '" class="static" alt="No photo" rel="nofollow" data-original="">'))
                                    .append($('<em class="icon"></em>')))
                                .append($('<a href="javascript:void(0)" data-select="Chọn hình" data-remove="Xóa hình">Xóa hình</a>')));

                        (function(item) {
                            item.click(function() {
                                deletePhoto(item.attr('data-index'));
                                item.remove();
                            });
                        }(node))
                        div_photos.append(node);

                        // createPreview();

                        if (photos_data) {
                            photos_data_keys = Object.keys(photos_data);
                            photo_index = parseInt(photos_data_keys[photos_data_keys.length - 1]) + 1;
                        }
                    });

                    div_photos.children().insertBefore('div.' + ADD_CLASS);
                }

                if (Object.keys(photos_data).length == max_photos) {
                    photos_holder.find('li.' + ADD_CLASS).hide();
                }
            });

            // for upload jXhr fail
            input.on('fileuploadfail', function(e, data) {
                WVN.alert(WVN.trans('msg_product_upload_failed'));
            });

            // for upload jXhr complete
            input.on('fileuploadalways refresh', function(e, data) {
                link.off('click');
                if (parent.hasClass('has-photo')) {
                    // remove button
                    link.one('click', function() {
                        parent.removeClass('has-photo');
                        img.attr('src', '');
                        link.text(' ' + link.data('select')).prepend(link_icon);

                        deletePhoto(input.attr('data-index'));

                        if (parent.hasClass('optional')) {
                            parent.parent().remove();
                            addMoreUpload();
                        }

                        return false;
                    });

                    link.text(' ' + link.data('remove')).prepend(link_icon);
                } else {
                    link.text(' ' + link.data('select')).prepend(link_icon);
                }

                parent.removeClass('loading');
                uploading_flag = false;

                if (Object.keys(photos_data).length == max_photos) {
                    photos_holder.find('div.' + ADD_CLASS).hide();
                }
            });

            // for drag and drop
            $(document).on('drop dragover', function(e) {
                e.preventDefault();
            });

            parent.on('drop dragover dragleave', function(e) {
                if (e.type == 'dragover') {
                    parent.addClass('dragover');
                } else {
                    parent.removeClass('dragover');
                }
            });
        } else {
            link_icon.remove();

            input.on('change refresh', function() {
                var value = input.val();

                // toggle class name for .upload element
                if (value) {
                    parent.addClass('has-photo');
                    link.text(' ' + link.data('remove')).prepend(link_icon);
                } else {
                    parent.removeClass('has-photo');
                    link.text(' ' + link.data('select')).prepend(link_icon);
                }
            });

            // remove button
            link.on('click', function() {
                input.val('').trigger('change');
                return false;
            });
        }
    }

    function addMoreUpload() {
        // return if there is no template
        if (!add_more_template.length) return;

        // return if add photo button exists
        if (photos_holder.find('.' + ADD_CLASS).length) return;

        // return if the number of photos reaches the limit
        if (max_photos && photos_holder.find('label.upload').length >= max_photos) return;

        // clone new element
        var new_upload = add_more_template.clone(true);
        new_upload.appendTo(photos_holder).fadeIn(200).show();

        // init upload plugin for new element
        initUploader(new_upload.find('input:file'));

        return new_upload;
    }

    // delete an uploaded photo
    function deletePhoto(index) {
        if (index in photos_data) {

            if ('deleteUrl' in photos_data[index]) {
                $.post(photos_data[index]['deleteUrl']);
            }

            delete photos_data[index];
        }

        // reset preview photo
        // createPreview(index);

        // show add photo button
        photos_data_keys = Object.keys(photos_data);
        photo_index = parseInt(photos_data_keys[photos_data_keys.length - 1]) + 1;
        if (Object.keys(photos_data).length < max_photos) {
            photos_holder.find('div.' + ADD_CLASS).show();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | For Fix Block
    |--------------------------------------------------------------------------
    */
    var block_scroll = $(".block-fixed a");
    block_scroll.click(function(e){
        e.preventDefault();
        var ref = $($(this).attr("href"));
        $('html, body').animate({
            scrollTop: ref.offset().top - 300
        }, 500);
    })

    $(document).on("scroll", function(){
        onScroll(block_scroll);
    });

    function onScroll(element){
        var scrollPos = $(document).scrollTop();
        element.each(function () {
            var currLink = $(this);
            var refElement = $(currLink.attr("href"));
            if (refElement.position() != undefined && refElement.position().top <= scrollPos + 300) {
                element.parent().removeClass("active");
                currLink.parent().addClass('active');
            }
            else{
                currLink.parent().removeClass('active');
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize and Event Change Product Condition
    |--------------------------------------------------------------------------
    */
    if(!has_shop){
        disableControls([condition_new]);
    }

    condition_old.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            is_new = false;
        } else {
            is_new = true;
        }
        conditionChecked(is_new);
    });

    condition_new.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            is_new = true;
        } else {
            is_new = false;
        }
        conditionChecked(is_new);
    });

    var ele_number_plate = $(".number_plate");
    function conditionChecked(is_new = false){
        condition_new.prop("checked", is_new);
        condition_old.prop("checked", !is_new);
        if(is_new){
            product_condition.val(1);
            ele_number_plate.addClass('hide');
        }else{
            product_condition.val(0);
            ele_number_plate.removeClass('hide');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize and Event Change Tra Gop
    |--------------------------------------------------------------------------
    */
    installment_active.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            installmentChecked(true);
        } else {
            installmentChecked(false);
        }
    });

    installment_unactive.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            installmentChecked(false);
        } else {
            installmentChecked(true);
        }
    });

    function installmentChecked(is_check = false){
        installment_active.prop("checked", is_check);
        installment_unactive.prop("checked", !is_check);
        if(is_check){
            installment_flag.val(1);
        }else{
            installment_flag.val(0);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize and Event Change Test Drive
    |--------------------------------------------------------------------------
    */
    testdrive_active.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            testDriveChecked(true);
        } else {
            testDriveChecked(false);
        }
    });

    testdrive_unactive.on('change', function(event, refresh_only) {
        if ($(this).prop('checked')) {
            testDriveChecked(false);
        } else {
            testDriveChecked(true);
        }
    });

    function testDriveChecked(is_check = false){
        testdrive_active.prop("checked", is_check);
        testdrive_unactive.prop("checked", !is_check);
        if(is_check){
            test_drive_flag.val(1);
        }else{
            test_drive_flag.val(0);
        }
    }

    product_odo.on('change', function(event, refresh_only) {
        if($(this).val()){
            destroyTooltip(this);
        }
    });

    // Event Change For BikeYear
    $(document).on('change','input[name="bike_year"]', function(event, refresh_only) {
        var model_year_tmp = $(".model_year_tmp");
        model_year_tmp.attr('name', 'model_year');
        var _tmp = $.trim($(this).val());
        if(parseInt(_tmp) > 0){
            _tmp = parseInt(_tmp);
            cur_model_year = _tmp;
            arr_title.year_name = _tmp;
            suggest_title.year_name = _tmp;
            model_year_tmp.val(_tmp);
        }else{
            model_year_tmp.attr('name', '');
        }
        initProductDescription();
        suggestTitle();

        clearCheckFilter([filter_year]);
    });

    // Event Key For Input BikeYear
    $(document).on('keypress keyup blur','input[name="bike_year"]', function(e) {
        if ((e.which < 48 || e.which > 57)) {
            e.preventDefault();
        }

        if (s_timer) {
            clearTimeout(s_timer);
        }
        if (e.type == 'change') {
            s_timer = setTimeout(function() {
                handleValueNumber($(this), 4);
            }, 300);
        } else {
            handleValueNumber($(this), 4);
        }
    });

    $(document).on('focus','input[name="bike_year"]', function(e) {
        $(this).trigger('change');
    });

    // Event Key For List Year Filter
    $(document).on('keypress keyup blur','input[name="list-year-filter"]', function(e) {
        if ((e.which < 48 || e.which > 57)) {
            e.preventDefault();
        }
        if (s_timer) {
            clearTimeout(s_timer);
        }
        if (e.type == 'change') {
            s_timer = setTimeout(function() {
                handleValueNumber($(this), 4);
            }, 300);
        } else {
            handleValueNumber($(this), 4);
        }
    });

    /*
    |--------------------------------------------------------------------------
    | For Filter
    |--------------------------------------------------------------------------
    */
    filterlist('#list-brand-filter','#filter-brand-list');
    filterlist('#list-series-filter','#filter-series-list');
    filterlist('#list-year-filter','#filter-year-list');
    filterlist('#list-color-filter','#filter-color-list');

    function filterlist(listfilter, checkboxlist){
        $(listfilter).on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $(checkboxlist).find('li').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    }

    /*
    |--------------------------------------------------------------------------
    | For autocomplete fields, event listeners
    |--------------------------------------------------------------------------
    */

    if (EDIT_MODE) {
        trigerChangeControl();
        disableControls([
            manufacturer_code,
            series_code,
            model_year,
            model_color_code
        ]);
        initProductDescription();

    } else {
        // bind event for manufacturer_code input
        manufacturer_code.on('change', function(event, refresh_only) {
            if (!$(this).val()) {
                clearFilter([filter_series, filter_year]);
            }else{
                resetProductDescription(['manufacturer_name', 'series_name', 'year_name', 'color_name']);
                cur_manufacturer_code = $(this).val();
                manufacturer_name = $(this).parent().text();

                var tmp = $(this).parent().text();
                arr_title.manufacturer_name = tmp.trim();
                suggest_title.manufacturer_name = tmp.trim();
            }

            hiddenFilter([filter_color]);

            if (refresh_only) return false;
            fetchSeries();
            initProductDescription();
            suggestTitle();
            var idElement = $(this).closest('.filter-col').find('.input-search').find('input').attr('id');
            destroyTooltip('#'+idElement);
        });

        // bind event for series_code input
        $(document).on('change','input[name="series_code"]', function(event, refresh_only) {
            if (!$(this).val()) {
                clearFilter([filter_year]);
            }else{
                resetProductDescription(['series_name', 'year_name']);
                cur_series_code = $(this).val();
                series_name = $(this).parent().text();

                var tmp = $(this).parent().text();
                arr_title.series_name = tmp.trim();
                suggest_title.series_name = tmp.trim();
            }

            if (refresh_only) return;
            fetchModelYears();
            initProductDescription();
            suggestTitle();
            var idElement = $(this).closest('.filter-col').find('.input-search').find('input').attr('id');
            destroyTooltip('#'+idElement);
        });

        // bind event for model_year input
        $(document).on('change','input[name="model_year"]', function(event, refresh_only) {
            if (!$(this).val()) {
                disableControls([], '');
            }else{
                cur_model_year = $(this).val();
                var tmp = $(this).parent().text();
                if(tmp.trim() == name_not_year){
                    tmp = '';
                }
                arr_title.year_name = tmp.trim();
                suggest_title.year_name = tmp.trim();
            }

            if (refresh_only) return;
            // openBoxPreview();
            initProductDescription();
            suggestTitle();
            var idElement = $(this).closest('.filter-col').find('.input-search').find('input').attr('id');
            destroyTooltip('#'+idElement);
        });

        // bind event for model_color_code input
        model_color_code.on('change', function(event, refresh_only) {
            cur_color_code = $(this).val();
            var tmp = $(this).parent().text();
            arr_title.color_name = tmp.trim();
            suggest_title.color_name = tmp.trim();
            initProductDescription();
            suggestTitle();
            var idElement = $(this).closest('.filter-col').find('.input-search').find('input').attr('id');
            destroyTooltip('#'+idElement);
        });   
    }

    // bind event for province_code input
    province_code.on('change', function(event, refresh_only) {
        var tmp_name = $(this).find(':selected').text();
        if(tmp_name){
            suggest_title.province_name = tmp_name.trim();
        }
        
        disableControls([district_code], '');
        if (refresh_only) return;
        fetchDistrict();
        suggestTitle();
    });

    // bind event for contact phone input
    contact_phone.on('change', function(event) {
        if($.trim( $(this).val() ) == ""){
            return false;
        }

        if (is_editor == false) {
            flag_phone_verified = false;
            
            var tmp_url = url_signup_firebase.val() + '?phone=' + $('input[name=contact_phone]').val();
            $('#verify-phone').val(tmp_url);
            if (is_shop.val() == false) {
                verifyContactPhone();
            }
        }
    });

    // Event Verify Phone
    var click_verify_phone = false;
    verify_phone.on('click', function(event) {
        if($.trim( contact_phone.val() ) == ""){
            return false;
        }

        if(check_valid == false){
            contact_phone.trigger('change');
        }

        if(flag_phone_verified == false){
            click_verify_phone = true;
            verifyPhone();
        }
    });

    // Event Change For Contact Price
    contact_price.on('change', function() {
        showPrice();
    });

    // Event Blur For Product Price
    product_price.on('change', function() {
        handlePrice(product_price);
        setProductPrice(true);
    });

    // Event Keyup For Product Price
    function handlePrice(target){
        target.on('keypress keyup change', function(e) {
            if (e.key == undefined) {
                return;
            }
            var e_key = e.key;
            e_key = e_key.replace(/\D+/g, '');
            if(e_key === ""){
                e.preventDefault();
                return;
            }
            if (s_timer) {
                clearTimeout(s_timer);
            }

            if (e.type == 'change') {
                s_timer = setTimeout(function() {
                    handleNumber($(this));
                }, 300);
            } else {
                handleNumber($(this));
            }
            destroyTooltip(target);
        });
    }

    // handle Number for Price
    function handleNumber(target){
        var str = target.val();
        str = str.replace(/\D+/g, '');
        if('' == str){
            target.val('');
            $("#txtMoney").html('');
            return false;
        }
        var value_tmp = str.replace(/\D+/g, '');
        if ('' != value_tmp) {
            if(value_tmp.length > 10){
                COMMON.alert('','Số tiền quá lớn.').set({transition:'zoom', closable: false});
                target.val(value_tmp.substr(0, 10));
                target.trigger('keyup');
                // return false;
            }
            value = WVN.helpers.currency_format(parseInt(value_tmp.substr(0, 10), 10));
            target.val(value);
            if(value != undefined){
                var strMoney = value.replace(/\D+/g, '');
                strMoney = convertNumber2Word(strMoney);
                $("#txtMoney").html(strMoney);
            }
        }
    }

    // Convert Number To Word: VN - 100 -> Một trăm
    function convertNumber2Word(str){
        str = $.trim(str);
        if('' == str){
            return '';
        }
        str = str.replace(/\,/gi, "");
        var rs = COMMON.numberToWord(parseInt(str));
        rs = rs.split(" ");
        if(rs.length > 0){
            rs[0] = '<i>'+ rs[0] +'</i>';
            rs = rs.join(" ") + ' đồng';
            
            return rs;
        }
    }

    // handle value is Number
    function handleValueNumber(target, length){
        var str = target.val();
        str = str.replace(/\D+/g, '');
        if('' == str){
            target.val('');
            return false;
        }
        var value_tmp = str.replace(/\D+/g, '');
        if ('' != value_tmp) {
            if(value_tmp.length > length){
                WVN.alert('Không hợp lệ.');
                target.val(value_tmp.substr(0, length));
                target.trigger('keyup');
                return false;
            }
            target.val(value_tmp);
        }
    }

    // Count length description
    function handleChangeDescription(target){
        target.on('keyup', function(e) {
            if (s_timer) {
                clearTimeout(s_timer);
            }
            if (e.type == 'change') {
                s_timer = setTimeout(function() {
                    handleDescription($(this));
                }, 300);
            } else {
                handleDescription($(this));
            }
        });
    }

    function handleDescription(target){
        var str = target.val();
        str = $.trim(str);
        if('' == str){
            target.val('');
            return false;
        }

        // counter for title
        var label = target.parent().find('span');
        var max = parseInt(target.attr('maxlength'), 10) || 0;

        if (max > 0) {
            var tmp = str.length + "/"+ max;
            label.html(tmp);
        }
    }

    // create suggest title
    function suggestTitle(){
        var arrTitle = [];
        var title = "";
        var tmpTitle = suggest_title;
        if(tmpTitle){
            if(tmpTitle.manufacturer_name){
                title += tmpTitle.manufacturer_name + ' ';
            }

            if(tmpTitle.series_name){
                title += tmpTitle.series_name + ' ';
            }

            if(tmpTitle.year_name){
                title += tmpTitle.year_name + ' ';
                arrTitle.push(title);
            }

            if(tmpTitle.color_name){
                title += tmpTitle.color_name + ' ';
                arrTitle.push(title);
            }

            tmpTitle.province_name = province_code.find(':selected').text();
            if(tmpTitle.province_name){
                title += tmpTitle.province_name + ' ';
                arrTitle.push(title);
            }
            var parent = document.getElementById('suggest-title');

            if(arrTitle.length > 0){
                OwlCarousel_Title.parent().parent().removeClass('hide');
                // remove old item
                var owl_stage = $(".owl-stage");
                var owl_item = owl_stage.find(".owl-item");
                if(owl_item.length > 0){
                    for (var i = 0; i < owl_item.length; i++) {
                        OwlCarousel_Title.trigger('remove.owl.carousel',  i);                        
                    }
                }

                // apply new item
                $.each(arrTitle, function(k, v) {
                    var div      = document.createElement("div");
                    div.setAttribute("class", "item");
                    div.setAttribute("style", "width: auto !important;");
                    var a = document.createElement("a");
                    a.setAttribute("href", "javascript:void(0)");
                    a.innerHTML = v;
                    div.appendChild(a);
                    OwlCarousel_Title.owlCarousel('add', div).owlCarousel('update');
                });
                owl_stage.css('width', owl_stage.width()+10+'px');
                OwlCarousel_Title.trigger('next.owl.carousel');
            }
        }
    }

    // Validate phone
    function handlePhone(target){
        target.on('keypress keyup blur', function(e) {
            if ((e.which < 48 || e.which > 57)) {
                e.preventDefault();
            }
            if (s_timer) {
                clearTimeout(s_timer);
            }
            if (e.type == 'change') {
                s_timer = setTimeout(function() {
                    handleNumberPhone($(this));
                }, 300);
            } else {
                handleNumberPhone($(this));
            }
        });
    }

    var contact_phone_valid = false;
    function handleNumberPhone(target){
        var str = target.val();
        str = str.replace(/\D+/g, '');
        if('' == str){
            target.val('');
            return false;
        }
        var value_tmp = str.replace(/\,/gi, "");
        if ('' != value_tmp) {
            if(value_tmp.length > 11){
                COMMON.alert('','Số điện thoại không hợp lệ');
                target.val(value_tmp.substr(0, 11));
                target.trigger('keyup');
                return false;
            }
            target.val(value_tmp);
            contact_phone_valid = true;
        }
    }

    var tbwfocus = false;
    // Event Show Tip for product_other_description
    product_other_description.trumbowyg().on('tbwfocus', function(){ 
        block_notice.fadeIn("slow").removeClass('hide');
        tbwfocus = true;
    });

    // Event Hide Tip for product_other_description
    product_other_description.trumbowyg().on('tbwblur', function(){ 
        block_notice.fadeOut("slow");
        tbwfocus = false;
    });

    product_other_description.trumbowyg().on('tbwchange', function(){ 
        destroyTooltip(this);
    });

    // Event Click For Suggest Title
    $(document).on('click', '.owl-item a', function() {
        var e = $(this);
        product_description.val($.trim(e.text()));
        handleDescription(product_description);
    });
    /*
    |--------------------------------------------------------------------------
    | Retrieve data
    |--------------------------------------------------------------------------
    */

    // retrieve series by brand
    function fetchSeries() {
        if (cur_manufacturer_code != 0) {
            ajax_helper("series_code", WVN.url('ajax_series_list_json'), {
                brand: cur_manufacturer_code || null
            }, filter_series);
        }

        clearFilter([filter_year]);
    }

    // retrieve model years list by series code
    function fetchModelYears() {
        if (cur_series_code != 0) {
            ajax_helper("model_year", WVN.url('ajax_model_year_list_json'), {
                series: cur_series_code || null
            }, filter_year);

            hiddenFilter([filter_color], false);
        }else{
            hiddenFilter([filter_color]);
        }
    }

    // retrieve model original country list
    function fetchModelOrigins() {
        ajax_helper(model_origin_code, WVN.url('ajax_model_origin_list_json'), {
            series: series_code.val() || null,
            year: model_year.val() || null
        });
    }

    // retrieve model colors list
    function fetchModelColors() {
        ajax_helper("color_code", WVN.url('ajax_model_color_list_json'), {
            series: series_code.val() || null,
            year: model_year.val() || null,
            origin: model_origin_code.val() || null
        });
    }

    // retrieve district by province
    function fetchDistrict() {
        ajax_helper(district_code, WVN.url('ajax_district_list_json'), {
            province: province_code.val() || null
        }, filter_district);
    }

    // get data series list by series code
    function getDataSeries(){
        if(series_code.val() != 0){
            $.ajax({
                'url': $('#post_data_series').val(),
                'type': 'POST',
                'dataType': 'JSON',
                async: false,
                'data' :  {
                    'series_code' : series_code.val()
                },
                success : function(data){
                    if(data.valid) {
                        series_original_price = data.series_original_price;
                        
                        if(series_original_price <= 0) valid_handle = false;
                        else valid_handle = true;
                    }
                    else 
                        valid_handle = false;
                },
                error: function (data) {
                   // console.log("ajax failed");
                }
            }).done(function(){
                // handlePriceMin();
            });
        }
    }

    // Init Product Description
    function initProductDescription(){
        if(EDIT_MODE == true){
            arr_title.manufacturer_name = getValueFilterList($('#filter-brand-list'));
            arr_title.series_name       = getValueFilterList($('#filter-series-list'));
            arr_title.color_name        = getValueFilterList($('#filter-color-list'));
            arr_title.year_name         = getValueFilterList($('#filter-year-list'));
            if(arr_title.year_name == ''){
                arr_title.year_name = $('.model_year_tmp').val();
            }
        }

        var title = "";
        if(arr_title){
            $.each(arr_title, function(k, v) {
                if(v != ""){
                    if(k == "year_name"){
                        title = title + "- " + v;
                    }else{
                        title += v + " ";
                    }
                }
            });
            temp_description.html(title.trim());
            if(EDIT_MODE == false){
                product_description.val(title.trim());
            }
        }
        handleDescription(product_description);
    }

    // Show or Disable Input Price
    function showPrice(){
        var e = product_price.parent().parent();
        if (contact_price.prop('checked')) {
            product_price.prop('disabled', true);
            product_price.attr('data-value', 0);
            product_price.siblings('input.data').val('').trigger('change');
            setProductPrice(false);
            e.addClass('disabled');
            destroyTooltip(e);
        } else {
            product_price.prop('disabled', false);
            product_price.trigger('input');
            setProductPrice(true);
            e.removeClass('disabled');
        }
    }

    // this will append uploaded photo when form submit
    function appendUploadedData() {
        hidden_upload.val(JSON.stringify(photos_data));
    }

    // Set product price when contact price change
    function setProductPrice(hasPrice = false){
        if(hasPrice){
            var _price = product_price.val();
            _price = _price.replace(/\D+/g, '');
            product_price_hide.val(_price);
        }else{
            product_price_hide.val(0);
        }
    }

    /*
     |--------------------------------------------------------------------------
     | Submit
     |--------------------------------------------------------------------------
     */    
    var isValid = false;
    function submit(){
        if (!validateForm()) {
            return false;
        }

        verifyPhone();
        if(flag_phone_verified == true){
            appendUploadedData();
            submit_btn.prop('disabled', true);
            form.addClass('disabled');
            form.submit();
            return true;
        }
        return false;
    }

    // Submit Publish
    submit_btn.on('click', function(e) {
        e.preventDefault();
        click_verify_phone = false;
        $('#status_private').val(0);
        submit();
    });

    // Submit Save Private
    save_hide_btn.on('click', function(e) {
        e.preventDefault();
        $('#status_private').val(1);
        submit();
    });

    // Event Cancel form
    cancel_btn.on('click', function(e) {
        e.preventDefault();
        if ('alertify' in window){
            COMMON.confirm('','Có chắc muốn đóng?', 
                function(){ 
                    window.location.href = manage_product_url;
                    return true;
                },
                function(){ return true; }
            ).set({transition:'zoom', closable: false});
        }
        return false;
    });

    // save draft
    function saveDraft() {
        if (EDIT_MODE) return;

        if (!INITIALIZED) return;
        if (!change_flag) return;
        if (saving_flag) return;
        saving_flag = true;

        // append uploaded photo data before submit
        appendUploadedData();

        // get form data
        var form_data = form.serialize();

        // call api to save draft, then turn off flag after done
        cancelLastRequest('draft');
        xhr['draft'] = $.post(WVN.url('ajax_save_product_draft'), form_data, function(result) {
            change_flag = false;
            saving_flag = false;
        }, 'json');
    }

    /*
    |--------------------------------------------------------------------------
    | For form validations
    |--------------------------------------------------------------------------
    */

    function validateForm(hide_alert){
        isValid = true;

        // validate model
        if(!showValidModel("#list-brand-filter", cur_manufacturer_code)){
            return false;
        }
        if(!showValidModel("#list-series-filter", cur_series_code)){
            return false;
        }
        var _bike_year = $('[name="bike_year"]').val();
        if(!showValidModel("#list-year-filter", cur_model_year)){
            return false;
        }
        if(!showValidModel("#list-color-filter", cur_color_code)){
            return false;
        }

        if(!validBikeNumber()){
            return false;
        }

        if(!validateInput()){
            return false;
        }

        if(!validContact()){
            return false;
        }

        if(Object.keys(photos_data).length == 0){
            $('.msg_warning_photo').html('Vui lòng thêm hình ảnh');
            $('.msg_warning_photo').removeClass('hide');
            isValid = false;
        }else{
            $('.msg_warning_photo').removeClass('hide').addClass('hide');
        }

        if(isValid == true){
            return true;    
        }else{
            // showError();
        }
        return false;
    }

    var listError = [];
    // Valid Master
    function showValidModel(element, value){
        if(EDIT_MODE){
            return true;
        }

        var valid = true;
        var e = $(element);
        var div = document.getElementById(element.replace("#",""));
        div.setAttribute("required", "false");
        
        e.removeClass('invalid');
        e.attr('title','');
        if(value == ""){
            div.setAttribute("required", "true");
            e.parent().addClass('invalid');
            e.attr('title','Không được để trống');
            valid = false;
            $(element).tooltip(tooltipOoption);
            $(element).tooltip('open');

            listError.push({ id: e });
            $('html,body').animate({scrollTop: e.offset().top - 50}, 500, function() {
                e.focus();
            });
        }else{
            div.setAttribute("required", "false");
            e.parent().removeClass('invalid');
            destroyTooltip(element);
        }
        return valid;
    }

    function showError(){
        $.each(listError, function(k, v){
            var e = v.id;
            $('html,body').animate({scrollTop: e.offset().top - 50}, 500, function() {
                e.focus();
            });
            listError = [];
            return false;
        })
    }

    // Valid Contact Info
    function validContact(){
        var valid = true;
        if(EDIT_MODE || $('#customer_id').val() != ''){
            flag_phone_verified = true;
            return valid;
        }

        var input = [contact_name, contact_phone];
        if(phoneExist == false){
            input = [contact_name, contact_phone, pass, confirmPass];
        }

        $.each(input, function(i, e) {
            var value = e.val(),
                parent = e.parent().parent().parent(), 
                label = parent.find('label').text().replace(/\*/, '');
            var msg   = parent.find('label.msg_warning');
            if (($.isArray(value) && value.length == 0) || ($.trim(value) == '')) {
                msg.html('');
                // msg.html($.trim(label) + ' không để trống');
                msg.removeClass('hide');
                e.focus();
                valid = false;
            }else{
                msg.removeClass('hide').addClass('hide');
                destroyTooltip(e);
            }
        });

        if(phoneExist == false){
            // valid pass
            if(!validPassword()){
                valid = false;
            }
        }

        return valid;
    }

    // Valid Bike Number
    function validBikeNumber(){
        var e = number_plate;
        var msg = e.parent().parent().find('label.msg_warning');
        var _number_plate = $.trim(e.val());
        if(_number_plate != '' && _number_plate.length > 11){
            msg.html('Biển số xe không hợp lệ');
            msg.removeClass('hide');
            number_plate.focus();
            return false;
        }else{
            msg.removeClass('hide').addClass('hide');
        }
        return true;
    }

    // Validate Price
    function validatePrice(){
        var e = product_price;
        var _price = product_price.val();
        var isNoPrice = contact_price.prop('checked');

        if($.trim(_price) == '' && !isNoPrice){
            var element = e.selector;
            $(element).tooltip(tooltipOoption);
            $(element).tooltip('open');
            listError.push({
                id: element
            });
            return false;
        }else{
            // parent_msg.removeClass('hide').addClass('hide');
        }
        return true;
    }

    // Verify Phone With Firebase
    function verifyPhone() {
        if(flag_phone_verified == true){
            return flag_phone_verified;
        }

        let otherWindow = window.open($('#verify-phone').val(), 'Verify SMS', 'width=500,height=600,top=20,left=20');
        $("#layout").show();
        let timer = setInterval(function () {
            if (otherWindow.closed) {
                $("#layout").hide();
                clearInterval(timer);
                if ($('#access_token').val()) {
                    flag_phone_verified = true;
                    if(isValid == true && click_verify_phone == false){
                        if ('fancybox' in $) {
                            $.fancybox.showLoading();
                        }
                        appendUploadedData();
                        submit_btn.prop('disabled', true);
                        form.addClass('disabled');
                        form.submit();
                    }
                }else {
                    if ('fancybox' in $) {
                        $.fancybox.hideLoading();
                    }
                    submit_btn.prop('disabled', false);
                }
            }
        }, 1000);
    }

    var phoneExist = false;
    // Check Contact Phone With DB
    function verifyContactPhone() {
        if ('fancybox' in $) {
            $.fancybox.showLoading();
        }
        $.ajax({
            'url' : CHECK_PHONE_URL,
            'type' : 'POST',
            'dataType' : 'JSON',
            'async' : false,
            'data' : {
                'add_tel' : contact_phone.val()
            },
            'success' : function(data){
                if ('fancybox' in $) {
                    $.fancybox.hideLoading();
                }

                if($('#customer_id').val() == ''){
                    if (data.status) {
                        phoneExist = true;
                        showHidePassField(false);
                    }else{
                        phoneExist = false;
                        showHidePassField(true);
                        COMMON.notify('Bạn cần nhập mật khẩu để tạo tài khoản đăng xe.','error');
                        $('html,body').animate({scrollTop: pass.offset().top - 50}, 500, function() {
                            pass.focus();
                        });
                    }
                    check_valid = true;
                }
            }
            
        });
    }

    function showHidePassField(show = true){
        var e = $('.pass_field');
        if(show){
            e.removeClass('hide');
        }else{
            pass.val('');
            confirmPass.val('');
            e.addClass('hide');
        }
    }

    // Valid Password
    function validPassword(){
        var _pass = pass.val();
        var _conf_pass = confirmPass.val();
        var _error = 'Mật khẩu ít nhất 8 ký tự';
        
        var e = pass;
        var label = e.parent().parent().parent().find('label').text().replace(/\*/, '');
        var msg = e.parent().parent().parent().find('label.msg_warning');
        if(_pass.length < 8){
            msg.html(_error);
            msg.removeClass('hide');
            e.focus();
            return false;
        }else{
            msg.removeClass('hide').addClass('hide');
        }

        e = confirmPass;
        label = e.parent().parent().parent().find('label').text().replace(/\*/, '');
        msg = e.parent().parent().parent().find('label.msg_warning');

        if(_conf_pass.length < 8){
            msg.html('');
            msg.html(_error);
            msg.removeClass('hide');
            e.focus();
            return false;
        }else{
            msg.removeClass('hide').addClass('hide');
        }

        if($.trim(_pass) != $.trim(_conf_pass)){
            msg.html('Xác nhận mật khẩu không đúng');
            msg.removeClass('hide');
            e.focus();
            return false;
        }else{
            msg.removeClass('hide').addClass('hide');
        }
        return true;
    }

    // Valid Other Description
    function validOtherDescription(){
        var e = other_description;
        var error = 'Mô tả không để trống';
        var msg = $('label.msg_other_desc');
        if($.trim(other_description.val()) == ""){
            msg.html(error);
            msg.removeClass('hide');
            e.focus();
            return false;
        }else{
            msg.removeClass('hide').addClass('hide');
        }
        return true;
    }

    // Valid For Input
    function validateInput() {
        var valid = true;
        $("input[required=true], select[required=true], textarea[required=true]").each(function(){
            var e = $(this);
            if(!e.val() && e.attr('name') == 'product_price_tmp' && contact_price.prop('checked')){
                e.removeClass('invalid');
                e.parent().removeClass('invalid');
                return valid;
            }
            e.removeClass('invalid');
            e.attr('title','');
            if(!e.val()){ 
                e.parent().addClass('invalid');
                e.attr('title','Không được để trống');
                valid = false;
                $(this).tooltip(tooltipOoption);
                $(this).tooltip('open');
                listError.push({id: e });
                $('html,body').animate({scrollTop: e.offset().top - 50}, 500, function() {
                    e.focus();
                });
            }else{
                e.parent().removeClass('invalid');
                destroyTooltip(e);
            }
            return valid;
        }); 
        return valid;
    }

    /*
    |--------------------------------------------------------------------------
    | Helper
    |--------------------------------------------------------------------------
    */
    var tooltipOoption = {
        position: {
            my: "left bottom-10",
            at: "left top",
            using: function( position, feedback ) {
              $( this ).css( position );
              $( "<div>" )
                .addClass( "arrow" )
                .addClass( feedback.vertical )
                .addClass( feedback.horizontal )
                .appendTo( this );
            }
        },
        content: function() { return $(this).attr( "title" ); },
    };

    // Destroy Tooltip
    function destroyTooltip(element){
        if($(element).data('ui-tooltip')) {
            $(element).tooltip('destroy');
            $(element).attr('title','');
            $(element).parent().removeClass('invalid');
        }
    }

    // cancel previous ajax request
    function cancelLastRequest(type) {
        if (type in xhr && xhr[type]) {
            xhr[type].abort();
            xhr[type] = null;
        }
    }

    // reset state of an input
    function clearValidation(element) {
        $(element).closest('.form-error,.form-valid')
            .removeClass('form-valid form-error')
            .find('.message.form-error').remove();
    }

    // improve ajax calls with cache
    function ajax_helper(element, url, data, target, callback) {
        var tar = $("#"+target);
        tar.addClass('loading disabled');
        // default callback
        if (typeof callback != 'function') {
            callback = function(json) {

                var list_data = [];
                // format data list for select2
                var _other = {};
                for (var i in json) {
                    if(json[i] == 'khác'){
                        _other = {
                            id: i,
                            text: 'Dòng khác'
                        };
                        continue;
                    }
                    
                    list_data.push({
                        id: i,
                        text: json[i]
                    });
                }

                if(Object.keys(_other).length > 0){
                    list_data.push(_other);
                }

                if(element == "model_year"){
                    list_data.push({
                        id: 0,
                        text: name_not_year
                    });
                    list_data.push({
                        id: -1,
                        text: ''
                    });
                }

                if(target == "filter-district"){
                    element.html(blank_option).val('').trigger('refresh').prop('disabled', true);
                    if (list_data.length){
                        element.prop('disabled', false);
                    }

                    // append new list
                    WVN.select2(element, {
                        data: list_data
                    });
                }else{
                    applyData(element, list_data, target);
                }
            };
        }

        var key = JSON.stringify(data).replace(/\W+/g, '_'),
            type = target;

        // try to retrieve from cache, else fetch
        if ((type in cache) && (key in cache[type])) {
            callback(cache[type][key]);
        } else {
            cancelLastRequest(type);
            xhr[type] = $.getJSON(url, data, function(json) {
                if (!(type in cache)) {
                    cache[type] = {};
                }
                cache[type][key] = json;                
                callback(json);
            });
        }
        tar.removeClass('loading disabled');
    }

    // Apply Data For Filter List
    function applyData(element, data, target){
        if (data == undefined) {
            return;
        }

        var parent = document.getElementById(target);
        parent.innerHTML = "";

        $.each(data, function(k, v) {
            if(parseInt(v.id) >= 0){
                var li      = document.createElement("li");
                var label   = document.createElement("label");
                var radioInput = document.createElement('input');
                var span    = document.createElement("span");

                radioInput.type     = 'radio';
                radioInput.name     = element;
                radioInput.value    = v.id;
                span.innerHTML      = v.text;

                label.appendChild(radioInput);
                label.appendChild(span);
                li.appendChild(label);
                parent.appendChild(li); 
            }else if(element == "model_year" && parseInt(v.id) == -1){
                var li      = document.createElement("li");
                var label   = document.createElement("label");
                var input   = document.createElement('input');

                label.className = 'input'
                input.type     = 'text';
                input.name     = 'bike_year';
                input.value    = '';
                input.placeholder    = 'Nhập đời xe';
                
                label.appendChild(input);
                li.appendChild(label);
                parent.appendChild(li); 
            }
        });
    }

    // Disable Controls
    function disableControls(target, default_value) {
        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function() {
            var self = $(this);

            if (default_value != undefined) {
                self.val(default_value);
            }

            $(this).prop('disabled', true).trigger('change', true);
        });
    }

    // hidden Filter
    function hiddenFilter(target, hide = true) {
        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function(k, v) {
            var parent = document.getElementById(v);
            if(parent.hasChildNodes()){
                if(hide){
                    $.each(parent.children, function() {
                        $(this).addClass('hide');
                    });
                }else{
                    $.each(parent.children, function() {
                        $(this).removeClass('hide');
                    });
                }
            }
        });
    }

    // Clear Filter
    function clearFilter(target){
        var parent = document.getElementById(target);
        parent.innerHTML = "";

        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function(k, v) {
            var parent = document.getElementById(v);
            parent.innerHTML = "";
        });
    }

    // Clear Check Filter
    function clearCheckFilter(target){
        var parent = document.getElementById(target);

        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function(k, v) {
            var parent = $("#"+v);
            parent.find('li input').each(function() {
                if($(this).prop('checked')){
                    $(this).prop('checked', false);
                    return;
                }
            });
        });
    }

    // Reset Product Description
    function resetProductDescription(target){
        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function(k, v) {
            if ((v in arr_title)) {
                arr_title[v] = "";
            }
        });
    }

    // Reset Suggest Title
    function resetSuggestTitle(target){
        if (!$.isArray(target)) {
            target = [target];
        }

        $.each(target, function(k, v) {
            if ((v in arr_title)) {
                arr_title[v] = "";
            }
        });
    }

    // getValueFilterList
    function getValueFilterList(target){
        var rs = '';
        target.find('li input').each(function() {
            if($(this).prop('checked')){
                rs = $(this).parent().text().trim();
                return;
            }
        });
        return rs;
    }

    /*
    |--------------------------------------------------------------------------
    | Trigger Change Control When Edit
    |--------------------------------------------------------------------------
    */
    function trigerChangeControl(){
        $('.filter-col').each(function() {
            $(this).addClass('disabled');
        });

        checkedlist('#list-brand-filter','#filter-brand-list');
        checkedlist('#list-series-filter','#filter-series-list');
        checkedlist('#list-year-filter','#filter-year-list');
        hiddenFilter([filter_color], false);
        checkedlist('#list-color-filter','#filter-color-list');
        handleDescription(product_description);
        product_price.trigger('keyup');
    }

    // Init Checklist When Edit
    function checkedlist(listfilter, checkboxlist){
        $(checkboxlist).find('li input').each(function() {
            if($(this).prop('checked')){
                var _tmp = $(this).parent().text().trim();
                $(listfilter).val(_tmp);
                $(listfilter).trigger('keyup');
            }
        });
    }

    // Auto save - every 1 minute
    setInterval(saveDraft, 60000);
})(jQuery)