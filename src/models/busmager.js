const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    name: String,
    stops: [{
        name: String,
        fee: Number
    }]
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
