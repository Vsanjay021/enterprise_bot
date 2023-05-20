require("dotenv").config();
const { getDate } = require("./getDate");

// npm package to calculate time to send an article to telegram group

const { performance } = require('perf_hooks');

// Importing fetch in nodejs
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

//wiki API
const wikiAPI = process.env.wikiAPI;

// Telegram 

const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.botToken;
const chatId = process.env.chatId;

// Creating a Telegram bot instance
const bot = new TelegramBot(botToken);

//getting random pageid

const getRandomPageId = async () => {
    try {
        let articleresponse = await fetch(`${wikiAPI}?action=query&format=json&list=random&rnnamespace=0&rnlimit=1`);
        let articledatajson = await articleresponse.json();
        let pageid = articledatajson.query.random[0].id;
        getArticleSummary(pageid)
    } catch (error) {
        console.log(error.message);
    }
}
getRandomPageId();

//get summarty of article

const getArticleSummary = async (pageid) => {
    try {
        let articleResponse = await fetch(`${wikiAPI}?action=query&prop=extracts&format=json&exchars=500&pageids=${pageid}&explaintext=true`);
        let articleDataJson = await articleResponse.json();
        let artilceData = articleDataJson.query.pages[pageid];

        let title = artilceData?.title;
        let summary = artilceData?.extract;

        postArticle(title, summary)

    } catch (error) {
        console.log(error.message);
    }
}

//  posting a random Wikipedia article along with the summary to a telegram group

const postArticle = async (title, summary) => {
    try {
        const message = `*Wikipedia Article*\n\n*Title:-* ${title}\n\n*Summary :-* ${summary}`;

        const startTime = performance.now();

        let result = await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
        const endTime =  performance.now();
        const elapsedTimeMs = endTime - startTime;
        const elapsedTimeSeconds = (elapsedTimeMs / 1000).toFixed(4);
         

        console.log(`Successfully sent random Wikipedia article along with the title and summary to "${result?.chat.first_name}" at ${getDate(result)}`);
        console.log(`The time taken to send the post is ${elapsedTimeSeconds} seconds`);

    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}


