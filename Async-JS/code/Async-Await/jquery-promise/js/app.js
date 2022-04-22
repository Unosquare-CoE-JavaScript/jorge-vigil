"use strict";

const moviePlanets = async function(movieNum) {
    let url = 'https://swapi.dev/api/films/';

    try {
        if (isNaN(movieNum)) {
            throw "Number expected";
        }
        let movieObj = await $.getJSON(url + movieNum + '/');
    
        console.log(movieObj.title);
    
        let promises = movieObj.planets.map(url => $.getJSON(url));
    
        for await (let pl of promises) {
            console.log(pl.name);
        }
    } catch (e) {
        console.error(e);
    }
};

moviePlanets(3);

console.log("Remaining Code")