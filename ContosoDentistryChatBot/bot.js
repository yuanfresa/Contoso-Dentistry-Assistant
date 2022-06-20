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

        this.QnAMaker = new QnAMaker(configuration.QnAConfiguration)
       
        // create a DentistScheduler connector
        this.DentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);
        // create a IntentRecognizer connector
        this.IntentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker
            const qnaResults = await this.qnaMaker.getAnswers(context);
            // send user input to LUIS
            const LuisResult = await this.intentRecognizer.executeLuisQuery(context);
            const LuistopIntent = LuisResult.luisResult.prediction.topIntent;
            
            let reply_message;
            if (LuisResult.intents[LuistopIntent].score>0.65) {
                if (LuistopIntent === 'getAvailability') {
                    reply_message = await this.DentistScheduler.getAvailability(this.IntentRecognizer.getTimeEntity(LuisResult));
                } else if (LuistopIntent === "scheduleAppointment") {
                    reply_message = await this.DentistScheduler.scheduleAppointment(this.IntentRecognizer.getTimeEntity(LuisResult));
                }
                else {
                    reply_message = "Sorry, I don't understand"
                };
            } else if (qnaResults[0]) {
                reply_message = qnaResults[0].answer;
            } else {
                // If no answers were returned from QnA Maker, reply with help.
                reply_message = `I'm not sure`
                + 'I found an answer to your question'
                + `You can ask me questions about dentistry like "When is the dentistry open?`
            }
            await context.sendActivity(MessageFactory.text(reply_message, reply_message));

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
