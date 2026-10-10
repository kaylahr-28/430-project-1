const fs = require('fs');
const pokemon = JSON.parse(fs.readFileSync(`${__dirname}/../pokedex.json`));
const favPokemon = [];


const allNames = [];
for (let monster of pokemon) {
    allNames.push(monster.name);
}

const types = ["Water", "Fire", "Grass", "Poison", "Flying", "Psychic", "Ice", "Ground", "Rock", "Electric", "Bug", "Normal", "Fighting", "Fairy",
    "Ghost", "Dark", "Steel", "Dragon"];

//format JSON objects before sending it over to be displayed
//removes id/num, img link, weaknesses, next evolution
//adds 'favorite' key w default vals
const formatPokemon = (pokemon, favorites) => {
    const formattedPokemon = [];
    for (let monster of pokemon) {
        let formatMonster = {};
        if (!favorites) {


            formatMonster = {
                "name": monster.name,
                "type": monster.type,
                "height": monster.height,
                "weight": monster.weight,
                "favorite": {
                }
            };
            if (!formatMonster.weight.includes('kg')) {
                formatMonster.weight += " kg";
                //only added pokemon are missing kg, which means
                // theyre missing m too
                formatMonster.height += " m";
            }
            //check if the pokemon has been favorited
            //if not, set default info
            if (!monster.favorite) {
                formatMonster.favorite = {
                    "isFavorited": false,
                    "reasoning": "N/A"
                }
            } else {
                formatMonster.favorite = {
                    "isFavorited": monster.favorite.isFavorited,
                    "reasoning": monster.favorite.reasoning
                }
            }
        } else {
            //format 'getFav' pokemon with just name and favorite obj
            formatMonster = {
                "name": monster.name,
                "favorite": {
                    "isFavorited": monster.favorite.isFavorited,
                    "reasoning": monster.favorite.reasoning
                }
            }
        }
        formattedPokemon.push(formatMonster);

    }
    return formattedPokemon;
}

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
        const responseJSON = formatPokemon(pokemon, false);

        return respondJSON(request, response, 200, responseJSON);

        //search by type
    } else if (pathname == "/getPokemonType") {
        let responseJSON = {};

        //no type given
        if (request.query.type == "") {
            responseJSON.message = "Please submit a type!",
                responseJSON.id = 'missingTypeParam'
            return respondJSON(request, response, 400, responseJSON);
        }

        //type doesnt exist
        if (!types.includes(request.query.type)) {
            responseJSON.message = "This type does not exist!",
                responseJSON.id = "invalidTypeParam"
            return respondJSON(request, response, 404, responseJSON);
        }

        //return only pokemon that are of the searched type
        const selectedPokemon = formatPokemon(pokemon, false).filter(monster => monster.type.includes(request.query.type));
        const pkmnNames = [];

        //only return names
        for (let pkmn of selectedPokemon) {
            pkmnNames.push(pkmn.name);
        }
        responseJSON = pkmnNames;

        return respondJSON(request, response, 200, responseJSON);

        //search by name
    } else if (pathname == "/getPokemonName") {
        let responseJSON = {};

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
        const selectedPokemon = formatPokemon(pokemon, false).filter(monster => monster.name.includes(request.query.name));
        responseJSON = selectedPokemon;
        return respondJSON(request, response, 200, responseJSON);
    } else if (pathname == "/getPokemonFavs") {

        if (favPokemon.length == 0) {
            const responseJSON = {};
            responseJSON.message = 'You have no favorited pokemon!';
            responseJSON.id = 'favPokemonNotFound';

            return respondJSON(request, response, 404, responseJSON);
        } else {
            const responseJSON = formatPokemon(favPokemon, true);
            return respondJSON(request, response, 200, responseJSON);
        }
    }
}

const addPokemon = (request, response, pathname) => {
    //options: create new pokemon or add one to favorites
    if (pathname == "/addPokemon") {
        const responseJSON = {
            message: 'Please provide a name and type.',
        };

        const { name, type, height, weight } = request.query;
        //both needed
        if (!name || !type) {
            responseJSON.id = 'addPokemonMissingParams';
            return respondJSON(request, response, 400, responseJSON);
        };

        //cant create a pokemon with an existing name
        if (allNames.includes(name)) {
            responseJSON.message = "A Pokemon with this name already exists!";
            responseJSON.id = 'duplicatePokemonName';
            return respondJSON(request, response, 400, responseJSON)
        }

        pokemon.push({ "name": name, "type": type, "weight": weight ? weight : "Unknown", "height": height ? height : "Unknown", });
        allNames.push(name);
        responseJSON.message = `Your ${type} type pokemon, ${name}, has been created!`;
        return respondJSON(request, response, 201, responseJSON);

    } else if (pathname == "/favPokemon") {
        const responseJSON = {
            message: 'Please provide a name and reasoning.',
        };

        const { name, favReason } = request.query;
        //both needed
        if (!name || !favReason) {
            responseJSON.id = 'favPokemonMissingParams';
            return respondJSON(request, response, 400, responseJSON);
        };

        //cant fav a pokemon that doesn't exist
        if (!allNames.includes(name)) {
            responseJSON.message = "Please insert a valid Pokemon name!";
            responseJSON.id = 'pokemonNotFound';
            return respondJSON(request, response, 404, responseJSON)
        }

        let alreadyFav = false;
        for (let monster of pokemon) {
            if (monster.name === name) {
                monster.favorite = {};
                monster.favorite.isFavorited = true;
                monster.favorite.reasoning = favReason;

                favPokemon.forEach((fav) => {
                    if (fav.name === name) { //already favorited
                        alreadyFav = true;
                        fav.name.favorite.reasoning = favReason;
                    }
                });
                //if the pokemon has not been favorited before,
                //add it to the fav pokemon array
                if (!alreadyFav) {
                    favPokemon.push(monster);
                }
            }

        }

        responseJSON.message = `${name} has been favorited for the following reason: ${favReason}`;
        return respondJSON(request, response, 204, responseJSON);
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
    notFound
}