document.getElementById('downloadBtn').addEventListener('click', () => {
  const format = document.getElementById('formatSelect').value;
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "downloadSVG", format: format});
  });
}); 