// Dependencies

var express = require('express');
var router = express.Router();

// Models
var Equipo = require('../models/equipo');
var Jugador = require('../models/jugador');

// Routes
Equipo.methods(['get', 'put', 'post', 'delete'])
    .before('get', function(req, res, next) {
    req.query.populate = 'jugadores';   // you could delegate to restful
    //req.query.populate('jugadores'); // or populate it yourself
    next()
});
Equipo.register(router, '/equipos');

Jugador.methods(['get', 'put', 'post', 'delete']);
Jugador.register(router, '/jugadores');

// Return router
module.exports = router;