'use strict'

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true,
    required: true
  },
  username: String,
  description: String,
  duration: Number,
  date: Date
});

module.exports = mongoose.model('Exercise', exerciseSchema);
