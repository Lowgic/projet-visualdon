import $ from 'jquery';
const L = require('leaflet')

/*___________import_des_datas__________________________*/ 

import data from '../data/data.json'
//import worldAlcoholFemaleData from './data/worldAlcoholFemaleData.json';
//import worldAlcoholMaleData from './data/worldAlcoholMaleData.json';
//import worldLifeFemaleData from './data/worldLifeFemaleData.json';
//import worldLifeMaleData from './data/worldLifeMaleData.json';
//import worldBusinessFemaleData from './data/worldBusinessFemaleData.json';
//import worldBusinessMaleData from './data/worldBusinessMaleData.json';

/*___________déclaration_des_variables_________________*/

//Clé personnelle pour accéder à l'API de mapbox
let mapboxAccessToken = 'pk.eyJ1IjoibG93Z2ljIiwiYSI6ImNqdm1ieG5uaDEwZXE0Y29mcDAzZXU3dTcifQ.y_uP3kNnKFociUZFTXIySg';

//Crée une variable pour les tuiles 
let geojson;

//L.Control est une classe de base pour l'implémentation des contrôles de la carte
//par défaut il est mis en haut à droite
let info = L.control();

//Crée le panneau des légendes positionné en bas à droite
let legend = L.control({position: 'bottomright'});

//Variable pour le removeLayer
let compteur = 0;


//Cadrage du centre de la carte et instanciation
let map = L.map('map').setView([20,3], 1.70);

//Lien avec l'API de map.box 
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    //Encart en bas de la carte pour les crédits
    attribution: 'HEIG-VD | Cours de visualisation de données'
}).addTo(map);


// Fonctions de l'application

/*___________________Coloration_des_tuiles__________________*/ 

const GRIS = 'lightgray'

function getAlcoholColors(d){
	if (d !== 0 && !d) {
		return GRIS
	}
	//Série de if imbriqués
	//Max 25.2 , Min 0
    return d > 25  ? '#800026' :
           d > 20  ? '#BD0026' :
           d > 15  ? '#E31A1C' :
           d > 10  ? '#FC4E2A' :
           d > 5   ? '#FD8D3C' :
 					 '#FED976';
}

function getLifeColors(d){
	if (d !== 0 && !d) {
		return GRIS
	}
	//Série de if imbriqués
	//Max 87 , Min 51
    return  d > 85  ? '#005a32' :
         	d > 80  ? '#238b45' :
         	d > 75  ? '#41ab5d' :
         	d > 70  ? '#74c476' :
         	d > 65  ? '#a1d99b' :
         	d > 60  ? '#c7e9c0' :
         	d > 55  ? '#e5f5e0' :
 			 		  '#f7fcf5';
}

function getBusinessColors(d){
	if (d !== 0 && !d) {
		return GRIS
	}
	//Série de if imbriqués
	//Max 230 , Min 0.5
	return  d > 200 ? '#08306b' :
	        d > 100 ? '#08519c' :
	        d > 50  ? '#2171b5' :
	        d > 28  ? '#4292c6' :
	        d > 21  ? '#6baed6' :
	        d > 14  ? '#9ecae1' :
	        d > 7   ? '#c6dbef' :
	 			 	  '#deebf7';
}

//Fonction permettant d'ajouter le style des tuiles 
function addAlcoholStyle(feature, female){
    return {
        fillColor: getAlcoholColors(female ? feature.properties.alcoF : feature.properties.alcoM),
        //Epaisseur bordure
        weight: 2,
        //Opacité des contours
        opacity: 1,
        //Couleur des contours
        color: 'white',
        //Contours hashés
        dashArray: '3',
        //Opacité des tuiles
        fillOpacity: 0.5
    };
}

//Fonction permettant d'ajouter le style des tuiles 
function addLifeStyle(feature, female){
    return {
        fillColor: getLifeColors(female ? feature.properties.lifeF : feature.properties.lifeM),
        //Epaisseur bordure
        weight: 2,
        //Opacité des contours
        opacity: 1,
        //Couleur des contours
        color: 'white',
        //Contours hashés
        dashArray: '3',
        //Opacité des tuiles
        fillOpacity: 0.5
    };
}


