import got from 'got';
import uniqueRandomArray from 'unique-random-array';
import EventEmitter from 'eventemitter3';

const randomCache = {};

function formatResult(getRandomImage) {
    const imageData = getRandomImage();
    if (!imageData) {
        return;
    }

    return `http://imgur.com/${imageData.hash}${imageData.ext.replace(/\?.*/, '')}`;
}

function storeResults(images, subreddit) {
    const getRandomImage = uniqueRandomArray(images);

    randomCache[subreddit] = getRandomImage;
    return getRandomImage;
}

async function randomPuppy(subreddit) {
    subreddit = (typeof subreddit === 'string' && subreddit.length > 0) ? subreddit : 'puppies';

    if (randomCache[subreddit]) {
        return formatResult(randomCache[subreddit]);
    }

    const response = await got(`https://imgur.com/r/${subreddit}/hot.json`, {responseType: 'json'});
    const getRandomImage1 = storeResults(response.body.data, subreddit);
    return formatResult(getRandomImage1);
}

export default function f(subreddit) {
    return randomPuppy(subreddit);
}

// Silly feature to play with observables
export function all(subreddit) {
    const eventEmitter = new EventEmitter();

    function emitRandomImage(subreddit) {
        randomPuppy(subreddit)
            .then(imageUrl => {
                eventEmitter.emit('data', imageUrl + '#' + subreddit);
                if (eventEmitter.listeners('data').length > 0) {
                    setTimeout(() => emitRandomImage(subreddit), 200);
                }
            })
            .catch();
    }

    emitRandomImage(subreddit);
    return eventEmitter;
}
