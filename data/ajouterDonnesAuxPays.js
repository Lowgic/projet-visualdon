const R = require('ramda')
// pays_simplifies est le fichier pays.json simplifié avec https://mapshaper.org/
const pays = require('./pays_simplies.json').features
// les données à joindre
const alcoF = require('./data/femaleAlcoholData.json')
const alcoM = require('./data/maleAlcoholData.json')
const lifeF = require('./data/femaleLifeData.json')
const lifeM = require('./data/maleLifeData.json')
const bizzF = require('./data/femaleBusinessData.json')
const bizzM = require('./data/maleBusinessData.json')

const getDonnee = objet => {
  // si le pays n'a pas été trouvé -> rien
  if (!objet) {
    return undefined
  }
  // trouver la clé (donnees2017, donnees2018...), elle contient toujours "donnee"
  const cle = Object.keys(objet).filter(key => key.includes('donnee'))[0]
  const donnee = R.prop(cle, objet)
  return isNaN(Number(donnee))
    // si ce n'est pas un nombre, genre '..' -> rien
    ? undefined
    : Number(donnee)
}

const getValueByCountryCode = (data, iso) => {
  // ici "data" est une des listes chargées plus haut (alcoF par exemple)
  // "iso" est le code pays
  const objet = data.find(d => d.codePays === iso)
  // utilise getDonnee créé au dessus
  return  getDonnee(objet)
}

// pour chaque pays je récupère toutes les données
const avecDonnees = pays.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    alcoF: getValueByCountryCode(alcoF, feature.properties.ISO_A3),
    alcoM: getValueByCountryCode(alcoM, feature.properties.ISO_A3),
    lifeF: getValueByCountryCode(lifeF, feature.properties.ISO_A3),
    lifeM: getValueByCountryCode(lifeM, feature.properties.ISO_A3),
    bizzF: getValueByCountryCode(bizzF, feature.properties.ISO_A3),
    bizzM: getValueByCountryCode(bizzM, feature.properties.ISO_A3),
  }
}))

// transformer en collection geojson et logger comme chaine de charactères
console.log(
  JSON.stringify(
    { type: 'FeatureCollection', features: avecDonnees },
    null,
    2
  )
)

/* 
    UTILISATION
  
    Dans la console:

    node ajouterDonnesAuxPays > data.json

    pour sauver dans un fichier "data"
*/

