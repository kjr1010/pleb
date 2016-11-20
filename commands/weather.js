/**
 * Created by Will on 11/6/2016.
 */

const rp = require('request-promise-native');
const numeral = require('numeral');
const moment = require('moment');
const Canvas = require('canvas');

/**
 *
 * @param {Client} client
 * @param {Message} msg
 * @param {[]} args
 * @return {Promise|string}
 */
function Weather(client, msg, args) {

    const poss = [
        'currently',
        'minutely',
        'hourly',
        'daily'
    ];

    let index = poss.indexOf(args[0]);
    if(index == -1) {
        args.unshift('currently');
        index = 0;
    }

    const type = poss.splice(index, 1).join('');

    const rpDarksky = rp.defaults({
        baseUrl: 'https://api.darksky.net/forecast/' + process.env.darksky,
        qs: {
            exclude: poss.join(',')
        },
        json: true,
        method: 'get'
    });

    const rpGoogle = rp.defaults({
        baseUrl: 'https://maps.googleapis.com/maps/api',
        qs: {
            key: process.env.youtube
        },
        method: 'get',
        json: true
    });

    return rpGoogle({
        uri: 'geocode/json',
        qs: {
            address: args.slice(1).join(' ')
        }
    }).then(loc => {
        if(loc.status == 'ZERO_RESULTS')    {
            return;
        }

        const coords = loc.results[0].geometry.location;
        return Promise.all([
            rpDarksky({
                uri: coords.lat + ',' + coords.lng
            }),
            loc.results[0]
        ]);
    }).then(res => {

        if(!res) {
            return 'no location found';
        }

        const canvas = new Canvas(400, 290);
    });
}

module.exports = Weather;