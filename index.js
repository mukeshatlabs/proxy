let http = require('http')
let request = require('request')

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    for (let header in req.headers) {
    	res.setHeader(header, req.headers[header])
	}
    req.pipe(res)
}).listen(8000)

let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
// Build the destinationUrl using the --host value
let port = argv.port || argv.host === '127.0.0.1' ? 8000 : 80

// Update our destinationUrl line from above to include the port
let destinationUrl = argv.url || scheme + argv.host + ':' + port
http.createServer((req, res) => {
	
	destinationUrl = req.headers['x-destination-url']? req.headers['x-destination-url'] : destinationUrl

	console.log(`Proxying request to: ${destinationUrl + req.url}`)
	process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
	req.pipe(process.stdout)
	
	let options = {
		headers: req.headers,
		url: `${destinationUrl}${req.url}`
	}
	options.method = req.method

	let downstreamResponse = req.pipe(request(options))
	process.stdout.write(JSON.stringify(downstreamResponse.headers))
	downstreamResponse.pipe(process.stdout)
	downstreamResponse.pipe(res)
}).listen(8001)