//Fonction permettant d'ajouter le style des tuiles 
function addBusinessStyle(feature, female){
    return {
        fillColor: getBusinessColors(female ? feature.properties.bizzF : feature.properties.bizzM),
        //Epaisseur bordure
        weight: 2,
        //Opacité des contours
        opacity: 1,
        //Couleur des contours
        color: 'white',
        //Contours hashés
        dashArray: '3',
        //Opacité des tuiles
        fillOpacity: 0.5
    };
}


/*__________________Interaction_avec_le_SVG_________________*/

//Fonction de modification du style de la tuile sur un hover
function highlightFeature(e) {
	let layer = e.target;

	layer.setStyle({
	    weight: 3,
	    color: '#444',
	    dashArray: '',
	    fillOpacity: 0.5
	});

	//La méthode bringToFront n'est pas accessible sur IE,Opera et Edge
	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	    layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

//Lorsque le pointer quitte le hover, reset au style d'origine
	function resetHighlight(e) {
	    geojson.resetStyle(e.target);
	    info.update();
	}

//Gère le clique sur la tuile pour un zoom sur celle-ci
function zoomToFeature(e) {
	//Note: les pays comme la France possède des territoires(ici la Guinée) sur deux continents
	//Cela ne provoque donc pas un zoom mais un dézoom  
    map.fitBounds(e.target.getBounds());
}

//Rassemble les trois fonctions ci-dessus en une seule
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

/*__________Informations_dynamiques_dans_l'ecart_____________*/

const montrerLaValeur = (valeur, unite) =>
	// s'il n'y a pas de valeur retourne "Pas de donnees" sinon la valeur et l'unité
	isNaN(valeur)
		? 'Pas de données'
		: `${valeur} ${unite}`

//Fonction qui retourne le contenu de l'encart d'info. selon l'étude séléctionnée
info.update = function (props) {
	let filter = $("#study").find(':selected').data('filter');

	if(filter == "femaleAlcohol"){
	    this._div.innerHTML = '<div id="titre">♀️ Consommation d\'alcool pur</div>' +  (props ?
        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.alcoF, 'ℓ/An par habitante')
        : 'Survolez un pays');
	}
	if(filter == "maleAlcohol"){
    this._div.innerHTML = '<div id="titre">♂️ Consommation d\'alcool pur</div>' +  (props ?
        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.alcoM, 'ℓ/An par habitant')
        : 'Survolez un pays');
	}
	if(filter == "femaleLife"){
	this._div.innerHTML = '<div id="titre">♀️ Espérance de vie</div>' +  (props ?
	        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.lifeF, 'ans')
	        : 'Survolez un pays');
	}
	if(filter == "maleLife"){
	this._div.innerHTML = '<div id="titre">♂️ Espérance de vie</div>' +  (props ?
	        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.lifeM, 'ans')
	        : 'Survolez un pays');
	}
	if(filter == "femaleBusiness"){
	this._div.innerHTML = '<div id="titre">♀️ Durée moyenne de création d\'entreprise</div>' +  (props ?
	        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.bizzF, 'jour(s)')
	        : 'Survolez un pays');
	}
	if(filter == "maleBusiness"){
	this._div.innerHTML = '<div id="titre">♂️ Durée moyenne de création d\'entreprise</div>' +  (props ?
	        '→ <i><b>' + props.ADMIN + '</b></i><br/><br/>' + montrerLaValeur(props.bizzM, 'jour(s)')
	        : 'Survolez un pays');
	}
};

