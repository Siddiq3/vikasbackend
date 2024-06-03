// models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  classFee: {
    type: Number,
    required: true
  },
  examFee: {
    type: Number,
    required: true
  },
  bookFee: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Class', classSchema);
