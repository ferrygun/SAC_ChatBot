//https://stackoverflow.com/questions/10703513/node-js-client-for-a-socket-io-server
"use strict";
const port = process.env.PORT || 3000;
const server = require("http").createServer();
const express = require("express");
const fs = require('fs');
const url = require('url');
const bodyParser = require("body-parser");
const request = require('request');
var sapcai = require('sapcai').default

//Get it from Settings in SAP CAI
var token = "REPLACE_WITH_DEVELOPER_TOKEN";
var botSlug = "REPLACE_WITH_BOT_NAME";
var userSlug = "REPLACE_WITH_USER_SLUG"
var version = "REPLACE_WITH_VERSION_INFO";

var connect = new sapcai.connect(token)
var app = express();
app.use(bodyParser.json());
var sockett;
var socketid;

var Ar = [];

// Redirect any to service root
app.get("/", (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write('<h1>SAP SAP Analytics CLoud Chat Bot with SAP Conversational AI</h1>');
    res.end();
});


app.post('/', function(req, res) {
    connect.handleMessage(req, res, onMessage)
})

function reply(conversationId) {
    var url_post = "https://api.cai.tools.sap/connect/v1/conversations/" + conversationId + "/messages";

    const options = {
        url: url_post,
        type: 'post',
        headers: {
            "Authorization": "Token " + token
        },
        json: true,
        body: {
            "messages": [{
                "content": "Hello SAP Conversational AI",
                "type": "text"
            }]
        }
    };

    request.post(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        //console.log(`Status: ${res.statusCode}`);
        //console.log(body);
    });
}

function initChat(conversationId, socketid) {
    var url_post = "https://api.cai.tools.sap/build/v1/dialog";

    const options = {
        url: url_post,
        type: 'post',
        headers: {
            "Authorization": "Token " + token
        },
        json: true,
        body: {
            "message": {
                "content": "Hello SAP Conversational AI",
                "type": "text"
            },
            "conversation_id": conversationId
        }
    };

    request.post(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        //console.log(`Status: ${res.statusCode}`);
        //console.log(body);
        UpdateMemory(conversationId, socketid);
    });
}

function UpdateMemory(conversationId, socketid) {
    //check ferrygun and fd in settings
    var url_post = "https://api.cai.tools.sap/build/v1/users/" + userSlug + "/bots/" + botSlug + "/versions/" + version + "/builder/conversation_states/" + conversationId;

    const options = {
        url: url_post,
        type: 'put',
        headers: {
            "Authorization": "Token " + token
        },
        json: true,
        body: {
            "language": "en",
            "merge_memory": false,
            "memory": {
                "user": {
                    "id": "SOCKETID",
                    "name": socketid
                }
            }
        }
    };

    request.put(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        //console.log(`Status: ${res.statusCode}`);
        //console.log(body);
    });
}

