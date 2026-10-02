const fs = require('fs');
const pokemon = JSON.parse(fs.readFileSync(`${__dirname}/../pokedex.json`));

const respondJSON = (request, response, status, obj) => {
    let content = JSON.stringify(obj);

    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });


    if (request.method !== "HEAD" && status !== 204) {
        response.write(JSON.stringify(obj));
    }
    response.end();
};


const getPokemon = (request, response, pathname) => {
    //get all pokemon
    if (pathname == "/getPokemon") {
        const responseJSON = {
            pokemon,
        };
        return respondJSON(request, response, 200, responseJSON);
    }
    const responseJSON = {

    };
    //figure out what to do if user submits nothing in form
    console.log(request.query.name ? true : false);
    //search by type
    if (request.query.type) {
        const types = ["Water", "Fire", "Grass", "Poison", "Flying", "Psychic", "Ice", "Ground", "Rock", "Electric", "Bug", "Normal", "Fighting", "Fairy",
            "Ghost", "Dark", "Steel", "Dragon"];
        //no type given
        if (request.query.type == "") {
            responseJSON.message = "Please submit a type!",
                responseJSON.id = 'missingTypeParam'
            return respondJSON(request, response, 400, responseJSON);
        }
        console.log('request.query.type', request.query.type);

        //type doesnt exist
        if (!types.includes(request.query.type)) {
            responseJSON.message = "This type does not exist!",
                responseJSON.id = "invalidTypeParam"
            return respondJSON(request, response, 404, responseJSON);
        }

        //return only pokemon that are of the searched type
        const selectedPokemon = pokemon.filter(monster => monster.type.includes(request.query.type));
        responseJSON.pokemon = selectedPokemon;

        return respondJSON(request, response, 200, responseJSON);
    } else if (request.query.name) {
        const allNames = [];
        for (let monster of pokemon) {
            allNames.push(monster.name);
        }
        //no name given
        if (request.query.name == "") {
            responseJSON.message = "Please submit a name!",
                responseJSON.id = 'missingNameParam'
            return respondJSON(request, response, 400, responseJSON);
        }

        //name doesnt exist
        if (!allNames.includes(request.query.name)) {
            responseJSON.message = "This Pokemon does not exist in this server!",
                responseJSON.id = "invalidNameParam"
            return respondJSON(request, response, 404, responseJSON);
        }

        //return only pokemon that are of the searched type
        const selectedPokemon = pokemon.filter(monster => monster.name.includes(request.query.name));
        responseJSON.pokemon = selectedPokemon;
        return respondJSON(request, response, 200, responseJSON);
    }
}

const addPokemon = (request, response) => {
    //options: create new pokemon or add one to favorites
    const responseJSON = {
        message: 'Please provide a name, type, height (m), and weight (kg).',
    };

    const { name, type } = request.body;

    //both needed
    if (!name || !type) {
        responseJSON.id = 'addUserMissingParams';
        return respondJSON(request, response, 400, responseJSON);
    };

    //204:updated (added to favorites)
    let responseCode = 204;

    //201: new pokemon
    for (let monster of pokemon) {
        if (monster["name"] == name) { }
    }
}

const favoritePokemon = (request, response) => {
    //options: create new pokemon or add one to favorites
    const responseJSON = {
        message: 'Please provide a name, type, height, and weight.',
    };

    const { name, type } = request.body;

    //both needed
    if (!name || !type) {
        responseJSON.id = 'addUserMissingParams';
        return respondJSON(request, response, 400, responseJSON);
    };

    //204:updated (added to favorites)
    let responseCode = 204;

    //201: new pokemon
    for (let monster of pokemon) {
        if (monster["name"] == name) { }
    }
}

const notFound = (request, response) => {
    const responseJSON = {
        message: 'The page you are looking for can not be found',
        id: 'notFound'
    };

    return respondJSON(request, response, 404, responseJSON);
}

module.exports = {
    getPokemon,
    addPokemon,
    favoritePokemon,
    notFound
}