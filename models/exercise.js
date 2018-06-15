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
  date: Date
});

module.exports = mongoose.model('Exercise', exerciseSchema);
