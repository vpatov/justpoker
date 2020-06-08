require("chromedriver");
const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

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
  const driver = new webdriver.Builder().forBrowser("chrome").build();
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
    for (d of drivers) {
      await checkCall(d);
    }
    await sleep(WaitBetweenRounds);
  }
}

function sitDown(driver, playerName) {
  return driver
    .wait(until.elementLocated(By.className("CLASS_OpenSeatButton")))
    .then(() =>
      driver
        .findElement(By.className("CLASS_OpenSeatButton"))
        .click()
        .then(() =>
          driver.findElement(By.id("ID_NameField")).sendKeys(playerName)
        )
        .then(() => driver.findElement(By.id("ID_SitDownButton")).click())
    );
}

async function checkCall(driver) {
  return driver.findElement(By.id("ID_CheckCallButton")).click();
}

// gameplay functions
async function createGameSitDownAdmin() {
  const adminWindow = spawnWindowAtLocation("http://localhost:3000/");
  await adminWindow.findElement(By.id("ID_CreateGameButton")).click();
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
  await adminWindow.findElement(By.id("ID_StartGameButton")).click();
}

async function playGameWithPlayers(numPlayers) {
  const adminWindow = await createGameSitDownAdmin();
  const gameUrl = adminWindow.getCurrentUrl();
  const playerDrivers = await sitDownPlayers(numPlayers, gameUrl);
  await adminWindow.findElement(By.id("ID_StartGameButton")).click();
  checkItDown([adminWindow, ...playerDrivers]);
}

// main functions

async function PlayThreeTablesThreePlayers() {
  try {
    await Promise.all[
      (playGameWithPlayers(3), playGameWithPlayers(3), playGameWithPlayers(3))
    ];
  } catch (error) {
    console.log("caught err", error);
    allDrivers.forEach((d) => d.quit());
  }
}

async function PlayOneTableNinePlayers() {
  try {
    await playGameWithPlayers(9);
  } catch (error) {
    console.log("caught err", error);
    allDrivers.forEach((d) => d.quit());
  }
}

async function SitDownPlayersAtOneTable(n) {
  try {
    await createGameSitDownPlayers(n);
  } catch (error) {
    console.log("caught err", error);
    allDrivers.forEach((d) => d.quit());
  }
}

// PlayThreeTablesThreePlayers();
// PlayOneTableNinePlayers();
SitDownPlayersAtOneTable(4);
