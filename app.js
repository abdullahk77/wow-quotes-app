document.addEventListener("DOMContentLoaded", () => {
  // DOM refs
  const qText = document.getElementById("quoteText"),
        qAuth = document.getElementById("quoteAuthor"),
        quoteBox = document.getElementById("quoteBox"),
        quoteMark = document.getElementById("quoteMark"),
        genBtn = document.getElementById("generateBtn"),
        undoIcon = document.getElementById("undoIcon"),
        shareBtn = document.getElementById("shareBtn"),
        copyBtn = document.getElementById("copyBtn"),
        feedbackBtn = document.getElementById("feedbackBtn"),
        feedbackModal = document.getElementById("feedbackModal"),
        closeFeedback = document.querySelector(".close-feedback"),
        feedbackText = document.getElementById("feedbackText"),
        submitFeedback = document.getElementById("submitFeedback"),
        themeSw = document.getElementById("themeSwitch");

  // Example quotes array (replace with your real quote loading logic)
  const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" }
  ];
  let currentIdx = 0;
  let quoteHistory = [];

  function showQuote(idx, pushHistory = true) {
    const item = quotes[idx];
    if (!item) return;
    qText.textContent = item.text;
    qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${item.author}`;
    if (pushHistory) {
      // Avoid duplicate if user goes back and then forward
      if (!quoteHistory.length || quoteHistory[quoteHistory.length-1] !== idx) {
        quoteHistory.push(idx);
      }
    }
  }

  // Initial quote
  showQuote(currentIdx);

  // Generate (next) quote
  genBtn.addEventListener("click", () => {
    currentIdx = (currentIdx + 1) % quotes.length;
    showQuote(currentIdx);
  });

  // Undo (previous) quote
  undoIcon.addEventListener("click", () => {
    if (quoteHistory.length > 1) {
      quoteHistory.pop(); // remove current
      const prevIdx = quoteHistory[quoteHistory.length - 1];
      currentIdx = prevIdx;
      showQuote(currentIdx, false);
    }
  });

  // Feedback modal logic
  feedbackBtn.addEventListener("click", () => feedbackModal.classList.add("open"));
  closeFeedback.addEventListener("click", () => feedbackModal.classList.remove("open"));
  submitFeedback.addEventListener("click", () => {
    const text = feedbackText.value.trim();
    if (text) {
      window.open(`mailto:info@wordsofwisdom.in?subject=WOW%20Quotes%20Feedback&body=${encodeURIComponent(text)}`);
      feedbackModal.classList.remove("open");
      feedbackText.value = "";
    }
  });

  // Copy/share logic
  copyBtn.addEventListener("click", () => {
    const textToCopy = `${qText.textContent} ${qAuth.textContent}`.trim();
    navigator.clipboard.writeText(textToCopy);
  });
  shareBtn.addEventListener("click", () => {
    const textToShare = `${qText.textContent} ${qAuth.textContent}`.trim();
    if (navigator.share) {
      navigator.share({ title: 'WOW Quote', text: textToShare, url: window.location.href });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, "_blank");
    }
  });

  // Theme switcher
  const savedTheme = localStorage.getItem("wowDark");
  if (savedTheme === "true") {
    themeSw.checked = true;
    document.body.classList.add("dark");
  }
  themeSw.addEventListener("change", () => {
    const isDark = themeSw.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("wowDark", isDark);
  });
});
