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

bot.on('start', () => {
    
})

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message' || data.subtype === 'bot_message') {
        return;
    }
    //console.log(data.channel);
    if(typeof data.text !== "undefined"){
        if(data.channel == BOT_CHANNEL)
            handleMessage(data.text, data.channel, data.user);    
    }
        
})

function handleMessage(message, channel_id, user_id) {
    if(message.includes('@pain')) {
        painSwitch(message, channel_id, user_id);
    } else if(message.includes('@issue')) {
        issueSwitch(message, channel_id, user_id);
    } else if(message.includes('@solution')) {
        solutionSwitch(message, channel_id, user_id);
    }else if(message.includes('@help')) {
        helpSwitch("Send a message to the @PAIPAS Bot, with the message contains the follow keywords: @pain, or @issue, or @solution", channel_id);
    } else{
    	painSwitch(message, channel_id, user_id);
    }
}

function painSwitch(message, channel_id, user_id){
	makeCall(message, channel_id, user_id, 'pain');
}

function issueSwitch(message, channel_id, user_id){
	makeCall(message, channel_id, user_id, 'issue');
}

function solutionSwitch(message, channel_id, user_id){
	makeCall(message, channel_id, user_id, 'solution');
}

function helpSwitch(statusMessage, channel_id){
	bot.postMessage(
        channel_id,
        statusMessage
    );
}

function makeCall(message, channel_id, user_id, toi){
	axios.post(POST_URL, {
		'slack_user_id': user_id,
		'message': streamlineMessage(message),
		'type_of_input': toi
	}).then(function (response) {
		displayMessageOnSlack(true, channel_id, toi);
	}).catch(function (error) {
		//console.log(error);
		displayMessageOnSlack(false, channel_id, toi);
	});
}

function displayMessageOnSlack(status, channel_id, toi){
    var statusMessage = "Thanks! This "+ toi +" has been flagged and added to PAIPAS!";
    if(!status){
    	statusMessage = "Error occur, cannot flag this issue, contact @Peter";
    }
    bot.postMessage(
        channel_id,
        statusMessage
    );
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