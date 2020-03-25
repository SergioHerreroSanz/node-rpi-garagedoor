//Dependencias Express, HTTPS y FileSystem (para el servidor)
const express = require('express');
const https = require('https');
const fs = require('fs');
const port = 443;

//Leer certificados y almacenarlos en 'options' para el servidor
const options = {
    key: fs.readFileSync('./certs/selfsigned.key'),
    cert: fs.readFileSync('./certs/selfsigned.crt')
};

//Crear servidor HTTPS e iniciarlo
var app = express();
var server = https.createServer(options, app);
server.listen(port, () => {
    console.log("Servidor iniciado en el puerto : " + port)
});

//Dependencias Firebase (para auth)
var admin = require('firebase-admin');

//Inicializar Firebase
var serviceAccount = require("./credentials/garagedoor-8a391.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://garagedoor-8a391.firebaseio.com"
});

//Rutas
app.get('/', function (req, res) {
    //res.status(200).json({ message: "Connected!" });
    console.log('conexion!');
    res.send('Connected!');
});

app.get('/status', function (req, res) {
    res.status(200).json({ message: "active" });
    console.log('/status');
});