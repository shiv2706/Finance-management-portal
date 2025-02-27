const transactionModel = require("../models/transactionModel");
const Tesseract = require("tesseract.js");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const {json} = require("express");
const dotenv = require('dotenv').config()


const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.API_KEY;

async function runChat(textInput) {
    console.log("runchat invoked")
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,

        // history:[
        //     {
        //         role: "user",
        //         parts: [{ text: "Extract the amount, category of expense, type of the transaction(income or expense), and date"+
        //                 "from the text that will be provided to you. only give"+
        //                 "key value pairs like amount:'value',category:'food',Type:'income or expense',date:'YYYY-MM-DD' format'"+
        //                 "only give one response for the entire text i.e give the total amount of transaction,"+
        //                 " the general overall category of this entire transaction and the date and types and not separately for each item"+
        //                 "i need to save the values in my mongodb database with the following schema: "+
        //                 "const transactionSchema = new mongoose.Schema({" +
        //                 "    amount:{"+
        //                 "        type: Number,"+
        //                 "        required: [true, 'amount is required']"+
        //                 "    }," +
        //                 "    Type:{" +
        //                 "        type: String,"+
        //                 "        required: true,"+
        //                 "    }," +
        //                 "    category:{" +
        //                 "        type: String,"+
        //                 "        required: true," +
        //                 "    }," +
        //                 "    date:{" +
        //                 "        type: String," +
        //                 "        required: true," +
        //                 "    }"+
        //                 "give the response such that i can directly pass it in the database"+
        //                 "be sure to keep in mind the format of the date field only give in this format eg:2025-01-28"+
        //                 "return a response like {amount:'xyz', category:'xyz', Type:'xyz', date:'YYYY-MM-DD'}"+
        //                 "the categories should be any of the following only"+
        //                 "SALARY\n" +
        //                 "GIFT\n" +
        //                 "RENT\n" +
        //                 "FOOD\n" +
        //                 "EDUCATION\n" +
        //                 "TRANSPORTATION\n" +
        //                 "SHOPPING\n" +
        //                 "ENTERTAINMENT\n"+
        //                 "GROCERIES\n"+
        //                 "OTHERS"+
        //                 "drinks also fall in FOOD category"}],
        //     },
        // ]
        history:[
            {
                role: "user",
                parts: [{ text: "Extract the amount, category of expense, type of the transaction(income or expense), and date"+
                        "from the text that will be provided to you. only give"+
                        "key value pairs like amount:'value',category:'food',Type:'income or expense',date:'YYYY-MM-DD' format'"+
                        "only give one response for the entire text i.e give the total amount of transaction,"+
                        " the general overall category of this entire transaction and the date and types and not separately for each item"+
                        "Try the get the Net pay or the Sub Total or the amount after tax / After discount" +
                        "i need to save the values in my mongodb database with the following schema: "+
                        "const transactionSchema = new mongoose.Schema({" +
                        "    amount:{"+
                        "        type: Number,"+
                        "        required: [true, 'amount is required']"+
                        "    }," +
                        "    Type:{" +
                        "        type: String,"+
                        "        required: true,"+
                        "    }," +
                        "    category:{" +
                        "        type: String,"+
                        "        required: true," +
                        "    }," +
                        "    date:{" +
                        "        type: String," +
                        "        required: true," +
                        "    }"+
                        "give the response such that i can directly pass it in the database DONT GIVE JSON RESPONSE"+
                        "only give a string with values enclosed inside curly braces i.e. {}"+
                        "be sure to keep in mind the format of the date field only give in this format eg:2025-01-28"+
                        "return a response like {amount:'xyz', category:'xyz', Type:'xyz', date:'YYYY-MM-DD'}"+
                        "the categories should be any of the following only"+
                        "SALARY\n" +
                        "GIFT\n" +
                        "RENT\n" +
                        "FOOD\n" +
                        "EDUCATION\n" +
                        "TRANSPORTATION\n" +
                        "SHOPPING\n" +
                        "ENTERTAINMENT\n"+
                        "GROCERIES\n"+
                        "OTHERS"+
                        "drinks also fall in FOOD category"}],
            },
        ]

    })
    const result = await chat.sendMessage(textInput);
    const response = result.response;
    return response.text();
}

const getAllTransactions = async (req, res) => {
    try{
        const {selectedDate , answer,categoryy,type, daterange} = req.body;
        const endDate = new Date(); // Today
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - daterange); // Subtract days based on date range
        if(answer === "0" ) {
            const transactions = await transactionModel.find({userid: req.body.userid,date: { $gte: startDate}})
            // console.log(transactions)
            return res.status(200).json(transactions);
        }else if(answer === "1" && selectedDate[0] === 0 && selectedDate[1] === 0){
            const transactions = await transactionModel.find({userid:req.body.userid,})
            return res.status(200).json(transactions);

        }else if(answer=== "2"){
            const transactions = await transactionModel.find({userid:req.body.userid, category:categoryy, date: { $gte: startDate}})
            return res.status(200).json(transactions);
        }else if(answer=== "3"){
            const transactions = await transactionModel.find({userid:req.body.userid, Type:type, date: { $gte: startDate}})
            return res.status(200).json(transactions);
        }
        // else{
        //     const transactions = await transactionModel.find({
        //         date:{
        //             $gte: selectedDate[0],
        //             $lte: selectedDate[1],
        //         },
        //         userid:req.body.userid,})
        //     return res.status(200).json(transactions);
        // }

    }catch(err){
        console.log(err);
        return res.status(500).json({err})
    }
}

