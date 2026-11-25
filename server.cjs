// Local-only static server. No packages to install.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/core.js':'core.js','/scenes.js':'scenes.js','/app.js':'app.js'};
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server = http.createServer((req,res) => {
  const file = files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);res.end('Not found');return;}
  fs.readFile(path.join(root,file),(err,data)=>{
    if(err){res.writeHead(500);res.end('Unable to read app file');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
  });
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?'Port 8787 is busy. Close the other local server and try again.':err.message);process.exitCode=1;});
server.listen(8787,'127.0.0.1',()=>console.log('Terminal Bloom is ready: http://localhost:8787\nKeep this window open. Press Ctrl+C to stop.'));
