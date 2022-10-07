import test from 'ava';
import RX from 'rx-lite';
import randomPuppy, {all} from './index.js';

const imgurRegEx = /^https?:\/\/(\w+\.)?imgur.com\/[a-zA-Z\d]+(\.[a-zA-Z\d]{3})?(#[a-zA-Z\d]*)?$/;
test('get random', async t => {
    const result = await randomPuppy();
    t.regex(result, imgurRegEx);
});

test('get more random', async t => {
    const result1 = await randomPuppy();
    t.regex(result1, imgurRegEx);
    const result2 = await randomPuppy();
    t.regex(result2, imgurRegEx);
    const result3 = await randomPuppy();
    t.regex(result3, imgurRegEx);
    const result4 = await randomPuppy();
    t.regex(result4, imgurRegEx);
});

test('different subreddit', async t => {
    const result1 = await randomPuppy('aww');
    t.regex(result1, imgurRegEx);
    const result2 = await randomPuppy('aww');
    t.regex(result2, imgurRegEx);
    const result3 = await randomPuppy('aww');
    t.regex(result3, imgurRegEx);
    const result4 = await randomPuppy('aww');
    t.regex(result4, imgurRegEx);
});

test('invalid subreddit', async t => {
    const result1 = await randomPuppy('23rkljr2klj3');
    t.falsy(result1);
    const result2 = await randomPuppy('');
    t.regex(result2, imgurRegEx);
    const result3 = await randomPuppy({});
    t.regex(result3, imgurRegEx);
    const result4 = await randomPuppy(false);
    t.regex(result4, imgurRegEx);
});

test('all', t => {
    t.plan(10);
    const puppyEmitter = all('puppies');
    const robotEmitter = all('robots');

    const puppySource = RX.Observable.fromEvent(puppyEmitter, 'data');
    const robotSource = RX.Observable.fromEvent(robotEmitter, 'data');

    const sharedSource = RX.Observable
        .merge(puppySource, robotSource)
        .take(10);

    sharedSource.subscribe(data => {
        t.regex(data, imgurRegEx);
    });
    return sharedSource.toPromise();
});
