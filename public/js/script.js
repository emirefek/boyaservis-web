$(".hero-slider").ready(() => {
  $(".hero-slider").owlCarousel({
    loop: true,
    items: 1,
    margin: 0,
    nav: true,
    smartSpeed: 500,
    autoplay: 6000,
    autoplayTimeout: 700000,
    navText: ['<i class="fa-solid fa-angle-left"></i>', '<i class="fa-solid fa-angle-right"></i>'],
  });
});

$(".logo-slider").ready(() => {
  $(".logo-slider").owlCarousel({
    loop: true,
    dots: false,
    nav: false,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 1,
        slideBy: 1,
        autoplayTimeout: 1500,
      },
      600: {
        items: 2,
        slideBy: 2,
        autoplayTimeout: 1500,
      },
      768: {
        items: 3,
        slideBy: 3,
      },
      992: {
        items: 4,
        slideBy: 3,
      },
      1200: {
        items: 5,
        slideBy: 4,
      },
    },
  });
});

$(".menu").ready(function () {
  $(".menu [href]").each(function () {
    if (this.href == window.location.href) {
      $(this).addClass("current");
    }
  });
});

$(".menu").ready(() => {
  $(".menu-btn").on("click", () => {
    $(".menu").toggleClass("menu-fullscreen");

    if ($("#mBtn").attr("class") === "fa-solid fa-bars") {
      $("#mBtn").removeClass("fa-bars");
      $("#mBtn").addClass("fa-xmark");
    } else {
      $("#mBtn").removeClass("fa-xmark");
      $("#mBtn").addClass("fa-bars");
    }
  });
});

document.querySelector(".burger").addEventListener("click", () => {
  document.querySelector("body").classList.toggle("noscroll");
  document.querySelector(".burger").classList.toggle("fa-bars");
  document.querySelector(".burger").classList.toggle("fa-xmark");
  document.querySelector(".menu").classList.toggle("menupop");
});

$(document).ready(() => {
  $("[data-bg-image]").each(function () {
    var $this = $(this),
      $image = $this.data("bg-image");
    $this.css({
      "background-image": "url(" + $image + ")",
      "background-size": "contain",
      "background-repeat": "no-repeat",
    });
  });

  $("[data-bg-color]").each(function () {
    var $this = $(this),
      $color = $this.data("bg-color");
    $this.css("background-color", $color);
  });

  const isMobile = () => {
    const details = navigator.userAgent;
    const regexp = /android|iphone|kindle|ipad/i;
    const isMobile = regexp.test(details);
    return isMobile;
  };

  const ifMobile = isMobile();
  const footer = $(".ff");
  ifMobile ? footer.removeClass("footer-fix") : null;
  //Burayı elleme bu kısım mobilde çalışıyor pc'de çalışmıyor gibi gözükmesi normaldir. Çalıştığını görmen için dev tools'dan mobil moduna geçip refresh atman lazım.

  $(".clickable").ready(() => {
    $(".clickable").on("click", (e) => {
      const target = e.target.classList;
      const index = target[target.length - 1];
      const query = `.cat-${index}`;
      const services = document.querySelector(query);
      const checkIfMobile = isMobile();
      if (!checkIfMobile) {
        const footer = $(".ff");
        footer.toggleClass("footer-fix");
      }
      services.classList.toggle("undisplayed");
    });
  });
});
