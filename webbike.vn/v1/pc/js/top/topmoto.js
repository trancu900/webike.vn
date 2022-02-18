$(function() {

    /*
    |--------------------------------------------------------------------------
    | Modules on TOP Motomarket
    |--------------------------------------------------------------------------
    */

    // left modules
    var top_banners = MODULES.initTopMotorBanners();
    var motor_makers = MODULES.initTopMotorMakers();
    var left_recent_viewed = MODULES.initRecentlyViewedItemsModule();

    // body modules
    var body_product_grids = MODULES.initProductGridModules();

    $(document).ready(function () {
      $(".comp-new-bike").slick({
        infinite: true,
        slidesToShow: 6,
        slidesToScroll: 1,
      });
    });

});
