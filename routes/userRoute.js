const express = require('express');
const {loginController, registerController,ReturnOkay} = require("../controllers/userController");
const {getAllTransactions} = require("../controllers/transactionController");

const router = express.Router();
//login user
router.post('/login', loginController);
//register user
router.post('/register', registerController);

router.get('', ReturnOkay);


module.exports = router;