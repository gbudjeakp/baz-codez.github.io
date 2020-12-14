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

const mainNav = document.getElementById('js-menu')
const navBarToggle = document.getElementById('js-navbar-toggle')

navBarToggle.addEventListener('click', function () {
  mainNav.classList.toggle('active')
})

// For dynamic date
const text = document.getElementById('footer')
const date = new Date().getFullYear()
text.innerHTML = `&copy; Copyright ${date}, The Amature Web Dev`
