const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Absent', 'Leave']
    }
});

module.exports = mongoose.model('staffAttendance', staffAttendanceSchema);
