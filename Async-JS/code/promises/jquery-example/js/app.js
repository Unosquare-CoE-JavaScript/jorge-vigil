"use strict";

const moviePlanets = function(movieNum) {
  let url = 'https://swapi.dev/api/films/';

  $.getJSON(url + movieNum + '/')
    .then(response => {
      console.log(response.title);
      response.planets.forEach(
        planet => $.getJSON(planet)
        .then(p => console.log(p.name))
      )
    })
    .catch(reject => console.log(`Couldn't retreive films: ${reject}`));
};

moviePlanets(1);

console.log('Other code...');