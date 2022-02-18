// JavaScript Document
document.addEventListener("DOMContentLoaded", function() {yall({observeChanges: true});});
$( document ).ready(function() {
	// setup time scroll
    $('body').scrollspy({target: ".navbar", offset: 50});
    $("#myNavbar a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top-100
            }, 800, function(){
                window.location.hash = hash;
            });
        }
    });

	$("body").removeClass(".slideshow-control-top");

    $('.list-series-moto-like').slick(
        {
            slidesToShow: 5,
            slidesToScroll: 5,
            autoplay: false,
        }
    );
	$('.slideshow-top').slick({
		dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        adaptiveHeight: true,
        autoplay: true,
        autoplaySpeed: 4000,
	});
	$('.buy-tool-side').slick({
		slidesToShow: 5,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 4000,
		responsive: [
			{
				breakpoint: 1150,
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1,
					autoplay: true,
					autoplaySpeed: 4000,
				}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1
				}
			}
		]
	});

//	$('.buy-tool-side2').slick({
//        slidesToShow: 5,
//        slidesToScroll: 1,
//        autoplay: false,
//        responsive: [
//            {
//                breakpoint: 1150,
//                settings: {
//                    slidesToShow: 4,
//                    slidesToScroll: 1,
//                    autoplay: false,
//                }
//            },
//            {
//                breakpoint: 600,
//                settings: {
//                    slidesToShow: 4,
//                    slidesToScroll: 1
//                }
//            },
//            {
//                breakpoint: 480,
//                settings: {
//                    slidesToShow: 4,
//                    slidesToScroll: 1
//                }
//            }
//        ]
//    });
        $('.buy-tool-side2').slick({
            slidesToShow: 5,
            asNavFor: '.slider-for',
            dots: false,
            centerMode: false,
            focusOnSelect: true,
            autoplay: false,
            responsive: [
                    {
                            breakpoint: 1150,
                            settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 1,
                                    autoplay: false,

                            }
                    },
                    {
                            breakpoint: 600,
                            settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 1
                            }
                    },
                    {
                            breakpoint: 480,
                            settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 1
                            }
                    }
            ]
    });

    // slide for series summary
    $('.list-series-moto-like, .list-model-topmoto').slick(
        {
            slidesToShow: 5,
            slidesToScroll: 5,
            autoplay: false,
        }
    );

     $(".select-box").select2({ width: '100%' });
    // scroll to top
    $(window).scroll(function () {
        if ($(this).scrollTop() > 150) {
            $('#gotop').fadeIn();
            $('#btn-help-desk-foot').fadeIn();
        } else {
            $('#gotop').fadeOut();
            $('#btn-help-desk-foot').fadeOut();
        }
    });
    $('#gotop').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});