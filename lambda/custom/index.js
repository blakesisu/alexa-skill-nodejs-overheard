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
const ENV = require('./env.js');
const OAuth = require('oauth');
const CONSUMER_KEY = ENV.twitter.consumer.public;
const CONSUMER_SECRET = ENV.twitter.consumer.secret;
const ACCESS_TOKEN = ENV.twitter.user.token;
const ACCESS_TOKEN_SECRET = ENV.twitter.user.secret;
const APP_ID = ENV.twitter.alexaSkillId;

const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  CONSUMER_KEY,
  CONSUMER_SECRET,
  '1.0A',
  null,
  'HMAC-SHA1'
);

const PARAMS = {
  q: 'realoverheardla',
  until: `${datestring()}`,
  result_type: 'mixed',
  count: 100
}

const LEN = Object.keys(PARAMS).length;
const URLSUFFIX = Object.keys(PARAMS).reduce((acc, curr, idx) => {
  let suffix = idx === LEN - 1 ? '' : '&';
  acc += `${curr}=${PARAMS[curr]}${suffix}`;
  return acc;
}, '')

function datestring() {
  var d = new Date();
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +  (d.getDate() - Math.floor(Math.random() * 7));
};

const SKILL_NAME = 'Local Smut';
const GET_TWITHEARD_MESSAGE = "Here's a random smut from some smuck in Los Angeles: ";
const HELP_MESSAGE = 'You can say tell me some smut, or, you can say gtfo... What can I even help you with?';
const HELP_REPROMPT = 'What the heck can I even help you with?';
const STOP_MESSAGE = 'Goodbye!';


let twitData = new Promise((resolve, reject) => {
  oauth.get(
    `https://api.twitter.com/1.1/search/tweets.json?${URLSUFFIX}`,
    ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET,
    function (error, result, response){
      if (error) return reject(error);

      return resolve( JSON.parse(result).statuses.map(datum => {
        return datum.text;
      })
        .filter(datum => {
          return datum.indexOf('//') < 0 && datum.length > 75;
        })
        .map(datum => datum.replace(/(\r\n\t|\n|\r\t)/gm,""))
        .map(datum => datum.replace(/"/g, ''))
      )
    });
})

const handlers = {
  'LaunchRequest': function () {
    this.emit('GetNewFactIntent');
  },
  'GetNewFactIntent': function () {
    let self = this;
    twitData
      .then(twitheardArr => {
        const twitheardIndex = Math.floor(Math.random() * twitheardArr.length);
        const randomTwitheard = twitheardArr[twitheardIndex];
        const speechOutput = GET_TWITHEARD_MESSAGE + randomTwitheard;

        self.response.cardRenderer(SKILL_NAME, randomTwitheard);
        self.response.speak(speechOutput);
        self.emit(':responseReady');
      });
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

exports.handler = function(event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
