// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var jugadorSchema = new mongoose.Schema({
    name: String,
    number: Number
});

// Return model
module.exports = restful.model('Jugador', jugadorSchema);