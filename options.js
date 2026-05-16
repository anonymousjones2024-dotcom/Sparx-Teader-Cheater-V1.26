document.getElementById('save').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value;
  chrome.storage.local.set({ openAiKey: key }, () => {
    alert('Key saved successfully!');
  });
});