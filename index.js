const http = require('http');
const express = require('express');
const normalizePort = require('normalize-port');

const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'PAIPAS Bot'
})

const POST_URL = `${process.env.POST_URL}`;
const BOT_CHANNEL = `${process.env.BOT_CHANNEL}`;

// Error Handler
bot.on('error', (err) => {
	console.log(`${process.env.BOT_TOKEN}`);
    console.log(err);
})

bot.on('start', (e) => {
    //console.log(bot);
})

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message' || data.subtype === 'bot_message') {
        return;
    }
    console.log(data.ts);
    //console.log(/^D/.test(data.channel));
    if(/^D/.test(data.channel)){
        if(typeof data.text !== "undefined"){
            if(typeof data.ts !== "undefined"){
                handleMessage(data.text, data.channel, data.user, data.ts);
            }else{
                handleMessage(data.text, data.channel, data.user, "");    
            }
        }
    }else{
        if(typeof data.text !== "undefined"){
            if((data.text).includes("<@"+ bot.self.id +">")){
                if(typeof data.ts !== "undefined"){
                    handleMessage(data.text, data.channel, data.user, data.ts);
                }else{
                    handleMessage(data.text, data.channel, data.user, "");    
                }
            }
        }
    }
})

function handleMessage(message, channel_id, user_id, thread_ts) {
    if(message.includes('@pain')) {
        painSwitch(message, channel_id, user_id, thread_ts);
    } else if(message.includes('@issue')) {
        issueSwitch(message, channel_id, user_id, thread_ts);
    } else if(message.includes('@solution')) {
        solutionSwitch(message, channel_id, user_id, thread_ts);
    }else if(message.includes('@help')) {
        helpSwitch("Send a message to the @PAIPAS Bot, with the message contains the follow keywords: @pain, or @issue, or @solution", channel_id, thread_ts);
    } else{
    	painSwitch(message, channel_id, user_id, thread_ts);
    }
}

function painSwitch(message, channel_id, user_id, thread_ts){
	makeCall(message, channel_id, user_id, 'pain', thread_ts);
}

function issueSwitch(message, channel_id, user_id, thread_ts){
	makeCall(message, channel_id, user_id, 'issue');
}

function solutionSwitch(message, channel_id, user_id, thread_ts){
	makeCall(message, channel_id, user_id, 'solution', thread_ts);
}

function helpSwitch(statusMessage, channel_id, thread_ts){
	bot.postMessage(
        channel_id,
        statusMessage,
        thread_ts
    );
}

function makeCall(message, channel_id, user_id, toi, thread_ts){
	axios.post(POST_URL, {
		'slack_user_id': user_id,
		'message': streamlineMessage(message),
		'type_of_input': toi
	}).then(function (response) {
		displayMessageOnSlack(true, channel_id, toi, thread_ts);
	}).catch(function (error) {
		//console.log(error);
		displayMessageOnSlack(false, channel_id, toi, thread_ts);
	});
}

function displayMessageOnSlack(status, channel_id, toi, thread_ts){
    var statusMessage = "Thanks! This "+ toi +" has been flagged and added to PAIPAS!";
    if(!status){
    	statusMessage = "Error occur, cannot flag this issue, contact @Peter";
    }
    setTimeout(function(){
        bot.postMessage(
            channel_id,
            statusMessage,
            thread_ts
        );    
    }, 500)
}

function streamlineMessage(message){
	return message.replace("<@"+ bot.self.id +"> ", "");
}

// Create the server
const port = normalizePort(process.env.PORT || '3100');
const app = express();

app.use(express.static(__dirname));

// Start the server
http.createServer(app).listen(port, () => {
    console.log(`server listening on port ${port}`);

    bot.on('error', (err) => {
        console.log(`${process.env.BOT_TOKEN}`);
        console.log(err);
    })
});
