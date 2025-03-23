const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter your name'],
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
    },
    password:{
        type: String,
        required: [true, 'Please enter your password'],
    }

},{timestamps:true});





const userModel = mongoose.model('User', userSchema);
module.exports = userModel;