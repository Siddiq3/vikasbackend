const mongoose = require('mongoose');

const feePerStopSchema = new mongoose.Schema({
    studentClass: String,
    routeName: String,
    feesPerStop: Object
});

const FeePerStop = mongoose.model('FeePerStop', feePerStopSchema);
module.exports = FeePerStop;
