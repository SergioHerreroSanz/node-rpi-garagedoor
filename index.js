//region -------------------------------SERVIDOR-------------------------------
//Dependencias Express, HTTPS y FileSystem
const express = require('express');
const https = require('https');
const fs = require('fs');
const port = 443;
//Inicializar servidor HTTPS
//Leer certificados y almacenarlos en 'options'
const options = {
    key: fs.readFileSync(__dirname + '/credentials/selfsigned.key'),
    cert: fs.readFileSync(__dirname + '/credentials/selfsigned.crt')
};
//Crear e inicializar servidor
var app = express();
var server = https.createServer(options, app);
app.use(express.json());
server.listen(port, () => {
    console.log("Servidor iniciado en el puerto : " + port)
});
//endregion

//region -----------------------------AUTENTICACION----------------------------
//Dependencias Firebase
var admin = require('firebase-admin');
//Inicializar Firebase
var serviceAccount = require(__dirname + '/credentials/firebase.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://garagedoor-3e5d1.firebaseio.com"
});
//endregion

//region ----------------------------------BD----------------------------------
//Dependencias .env y mariadb
require('dotenv').config({path: __dirname + '/credentials/.env'});
const mariadb = require('mariadb');
//Inicializar mariadb
const pool = mariadb.createPool({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database,
    connectionLimit: 5
});
//Constantes
const sql = "SELECT enabled FROM users WHERE email=?"
//endregion

//region ---------------------------------GPIO---------------------------------
var rpio = require('rpio');
const rpioPin = 7;
rpio.open(rpioPin, rpio.OUTPUT, rpio.LOW);
rpio.open(22, rpio.OUTPUT, rpio.HIGH);
//endregion

//region ---------------------------------RUTAS--------------------------------
app.post('/open', function (req, res) {
    var token = req.body.token;
    var user = admin.auth().getUser(token);

    user.then(function (user) {
        console.log(user.email);

        pool.getConnection()
            .then(conn => {
                conn.query(sql, user.email)
                    .then((result) => {
                        console.log(result);
                        var enabled = result[0].enabled;
                        if (enabled) {
                            abrirPuerta();
                            res.status(200).json({message: 'Success'});
                        }
                        conn.end();
                    })
                    .catch(err => {
                        console.log(err);
                        conn.end();
                    })
            }).catch(err => {
            console.log("No se pudo conectar a la BD");
        });
    })
});

app.get('/status', function (req, res) {
    res.status(200).json({message: "active"});
    console.log('status');
});
//endregion

//region -------------------------------FUNCIONES------------------------------
function abrirPuerta() {
    rpio.write(rpioPin, rpio.HIGH);
    setTimeout(cerrarPuerta, 1000);
}

function cerrarPuerta() {
    rpio.write(rpioPin, rpio.LOW);
}

//endregion