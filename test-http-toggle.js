const http = require('http');

function testToggleEndpoint() {
    const postData = '';

    const options = {
        hostname: 'localhost',
        port: 3007,
        path: '/documents/admin/5/toggle',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`Body: ${chunk}`);
        });

        res.on('end', () => {
            console.log('Request completed');
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

console.log('Test de l\'endpoint toggle...');
testToggleEndpoint();
