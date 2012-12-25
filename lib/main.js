#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var mime = require('mime');
var path = require('path');
var url = require('url');

var args = process.argv.slice(2);
var port = args[0] || 3000;
var root = './';

var server = http.createServer( function(request, response) {

	var pathname = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(), root, pathname);

	// if the requested path has no file extension, assume it's a directory
	if (!path.extname(filename)) {
		filename = filename + '/index.html';
	}

	var logOutput = function(code) {
		var d = new Date();
		console.log(
			'[' + d.toDateString() + ' ' + d.toLocaleTimeString() + '] ' +
			request.method + ' ' +
			request.url + ' ' +
			code + ' -'
		);
	};

	// does this path exist?
	fs.exists(filename, function(gotPath) {

		// no, bail out
		if (!gotPath) {
			response.writeHead(404, {
				"Content-Type": "text/plain"
			});
			response.write("404 Not Found");
			response.end();
			logOutput(404);
			return;
		}

		// look up the mime type by file extension
		response.writeHead(200, {
			'Content-Type': mime.lookup(filename)
		});

		fs.createReadStream(filename, {
			'flags': 'r',
			'encoding': 'binary',
			'mode': '0666',
			'bufferSize': 4 * 1024
		})
		.addListener( "data", function(chunk) {
			response.write(chunk, 'binary');
		})
		.addListener( "close",function() {
			logOutput(200);
			response.end();
		});
	});
});

console.log('Now start listening at port: ' + port);
server.listen(port);