const getTotalDetail = async (req, res) => {
    try{
        const {daterange} = req.body;
        const DaysAgo = new Date();
        DaysAgo.setDate(DaysAgo.getDate() - parseInt(daterange));
        console.log(typeof(daterange));

        const totals = await transactionModel.aggregate([
            { $match: { userid:req.body.userid,
                    date: { $gte: DaysAgo }} }, // Filter by logged-in user
            {
                $group: {
                    _id: "$Type",
                    totalAmount: { $sum: "$amount" },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        const THESE_ARE_THE_TRANSACTIONS_ = await transactionModel.find({
            date:{
                $gte: DaysAgo,
            },
            userid:req.body.userid,
        }).select('amount Type category date -_id')



        let totalIncome = 0;
        let totalExpense = 0;
        let incomeTransactions = 0;
        let expenseTransactions = 0;

        totals.forEach(entry => {
            if (entry._id === "income") {
                totalIncome = entry.totalAmount;
                incomeTransactions = entry.transactionCount;
            } else if (entry._id === "expense") {
                totalExpense = entry.totalAmount;
                expenseTransactions = entry.transactionCount;
            }
        });

        const balance = totalIncome - totalExpense;
        const totalTransactions = incomeTransactions + expenseTransactions;

        return res.json({ THESE_ARE_THE_TRANSACTIONS_, totalIncome, totalExpense, balance, expenseTransactions,incomeTransactions,totalTransactions });

    }catch(err){
        console.log(err)
        return res.status(500).json({err})
    }
}

const addTransaction = async (req, res) => {
    try{
        const newTransaction = new transactionModel(req.body);
        console.log(newTransaction);
        await newTransaction.save();
        return res.status(201).json("transaction created")

    }catch(err){
        console.log(err);
        return res.status(500).json({err})
    }
}
const addTransactionImage = async (req, res) => {
    try{
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const imagePath = req.file.path; // Path to the uploaded image

        // Extract text using Tesseract.js
        const { data: { text } } = await Tesseract.recognize(imagePath);
        console.log("Extracted Text:", text);
        console.log("calling runchat");
        // const response = await runChat(text);
        // console.log(response);

        return res.status(200).json(text);

    }catch(err){
        return res.status(500).json({err})
    }
}

const CategorizeTransaction = async (req, res) => {
    try{
        const {transactData} = req.body;
        const response = await runChat(transactData)
        console.log(response)
        return res.status(200).json(response);
    }catch(err){
        return res.status(500).json({err})
    }
}

const addTransactionText = async (req, res) => {
    try{
        const {text} = req.body;
        const response = await runChat(text);
        console.log(response);
        return res.status(200).json(response);
    }catch(err){
        return res.status(500).json({err})
    }
}

const editTransaction = async (req, res) => {
    try{
        await transactionModel.findOneAndUpdate({_id:req.body.transactionId}, req.body.payload )
        res.status(200).json("transaction updated")

    }catch(err){
        console.log(err);
        return res.status(500).json({err})
    }

}

const deleteTransaction = async (req, res) => {
    try {
        await transactionModel.findOneAndDelete({_id: req.body.transactionId})
        res.status(200).json("transaction deleted")
    }catch(err){
        console.log(err);
        return res.status(500).json({err})
    }
}

const getLineChart = async (req, res) => {
    try{
        const { daterange } = req.body;
        const endDate = new Date(); // Today
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - daterange); // Subtract days based on date range


        const transactions = await transactionModel.aggregate([
            {
                $match: {
                    userid: req.body.userid,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" },
                        type: "$Type"
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } } // Sort by date
        ]);

        // Transform data into a structured format
        let formattedData = {};
        let labels = [];
        let incomeData = [];
        let expenseData = [];

        transactions.forEach(entry => {
            let dateString = `${entry._id.year}-${entry._id.month}-${entry._id.day}`;

            if (!formattedData[dateString]) {
                formattedData[dateString] = { income: 0, expense: 0 };
                labels.push(dateString);
            }

            if (entry._id.type === "income") {
                formattedData[dateString].income = entry.totalAmount;
            } else if (entry._id.type === "expense") {
                formattedData[dateString].expense = entry.totalAmount;
            }
        });

        labels.forEach(label => {
            incomeData.push(formattedData[label].income);
            expenseData.push(formattedData[label].expense);
        });

        res.json({ labels, incomeData, expenseData });

    }catch(err){
        console.error(err);
        res.status(500).json({err});

    }
}

const getCategoryData = async (req, res) => {
    try{
        const { daterange } = req.body;
        const DaysAgo = new Date();
        DaysAgo.setDate(DaysAgo.getDate() - parseInt(daterange));

        const categoryExpenses = await transactionModel.aggregate([
            {
                $match: {
                    userid: req.body.userid,
                    date: { $gte: DaysAgo },
                    Type: "expense"
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        res.json({ categoryExpenses });

    }catch(err){
        console.log(err)
        res.status(500).json({err});
    }
}



module.exports = {getAllTransactions, addTransaction, addTransactionImage,getTotalDetail,getLineChart, getCategoryData, addTransactionText, editTransaction, deleteTransaction, CategorizeTransaction}