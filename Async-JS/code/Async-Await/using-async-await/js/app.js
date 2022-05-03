"use strict";

const swapiFilms = async function() {
  const url = "https://swapi.dev/api/films/";
  let films = [];

  const filmsData = await fetch(url).then(data => data.json());

  films = filmsData.results.map(obj => obj.title);
  console.log(films);
};