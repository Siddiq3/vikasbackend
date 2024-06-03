const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    caste: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    fatherName: {
        type: String,
        required: true
    },
    motherName: {
        type: String,
        required: true
    },
    parentPhoneNumber: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    schoolFee: {
        type: Number,
        required: true
    },
    busRoute: {
        type: String,
        required: false // Assuming busRoute can be optional
    },
    booksFee: {
        type: Number,
        required: true
    },
    examFee: {
        type: Number,
        required: true
    },
    otherFees: [{
        name: String,
        amount: Number
    }],
    oldBalance: {
        type: Number,
        required: true,
        default: 0
    },
    totalFee: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    netFee: {
        type: Number,
        required: true
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    totalDue: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    paidDate: {
        type: Date,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    }
});

// Pre-save middleware to calculate totalFee, netFee, and remainingAmount
admissionSchema.pre('save', async function(next) {
    try {
        // Calculate class-based fees
        const classBasedFees = fetchClassBasedFees(this.class);
        this.booksFee = classBasedFees.booksFee;
        this.examFee = classBasedFees.examFee;

        // Calculate bus route-based fees if bus route is provided
        if (this.busRoute) {
            this.busFee = fetchBusRouteBasedFees(this.busRoute);
        } else {
            this.busFee = 0;
        }

        // Calculate total fee
        this.totalFee = this.schoolFee + this.booksFee + this.examFee + this.busFee;

        // Calculate net fee after discount
        this.netFee = this.totalFee - this.discount;

        // Calculate remaining amount
        this.remainingAmount = this.netFee - this.totalPaid;

        next();
    } catch (error) {
        next(error);
    }
});

const Admission = mongoose.model('Admission1', admissionSchema);

module.exports = Admission;
