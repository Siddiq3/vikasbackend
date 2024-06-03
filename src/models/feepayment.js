const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    fathername: {
        type: String
    },
    village: {
        type: String
    },
  
    class: {
        type: String
    },
    section: {
        type: String
    },
    rollNo: {
        type: Number
    },
    classFee: {
        type: Number
    },
    classFeePaid: {
        type: Number,
    },
    classFeeDue: {
        type: Number,
    },
    examFee: {
        type: Number
    },
    examFeePaid: {
        type: Number,
    },
    examFeeDue: {
        type: Number,
    },
    bookFee: {
        type: Number
    },
    bookFeePaid: {
        type: Number,
    },
    bookFeeDue: {
        type: Number,
    },
    busFee: {
        type: Number
    },
    busFeePaid: {
        type: Number,
    },
    busFeeDue: {
        type: Number,
    },
    otherFee: {
        type: Number
    },
    oldFee: {
        type: Number
    },
    oldFeePaid: {
        type: Number
    },
    oldFeeDue: {
        type: Number
    },
    totalFee: {
        type: Number
    },
    discount: {
        type: Number
    },
    netFee: {
        type: Number
    },
    totalPaid: {
        type: Number
    },
    totalDueAmount: {
        type: Number
    },
    mode: {
        type: String
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

feePaymentSchema.pre('save', async function(next) {
    try {
        if (!this.isNew) {
            return next();
        }
        
        // Get the latest receipt number
        const latestReceipt = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });

        // If there are no existing documents, start from 1
        if (!latestReceipt) {
            this.receiptNumber = '1';
        } else {
            // Increment the latest receipt number
            const latestReceiptNumber = parseInt(latestReceipt.receiptNumber);
            if (isNaN(latestReceiptNumber)) {
                this.receiptNumber = '1';
            } else {
                this.receiptNumber = (latestReceiptNumber + 1).toString();
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = FeePayment;
