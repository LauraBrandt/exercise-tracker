'use strict'

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    index: true,
    required: true
  },
  username: String,
  descripition: String,
  duration: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
