/**
 * Created by Will on 10/23/2016.
 */

const rp = require('request-promise-native');
const request = require('request');
// require('request-debug')(request);
const streamifier = require('streamifier');
const ffmpeg = require('fluent-ffmpeg');

const VC = require('../operators/voiceConnection');

function Say(client, msg, args) {
    Promise.all([
        rp({
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.bing_speech
            },
            uri: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken'
        }).then(token => {
            return rp({
                headers: {
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'raw-16khz-16bit-mono-pcm',
                    'X-Search-ClientID': process.env.HEROKU_DYNO_ID || 'a058b078927dc66a53210c53321ad40e7c559372',
                    'User-Agent': 'appellation/pleb:v3.0',
                    'Authorization': 'Bearer ' + token
                },
                uri: 'https://speech.platform.bing.com/synthesize',
                method: 'POST',
                encoding: null,
                body: "<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>" + args.join(' ') + "</voice></speak>"
            });
        }),
        VC.checkUser(msg)
    ]).then(res => {
        const stream = ffmpeg(streamifier.createReadStream(res[0]))
            .inputFormat('s16le')
            .audioFrequency(48000)
            .audioChannels(1)
            .audioCodec('flac')
            .format('flac');

        stream.on('error', console.error);

        res[1].playStream(stream)
            .on('debug', console.info)
            .on('error', console.error);
    }).catch(err => {
        console.error(err);
    });
}

module.exports = Say;