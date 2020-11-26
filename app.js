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

// for cursor
const cursor = document.querySelector('.cursor')

document.addEventListener('mousemove', e => {
  cursor.setAttribute('style', 'top: ' + (e.pageY - 10) + 'px; left: ' + (e.pageX - 10) + 'px;')
})

document.addEventListener('click', () => {
  cursor.classList.add('expand')

  setTimeout(() => {
    cursor.classList.remove('expand')
  }, 500)
})

// For dynamic date
const text = document.getElementById('footer')
const date = new Date().getFullYear()
text.innerHTML = `&copy; Copyright ${date}, The Amature Web Dev`

