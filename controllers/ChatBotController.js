const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()


const MODEL_NAME = "gemini-1.5-flash-8b";
const API_KEY = process.env.API_KEY;

async function runChat(userInput,memory,userDetails,CategoryWiseExpense,DayWiseData) {
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
        // ... other safety settings
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{ text: "You are Sam, a friendly financial assistant who responds to" +
                        "peoples questions related personal finance based on provided expenditure" +
                        "or income or any other related finance data. you only answer finance related"+
                        "questions and friendly tell people that you can not answer any other"+
                        " kind of question other than personal finance politely and don't include any ** in"+
                        "in the response to make text bold give simple text only"+
                        "all values are in rupees and there is no transaction in any other currency like dollar etc."}],
            },
            {
                role: "model",
                parts: [{ text: "Hello! Welcome to ChatBot. My name is FinBot. What's your name?"}],
            },
            {
                role: "user",
                parts: [{ text: "Hi"}],
            },
            {
                role: "model",
                parts: [{ text: "Hi there! Thanks for reaching out to us. how can i help you today?"}],
            },
            {
                role: "user",
                parts: [{ text: memory.toString()}],
            },
            {
                role: "user",
                parts: [{ text: "this is all the info about the user. analyse this info and"+
                        " answer any questions they ask based on this"},{text: JSON.stringify(userDetails,null,2)},],
            },
            {
                role: "user",
                parts: [{ text: "this is the category-wise expense info about the user. analyse this info and"+
                        " answer any questions they ask based on this"},{text: JSON.stringify(CategoryWiseExpense,null,2)},],
            },
            {
                role: "user",
                parts: [{ text: "this is the day-wise expense and income info about the user. analyse this info and"+
                        " answer any questions they ask based on this"},{text: JSON.stringify(DayWiseData)},],
            }
        ],
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    return response.text();
}
let historyy = "this is the history of all the previous questions ans answers asked till now:";
let count = 0;

const ChatBotResponse = async (req, res) => {
    try{
        const {userInput,userInfo, CategoryWiseExpense,DayWiseData} = req.body;
        let context = JSON.stringify(userInfo);
        // context = context + "hello"
        console.log(context)
        const response = await runChat(userInput,historyy,userInfo,CategoryWiseExpense,DayWiseData);
        console.log("runchat invoked")
        count++;
        historyy = historyy + `${count}`+ ":" + "Question: "+  userInput + ". response: "+ response;
        console.log(historyy)
        return res.status(200).send(response);


    }catch(err){
        console.error(err);
    }
}

module.exports = {ChatBotResponse};