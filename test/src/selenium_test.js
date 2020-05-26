require("chromedriver");
const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

const windowSize = { x: 850, y: 600 };
let curPos = { x: 0, y: 0 };
const maxCols = 4;
const windows = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  windows.push(driver);
  return driver;
}

async function gameWithNPlayers(numPlayers) {
  const WaitBetweenRounds = 3000 + 125 * numPlayers;

  const adminWindow = spawnWindowAtLocation("http://localhost:3000/");
  await adminWindow.findElement(By.id("ID_CreateGameButton")).click();
  await sitDown(adminWindow, "ADMIN");
  const gameUrl = adminWindow.getCurrentUrl();
  for (let i = 1; i < numPlayers; i++) {
    let newDriver = await spawnWindowAtLocation(gameUrl);
    await sitDown(newDriver, `PLAYER_${i}`);
  }

  await adminWindow.findElement(By.id("ID_StartGameButton")).click();

  for (let i = 1; i < 100; i++) {
    for (driver of windows) {
      await checkCall(driver);
    }
    await sleep(WaitBetweenRounds);
  }
}

function sitDown(driver, playerName) {
  return driver
    .findElement(By.className("CLASS_OpenSeatButton"))
    .click()
    .then(() => driver.findElement(By.id("ID_NameField")).sendKeys(playerName))
    .then(() => driver.findElement(By.id("ID_SitDownButton")).click());
}

async function checkCall(driver) {
  return driver.findElement(By.id("ID_CheckCallButton")).click();
}

async function start() {
  try {
    await gameWithNPlayers(9);
  } catch (error) {
    console.log("caught err", error);
    windows.forEach((d) => d.quit());
  }
}

start();
