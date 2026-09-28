const http = require('http');
//const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
    // const protocol = request.connection.ecrypted ? 'https' : 'http';
    //  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    switch (request.url) {
        case '/client.html':
            htmlHandler.getIndex(request, response);
            break;
        case '/style.css':
            htmlHandler.getCSS(request, response);
            break;
        default:
            htmlHandler.getIndex(request, response);
            break;
    }
}

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});