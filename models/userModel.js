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

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}



const userModel = mongoose.model('User', userSchema);
module.exports = userModel;