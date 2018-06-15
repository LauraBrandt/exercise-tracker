'use strict'

const mongoose = require('mongoose');
const shortid = require('shortid');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  _id: {
    type: String,
    index: true,
    'default': shortid.generate
  }
});

module.exports = mongoose.model('User', userSchema);