//Créé le DOM et le met à jour 
info.onAdd = function (map) {
	//Crée une div avec une classe "info" 
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

/*_______________Encart_des_légendes_______________*/

legend.onAdd = function (map) {

	let filter = $("#study").find(':selected').data('filter');

	if(filter == "maleAlcohol" || filter =="femaleAlcohol"){
	    let div = L.DomUtil.create('div', 'info-legend'),
    	//Les niveaux de la coloration
        grades = [0, 5, 10, 15, 20, 25],
        //Les labels pour chaque légende
        labels = ["ℓ", "ℓ", "ℓ", "ℓ", "ℓ", "ℓ"];

	    //Boucle générant l'HTML dans l'encart
	    for (let i = 0; i < grades.length; i++){
        	div.innerHTML +=
            '<i style="background:' + getAlcoholColors(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
	    }
	    return div;
	}

	if(filter == "maleLife" || filter =="femaleLife"){
		let div = L.DomUtil.create('div', 'info-legend'),
    	//Les niveaux de la coloration
        grades = [55, 60, 65, 70, 75, 80, 85],
        //Les labels pour chaque légende
        labels = ["ans", "ans", "ans", "ans", "ans", "ans", "ans"];

	    //Boucle générant l'HTML dans l'encart
	    for (let i = 0; i < grades.length; i++){
        	div.innerHTML +=
            '<i style="background:' + getLifeColors(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
	    }
	    return div;
	}

	if(filter == "maleBusiness" || filter =="femaleBusiness"){
		let div = L.DomUtil.create('div', 'info-legend'),
    	//Les niveaux de la coloration
        grades = [7, 14, 21, 28, 50, 100, 200],
        //Les labels pour chaque légende
        labels = ["jours", "jours", "jours", "jours", "jours", "jours", "jours"];

	    //Boucle générant l'HTML dans l'encart
	    for (let i = 0; i < grades.length; i++){
        	div.innerHTML +=
            '<i style="background:' + getBusinessColors(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
	    }
	    return div;
	}
	}

//Fin des fonctions

/*__________Affichage_selon_filtre_______________*/

$("#study").change(function(){
	
	//Si c'est le chargement de la page ne remove aucun layer de map
	if(compteur >= 1){
		//Nécéssaire afin que la coloration des tuiles en opacité ne s'additionne pas
		map.removeLayer(geojson);
	}

	compteur++;

	//Récupère l'étude séléctionnée dans le <select>
	let filter = $(this).find(':selected').data('filter');

	/*__________________FEMALE_ALCOHOL________________*/
	if(filter == "femaleAlcohol"){

		//Ajoute les tuiles interactives correspondantes 
		geojson = L.geoJson(data, {
		    style: feature => addAlcoholStyle(feature, true),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations correspondantes
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}

	/*__________________MALE_ALCOHOL________________*/

	if(filter == "maleAlcohol"){

		//Ajoute les tuiles interactives
		geojson = L.geoJson(data, {
		    style: feature => addAlcoholStyle(feature, false),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}

	/*________________FEMALE_LIFE________________*/

	if(filter == "femaleLife"){

		//Ajoute les tuiles interactives
		geojson = L.geoJson(data, {
		    style: feature => addLifeStyle(feature, true),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}

	/*__________________MALE_LIFE________________*/

	if(filter == "maleLife"){

		//Ajoute les tuiles interactives
		geojson = L.geoJson(data, {
		    style: feature => addLifeStyle(feature, false),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}

	/*______________FEMALE_BUSINESS______________*/

	if(filter == "femaleBusiness"){

		//Ajoute les tuiles interactives
		geojson = L.geoJson(data, {
		    style: feature => addBusinessStyle(feature, true),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}

	/*______________MALE_BUSINESS______________*/

	if(filter == "maleBusiness"){

		//Ajoute les tuiles interactives
		geojson = L.geoJson(data, {
		    style: feature => addBusinessStyle(feature, false),
		    onEachFeature: onEachFeature
		}).addTo(map);

		//Ajoute les informations
		info.addTo(map);

		//Ajoute les légendes correspondantes
		legend.addTo(map);
	}
});

//Simule l'évenement pour gérer le premier chargement de la page
$("#study").trigger("change");
