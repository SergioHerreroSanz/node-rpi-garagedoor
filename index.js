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
const select = "SELECT enabled FROM users WHERE email=?";
const insertUser = "INSERT INTO users (email, enabled) VALUES (?, 0)";
const insertConnection = "INSERT INTO connections (email, date, authorised) VALUES (?, NOW(), ?)";
const checkPermissions = "CALL checkPermissions()";
//Mandar orden de comprobación de los permisos a la BD y programar la siguiente a las 23:59
setTimeout(comprobarPermisosBD, 10000);
//endregion

//region ---------------------------------GPIO---------------------------------
var gpio = require("gpio");
var puerta = gpio.export(4, {
    direction: gpio.DIRECTION.OUT,
    interval: 200,
    ready: function () {
        cerrarPuerta();
    }
});
//endregion

//region ---------------------------------RUTAS--------------------------------
app.post('/open', function (req, res) {
    var token = req.body.token;
    var user = admin.auth().getUser(token);
    var email;
    var enabled;

    user.then(function (user) {
        email = user.email;

        pool.getConnection()
            .then(conn => {
                console.log('--------------------');
                console.log('Email: ' + email);
                conn.query(select, email)
                    .then(result => {
                        enabled = result[0].enabled;
                        console.log('Autorizado: ' + enabled);
                        if (enabled) {
                            abrirPuerta();
                            res.status(200).json({message: 'Success'});
                        } else {
                            res.status(200).json({message: 'Not authorised'});
                        }
                    })
                    .catch(err => {
                        console.log('No registrado en la BD');
                        res.status(200).json({message: 'Not registered'});
                        conn.query(insertUser, email);
                        enabled = 0
                    })
                    .finally(() => {
                        conn.query(insertConnection, [email, enabled]);
                        conn.end();
                    });
            })
            .catch(err => {
                console.log('No se pudo conectar a la BD');
                res.status(200).json({message: 'Error'});
            });
    });
});

app.get('/status', function (req, res) {
    res.status(200).json({message: "active"});
    console.log('status');
});
//endregion

//region -------------------------------FUNCIONES------------------------------
function abrirPuerta() {
    puerta.set();
    setTimeout(cerrarPuerta, 500);
}

function cerrarPuerta() {
    puerta.reset();
}

function millisHastaMedianoche() {
    var ahora = new Date();
    var noche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 0);
    var tiempo = noche.getTime() - ahora.getTime();
    return tiempo;
}

function comprobarPermisosBD() {
    console.log('--------------------');
    console.log('Checking DB permissions')
    pool.getConnection()
        .then(conn => {
            conn.query(checkPermissions);
            conn.close();
        })
        .catch(err => {
                console.log(err);
            }
        );

    return setTimeout(comprobarPermisosBD, millisHastaMedianoche());
}
//endregion