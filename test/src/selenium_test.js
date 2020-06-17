require('chromedriver');
const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

import { SELENIUM_TAGS } from '../../ui/src/shared/models/test/seleniumTags';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// global params
const windowSize = { x: 950, y: 800 }; // https://www.amazon.com/LG-27UD68-P-27-Inch-Monitor-FreeSync/dp/B01CH9ZTI4
let curPos = { x: 0, y: 0 };
const maxCols = 4;
const allDrivers = [];

// driver methods
function spawnWindowAtLocation(url) {
    const driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(url);
    driver.manage().window().setRect({
        width: windowSize.x,
        height: windowSize.y,
        x: curPos.x,
        y: curPos.y,
    });

    curPos.x += windowSize.x;
    if (curPos.x > (maxCols - 1) * windowSize.x) {
        curPos.y += windowSize.y + 100;
        curPos.x = 0;
    }

    allDrivers.push(driver);
    return driver;
}

async function checkItDown(drivers) {
    const WaitBetweenRounds = 3000 + 150 * drivers.length;
    // only do 100 checks
    for (let i = 1; i < 100; i++) {
        for (let j = 0; j < drivers.length; j++) {
            await checkCall(drivers[j]);
        }
        await sleep(WaitBetweenRounds);
    }
}

async function sitDown(driver, playerName) {
    await driver.wait(until.elementLocated(By.id(SELENIUM_TAGS.IDS.JOIN_GAME_BUTTON)));
    await driver.findElement(By.id(SELENIUM_TAGS.IDS.JOIN_GAME_BUTTON)).click();
    await driver.findElement(By.id(SELENIUM_TAGS.IDS.NAME_FIELD)).sendKeys(playerName);
    await driver.findElement(By.id(SELENIUM_TAGS.IDS.JOIN_AND_SIT_BUTTON)).click();
    return driver;
}

async function checkCall(driver) {
    return driver.findElement(By.id(SELENIUM_TAGS.IDS.CHECK_CALL_BUTTON)).click();
}

// gameplay functions
async function createGameSitDownAdmin() {
    const adminWindow = spawnWindowAtLocation('http://localhost:3000/');
    await adminWindow.findElement(By.id(SELENIUM_TAGS.IDS.CREATE_GAME_BUTTON)).click();
    await sitDown(adminWindow, `ADMIN`);
    return adminWindow;
}

async function sitDownPlayers(numPlayers, gameUrl) {
    const drivers = [];
    for (let i = 1; i < numPlayers; i++) {
        let newDriver = await spawnWindowAtLocation(gameUrl);
        drivers.push(newDriver);
        await sitDown(newDriver, `PLAYER_${i}`);
    }
    return drivers;
}

async function createGameSitDownPlayers(numPlayers) {
    const adminWindow = await createGameSitDownAdmin();
    const gameUrl = adminWindow.getCurrentUrl();
    const playerDrivers = await sitDownPlayers(numPlayers, gameUrl);
    await adminWindow.findElement(By.id(SELENIUM_TAGS.IDS.START_GAME_BUTTON)).click();
}

async function playGameWithPlayers(numPlayers) {
    const adminWindow = await createGameSitDownAdmin();
    const gameUrl = adminWindow.getCurrentUrl();
    const playerDrivers = await sitDownPlayers(numPlayers, gameUrl);
    await adminWindow.findElement(By.id(SELENIUM_TAGS.IDS.START_GAME_BUTTON)).click();
    checkItDown([adminWindow, ...playerDrivers]);
}

// main functions

async function play(numTables, players) {
    const tables = [];
    for (let i = 0; i < numTables; i++) {
        tables.push(playGameWithPlayers(players));
    }
    try {
        await Promise.all(tables);
    } catch (error) {
        console.log('caught err', error);
        allDrivers.forEach((d) => d.quit());
    }
}

async function sit(numTables, players) {
    const tables = [];
    for (let i = 0; i < numTables; i++) {
        tables.push(createGameSitDownPlayers(players));
    }
    try {
        await Promise.all(tables);
    } catch (error) {
        console.log('caught err', error);
        allDrivers.forEach((d) => d.quit());
    }
}

play(2, 2);
