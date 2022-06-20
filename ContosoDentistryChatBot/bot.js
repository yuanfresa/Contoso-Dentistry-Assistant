// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
const IntentRecognizer = require("./intentrecognizer")
const DentistScheduler = require('./dentistscheduler');

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        this.qnaMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);
        // create a LUIS connector
        this.intentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker
            const qnaResults = await this.qnaMaker.getAnswers(context);
            // send user input to LUIS
            const LuisResult = await this.intentRecognizer.executeLuisQuery(context);
            const LuistopIntent = LuisResult.luisResult.prediction.topIntent;
            
            // Determine which service to respond with //
            if (LuistopIntent === "scheduleAppointment" &&
                LuisResult.intents.scheduleAppointment.score > .6
            ) {
                const time = LuisResult.entities.$instance.time[0].text;
                const reply_message = await this.DentistScheduler.scheduleAppointment(time);
                console.log("I found an appointment");
                console.log(reply_message)
                await context.sendActivity(reply_message);
                await next();
                return;
            }

            if (LuistopIntent === "getAvailability" &&
                LuisResult.intents.getAvailability.score > .6
            ) {
                const time = LuisResult.entities.$instance.time[0].text;
                const reply_message = await this.DentistScheduler.getAvailability(time);
                console.log("I found an getAvailability");
                await context.sendActivity(reply_message);
                await next();
                return;
            }

            // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                await context.sendActivity(`${qnaResults[0].answer}`);
            }
            else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity(`I'm not sure`
                + 'I found an answer to your question'
                + `You can ask me questions about dentistry like "When is the dentistry open?`);
            }
            await next();
    });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Welcome to Contoso Dentbot! We fix teath! How can I help you?';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // By calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
