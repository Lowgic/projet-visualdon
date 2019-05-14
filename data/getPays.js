const fetch = require('node-fetch')

/*
  une fonction qui va chercher les pays
  dans la ligne de commande:

  node getPays > pays.json

  crée un fichier pays.json
*/

fetch("https://datahub.io/core/geo-countries/r/0.geojson")
  .then(r => r.json())
  .then(JSON.stringify)
  .then(console.log)