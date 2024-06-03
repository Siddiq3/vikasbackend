const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    rollNumber: {
        type: String // Assuming roll number can be alphanumeric
    },
    adharNumber: {
        type: String // Assuming Aadhar number is a string
    },
    gender: {
        type: String // Assuming gender is a string (e.g., "Male", "Female", "Other")
    },
    dateOfBirth: {
        type: Date // Assuming date of birth is stored as a Date object
    },
    caste: {
        type: String // Assuming caste is a string
    },
    address: {
        type: String // Assuming address is a string
    },
    fatherName: {
        type: String // Assuming father's name is a string
    },
    motherName: {
        type: String // Assuming mother's name is a string
    },
    phonenumber:{
        type:Number
    },
    className: {
        type: String
    },
    section: {
        type: String
    },
    classFee: {
        type: Number
    },
    totalFee: {
        type: Number
    },
    busFee: {
        type: Number
    },
    bookFee: {
        type: Number
    },
    examFee: {
        type: Number
    },
    oldFee: {
        type: Number
    },
    discount: {
        type: Number
    },
    oldBalance: {
        type: Number
    },
    netFee: {
        type: Number
    }
}, { timestamps: true });

// Pre-save hook to calculate netFee
admissionSchema.pre('save', function(next) {
    this.netFee = this.totalFee - (this.discount || 0);
    next();
});

const Admission = mongoose.model('Admission', admissionSchema);
module.exports = Admission;
