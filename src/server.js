const http = require('http');
const query = require('querystring');
const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    '/client.html': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/': htmlHandler.getIndex,
    '/getPokemon': jsonHandler.getPokemon,
    '/getPokemonType': jsonHandler.getPokemonType,
    'notFound': jsonHandler.notFound,
}

const parseBody = (request, response, handler) => {
    const body = [];

    //error
    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    //add data to array
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const type = request.headers['content-type'];
        //turn into obj
        if (type === 'application/json') {
            request.body = JSON.parse(bodyString);
        } else if (type === 'application/x-www-form-urlencoded') {
            request.body = query.parse(bodyString);
        } else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({ error: 'invalid data format' }));
            return response.end();
        }
        handler(request, response);
    });
};

const handleGet = (request, response, parsedUrl) => {
    if (urlStruct[parsedUrl.pathname]) {
        urlStruct[parsedUrl.pathname](request, response);
    }
}

const handlePost = (request, response, parsedUrl) => {
    if (parsedUrl.pathname == "/addPokemon") {
        parseBody(request, response, jsonHandler.addPokemon);
    }
}

const onRequest = (request, response) => {
    const protocol = request.connection.ecrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    request.query = Object.fromEntries(parsedUrl.searchParams);
    console.log('request query', request.query);

    if (!urlStruct[parsedUrl.pathname]) {
        urlStruct['notFound'](request, response);
        return;
    }
    if (request.method == "POST") {
        handlePost(request, response, parsedUrl);
    } else {
        handleGet(request, response, parsedUrl);
    }
}

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});