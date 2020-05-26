require("chromedriver");
const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

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

  allDrivers.push(driver);
  return driver;
}

// https://www.amazon.com/LG-27UD68-P-27-Inch-Monitor-FreeSync/dp/B01CH9ZTI4
const windowSize = { x: 850, y: 600 };
let curPos = { x: 0, y: 0 };
const maxCols = 4;
const allDrivers = [];

async function gameWithNPlayers(numPlayers) {
  const WaitBetweenRounds = 3200 + 125 * numPlayers;
  const drivers = [];
  const adminWindow = spawnWindowAtLocation("http://localhost:3000/");
  drivers.push(adminWindow);
  await adminWindow.findElement(By.id("ID_CreateGameButton")).click();
  await sitDown(adminWindow, "ADMIN");
  const gameUrl = adminWindow.getCurrentUrl();
  for (let i = 1; i < numPlayers; i++) {
    let newDriver = await spawnWindowAtLocation(gameUrl);
    drivers.push(newDriver);
    await sitDown(newDriver, `PLAYER_${i}`);
  }

  await adminWindow.findElement(By.id("ID_StartGameButton")).click();

  // only do 100 checks
  for (let i = 1; i < 100; i++) {
    for (driver of drivers) {
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

async function ThreeTablesThreePlayers() {
  try {
    await Promise.all[
      (gameWithNPlayers(3), gameWithNPlayers(3), gameWithNPlayers(3))
    ];
  } catch (error) {
    console.log("caught err", error);
    allDrivers.forEach((d) => d.quit());
  }
}

async function OneTableNinePlayers() {
  try {
    await gameWithNPlayers(9);
  } catch (error) {
    console.log("caught err", error);
    allDrivers.forEach((d) => d.quit());
  }
}

ThreeTablesThreePlayers();
// OneTableNinePlayers();
