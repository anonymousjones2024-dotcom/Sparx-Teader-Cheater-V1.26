document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const input = document.getElementById('apiKey');
  const status = document.getElementById('status');

  chrome.storage.local.get(['geminiKey'], (result) => {
    if (result.geminiKey) input.value = result.geminiKey;
  });

  saveBtn.addEventListener('click', () => {
    const key = input.value.trim();
    if (key) {
      chrome.storage.local.set({ geminiKey: key }, () => {
        status.innerText = "✅ Key Saved! Refresh Sparx.";
        status.style.color = "green";
      });
    }
  });
});