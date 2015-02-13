// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var equipoSchema = new mongoose.Schema({
    name: String,
    color: String,
    cantidad: Number,
    jugadores: [{ type: String, ref: 'Jugador' }]
});

// Return model
module.exports = restful.model('Equipos', equipoSchema);