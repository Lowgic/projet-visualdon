# Provenance des données

*Pour les données geoJSON :*

Les informations relatives au multi-polygônes de chaque pays ont été prises à l'adresse suivante :
https://datahub.io/core/geo-countries/r/0.geojson

*Pour les données relatives aux statistiques de chaque pays :*

La source de celles-ci provient de [The World Bank](https://databank.worldbank.org/data/source/gender-statistics#). 

# Transformation des données 

Les données des études ont été exportées depuis The World Bank en format CSV.
Selon les études, certains nettoyages sur les données se sont parfois avérés nécéssaires. 
Ces dernières ont ensuite été transformées via [un convertisseur CSV à JSON en ligne](http://www.convertcsv.com). 

Les données finales sont enfin le résultat d'un tri entre tous les pays du geoJSON et tous les pays de l'étude possédant bel un bien un résultat, ce qui n'est malheureusement pas toujours le cas et sont alors exclus de la visualisation.

# Choix effectués

J'ai donc choisi trois thèmes parmi ceux présents dans la collection *"Gender Statistics"* :

- La consommation mondiale d'alcool en 2016
- L'espérance de vie mondiale en 2017
- La durée moyenne de création d'entreprise en 2018

Je les ai jugés intéressants car leurs résultats étaient scindés par sexe. 

Pour ce qui est du choix de la palette de couleurs, j'ai utilisé l'outil [ColorBrewer](http://colorbrewer2.org/) pour me conseiller. 

Quant aux échelles utilisées dans l'étude, j'ai simplement calculé l'écart entre le maximum et le minimum et l'ai divisé de sorte que celui-ci me donne plusieurs échelons de même taille.  

# Visualisation de données 

Étant donné le fait que je désirais représenter des géodonnées à l'échelle mondiale, la carte dite "choroplèthe" m'est apparu comme une évidence pour tenter de mettre en avant une tendance. Après quelques recherches, il s'est avéré que Leaflet.js proposait cette fonctionnalité ainsi qu'un tutoriel sur le sujet.    

# Objectifs 

Mon objectif est dans un premier temps de mettre en lumière des disparités entre les hommes et les femmes, puis dans un second temps, les disparités entre les pays. De manière plus globale, je souhaite démontrer l'impact de barrières culturelles qui divisent ou rassemblent nos pays. 

# Public cible 

Je pense que les informations visualisées pourraient intéresser des individus aux horizons variés et peut-être même aux opinions opposées. À ce stade, je n'arrive donc pas à définir un profil type, si ce n'est un Mr.ToutLeMonde un tant soit peu curieux. 
Cependant, je pense que ce travail peut être facilement personnalisable pour un public cible donné en travaillant le choix du thème des études ainsi que les échelles afin d'y faire ressortir ce qu'ils auraient envie d'y voir.   
