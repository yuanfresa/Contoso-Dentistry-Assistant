
# Instructions
## Create the Bot Application
* Create an Azure Bot resource in the Azure Portal
[![1.png](https://i.postimg.cc/hvdHk2Y3/1.png)](https://postimg.cc/5Qf7vSbw)
* Create an App Service resource in the Azure Portal
[![2.png](https://i.postimg.cc/3rt4NndD/2.png)](https://postimg.cc/c684577s)

* Set the Azure Bot resource's messaging endpoint URL to the App Service's endpoint URL (don't forget to add /api/messages to the of the endpoint URL) in the Azure Bot configuration settings.
  >https://contoso-dentistry-assist-appservices.azurewebsites.net/api/messages
[![222.png](https://i.postimg.cc/mDPLDfkd/222.png)](https://postimg.cc/LYMKCWzf)
* Create a Continuous deployment Reference ( Github CI / CD) in the Deployment Center of the App Service to the ContosoDentistryChatBot folder in your GitHub repo.
  [![3.png](https://i.postimg.cc/vZGGn6Dx/3.png)](https://postimg.cc/XpDMSqfn)
* Add the Azure Bot Resource App ID and Password to the ContosoDentistryChatBot .env file
  [![4.png](https://i.postimg.cc/X7fgcFKS/4.png)](https://postimg.cc/dL0dJhS4)
* In the ContosoDentistryChatBot code, use the command `npm install` to install dependencies.
* Use the command `npm start` to start ContosoDentistryChatBot
* Use the Microsoft Bot Framework Emulator to test the bot and verify that it runs correctly.

## Create A QnA Maker Resource
* Add a QnA Maker resource to the resource group.
[![11.png](https://i.postimg.cc/CMRDyyfJ/11.png)](https://postimg.cc/6TNTRmcG)
* Navigate to the QnA Maker portal.
* Create a knowledge base.
* Load dentist FAQs into the knowledge base from `FAQ.tsv` in the ContosoDentistryFAQs folder of the starter code repository.
[![22.png](https://i.postimg.cc/J7Hy6b92/22.png)](https://postimg.cc/PNhrN8fW)
* Publish the knowledge base.
* Copy the QnA maker keys to the ContosoDentistryChatBot `.env` file and the bot app service’s application settings.
  
## Create the LUIS Resource
* Add a language understanding resource to the resource group.
* Navigate to the LUIS portal.
* Create `GetAvailability` and `ScheduleAppointment` intents.
* Add example user input for both - labeling date-time entities where appropriate.
* Train and publish the LUIS model.
* Copy the LUIS keys to the bot’s env file and the bot app service’s application settings.

## Deploy the Dentist Scheduler App
The Dentist Scheduler app represents a third-party API whose functionality can be integrated into our conversational interface.

* Add a Web App resource to the resource group.
Create a Continuous deployment Reference ( Github CI / CD) in the Deployment Center for the Web App resource to the ContosoDentistryScheduler folder in the starter repository.
[![11111.png](https://i.postimg.cc/15zTK9Cm/11111.png)](https://postimg.cc/c6VXxNG2)
* Copy the ContosoDentistrySchedulerAPI endpoint to the bot’s `.env` file and the bot app service’s application settings.
  
