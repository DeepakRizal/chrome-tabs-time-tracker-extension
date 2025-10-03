import { getDataFromStorage, setItemToStorage, getTodaysKey } from "./utils.js";

let timeSpent = {};
let currentTab = null;
let startTime = null;

function getHostnameSafely(url) {
  try {
    // Try to create URL object
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    // If invalid (chrome://, about:blank etc.)
    return null;
  }
}

async function logCurrentTime() {
  if (currentTab && startTime) {
    const duration = Date.now() - startTime;

    const url = currentTab.url;
    const hostName = getHostnameSafely(url);

    if (hostName) {
      const todayKey = getTodaysKey();

      if (!timeSpent[todayKey]) timeSpent[todayKey] = {};
      timeSpent[todayKey][hostName] =
        (timeSpent[todayKey][hostName] || 0) + duration;

      console.log(
        `Tab: ${hostName} | Total Time: ${(
          timeSpent[todayKey][hostName] / 1000
        ).toFixed(2)}s`
      );

      await setItemToStorage("timeSpent", timeSpent);
    }
  }
}

//restore old
(async function init() {
  const result = await getDataFromStorage("timeSpent");

  if (result) {
    timeSpent = result;

    console.log("Restored Time Spent: ", timeSpent);
  }
})();

chrome.tabs.onActivated.addListener((activeInfo) => {
  logCurrentTime();

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = { tabId: tab.id, url: tab.url, title: tab.title };
    startTime = Date.now();
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    logCurrentTime();
    startTime = null;
    currentTab = null;
  } else {
    // some window focused — get active tab there
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        currentTab = { id: tabs[0].id, url: tabs[0].url, title: tabs[0].title };
        startTime = Date.now();
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTab && currentTab.id === tabId) {
    logCurrentTime();
  }
  currentTab = null;
  startTime = null;
});
