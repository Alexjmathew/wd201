const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const minimist = require('minimist');

// Parse command line arguments
const args = minimist(process.argv.slice(2));
const port = args.port || 3000; // Default to 3000 if no port is specified

const server = http.createServer(async (req, res) => {
    try {
        if (req.url === '/' || req.url === '/home.html') {
            const data = await fs.readFile(path.join(__dirname, 'home.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        } else if (req.url === '/project.html') {
            const data = await fs.readFile(path.join(__dirname, 'project.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        } else if (req.url === '/registration.html') {
            const data = await fs.readFile(path.join(__dirname, 'registration.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404 Not Found');
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('Internal Server Error');
    }
    res.end();
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
