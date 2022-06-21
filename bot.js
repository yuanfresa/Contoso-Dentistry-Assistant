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

            try{
                // send user input to QnA Maker
                const qnaResults = await this.QnAMaker.getAnswers(context);
                // send user input to LUIS
                const LuisResult = await this.IntentRecognizer.executeLuisQuery(context);
                const LuistopIntent = LuisResult.luisResult.prediction.topIntent;
    
                let reply_message;
                if (LuisResult.intents[LuistopIntent].score>0.65) {
                    if (LuistopIntent === 'getAvailability') {
                        reply_message = await this.DentistScheduler.getAvailability(this.IntentRecognizer.getTimeEntity(LuisResult));
                    } else {
                        reply_message = await this.DentistScheduler.scheduleAppointment(this.IntentRecognizer.getTimeEntity(LuisResult));
                    };
                } else {
                    reply_message = answers[0].answer;
                }
                await context.sendActivity(MessageFactory.text(reply_message, reply_message));
            } catch(e) {
                console.error(e);
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
