// Dependencies

var express = require('express');
var router = express.Router();

// Models
var Equipo = require('../models/equipo');

// Routes
Equipo.methods(['get', 'put', 'post', 'delete']);
Equipo.register(router, '/equipos');

// Return router
module.exports = router;