const userModel = require('../models/userModel');
const loginController = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email, password});
        if(!user){
            return res.status(401).send('user not found');
        }
        return res.status(200).send({
            success: true,
            user,
        });

    }catch(error){
        res.status(400).send({
            success: false,
            error
        })
    }
}

const registerController = async (req, res) => {
    try{
        console.log(req.body);
        const newUser = new userModel(req.body)
        console.log(newUser)
        await newUser.save();
        return res.status(201).json({
            success: true,
            newUser
        });

    }catch(error){
        res.status(400).send({
            success: false,
            error
        })
    }
}

const ReturnOkay = async (req, res) => {
    res.status(200).send("okay")
}



module.exports = {loginController, registerController,ReturnOkay}