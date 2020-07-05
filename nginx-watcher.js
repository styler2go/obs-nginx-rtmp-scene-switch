const parseString = require('xml2js').parseString;
const fetch = require('node-fetch');
const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
const config = require('./config.json');

const SCENES = {
    BAD: 'bad',
    GOOD: 'good'
};

let activeScene = SCENES.GOOD;
let runs = 0;
const decideScene = (bitrate, minimum) => {
    let nextScene = SCENES.GOOD;

    if (bitrate < minimum) {
        nextScene = SCENES.BAD;
    }

    if (nextScene !== activeScene) {
        activeScene = nextScene;
        if (runs === config.delayInSeconds) {

            const sceneName = config.obs.scenes[activeScene];
            obs.sendCallback('SetCurrentScene', {'scene-name': sceneName}, (err, data) => {
                data.status === 'ok' && console.log('Scene was changed', sceneName);
            });
            runs = 0;
        }

        runs++;

        console.log('Upcoming change backhold for ' + runs + ' second(s)');
        return;
    }

    runs = 0;
};

const findInArray = (haystack, needle) => {
    let found = null;
    haystack.forEach(haystackItem => {
        if (haystackItem.name[0] === needle) {
            found = haystackItem;
        }
    });

    return found;
}

const check = () => {
    fetch(config.nginx.url).then(response => response.text()).then(response => {
        parseString(response, (err, result) => {
            if (result.rtmp && result.rtmp.server) {
                const applications = result.rtmp.server[0].application;
                let liveApplication = findInArray(applications, config.nginx.application);

                if (!liveApplication) {
                    throw new Error('Cannot find your application. Is your config correct?')
                }

                liveApplication = liveApplication.live[0];
                let seletcedStream = findInArray(liveApplication.stream, config.nginx.stream);

                if (!seletcedStream) {
                    throw new Error('Cannot find your stream. Is your config correct?')
                }

                const bitrate = seletcedStream['bw_video'][0] / 1000;

                console.log('Current bitrate is ' + bitrate + ', should be ' + config.minBandwidth);

                decideScene(bitrate, config.minBandwidth);
            }
        });
    });
};


const {password, url} = config.obs.socket;

obs.connect({
    address: url ? url : 'localhost:4444',
    password: password ? password : ''
}).then(() => {
    console.log(`Connection established.`);
    setInterval(check, 1000);
}).catch(err => {
    console.log(err);
});