function Delete(conversationId, socketid) {
    //check ferrygun and fd in settings
    var url_post = "https://api.cai.tools.sap/build/v1/users/" + userSlug + "/bots/" + botSlug + "/versions/" + version + "/builder/conversation_states/" + conversationId;

    const options = {
        url: url_post,
        type: 'delete',
        headers: {
            "Authorization": "Token " + dev_token
        },
        json: true,
        body: {}
    };

    request.delete(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Status: ${res.statusCode}`);
        console.log(body);
    });
}

function onMessage(message) {
    console.log("------------------------------------------");
    console.log(message);
    console.log("------------------------------------------");

    var no_mem = false;
    var get_start = false;
    var sessionid;
    var question = "";
    var foundIndex;

    var date;
    var productcategoryname;
    var productname;
    var person;
    var location;

    //check session ID
    if (message.nlp.entities.hasOwnProperty("uid")) {
        sessionid = message.nlp.source.substring(8, message.nlp.source.length);
    }
    console.log("sessionid: " + sessionid);

    foundIndex = Ar.findIndex(x => x.conversation_id == message.conversation.conversation_id);
    if (foundIndex === -1) {
        //add new conversation id
        Ar.push({
            'conversation_id': message.conversation.conversation_id,
            'socketid': sessionid
        });
        foundIndex = Ar.findIndex(x => x.conversation_id == message.conversation.conversation_id);
    } else {
        if (typeof sessionid !== "undefined") {
            Ar[foundIndex].socketid = sessionid;
        }
    }

    console.log(Ar);
    sessionid = Ar[foundIndex].socketid;

    if (sessionid === "" || typeof sessionid === "undefined") {
        message.addReply([{
            type: 'text',
            content: 'Please enter the chat id first'
        }])
        message.reply()
            .then(res => console.log('message sent'))
    } else {
        if (message.conversation.memory.hasOwnProperty("user")) {
            //has memory
            console.log("--Has memory--");
            initChat(message.conversation.conversation_id, sessionid);

            if (message.nlp.entities.hasOwnProperty("uid")) {
                message.addReply([{
                    type: 'text',
                    content: 'You have entered the chat ID. Now you can ask me'
                }])
                message.reply()
                    .then(res => console.log('message sent'))
            }
        } else {
            //no memory
            console.log("--No memory--");
            initChat(message.conversation.conversation_id, sessionid);

            message.addReply([{
                type: 'quickReplies',
                "content": {
                    "title": "Hi there!",
                    "buttons": [{
                        "title": "Let's get started",
                        "value": "Start the conversation"
                    }]
                }
            }])
            message.reply()
                .then(res => console.log('message sent'))

            foundIndex = Ar.findIndex(x => x.conversation_id == message.conversation.conversation_id);
            console.log("foundIndex: " + foundIndex);
            if (foundIndex === -1) {
                //add new conversation id
                Ar.push({
                    'conversation_id': message.conversation.conversation_id,
                    'socketid': sessionid
                });
            }
        }
    }


    console.log("MEMORY:");
	console.log(message.conversation.memory);
	console.log("SESSIONID: " + sessionid);

    if (message.conversation.memory.hasOwnProperty("user")) {
        console.log("Memory:" + message.conversation.memory.user.name);

        if (message.nlp.hasOwnProperty("entities")) {

            if (message.nlp.entities.hasOwnProperty("getstart")) {
				message.addReply([{
                    type: 'text',
                    content: 'Great! Now you can ask me'
                }])
                message.reply()
                    .then(res => console.log('message sent'))
			}
        }

        if (message.nlp.hasOwnProperty("intents")) {
            if (message.nlp.intents[0].slug === "question" && typeof(sessionid) !== "undefined") {

                if (message.nlp.hasOwnProperty("entities")) {

                    if (message.nlp.entities.hasOwnProperty("date")) {
                        date = message.nlp.entities.date[0].raw;
                    }
                    if (message.nlp.entities.hasOwnProperty("productcategoryname")) {
                        productcategoryname = message.nlp.entities.productcategoryname[0].raw;
                    }
                    if (message.nlp.entities.hasOwnProperty("productname")) {
                        productname = message.nlp.entities.productname[0].raw;
                    }
                    if (message.nlp.entities.hasOwnProperty("person")) {
                        person = message.nlp.entities.person[0].raw;
                    }
                    if (message.nlp.entities.hasOwnProperty("location")) {
                        location = message.nlp.entities.location[0].raw;
                    }

                    console.log("date:" + date + ", productcategoryname:" + productcategoryname + ", productname:" + productname + ", person:" + person + ", location:" + location);

                    io.to(sessionid).emit("req", {
                        date: date,
                        productcategoryname: productcategoryname,
                        productname: productname,
                        person: person,
                        location: location
                    });

                    message.addReply([{
                        type: 'text',
                        content: 'Here is the information'
                    }])
                    message.reply()
                        .then(res => console.log('message sent'))

                }
            }
        }
    } else {
		//no memory
        console.log("--No memory--");
		initChat(message.conversation.conversation_id, sessionid);
	}
}

//Start the Server 
server.on("request", app);

// use socket.io
var io = require('socket.io').listen(server);


// define interactions with client
io.sockets.on("connection", function(socket) {

    socket.on('disconnect', function() {
        console.log("Disconnected: " + socket.id);

        //remove it from array
        var rmindex = Ar.findIndex(x => x.socketid == socket.id);
        Ar.splice(rmindex, 1);

        console.log(Ar);
    });
});

//Start the Server 
//server.on("request", app);
server.listen(port, function() {
    console.info(`Bot Server: ${server.address().port}`);
});
