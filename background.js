let currentPageText = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "UPDATE_PAGE") {
    currentPageText = request.text;
    return;
  }

  if (request.type === "GET_ANSWER") {
    chrome.storage.local.get(['geminiKey'], async (result) => {
      const apiKey = result.geminiKey;
      if (!apiKey) { sendResponse({ answer: "No API Key" }); return; }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `CONTEXT FROM CURRENT PAGE: ${currentPageText}\nQUESTION: ${request.question}\nCHOICES: ${request.options}\n\nTASK: Pick the best choice text. Reply with ONLY the exact text.`
              }]
            }],
            generationConfig: { temperature: 0.1 }
          })
        });

        const data = await response.json();
        const ans = data.candidates[0].content.parts[0].text.trim();
        sendResponse({ answer: ans });
      } catch (err) {
        sendResponse({ answer: "API Error" });
      }
    });
    return true; 
  }
});