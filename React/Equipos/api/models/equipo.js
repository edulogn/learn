// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var equipoSchema = new mongoose.Schema({
    name: String,
    color: String,
    cantidad: Number,
    jugadores: Array
});

// Return model
module.exports = restful.model('Equipos', equipoSchema);