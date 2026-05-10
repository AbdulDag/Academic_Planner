const MSG_TOGGLE = 'AP_TOGGLE_SIDEBAR';

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  const url = tab.url || '';
  if (!url.startsWith('https://calendar.google.com/')) return;

  chrome.tabs.sendMessage(tab.id, { type: MSG_TOGGLE }, () => {
    void chrome.runtime.lastError;
  });
});
