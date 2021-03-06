// set up server
const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

// querystring module for parsing querystrings from url

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:val obj
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getLocations': jsonHandler.getLocations,
    '/updateLocation': jsonHandler.updateLocation,
    '/notReal': jsonHandler.notFound,
    index: htmlHandler.getIndex,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getLocations': jsonHandler.getLocationsMeta,
    '/notReal': jsonHandler.notFoundMeta,
    notFound: jsonHandler.notFoundMeta,
  },
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // if post is to /addLocation
  if (parsedUrl.pathname === '/addLocation') {
    const res = response;

    // byte stream to be reassembled
    const body = [];

    // in case of error
    request.on('error', (err) => {
        console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      // combine our byte array & convert to string
      const bodyString = Buffer.concat(body).toString();
      // Parse string into obj
      const bodyParams = query.parse(bodyString);
      // pass to addProfile
      jsonHandler.addLocation(request, res, bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  // parse url into individual parts, returns obj of url parts by name
  const parsedUrl = url.parse(request.url);

  // check if method was POST, otherwise assume GET
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response);
  } else {
    urlStruct[request.method].notFound(request, response);
  }
};

// start server
http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);
