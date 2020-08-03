// Selectors
const myButton = document.getElementById('fetch')
myButton.addEventListener('click', displayInfo)

function displayInfo () {
  window.fetch('https://restcountries.eu/rest/v2/all')
    .then(response => response.json())
    .then(jsonObj => displayData(jsonObj))
    .catch(() => window.alert('API Could not be reached at this time'))
}
function displayData (country) {
  const { name, capital, languages, currencies, population, region } = country[Math.floor(Math.random() * 150)]
  const template = `
  <div>
  <h1 id="head">${name}</h1>
  <p id="content"> This is a country with its capital in ${capital}. 
  The language(s) spoken here are ${languages[0].name}. The nation of ${name} is 
  located in the ${region} region with a population of ${population} and uses ${currencies[0].name} as it's currency</P>
  </div>
  `
  // did this so i would avoid the process of having a refrsh/update button
  document.getElementById('template').innerHTML = template
}
