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
app.use(express.json());
server.listen(port, () => {
    console.log("Servidor iniciado en el puerto : " + port)
});

//Dependencias Firebase (para auth)
var admin = require('firebase-admin');

//Inicializar Firebase
var serviceAccount = require("./credentials/garagedoor-3e5d1.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://garagedoor-3e5d1.firebaseio.com"
});

//Rutas
app.post('/open', function (req, res) {
    var token = req.body.token;
    var user = admin.auth().getUser(token);
    res.status(200).json({ message: "Connected " + token + "!" });
    console.log(token);
});

app.get('/status', function (req, res) {
    res.status(200).json({ message: "active" });
    console.log('status');
});