particlesJS.load('particles-js', 'particles.json')

// For Contact Button
const btn = document.querySelector('.btn')
btn.addEventListener('click', contact)

function contact () {
  window.location.href = 'mailto:gbudjeakp@gmail.com'
}

// for nav menu
// var menu = document.querySelector('.burger')
// var sideNav = document.getElementById('sideNav')
// sideNav.style.right = '-250px'
// menu.addEventListener('click', popOut)
// function popOut () {
//   if (sideNav.style.right === '-250px') {
//     sideNav.style.right = '0'
//   } else {
//     sideNav.style.right = '-250px'
//   }
// }

// for popup
const popup = document.getElementsByClassName('popup')
for (var i = 0; i < popup.length; i++) {
  popup[i].addEventListener('onmouseover', pops, false)  
}

function pops () {
  const popup = document.getElementsByClassName('popup')
  for (var i = 0; i < popup.length; i++) {
    popup[i].addEventListener('onmouseover', pops, false)  
}

  const loader = document.getElementsByClassName('loader')
for (var i = 0; i < loader.length; i++) {
    loader[i].style.display = 'block'
 }
}

// mouse out closes popup
function popoff () {
  const popup = document.getElementsByClassName('popup')
  for (var i = 0; i < popup.length; i++) {
    popup[i].addEventListener('onmouseover', pops, false)  
}

  const loader = document.getElementsByClassName('loader')
for (var i = 0; i < loader.length; i++) {
    loader[i].style.display = 'none'
 
   }
}
