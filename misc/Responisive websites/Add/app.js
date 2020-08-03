var menu = document.getElementById('menuBtn')
var sideNav = document.getElementById('sideNav')
sideNav.style.right = '-250px'
menu.addEventListener('click', popOut)
function popOut () {
  if (sideNav.style.right == '-250px') {
    sideNav.style.right = '0'
  } else {
    sideNav.style.right = '-250px'
  }
}

var scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedDuration: true
})
var career = document.getElementById('career')
career.addEventListener('click', alertus)

function alertus () {
  window.alert('Page is under construction')
}
