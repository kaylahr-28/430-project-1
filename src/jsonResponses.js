const fs = require('fs');

const pokedex = fs.readFileSync(`${__dirname}/../pokedex.json`);
const pokemon = pokedex;
const users = {};
const respondJSON = (request, response, status, obj) => {
    const content = JSON.stringify(obj);

    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });

    if (request.method !== "HEAD" && status !== 204) {
        response.write(content);
    }

    response.end();
}


const getPokemon = (request, response) => {
    const responseJSON = {
        pokemon,
    };

    respondJSON(request, response, 200, responseJSON);
}

module.exports = {
    getPokemon,
}