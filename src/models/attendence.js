const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    present: {
        type: Boolean,
        default: true
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
