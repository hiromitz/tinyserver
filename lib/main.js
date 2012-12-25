#!/usr/bin/env node

var r = [ "fs", "http", "mime", "path", "url" ];
for (var i = 0; i < r.length; i++) {
  global[r[i]] = require(r[i]);
}

// some constants
var k = {
  port: (process.argv.length > 2) ? process.argv[2] : 3000,
  "dir": "./"
};

var server = http.createServer( function(request, response) {

  // extract the pathname from the request URL
  var pathname = url.parse(request.url).pathname;

  // add the home directory, /public or whatever
  var filename = path.join(process.cwd(), k.dir, pathname);

  // if the requested path has no file extension, assume it's a directory
  // caution: if you are shipping an API, this is the wrong thing to do
  if (!path.extname(filename)) {
    filename = filename + '/index.html';
  }

  var logOutput = function(code) {
    var d = new Date();
    console.log('[' +
      d.toDateString() +
      ' ' + d.toLocaleTimeString() +
      '] ' + request.method + ' ' + request.url + ' ' + code + ' -'
    );
  };

  // does this path exist?
  fs.exists(filename, function(gotPath) {

    // no, bail out
    if (!gotPath) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found");
        response.end();
        logOutput(404);
        return;
    }

    // still here? filename is good
    // look up the mime type by file extension
    response.writeHead(200, {'Content-Type': mime.lookup(filename)});

    // read and pass the file as a stream. Not really sure if this is better,
    // but it feels less block-ish than reading the whole file
    // and we get to do awesome things with listeners
    fs.createReadStream(filename, {
      'flags': 'r',
      'encoding': 'binary',
      'mode': '0666',
      'bufferSize': 4 * 1024
    }).addListener( "data", function(chunk) {
      response.write(chunk, 'binary');
    }).addListener( "close",function() {
      response.end();
      logOutput(200);
    });

  });
});

console.log('Now starting server at port ' + k.port);
server.listen(k.port);