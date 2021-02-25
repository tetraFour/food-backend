 AOS.init({
  duration: 800,
  easing: 'slide-up',
  once: true
 });

 jQuery(document).ready(function($){
  var formModal = $('.cd-user-modal'),
    formLogin = formModal.find('#cd-login'),
    formSignup = formModal.find('#cd-signup'),
    formForgotPassword = formModal.find('#cd-reset-password'),
    formModalTab = $('.cd-switcher'),
    tabLogin = formModalTab.children('li').eq(0).children('a'),
    tabSignup = formModalTab.children('li').eq(1).children('a'),
    forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
    backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a'),
    restaurantList = formSignup.find("#rest-list"),
    restaurantListSwitcherBtn = formSignup.find("#btn-list-switch"),
    mainNav = $('.main-nav');

  //open modal
  mainNav.on('click', function(event){
    $(event.target).is(mainNav) && mainNav.children('ul').toggleClass('is-visible');
  });

  //open sign-up form
  mainNav.on('click', '.cd-signup', signup_selected);
  //open login-form form
  mainNav.on('click', '.cd-signin', login_selected);

  //close modal
  formModal.on('click', function(event){
    if( $(event.target).is(formModal) || $(event.target).is('.cd-close-form') ) {
      formModal.removeClass('is-visible');
    }
  });

     restaurantListSwitcherBtn.on('click', function () {
         restaurantList.toggleClass('show')
     })

  //close modal when clicking the esc keyboard button
  $(document).keyup(function(event){
      if(event.which=='27'){
        formModal.removeClass('is-visible');
      }
    });

  //switch from a tab to another
  formModalTab.on('click', function(event) {
    event.preventDefault();
    ( $(event.target).is( tabLogin ) ) ? login_selected() : signup_selected();
  });

  //hide or show password
  $('.hide-password').on('click', function(){
    var togglePass= $(this),
      passwordField = togglePass.prev('input');

    ( 'password' == passwordField.attr('type') ) ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
    ( 'Hide' == togglePass.text() ) ? togglePass.text('Show') : togglePass.text('Hide');
    //focus and move cursor to the end of input field
    passwordField.putCursorAtEnd();
  });

  //show forgot-password form
  forgotPasswordLink.on('click', function(event){
    event.preventDefault();
    forgot_password_selected();
  });

  //back to login from the forgot-password form
  backToLoginLink.on('click', function(event){
    event.preventDefault();
    login_selected();
  });

  function login_selected(){
    mainNav.children('ul').removeClass('is-visible');
    formModal.addClass('is-visible');
    formLogin.addClass('is-selected');
    formSignup.removeClass('is-selected');
    formForgotPassword.removeClass('is-selected');
    tabLogin.addClass('selected');
    tabSignup.removeClass('selected');
  }

  function signup_selected(){
    mainNav.children('ul').removeClass('is-visible');
    formModal.addClass('is-visible');
    formLogin.removeClass('is-selected');
    formSignup.addClass('is-selected');
    formForgotPassword.removeClass('is-selected');
    tabLogin.removeClass('selected');
    tabSignup.addClass('selected');
  }

  function forgot_password_selected(){
    formLogin.removeClass('is-selected');
    formSignup.removeClass('is-selected');
    formForgotPassword.addClass('is-selected');
  }

  //REMOVE THIS - it's just to show error messages
  formLogin.find('input[type="submit"]').on('click', function(event){
    event.preventDefault();
    formLogin.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
  });
  formSignup.find('input[type="submit"]').on('click', function(event){
    event.preventDefault();
    formSignup.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
  });


  //IE9 placeholder fallback
  //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
  if(!Modernizr.input.placeholder) {
    $('[placeholder]').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        }
    }).blur(function() {
       var input = $(this);
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.val(input.attr('placeholder'));
        }
    }).blur();
    $('[placeholder]').parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
           input.val('');
        }
        })
    });
  }

});


//credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
jQuery.fn.putCursorAtEnd = function() {
  return this.each(function() {
      // If this function exists...
      if (this.setSelectionRange) {
          // ... then use it (Doesn't work in IE)
          // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
          var len = $(this).val().length * 2;
          this.focus();
          this.setSelectionRange(len, len);
      } else {
        // ... otherwise replace the contents with itself
        // (Doesn't work in Google Chrome)
          $(this).val($(this).val());
      }
  });
};

(function($) {

	'use strict';

	// bootstrap dropdown hover

  // loader
  var loader = function() {
    setTimeout(function() {
      if($('#loader').length > 0) {
        $('#loader').removeClass('show');
      }
    }, 1);
  };
  loader();


	$('nav .dropdown').hover(function(){
		var $this = $(this);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
			$this.removeClass('show');
			$this.find('> a').attr('aria-expanded', false);
			$this.find('.dropdown-menu').removeClass('show');
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
	  console.log('show');
	});

  $('.navbar .dropdown > a').click(function(){
    location.href = this.href;
  });


	// home slider
	$('.home-slider').owlCarousel({
    loop:true,
    autoplay: true,
    margin:0,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    smartSpeed: 1000,
    nav:true,
    autoplayHoverPause: true,
    items: 1,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:1,
        nav:false
      },
      1000:{
        items:1,
        nav:true
      }
    }
	});

  $('.home-slider-loop-false').owlCarousel({
    loop:false,
    autoplay: true,
    margin:0,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav:true,
    autoplayHoverPause: true,
    items: 1,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:1,
        nav:false
      },
      1000:{
        items:1,
        nav:true
      }
    }
  });

	// owl carousel
	var majorCarousel = $('.js-carousel-1');
	majorCarousel.owlCarousel({
    loop:true,
    autoplay: true,
    stagePadding: 7,
    margin: 20,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    smartSpeed: 1000,
    nav: true,
    autoplayHoverPause: true,
    items: 3,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:2,
        nav:false
      },
      1000:{
        items:3,
        nav:true,
        loop:false
      }
  	}
	});

	// owl carousel
	var major2Carousel = $('.js-carousel-2');
	major2Carousel.owlCarousel({
    loop:true,
    autoplay: true,
    stagePadding: 7,
    margin: 20,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    nav: true,
    autoplayHoverPause: true,
    items: 4,
    navText : ["<span class='ion-chevron-left'></span>","<span class='ion-chevron-right'></span>"],
    responsive:{
      0:{
        items:1,
        nav:false
      },
      600:{
        items:3,
        nav:false
      },
      1000:{
        items:4,
        nav:true,
        loop:false
      }
  	}
	});


  $('.centernonloop').owlCarousel({
    center: true,
    items: 1,
    loop: false,
    margin: 30,
    smartSpeed: 1000,
    dots: true,
    responsive:{
      600:{
        items: 2
      },
      900:{
        items: 3
      }
    }
  });

  $('.centernonloop2').owlCarousel({
    items: 1,
    loop: true,
    margin: 0,
    autoplay: true,
    smartSpeed: 1000,
    dots: true,
  });



	var contentWayPoint = function() {
		var i = 0;
		$('.element-animate').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('element-animated') ) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .element-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn element-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft element-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight element-animated');
							} else {
								el.addClass('fadeInUp element-animated');
							}
							el.removeClass('item-animate');
						},  k * 100);
					});

				}, 100);

			}

		} , { offset: '95%' } );
  };

	contentWayPoint();
  var modal = document.getElementById('myModal');


  var btn = document.getElementById("myBtn");


  var span = document.getElementsByClassName("close")[0];


  // var restaurantSwitcher = document.getElementById()

  btn.onclick = function() {
      modal.style.display = "block";
  }


  span.onclick = function() {
      modal.style.display = "none";
  }


  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }


})(jQuery);
