/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');

const dotenv = require('dotenv');
dotenv.load();

const OAuth = require('oauth');


const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  CONSUMER_KEY,
  CONSUMER_SECRET,
  '1.0A',
  null,
  'HMAC-SHA1'
);
//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const PARAMS = {
  q: 'realoverheardla',
  result_type: 'mixed',
  count: 100
}

const LEN = Object.keys(PARAMS).length;
const URLSUFFIX = Object.keys(PARAMS).reduce(( acc, curr, idx) => {
  let suffix = idx === LEN - 1 ? '' : '&';
  acc += `${curr}=${PARAMS[curr]}${suffix}`;
  return acc;
}, '')


const APP_ID = undefined;

const SKILL_NAME = 'Ya Heard';
const GET_HEARD_MESSAGE = "Here's a random blurb from some smuck in Los Angeles: ";
const HELP_MESSAGE = 'You can say tell me quote, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================
// const data = [
//     'A year on Mercury is just 88 days long.',
//     'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
//     'Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.',
//     'On Mars, the Sun appears about half the size as it does on Earth.',
//     'Earth is the only planet not named after a god.',
//     'Jupiter has the shortest day of all the planets.',
//     'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
//     'The Sun contains 99.86% of the mass in the Solar System.',
//     'The Sun is an almost perfect sphere.',
//     'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
//     'Saturn radiates two and a half times more energy into space than it receives from the sun.',
//     'The temperature inside the Sun can reach 15 million degrees Celsius.',
//     'The Moon is moving approximately 3.8 cm away from our planet every year.'
// ];

const data = await oauth.get(
  `https://api.twitter.com/1.1/search/tweets.json?${URLsUFFIX}`,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
  function (error, result, response){
    if (error) console.error(error);

    return JSON.parse(result).statuses.map(datum => {
      return datum.text;
    })
    .filter(datum => {
      return datum.indexOf('//') < 0 && datum.length > 75;
    })
    .map(datum => datum.replace(/(\r\n\t|\n|\r\t)/gm,""))
    .map(datum => datum.replace(/"/g, ''))

});

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },
    'GetNewFactIntent': function () {
        const heardArr = data;
        const heardIndex = Math.floor(Math.random() * heardArr.length);
        const randomHeard = heardArr[heardIndex];
        const speechOutput = GET_HEARD_MESSAGE + randomHeard;

        this.response.cardRenderer(SKILL_NAME, randomHeard);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};
