/*
Copyright © Fog Network
Made by Nebelung
MIT license: https://opensource.org/licenses/MIT
*/

importScripts('/Ultraviolet-Core/Ultraviolet-Core-main/uv.sw.js');

const proxy = new UVServiceWorker();
const express = require('express')
const app = express()
const basicAuth = require('express-basic-auth');
const config = require('./config.json')
const Corrosion = require('./lib/server')
const port = process.env.PORT
const SmokeProxy = require("./smoke/smoke")
const prefix = "/smoke/"
const btoa = e => new Buffer.from(e).toString("base64")
const lite = config.lite
const auth = config.auth
const username = config.username
const password = config.password
const users = {}
users[username] = password

const smoke = new SmokeProxy(prefix, {
    docTitle: "Tsunami"
})

if (auth == "true") { 
app.use(basicAuth({
    users,
    challenge: true,
    unauthorizedResponse: autherror
}));
}

function autherror(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'Error'
}

if (lite == "true") {

app.get('/', function(req, res){
    res.sendFile('index.html', {root: './lite'});
});

app.get('/js/go.js', function(req, res){
    res.sendFile('go.js', {root: './lite'});
});

}

app.use(express.static('./public', {
    extensions: ['html']
}));

app.get('/', function(req, res){
    res.sendFile('index.html', {root: './public'});
});

app.use(function (req, res) {
    if (req.url.startsWith(proxy.prefix)) {
      self.addEventListener('fetch', event =>
        event.respondWith(
            proxy.fetch(event)
        )
    );

    } else if (req.url.startsWith(prefix + "gateway")) {
      res.redirect(prefix + btoa(req.query.url))
    } else if (req.url.startsWith(prefix)) {
      return smoke.request(req, res)
    } else {
      res.status(404).sendFile('404.html', {root: './public'});
    }
}).post('*', (req, res) => {
  if (req.url.startsWith(prefix)) return smoke.post(req, res)
})

app.listen(port, () => {
    console.log(`Tsunami is running at localhost:${port}`)
})


