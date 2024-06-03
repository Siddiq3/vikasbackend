const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    staffid: {
        type: String,
        required: true,
        unique: true
    },
    name: { type: String, required: true },
    
    phone: { type: String, required: true, },
    position: { type: String, required: true },
    address: { type: String, required: true,  },
});

module.exports = mongoose.model('Staff', StaffSchema);
