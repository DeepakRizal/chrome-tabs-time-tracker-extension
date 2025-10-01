let currentTab = null;
let startTime = null;

function logCurrentTime() {
  if (currentTab && startTime) {
    const duration = Date.now() - startTime;

    console.log(`you have stayed in that tab for ${duration / 1000} seconds`);
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  logCurrentTime();

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = { tabId: tab.id, title: tab.title };
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
      console.log(tabs);
    });
  }
});
