import path from 'path';

import { Selector, ClientFunction } from 'testcafe';

function uriFromPath (relativePath) {
    let pathName = path.resolve(relativePath).replace(/\\/g, '/');

    if (pathName.length > 0 && pathName.charAt(0) !== '/')
        pathName = '/' + pathName;

    return encodeURI('file://' + pathName);
}

const index = uriFromPath('./index.html');

const button1 = Selector('#first-button');
const button2 = Selector('#second-button');
const button3 = Selector('#third-button');
const message = Selector('div');

fixture('Fixture')
    .page('about:blank');

test('Test using regular wait', async t => {
    console.time('regular wait');

    await t
        .navigateTo(index)
        .maximizeWindow()
        .click(button1)
        .wait(6000)
        .click(button2)
        .wait(24000)
        .expect(button3.exists).ok()
        .click(button3)
        .wait(18000)
        .expect(message.innerText).eql('The app is fully loaded');

    console.timeEnd('regular wait');
});

test('Test using ClientFunction', async t => {
    console.time('ClientFunction');

    const waitForStageLoaded = ClientFunction(eventName => {
        return new Promise(resolve => myApp.addEventListener(eventName, resolve));
    });

    await t
        .navigateTo(index)
        .maximizeWindow()
        .click(button1);

    await waitForStageLoaded('first-stage-loaded');

    await t.click(button2);

    await waitForStageLoaded('second-stage-loaded');

    await t
        .expect(button3.exists).ok()
        .click(button3);

    await waitForStageLoaded('third-stage-loaded');

    await t.expect(message.innerText).eql('The app is fully loaded');

    console.timeEnd('ClientFunction');
});

test('Test using smart assertion mechanism', async t => {
    console.time('smart assertion mechanism');

    const button2 = Selector('#second-button', { timeout: 6000 });

    await t
        .navigateTo(index)
        .maximizeWindow()
        .click(button1)
        .click(button2)
        .expect(button3.exists).ok({ timeout: 24000 })
        .click(button3)
        .expect(message.innerText).eql('The app is fully loaded', { timeout: 18000 });

    console.timeEnd('smart assertion mechanism');
});