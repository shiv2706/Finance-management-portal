const express = require('express');
const upload = require("../middlewares/multer-config")
const {addTransaction, getAllTransactions, addTransactionImage,getTotalDetail, getLineChart,getCategoryData,addTransactionText,editTransaction} = require("../controllers/transactionController");
const {ChatBotResponse} = require("../controllers/ChatBotController");
const router = express.Router();
//add a new transaction
router.post('/add-transaction', addTransaction);
router.post('/edit-transaction', editTransaction);
router.post('/upload-bill',upload.single("file"),  addTransactionImage);
//get all transactions
router.post('/get-transaction', getAllTransactions);
router.post('/get-totals', getTotalDetail);
router.post('/get-linechart-data', getLineChart)
router.post('/get-category-details', getCategoryData)
router.post('/get-chatbot-response', ChatBotResponse)
router.post('/upload-text', addTransactionText)



module.exports = router;