
// For Contact Button
// const btn = document.querySelector('.btn')
// btn.addEventListener('click', contact)

// function contact () {
//   window.location.href = 'mailto:gbudjeakp@gmail.com'
// }

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

// Set the date we're counting down to
var countDownDate = new Date('Oct 8, 2021 15:37:25').getTime()

// Update the count down every 1 second
var x = setInterval(function () {
  // Get todays date and time
  var now = new Date().getTime()

  // Find the distance between now an the count down date
  var distance = countDownDate - now

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24))
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.floor((distance % (1000 * 60)) / 1000)

  // Display the result in an element with id="demo"
  document.getElementById('demo').innerHTML = days + 'd ' + hours + 'h ' +
  minutes + 'm ' + seconds + 's ';

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x)
    document.getElementById('demo').innerHTML = 'EXPIRED';
  }
}, 1000)
