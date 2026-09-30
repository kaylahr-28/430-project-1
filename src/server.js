const http = require('http');
//const query = require('querystring');
//const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// const parseBody = (request, response, handler) => {
//     const body = [];

//     //error
//     request.on('error', (err) => {
//         console.dir(err);
//         response.statusCode = 400;
//         response.end();
//     });

//     //add data to array
//     request.on('data', (chunk) => {
//         body.push(chunk);
//     });

//     request.on('end', () => {
//         const bodyString = Buffer.concat(body).toString();
//         const type = request.headers['content-type'];
//         //turn into obj
//         if (type === 'application/json') {
//             request.body = JSON.parse(bodyString);
//         } else if (type === 'application/x-www-form-urlencoded') {
//             request.body = query.parse(bodyString);
//         } else {
//             response.writeHead(400, { 'Content-Type': 'application/json' });
//             response.write(JSON.stringify({ error: 'invalid data format' }));
//             return response.end();
//         }
//         handler(request, response);
//     });
// };


const onRequest = (request, response) => {
    const protocol = request.connection.ecrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
    const urlStruct = {
        '/client.html': htmlHandler.getIndex,
        '/style.css': htmlHandler.getCSS,
        '/': htmlHandler.getIndex,
        //  '/getPokemon': jsonHandler.getPokemon,

    }

    if (urlStruct[parsedUrl]) {
        urlStruct[parsedUrl](request, response);
    }
}

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});