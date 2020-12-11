// handles the scroll animation
$(document).on('scroll', function () {
  var pageTop = $(document).scrollTop()
  var pageBottom = pageTop + $(window).height()
  var tags = $('.tag')

  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i]

    if ($(tag).position().top < pageBottom) {
      $(tag).addClass('visible')
    } else {
      $(tag).removeClass('visible')
    }
  }
})

// for hamburger menu

const sideNav = document.getElementById('sidNav')

$(document).ready(function () {
  $('#nav-icon3, #sideNav').click(function () {
    $(this).toggleClass('open')
    if (sideNav.style.left === '40%') {
      sideNav.style.top = '-160%'
    } else {
      sideNav.style.right = '100%'
    }
  })
})

// For dynamic date
const text = document.getElementById('footer')
const date = new Date().getFullYear()
text.innerHTML = `&copy; Copyright ${date}, The Amature Web Dev`
