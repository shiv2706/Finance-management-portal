const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true,

    },
    amount:{
        type: Number,
        required: [true, 'amount is required'],
    },
    Type:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        required: true,
    }
},{timestamps:true});

const transactionModel = mongoose.model('Transaction', transactionSchema);
module.exports = transactionModel;