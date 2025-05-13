// app.js (Production Ready - Incorporating all fixes)
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const qText = document.getElementById("quoteText"),
    qAuth = document.getElementById("quoteAuthor"),
    quoteBox = document.getElementById("quoteBox"),
    quoteMark = document.getElementById("quoteMark"),
    genBtn = document.getElementById("generateBtn"),
    shareBtn = document.getElementById("shareBtn"),
    copyBtn = document.getElementById("copyBtn"),
    favBtn = document.getElementById("favBtn"),
    themeSw = document.getElementById("themeSwitch"),
    openMenuBtn = document.getElementById("openMenuBtn"),
    categoryModal = document.getElementById("categoryModal"),
    closeMenuBtn = document.getElementById("closeMenuBtn"),
    currentCategoryDisplay = document.getElementById("currentCategory"),
    categoryMenu = document.getElementById("categoryMenu"),
    streakBadge = document.getElementById("streakBadge"),
    shareMenu = document.getElementById("shareMenu"),
    submitQuoteModal = document.getElementById("submitQuoteModal"),
    closeSubmitQuoteModal = document.getElementById("closeSubmitQuoteModal"),
    customQuoteForm = document.getElementById("customQuoteForm"),
    submitCustomQuoteBtn = document.getElementById("submitCustomQuoteBtn"),
    quoteFormSuccess = document.getElementById("quoteFormSuccess"),
    favModal = document.getElementById('favModal'),
    closeFavModal = document.getElementById('closeFavModal'),
    favQuotesList = document.getElementById('favQuotesList'),
    specialBanner = document.getElementById('specialBanner'),
    bannerText = document.getElementById('bannerText'),
    closeBannerBtn = document.getElementById('closeBannerBtn'),
    closeFavModalLarge = document.getElementById('closeFavModalLarge'),
    undoBtn = document.getElementById('undoBtn'),
    feedbackBtn = document.getElementById('feedbackBtn'),
    feedbackModal = document.getElementById('feedbackModal'),
    closeFeedbackModal = document.getElementById('closeFeedbackModal'),
    feedbackTextarea = document.getElementById('feedbackTextarea'),
    submitFeedbackBtn = document.getElementById('submitFeedbackBtn'),
    feedbackSuccess = document.getElementById('feedbackSuccess'),
    magicSound = document.getElementById('magicSound'),
    favSound = document.getElementById('favSound'),
    appNotificationElement = document.getElementById('appNotification');

  // Image Generation Modal Elements
  const quoteImagePreviewContainer = document.getElementById('quoteImagePreviewContainer'),
    quoteImageWrapper = document.getElementById('quoteImageWrapper'), // Keep if used for styling wrapper
    quoteImageContent = document.getElementById('quoteImageContent'),
    imageQuoteText = document.getElementById('imageQuoteText'),
    imageQuoteAuthor = document.getElementById('imageQuoteAuthor'),
    imageWatermark = document.getElementById('imageWatermark'),
    downloadImageBtn = document.getElementById('downloadImageBtn'),
    shareGeneratedImageBtn = document.getElementById('shareGeneratedImageBtn'),
    closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn'),
    generateImageShareOption = document.getElementById('generateImageShareOption');

  // --- Global State ---
  let categories = [];
  let quotes = {}; // Stores quotes by category ID
  let authors = {}; // Index for author search
  let selectedCat = "inspiration"; // Default category
  let lastQuote = null; // Stores the current quote object {text, author, category}
  let quoteHistory = []; // Stores last 5 quotes for undo functionality
  let authorMode = false; // True if browsing quotes by a specific author
  let authorQuotes = []; // Array of quotes for the selected author
  let authorName = ""; // Name of the selected author
  let authorQuoteIndex = 0; // Current index for author's quotes
  let debounceTimer = null; // For debouncing author search input
  let currentCanvas = null; // Stores the generated canvas for image sharing
  let previouslyFocusedElement; // For accessibility in modals

  const MAX_QUOTE_HISTORY = 5;
  // IMPORTANT: Replace this with your actual VAPID public key for push notifications
  const VAPID_PUBLIC_KEY = 'BBOTRj3yGFqeY_CAmjIuLbxRX6xKC5TUwAvdpaMppgz8AqSkX9mxs16CHbOVkhS6siGgqgwkEGQSjqM-tGe5A0k';

  const bannerThemes = [
    {cat: "inspiration",    text: "Ignite fresh ideas to fuel your week."},
    {cat: "motivation",     text: "Power up your ambition and take the lead."},
    {cat: "positivethinking", text: "Spotlight on optimism-see possibilities."},
    {cat: "happiness",      text: "Embrace joy in every passing moment."},
    {cat: "love",           text: "Let compassion guide your connections."},
    {cat: "gratitude",      text: "Honor today with a thankful heart."},
    {cat: "resilience",     text: "Stand strong-your strength shines through."},
    {cat: "courage",        text: "Step forward with unwavering bravery."},
    {cat: "change",         text: "Welcome new paths with open arms."},
    {cat: "lifelessons",    text: "Learn, grow, and carry wisdom onward."},
    {cat: "dreams",         text: "Chase bold visions beyond the horizon."},
    {cat: "kindness",       text: "Extend a gesture that brightens someone’s day."},
    {cat: "beauty",         text: "Discover the elegance in simplicity."},
    {cat: "wisdom",         text: "Let insight illuminate your choices."},
    {cat: "sufiwisdom",     text: "Find depth in every sacred whisper."},
    {cat: "truth",          text: "Stand firm in authentic clarity."},
    {cat: "time",           text: "Value each moment’s fleeting gift."},
    {cat: "mortality",      text: "Reflect on life’s precious fragility."},
    {cat: "freedom",        text: "Celebrate the power of choice."},
    {cat: "society",        text: "Shape community with integrity."},
    {cat: "learning",       text: "Feed your mind with new discoveries."},
    {cat: "simplicity",     text: "Simplify to amplify what matters most."},
    {cat: "selfcare",       text: "Prioritize the well-being you deserve."},
    {cat: "mindfulness",    text: "Anchor yourself in this present breath."},
    {cat: "selfknowledge",  text: "Turn inward to unlock your true depth."},
    {cat: "innerpeace",     text: "Cultivate calm amid the daily rush."},
    {cat: "spirituality",   text: "Connect with what lies beyond the seen."},
    {cat: "perseverance",   text: "Advance onward-steady and unyielding."}
  ];
  const bannerStyles = {
    inspiration:    { color: "#7c5df0", icon: "💡" }, motivation:     { color: "#ff9800", icon: "⚡" },
    positivethinking: { color: "#43b581", icon: "🌈" }, happiness:      { color: "#ffd700", icon: "😊" },
    love:           { color: "#e57373", icon: "❤️" }, gratitude:      { color: "#4caf50", icon: "🙏" },
    resilience:     { color: "#2196f3", icon: "🛡️" }, courage:        { color: "#ff5722", icon: "🦁" },
    change:         { color: "#00bcd4", icon: "🔄" }, lifelessons:    { color: "#3f51b5", icon: "📚" },
    dreams:         { color: "#9c27b0", icon: "🌠" }, kindness:       { color: "#8bc34a", icon: "🤝" },
    beauty:         { color: "#f06292", icon: "🌸" }, wisdom:         { color: "#607d8b", icon: "🦉" },
    sufiwisdom:     { color: "#009688", icon: "🕊️" }, truth:          { color: "#795548", icon: "🔎" },
    time:           { color: "#607d8b", icon: "⏳" }, mortality:      { color: "#455a64", icon: "🌑" },
    freedom:        { color: "#00bfae", icon: "🕊️" }, society:        { color: "#ffb300", icon: "🌍" },
    learning:       { color: "#3949ab", icon: "🧠" }, simplicity:     { color: "#bdbdbd", icon: "🍃" },
    selfcare:       { color: "#f48fb1", icon: "🛁" }, mindfulness:    { color: "#aeea00", icon: "🧘" },
    selfknowledge:  { color: "#ab47bc", icon: "🔮" }, innerpeace:     { color: "#81d4fa", icon: "🌊" },
    spirituality:   { color: "#ba68c8", icon: "✨" }, perseverance:   { color: "#6d4c41", icon: "🚀" }
  };

  // --- Utility Functions ---
  function capitalize(str) {
    if (!str) return "";
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  let notificationTimeout;
  function showAppNotification(message, type = 'info', duration = 3000) {
    if (!appNotificationElement) {
        console.warn("App notification element not found. Message:", message);
        return;
    }
    appNotificationElement.textContent = message;
    appNotificationElement.className = 'app-notification show'; // Reset classes
    if (type === 'error') appNotificationElement.classList.add('error');
    else if (type === 'success') appNotificationElement.classList.add('success');

    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      if (appNotificationElement) appNotificationElement.classList.remove('show');
    }, duration);
  }

  async function fetchJSON(url, cacheKey) {
    // Constructs an absolute URL if 'url' is relative (e.g., "data/file.json")
    // Assumes 'url' is relative to the domain root if it doesn't start with http/https.
    const absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.warn(`Invalid JSON in localStorage for ${cacheKey}. Clearing item.`, e);
          localStorage.removeItem(cacheKey);
        }
      }
      const res = await fetch(absoluteUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status} for ${absoluteUrl}`);
      }
      const data = await res.json();
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
          console.warn(`Could not save to localStorage (possibly full) for ${cacheKey}:`, e);
          showAppNotification('Could not save data locally. Storage might be full.', 'error', 5000);
      }
      return data;
    } catch (e) {
      console.error(`Failed to fetch or parse ${absoluteUrl}:`, e.message);
      // Provide a more specific error message if possible
      showAppNotification(`Error loading data from ${url.split('/').pop()}. Check connection.`, 'error', 5000);
      throw e;
    }
  }

  // --- Modal Management ---
  function openModal(modalElement, focusElement) {
    if (!modalElement) {
        console.warn("Attempted to open a null modal element.");
        return;
    }
    previouslyFocusedElement = document.activeElement;
    modalElement.style.display = 'flex'; // Ensure it's visible (especially if initially display:none)
    // Timeout to allow display change to take effect before adding class for transition
    setTimeout(() => {
        modalElement.classList.add('open');
    }, 10); 

    if (focusElement) {
        focusElement.focus();
    } else {
        const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalElement) {
    if (!modalElement) {
        console.warn("Attempted to close a null modal element.");
        return;
    }
    modalElement.classList.remove('open');
    // Set display to none after transition (if your CSS relies on 'open' for display)
    // Or, if your CSS uses display:none for closed state, manage it here.
    // For simplicity, if 'open' class handles opacity/transform, this might be enough.
    // If modals are display:none by default in HTML, you might want to set it back:
    // setTimeout(() => { // Allow transition to finish
    //    if (!modalElement.classList.contains('open')) modalElement.style.display = 'none';
    // }, 300); // Match your CSS transition duration

    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
    }
    // Check if any other modal is open before re-enabling body scroll
    const anyModalOpen = document.querySelector('.modal.open, .image-modal.open');
    if (!anyModalOpen) {
        document.body.style.overflow = "";
    }
  }

  // --- Banner Logic ---
  function showRotatingBanner() {
    if (!specialBanner || !bannerText || !closeBannerBtn || !bannerThemes || bannerThemes.length === 0) {
        console.warn("Banner elements or themes not available.");
        return;
    }
    const today = new Date();
    const startDate = new Date("2025-05-05"); // Ensure this date is in the past or current
    const daysSinceStart = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const idx = daysSinceStart % bannerThemes.length;
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");

    if (lastBannerDate === todayStr && specialBanner.style.display === 'none' && !localStorage.getItem("bannerForceShow")) return;

    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;

    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "block"; // Assuming banner is display:block by default when shown
    specialBanner.style.background = style.color ? style.color : "linear-gradient(90deg, #ffd700 0%, #7c5df0 100%)";
    specialBanner.style.color = style.color && (style.color === "#ffd700" || style.color === "#aeea00") ? "#222" : "#fff";

    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr);
      localStorage.removeItem("bannerForceShow");
    };
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){
          specialBanner.style.display = "none";
          localStorage.setItem("wowBannerDate", todayStr);
          localStorage.removeItem("bannerForceShow");
      }
    }, 8000);

    selectedCat = theme.cat;
    authorMode = false;
    if(currentCategoryDisplay) currentCategoryDisplay.textContent = capitalize(theme.cat);
    localStorage.setItem("wowBannerDate", todayStr); // Store that banner was shown today
    localStorage.setItem("lastAutoSelectedCategory", theme.cat); // Store the category selected by banner
  }

  // --- Data Loading and Processing ---
  async function loadCategoriesAndQuotes() {
    try {
      // Try fetching categories from "data/categories.json" first, then fallback to "categories.json" at root
      try {
        categories = await fetchJSON('data/categories.json', 'wowCategories');
      } catch (e) {
        console.warn("Could not load 'data/categories.json', trying 'categories.json' at root...");
        try {
            categories = await fetchJSON('categories.json', 'wowCategoriesRoot');
        } catch (finalError) {
            showAppNotification('Critical: Could not load category definitions. App may not function.', 'error', 7000);
            if(qText) qText.textContent = "Error: Main category file (categories.json) could not be loaded.";
            if(qAuth) qAuth.textContent = "";
            return; // Essential data missing
        }
      }

      if (!categories || categories.length === 0) {
        console.error("CRITICAL: categories.json is empty or could not be loaded.");
        showAppNotification("Error: No categories found. App may not function correctly.", 'error', 7000);
        if(qText) qText.textContent = "Error: Category data missing. Please check file paths and content.";
        if(qAuth) qAuth.textContent = "";
        return;
      }

      const quotePromises = [];
      function collectCategoriesAndFetchQuotes(catArray) {
        catArray.forEach(cat => {
          if (cat.children) {
            collectCategoriesAndFetchQuotes(cat.children); // Recursively process children
          } else if (cat.file) {
            // cat.file is like "data/quotes_inspiration.json".
            // This path is assumed to be relative to the domain root.
            const primaryFilePath = cat.file; 
            
            const fetchAndProcessQuoteFile = async (filePath, cacheKeyPrefix) => {
                try {
                    // fetchJSON handles constructing the full URL.
                    const data = await fetchJSON(filePath, cacheKeyPrefix + cat.id);
                    if (Array.isArray(data)) {
                        quotes[cat.id] = data;
                        buildAuthorIndex(data, cat.id);
                        return true; // Success
                    }
                    console.warn(`Invalid data structure in ${filePath} for category ${cat.id}. Expected array. Received:`, typeof data, data);
                    return false; // Data structure error
                } catch (err) {
                    // fetchJSON already shows a notification for this specific file fetch error
                    return false; // Fetch error
                }
            };

            // Attempt to fetch the primary file path
            quotePromises.push(
                fetchAndProcessQuoteFile(primaryFilePath, `wowQuotes_${cat.id}_`)
                  .then(success => {
                    // If primary failed and it started with "data/", try fallback by removing "data/"
                    if (!success && primaryFilePath && primaryFilePath.startsWith('data/')) {
                        const fallbackFilePath = primaryFilePath.substring(5); // e.g., "quotes_inspiration.json"
                        console.warn(`Failed to load ${primaryFilePath}, trying fallback ${fallbackFilePath}`);
                        return fetchAndProcessQuoteFile(fallbackFilePath, `wowQuotesRoot_${cat.id}_`);
                    }
                    return success; // Return success status of primary or (if attempted) fallback
                  })
            );
          }
        });
      }
      collectCategoriesAndFetchQuotes(categories);

      // Load user-submitted quotes from localStorage
      const userQuotesRaw = localStorage.getItem('userQuotes');
      if (userQuotesRaw) {
        try {
            const userQuotesData = JSON.parse(userQuotesRaw);
            if (Array.isArray(userQuotesData)) {
                quotes['user'] = userQuotesData; // Assuming 'user' is a valid category ID for these
                buildAuthorIndex(userQuotesData, 'user');
            }
        } catch (e) {
            console.warn("Error parsing userQuotes from localStorage", e);
            localStorage.removeItem('userQuotes'); // Remove corrupted data
        }
      }
      
      await Promise.all(quotePromises); // Wait for all quote files to be fetched and processed

      // Check if any quotes were loaded at all
      if (Object.keys(quotes).length === 0) {
          // This condition might be too strict if userQuotes is the only source and it's empty.
          // Consider checking if ANY category defined in categories.json actually has quotes.
          let hasAnyQuotes = false;
          for (const catId in quotes) {
              if (quotes[catId] && quotes[catId].length > 0) {
                  hasAnyQuotes = true;
                  break;
              }
          }
          if (!hasAnyQuotes) {
            if(qText) qText.textContent = "No quote data could be loaded. Please check your connection or data files.";
            if(qAuth) qAuth.textContent = "";
            showAppNotification("No quotes could be loaded. The app might be empty.", 'error', 7000);
          }
      }
    } catch (err) {
      console.error('CRITICAL FAILURE in loadCategoriesAndQuotes:', err);
      showAppNotification('A critical error occurred while loading app data. Please refresh.', 'error', 7000);
      if(qText) qText.textContent = "A critical error occurred. Please refresh the page.";
      if(qAuth) qAuth.textContent = "";
    }
  }

  function buildAuthorIndex(quoteList, categoryId) {
    if (!Array.isArray(quoteList)) {
        console.warn(`Skipping author indexing for category ${categoryId}: quoteList is not an array.`);
        return;
    }
    quoteList.forEach(quote => {
      const by = (quote.author || quote.by || "").trim();
      if (by) {
        const authorKey = by.toLowerCase();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          author: by,
          category: categoryId // Store category for context if needed later
        });
      }
    });
  }

  // --- Menu Rendering and Interaction ---
  function renderMenu() {
    if (!categoryMenu) {
        console.error("Category menu DOM element not found. Cannot render menu.");
        return;
    }
    if (!categories || categories.length === 0) {
        categoryMenu.innerHTML = "<p style='padding:1rem; text-align:center;'>Categories not loaded.</p>";
        return;
    }

    categoryMenu.innerHTML = ""; // Clear previous menu
    
    function renderCategoryList(catArray, parentUlElement) {
      catArray.forEach(cat => {
        if (cat.isSearch) { // Special item for Author Search
          const searchSectionHTML = `
            <div class="section search-section">
              <button class="section-btn" aria-expanded="false" aria-controls="authorSearchWrapper-${cat.id || 'search'}">
                <i class="fa-solid ${cat.icon || 'fa-user'} section-icon"></i>${cat.name || 'Search by Author'}
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <div id="authorSearchWrapper-${cat.id || 'search'}" class="author-search-wrapper" style="display: none;">
                <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" aria-label="Search by author name" />
                <ul id="authorList" class="suggestions-list" role="listbox"></ul>
              </div>
            </div>`;
          parentUlElement.insertAdjacentHTML('beforeend', searchSectionHTML);

          // Add other static items if they are structured this way in categories.json
          // For now, assuming only author search is marked with isSearch.
          // The other static items (Favorites, Submit) are added after the loop.

        } else { // Regular categories (potentially with children)
          const sectionId = `section-list-${cat.id || Math.random().toString(36).substring(2,9)}`;
          const sectionHTML = `
            <div class="section">
              <button class="section-btn" aria-expanded="false" aria-controls="${sectionId}">
                ${cat.icon ? `<i class="fa-solid ${cat.icon} section-icon" aria-hidden="true"></i>` : ""}
                ${cat.name} <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <ul class="section-list" id="${sectionId}" style="display: none;"></ul>
            </div>`;
          parentUlElement.insertAdjacentHTML('beforeend', sectionHTML);
          const currentSectionDiv = parentUlElement.lastElementChild;
          const ulForChildren = currentSectionDiv.querySelector(".section-list");

          if (cat.children && ulForChildren) { // If it has children, render them
            cat.children.forEach(child => {
              const li = document.createElement("li");
              if (child.children) { // Nested sub-categories (e.g., Urdu -> Aqwal/Ashaar)
                li.className = "has-children";
                const subSectionId = `subsection-list-${child.id || Math.random().toString(36).substring(2,9)}`;
                li.innerHTML = `<span role="button" tabindex="0" aria-expanded="false" aria-controls="${subSectionId}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}" aria-hidden="true"></i>` : ""}
                  ${child.name} <i class="fa-solid fa-caret-right" aria-hidden="true"></i>
                </span>
                <ul class="nested-list" id="${subSectionId}" style="display: none;"></ul>`;
                const subUl = li.querySelector(".nested-list");
                if (subUl) {
                    child.children.forEach(sub => {
                      const subLi = document.createElement("li");
                      subLi.innerHTML = `<a href="#" data-cat="${sub.id}">
                        ${sub.icon ? `<i class="fa-solid ${sub.icon}" aria-hidden="true"></i>` : ""}
                        ${sub.name}
                      </a>`;
                      subUl.appendChild(subLi);
                    });
                }
              } else { // Direct child category (leaf node)
                li.innerHTML = `<a href="#" data-cat="${child.id}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}" aria-hidden="true"></i>` : ""}
                  ${child.name}
                </a>`;
              }
              ulForChildren.appendChild(li);
            });
          }
        }
      });
    }

    renderCategoryList(categories, categoryMenu);

    // Add static menu items (View Favorites, My Favorites Category, Submit Quote)
    // These are not part of the dynamic categories.json structure for iteration.
    const favSectionHTML = `
        <div class="section">
            <button class="section-btn" id="viewFavoritesBtn"><i class="fa-solid fa-heart section-icon" aria-hidden="true"></i>View Favorites</button>
        </div>`;
    categoryMenu.insertAdjacentHTML('beforeend', favSectionHTML);

    const myFavCatHTML = `
        <div class="section">
            <button class="section-btn" id="myFavoritesCategoryBtn"><i class="fa-solid fa-star section-icon" aria-hidden="true"></i>Quotes from My Favorites</button>
        </div>`;
    categoryMenu.insertAdjacentHTML('beforeend', myFavCatHTML);
    
    const submitSectionHTML = `
        <div class="section">
            <button class="section-btn" id="openSubmitQuoteModalBtn"><i class="fa-solid fa-plus section-icon" aria-hidden="true"></i>Submit a Quote</button>
        </div>`;
    categoryMenu.insertAdjacentHTML('beforeend', submitSectionHTML);

    attachMenuEventListeners(); // Attach listeners after HTML is rendered
  }

  function attachMenuEventListeners() {
    if (!categoryMenu) return;

    // Toggle for main category sections (and static buttons like "View Favorites")
    categoryMenu.querySelectorAll('.section > .section-btn').forEach(btn => {
      const listOrWrapper = btn.nextElementSibling; // Could be .author-search-wrapper or .section-list
      
      // If it's a button that directly performs an action (like View Favorites), handle its click
      if (btn.id === 'viewFavoritesBtn') {
        btn.addEventListener("click", () => {
            if (favModal && closeFavModal) openModal(favModal, closeFavModal); else console.error("Favorites modal elements not found");
            showFavorites();
            if (categoryModal) closeModal(categoryModal);
        });
      } else if (btn.id === 'myFavoritesCategoryBtn') {
        btn.addEventListener("click", () => {
            selectedCat = "myfavorites"; // Special category key
            authorMode = false;
            if(currentCategoryDisplay) currentCategoryDisplay.textContent = "My Favorites";
            if (categoryModal) closeModal(categoryModal);
            displayQuote();
        });
      } else if (btn.id === 'openSubmitQuoteModalBtn') {
         btn.addEventListener("click", () => {
            if (submitQuoteModal && customQuoteForm && closeSubmitQuoteModal) {
                openModal(submitQuoteModal, customQuoteForm.elements[0] || closeSubmitQuoteModal);
                customQuoteForm.reset();
                if(quoteFormSuccess) {
                    quoteFormSuccess.style.display = "none";
                    quoteFormSuccess.textContent = "Thank you! Your quote was submitted.";
                }
                const submitBtnText = submitCustomQuoteBtn ? submitCustomQuoteBtn.querySelector('.submit-btn-text') : null;
                const submitSpinner = submitCustomQuoteBtn ? submitCustomQuoteBtn.querySelector('.loader-spinner') : null;
                if(submitBtnText) submitBtnText.style.display = 'inline';
                if(submitSpinner) submitSpinner.style.display = 'none';
                if(submitCustomQuoteBtn) submitCustomQuoteBtn.disabled = false;
            } else {
                console.error("Submit quote modal elements not found");
            }
            if (categoryModal) closeModal(categoryModal);
        });
      } else if (listOrWrapper) { // For expandable sections
        btn.addEventListener('click', function() {
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', !isExpanded);
          listOrWrapper.style.display = isExpanded ? 'none' : 'block';
          const icon = this.querySelector('.fa-chevron-down, .fa-chevron-up');
          if (icon) {
            icon.classList.toggle('fa-chevron-down', isExpanded);
            icon.classList.toggle('fa-chevron-up', !isExpanded);
          }
          if (!isExpanded && listOrWrapper.id && listOrWrapper.id.includes('authorSearchWrapper')) {
            const searchInput = listOrWrapper.querySelector('input#authorSearch');
            if (searchInput) searchInput.focus();
          }
        });
      }
    });

    // Toggle for nested lists (e.g. Urdu -> Aqwal/Ashaar)
    categoryMenu.querySelectorAll('.has-children > span[role="button"]').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent section from closing if span is inside a section button
        const nestedList = this.nextElementSibling;
        if (!nestedList) return;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        nestedList.style.display = isExpanded ? 'none' : 'block';
        const icon = this.querySelector('.fa-caret-right, .fa-caret-down');
        if (icon) {
            icon.classList.toggle('fa-caret-right', isExpanded);
            icon.classList.toggle('fa-caret-down', !isExpanded);
        }
      });
      span.addEventListener('keydown', function(e) { // Accessibility for keyboard
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); this.click();
        }
      });
    });

    // Category link clicks (actual quote categories)
    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const catId = link.dataset.cat;
        if (!catId) return;
        selectedCat = catId;
        authorMode = false;
        if(currentCategoryDisplay) currentCategoryDisplay.textContent = capitalize(link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim());
        if (categoryModal) closeModal(categoryModal);
        displayQuote();
        recordCategoryUse(selectedCat);
      });
    });

    // Author search input
    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorListUL = categoryMenu.querySelector("#authorList");
    if (authorInput && authorListUL) {
      authorInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = authorInput.value.toLowerCase().trim();
          authorListUL.innerHTML = ""; // Clear previous results
          if (!query) return;
          
          const matchedAuthors = Object.keys(authors)
            .filter(nameKey => nameKey.includes(query))
            .sort()
            .slice(0, 10); // Limit results for performance/UX

          if (matchedAuthors.length === 0) {
            authorListUL.innerHTML = '<li style="padding: 0.5rem 1rem; color: var(--light);">No authors found.</li>';
            return;
          }

          matchedAuthors.forEach(nameKey => {
              const li = document.createElement("li");
              li.setAttribute('role', 'option');
              // Display the author's name as stored (original casing)
              li.textContent = authors[nameKey][0].author; 
              li.tabIndex = -1; 
              li.addEventListener("click", () => {
                authorMode = true;
                authorName = nameKey; // Store the lowercase key
                authorQuotes = [...authors[nameKey]]; // Create a copy to avoid modifying original
                authorQuoteIndex = 0;
                if(currentCategoryDisplay) currentCategoryDisplay.textContent = "Author: " + authors[nameKey][0].author;
                if (categoryModal) closeModal(categoryModal);
                showAuthorQuote(); // Display first quote of the author
              });
              authorListUL.appendChild(li);
            });
        }, 300); // Debounce for 300ms
      });
    }
  }

  // Event listeners for opening/closing the main category modal
  if(openMenuBtn && categoryModal) {
    openMenuBtn.addEventListener("click", () => {
      renderMenu(); // Re-render menu each time to ensure it's fresh (especially if categories can change)
      openModal(categoryModal, closeMenuBtn); // Focus the close button upon opening
    });
  }
  if(closeMenuBtn && categoryModal) {
    closeMenuBtn.addEventListener("click", () => closeModal(categoryModal));
  }
  if(categoryModal) { // Close modal if clicking outside of modal-content
    categoryModal.addEventListener("click", (e) => {
      if (e.target === categoryModal) closeModal(categoryModal);
    });
  }

  // --- Quote Submission ---
  if(closeSubmitQuoteModal && submitQuoteModal) {
    closeSubmitQuoteModal.addEventListener('click', () => closeModal(submitQuoteModal));
  }
  if(customQuoteForm && submitCustomQuoteBtn && quoteFormSuccess) {
    customQuoteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
      const spinner = submitCustomQuoteBtn.querySelector('.loader-spinner');

      if(submitBtnText) submitBtnText.style.display = 'none';
      if(spinner) spinner.style.display = 'inline-block';
      submitCustomQuoteBtn.disabled = true;

      // Simulate submission (replace with actual submission logic if you have a backend)
      setTimeout(() => {
          quoteFormSuccess.textContent = "Thank you! Your quote was submitted.";
          quoteFormSuccess.style.display = 'block';
          showAppNotification('Quote submitted successfully!', 'success');
          
          if(submitBtnText) submitBtnText.style.display = 'inline';
          if(spinner) spinner.style.display = 'none';
          submitCustomQuoteBtn.disabled = false;
          customQuoteForm.reset();

          setTimeout(() => {
            quoteFormSuccess.style.display = 'none';
            if (submitQuoteModal) closeModal(submitQuoteModal);
          }, 2500);
      }, 1500);
    });
  } else {
    console.warn("Submit quote form elements not fully available.");
  }

  // --- Quote Display Logic ---
  function showQuote(item, category, fromUndo = false) {
    if (!item || (typeof item.text === 'undefined' && typeof item.quote === 'undefined' && typeof item.message === 'undefined')) {
        const noQuoteMsg = "No quote available for this selection. Try another category or inspire me again!";
        if(qText) qText.textContent = noQuoteMsg;
        if(qAuth) qAuth.textContent = "";
        showAppNotification(noQuoteMsg, 'info');
        lastQuote = null; // Clear lastQuote
        if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
        updateFavoriteButtonState(); // Update fav button based on no quote
        return;
    }

    // Add to history if it's a new quote (not from undo) and there was a previous quote
    if (!fromUndo && lastQuote) {
      quoteHistory.unshift(lastQuote); // Add previous quote to start of history
      if (quoteHistory.length > MAX_QUOTE_HISTORY) quoteHistory.length = MAX_QUOTE_HISTORY; // Trim history
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";

    // Fade out animation
    if(qText) qText.classList.add('fade-out');
    if(qAuth) qAuth.classList.add('fade-out');

    setTimeout(() => {
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = (item.author || item.by || "").trim();

      if(qText) qText.textContent = txt;
      if(qAuth) {
        qAuth.innerHTML = (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") ? "" : `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
      }
      if(quoteMark) { // Ensure quote mark is visible
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
      }

      // Fade in animation
      if(qText) qText.classList.remove('fade-out');
      if(qAuth) qAuth.classList.remove('fade-out');

      lastQuote = { text: txt, author: by, category: category }; // Update lastQuote
      updateStreak();
      updateFavoriteButtonState(); // Update based on the new quote
    }, 300); // Duration of fade-out
  }

  function showAuthorQuote() {
    if (!authorQuotes || authorQuotes.length === 0) {
      if(qText) qText.textContent = "No quotes found for this author.";
      if(qAuth) qAuth.textContent = "";
      showAppNotification("No quotes found for this author.", 'info');
      lastQuote = null;
      updateFavoriteButtonState();
      return;
    }
    // Cycle through author's quotes
    const quote = authorQuotes[authorQuoteIndex % authorQuotes.length];
    showQuote(quote, quote.category); // Pass the quote's original category
    authorQuoteIndex++;
  }

  function displayQuote() {
    if (authorMode) { // If in author mode, get next quote from that author
      showAuthorQuote();
      return;
    }

    let pool = [];
    const isValidQuote = q => q && (typeof q.text !== 'undefined' || typeof q.quote !== 'undefined' || typeof q.message !== 'undefined');

    if (selectedCat === 'myfavorites') {
      const favsRaw = localStorage.getItem('favQuotes');
      const favs = favsRaw ? JSON.parse(favsRaw) : [];
      pool = favs.filter(isValidQuote);
      if (pool.length === 0) {
        if(qText) qText.textContent = "You have no favorite quotes yet. Add some!";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        updateFavoriteButtonState();
        if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
        return;
      }
    } else if (selectedCat === 'user' && quotes['user'] && Array.isArray(quotes['user'])) {
      pool = quotes['user'].filter(isValidQuote);
    } else if (quotes[selectedCat] && Array.isArray(quotes[selectedCat])) {
      pool = quotes[selectedCat].filter(isValidQuote);
    }


    // Fallback if selected category is empty or invalid, try to use all available quotes
    if (!pool || pool.length === 0) {
        console.warn(`No quotes in category "${selectedCat}" or category data missing. Falling back to all available quotes.`);
        const allQuotesRaw = Object.values(quotes).flat(); // Combine all arrays of quotes
        pool = allQuotesRaw.filter(isValidQuote);
        
        if (pool.length > 0 && currentCategoryDisplay) {
            // Optionally update display if we fell back
            // currentCategoryDisplay.textContent = "All Quotes"; 
            // selectedCat = "all_fallback"; // Or some indicator
        }
    }
    
    if (!pool || pool.length === 0) { // If still no quotes after fallback
        const criticalMsg = "No valid quotes available for this selection or any category. Please check data files.";
        if(qText) qText.textContent = criticalMsg;
        if(qAuth) qAuth.textContent = "";
        showAppNotification(criticalMsg, 'error', 5000);
        lastQuote = null;
        updateFavoriteButtonState();
        if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
        console.error("CRITICAL: Pool is empty after all fallbacks. No quotes to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    showQuote(pool[randomIndex], selectedCat); // Pass the actual selectedCat or fallback category
  }
  
  if(undoBtn) {
    undoBtn.addEventListener("click", () => {
      if (quoteHistory.length > 0) {
        const prevQuoteData = quoteHistory.shift(); // Get the most recent historical quote
        // Temporarily store current quote to push to history *after* showing prev
        const currentQuoteForRedo = lastQuote; 
        showQuote(prevQuoteData, prevQuoteData.category, true); // Display it, true means "fromUndo"
        // After showing prev, currentQuoteForRedo is now the "next" if user hits undo again
        // This simple undo doesn't have a "redo" stack, but this prevents current from being lost immediately.
      }
      undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
    });
  }

  // --- UI Effects and Interactions ---
  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0;
      magicSound.play().catch(e => console.warn("Audio play failed (magicSound):", e.name, e.message));
    }
    if(quoteBox) {
        quoteBox.classList.add('glow');
        setTimeout(() => { if(quoteBox) quoteBox.classList.remove('glow'); }, 400);
    }

    const wand = genBtn ? genBtn.querySelector('.magic-wand-icon') : null;
    if (wand) {
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    if(genBtn) {
        genBtn.classList.add('touched'); // For visual feedback
        setTimeout(() => {if(genBtn) genBtn.classList.remove('touched');}, 400);

        // Ripple effect specific to generate button (centered)
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = "50%"; // Center
        ripple.style.top = "50%";  // Center
        genBtn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }
  }

  if(genBtn) {
    genBtn.addEventListener("click", () => { // Removed 'e' as it's not used
        triggerGenerateEffects();
        displayQuote();
    });
  }

  // Ripple effect for other icon buttons
  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn').forEach(btn => {
    if (btn.id === 'generateBtn') return; // Skip generateBtn, it has custom ripple
    btn.style.webkitTapHighlightColor = "transparent"; 
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple'; 
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Share Menu
  if(shareBtn && shareMenu) {
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation(); 
      const isOpening = !shareMenu.classList.contains("open");
      shareMenu.classList.toggle("open");
      shareMenu.style.display = isOpening ? 'flex' : 'none'; // Control display directly
      shareBtn.setAttribute('aria-expanded', isOpening.toString());

      if (isOpening) {
        setTimeout(() => { // Add listeners after current event bubble phase
          document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
          document.addEventListener("keydown", closeShareMenuOnEscape, { once: true });
        }, 0);
      } else {
          document.removeEventListener("click", closeShareMenuOnClickOutside);
          document.removeEventListener("keydown", closeShareMenuOnEscape);
      }
    });
  }

  function closeShareMenu() {
      if (shareMenu && shareMenu.classList.contains("open")) {
        shareMenu.classList.remove("open");
        shareMenu.style.display = 'none';
        if(shareBtn) shareBtn.setAttribute('aria-expanded', 'false');
        document.removeEventListener("click", closeShareMenuOnClickOutside);
        document.removeEventListener("keydown", closeShareMenuOnEscape);
      }
  }
  function closeShareMenuOnClickOutside(event) {
    if (shareMenu && !shareMenu.contains(event.target) && event.target !== shareBtn && (!shareBtn || !shareBtn.contains(event.target))) {
        closeShareMenu();
    } else if (shareMenu && shareMenu.classList.contains("open")) { // If click was inside but menu still open, re-add listener
        document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }
  function closeShareMenuOnEscape(event) {
      if (event.key === "Escape") {
          closeShareMenu();
          if(shareBtn) shareBtn.focus(); 
      } else if (shareMenu && shareMenu.classList.contains("open")) { // If not escape but menu open, re-add
         document.addEventListener("keydown", closeShareMenuOnEscape, { once: true });
      }
  }

  if(shareMenu) {
    shareMenu.querySelectorAll('.share-option').forEach(btn => {
      if (btn.id === 'generateImageShareOption') return; // Handled separately by image generation logic

      btn.addEventListener('click', function() {
        const quoteTextContent = qText ? qText.textContent || "" : "";
        const authorTextContent = lastQuote && lastQuote.author ? lastQuote.author : "";
        const textToShare = `${quoteTextContent}${authorTextContent ? ` — ${authorTextContent}` : ''}`.trim();
        const pageUrl = window.location.href;
        let shareUrl = '';

        switch (btn.dataset.network) {
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}&url=${encodeURIComponent(pageUrl)}`;
            break;
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(textToShare)}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(quoteTextContent.substring(0,100))}...&summary=${encodeURIComponent(textToShare)}`;
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(textToShare + " (via " + pageUrl + ")")}`;
            break;
        }
        if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
        closeShareMenu();
      });
    });
  }

  // Copy to Clipboard
  if(copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (!lastQuote || !lastQuote.text) {
          showAppNotification("No quote to copy.", 'info');
          return;
      }
      const quoteTextContent = qText ? qText.textContent || "" : ""; // Get current text from DOM
      const authorTextContent = lastQuote.author || ""; // Use author from lastQuote object
      const textToCopy = `${quoteTextContent}${authorTextContent ? ` — ${authorTextContent}` : ''}`.trim();

      navigator.clipboard.writeText(textToCopy).then(() => {
        const iconElement = copyBtn.querySelector("i");
        const originalIcon = iconElement ? iconElement.className : "";
        if(iconElement) iconElement.className = "fa-solid fa-check";
        copyBtn.classList.add('copied-feedback');
        const tooltip = copyBtn.querySelector('.btn-tooltip');
        const originalTooltipText = tooltip ? tooltip.textContent : '';
        if(tooltip) tooltip.textContent = "Copied!";
        showAppNotification('Quote copied to clipboard!', 'success', 2000);

        setTimeout(() => {
          if(iconElement && originalIcon) iconElement.className = originalIcon;
          copyBtn.classList.remove('copied-feedback');
          if(tooltip && originalTooltipText) tooltip.textContent = originalTooltipText;
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        showAppNotification('Failed to copy quote. Please try again.', 'error');
        const tooltip = copyBtn.querySelector('.btn-tooltip');
        if(tooltip) {
            const originalTooltipText = tooltip.textContent; // Assuming it's "Copy"
            tooltip.textContent = "Copy failed!";
            setTimeout(() => { if (originalTooltipText) tooltip.textContent = originalTooltipText; }, 2000);
        }
      });
    });
  }

  // Favorite Button
  if(favBtn) {
    favBtn.addEventListener('click', () => {
      if (!lastQuote || !lastQuote.text) {
          showAppNotification("No quote to favorite.", 'info');
          return;
      }

      let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
      const currentQuoteText = lastQuote.text; // Use text from lastQuote object
      const currentAuthorText = lastQuote.author; // Use author from lastQuote object

      // Find if the current quote (text and author match) is already in favorites
      const favIndex = favs.findIndex(q => q.text === currentQuoteText && q.author === currentAuthorText);
      const isFavorited = favIndex !== -1;
      const savedPopup = favBtn.querySelector('.saved-popup');

      if (isFavorited) { // If already favorited, remove it
        favs.splice(favIndex, 1);
        if(savedPopup) savedPopup.textContent = "Unsaved";
        showAppNotification('Quote removed from favorites.', 'info', 2000);
      } else { // If not favorited, add it
        favs.push({ text: currentQuoteText, author: currentAuthorText, category: lastQuote.category });
        if(favSound) favSound.play().catch(e => console.warn("Fav sound play failed", e.name, e.message));
        if(savedPopup) savedPopup.textContent = "Saved!";
        showAppNotification('Quote saved to favorites!', 'success', 2000);
      }

      localStorage.setItem('favQuotes', JSON.stringify(favs));
      updateFavoriteButtonState(); // Update the heart icon

      // Show "Saved!" / "Unsaved!" popup
      if(favBtn) favBtn.classList.add('show-saved-popup');
      setTimeout(() => {
          if(favBtn) favBtn.classList.remove('show-saved-popup');
      }, 1200);
    });
  }

  function updateFavoriteButtonState() {
    if (!favBtn) return;
    const favIcon = favBtn.querySelector("i");
    if (!favIcon) return;

    if (!lastQuote || !lastQuote.text) { // No current quote to check
        favIcon.className = "fa-regular fa-heart"; // Default empty heart
        favBtn.setAttribute('aria-pressed', 'false');
        return;
    }

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    // Check if the *current lastQuote* is in favorites
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    favIcon.className = isFavorited ? "fa-solid fa-heart" : "fa-regular fa-heart";
    favBtn.setAttribute('aria-pressed', isFavorited.toString());
  }

  // Theme Switch
  if(themeSw) {
    const savedTheme = localStorage.getItem("wowDark");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === "true" || (!savedTheme && prefersDark)) {
        themeSw.checked = true;
        document.body.classList.add("dark");
    } else {
        themeSw.checked = false; // Explicitly set if not dark
        document.body.classList.remove("dark");
    }
    themeSw.addEventListener("change", () => {
        const isDark = themeSw.checked;
        document.body.classList.toggle("dark", isDark);
        localStorage.setItem("wowDark", isDark.toString());
    });
  }

  // Streak Logic
  function updateStreak() {
    const today = new Date().toISOString().slice(0,10);
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    if (streak.last !== today) { // If last visit was not today
      streak.count = (streak.last === getYesterday()) ? streak.count + 1 : 1; // Increment or reset to 1
      streak.last = today;
      localStorage.setItem('wowStreak', JSON.stringify(streak));
    }
    showStreak(streak.count);
  }

  function showStreak(count) {
    if (!streakBadge) return;
    if (count > 1) {
        streakBadge.innerHTML = `🔥 <span class="streak-count">${count}</span> day streak!`;
        streakBadge.style.display = 'inline-flex'; // Make it visible
    } else {
        streakBadge.textContent = ''; // Clear content
        streakBadge.style.display = 'none'; // Hide it
    }
  }

  // --- Feedback Modal ---
  if(feedbackBtn && feedbackModal && feedbackTextarea && submitFeedbackBtn && closeFeedbackModal && feedbackSuccess) {
    feedbackBtn.addEventListener('click', () => {
      openModal(feedbackModal, feedbackTextarea);
      feedbackTextarea.value = '';
      feedbackSuccess.style.display = 'none';
      feedbackSuccess.textContent = "Thank you for your feedback!"; // Reset message
      
      const feedbackSubmitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
      const feedbackSpinner = submitFeedbackBtn.querySelector('.loader-spinner');
      if(feedbackSubmitBtnText) feedbackSubmitBtnText.style.display = 'inline';
      if(feedbackSpinner) feedbackSpinner.style.display = 'none';
      submitFeedbackBtn.disabled = false;
    });
    closeFeedbackModal.addEventListener('click', () => closeModal(feedbackModal));

    submitFeedbackBtn.addEventListener('click', async () => {
      const feedback = feedbackTextarea.value.trim();
      if (!feedback) {
          feedbackTextarea.placeholder = "Please enter your feedback first!";
          showAppNotification('Please enter your feedback before submitting.', 'info');
          setTimeout(() => { feedbackTextarea.placeholder = "Your feedback...";}, 2000);
          return;
      }

      const submitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
      const spinner = submitFeedbackBtn.querySelector('.loader-spinner');
      if(submitBtnText) submitBtnText.style.display = 'none';
      if(spinner) spinner.style.display = 'inline-block';
      submitFeedbackBtn.disabled = true;

      // Simulate submission
      setTimeout(async () => {
              feedbackSuccess.textContent = "Thank you for your feedback!";
              feedbackSuccess.style.display = 'block';
              showAppNotification('Feedback submitted. Thank you!', 'success');
              
              feedbackTextarea.value = '';
              if(submitBtnText) submitBtnText.style.display = 'inline';
              if(spinner) spinner.style.display = 'none';
              submitFeedbackBtn.disabled = false;
              setTimeout(() => {
                  feedbackSuccess.style.display = 'none';
                  closeModal(feedbackModal);
              }, 2500);
      }, 1500);
    });
  } else {
    console.warn("Feedback modal elements not fully available.");
  }

  // --- Favorites Modal ---
  if(closeFavModal && favModal) closeFavModal.addEventListener('click', () => closeModal(favModal));
  if (closeFavModalLarge && favModal) closeFavModalLarge.addEventListener('click', () => closeModal(favModal));

  function showFavorites() {
    if (!favQuotesList) {
        console.warn("Favorites list element not found.");
        return;
    }
    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favQuotesList.innerHTML = favs.length
      ? favs.map((q, idx) => `
        <div class="fav-quote" data-index="${idx}" role="listitem">
          <p>${q.text}</p>
          <p class="author">${q.author ? `&#8213; ${q.author}` : ''}</p>
          <div class="fav-actions">
            <button class="fav-action-btn remove-fav-btn" title="Remove from Favorites" aria-label="Remove quote by ${q.author || 'Unknown'} from favorites"><i class="fa-solid fa-trash"></i></button>
            <button class="fav-action-btn copy-fav-btn" title="Copy Quote" aria-label="Copy quote by ${q.author || 'Unknown'}"><i class="fa-solid fa-copy"></i></button>
            <button class="fav-action-btn share-fav-btn" title="Share Quote" aria-label="Share quote by ${q.author || 'Unknown'}"><i class="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
      `).join('')
      : "<p style='padding: 1rem; text-align:center;'>No favorites yet. Click the heart icon on a quote to save it!</p>";

      // Add event listeners to newly created buttons
      favQuotesList.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.closest('.fav-quote').dataset.index);
            removeFavorite(index);
        });
      });
      favQuotesList.querySelectorAll('.copy-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];
            if (favoriteQuoteObject) {
                copyFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author, this);
            }
        });
      });
      favQuotesList.querySelectorAll('.share-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];
            if (favoriteQuoteObject) {
                shareFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author);
            }
        });
      });
  }

  // Make these functions available for inline calls from dynamically generated HTML
  // Consider refactoring to use event delegation on favQuotesList if preferred.
  window.removeFavorite = function(idx) {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites(); // Re-render list
    updateFavoriteButtonState(); // Update main heart icon if current quote was removed
    showAppNotification('Favorite removed.', 'info', 2000);
  };
  window.copyFavorite = function(text, cleanAuthor, buttonElement) {
    const textToCopy = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        if(buttonElement){ // Visual feedback on the button itself
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fa-solid fa-check" style="color: var(--green-accent);"></i>';
            setTimeout(() => { buttonElement.innerHTML = originalIconHTML; }, 1200);
        }
        showAppNotification('Favorite copied!', 'success', 2000);
    }).catch(err => {
        console.error("Copying favorite failed:", err);
        showAppNotification('Failed to copy favorite.', 'error');
    });
  };
  window.shareFavorite = function(text, cleanAuthor) {
    const shareText = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    if (navigator.share) {
      navigator.share({ title: `Quote by ${cleanAuthor || 'Words of Wisdom'}`, text: shareText, url: window.location.href })
        .then(() => showAppNotification('Favorite shared!', 'success', 2000))
        .catch(err => {
            if (err.name !== 'AbortError') { // Don't show error if user cancels share
                console.error("Sharing favorite failed:", err);
                showAppNotification('Could not share favorite.', 'error');
            }
        });
    } else { // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareText).then(() => {
            showAppNotification("Quote copied! You can now paste it to share.", 'info', 3000);
        }).catch(() => {
            showAppNotification("Could not copy quote for sharing. Please try manually.", 'error');
        });
    }
  };

  // --- Global Keydown Listener for Escape ---
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      // Check image preview modal first as it's on top and has specific close logic
      if (quoteImagePreviewContainer && quoteImagePreviewContainer.classList.contains('open')) {
          closeImagePreview();
      } else { // Then check other general modals
          const openModals = document.querySelectorAll('.modal.open');
          if (openModals.length > 0) {
              const topModal = openModals[openModals.length - 1]; // Get the topmost general modal
              closeModal(topModal);
          } else if (shareMenu && shareMenu.classList.contains("open")) { // Then check share menu
              closeShareMenu();
              if(shareBtn) shareBtn.focus(); // Return focus to share button
          }
      }
    }
  });

  // --- Usage Tracking (Basic) ---
  function recordCategoryUse(cat) {
    if (!cat) return;
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    usage[cat] = (usage[cat] || 0) + 1;
    localStorage.setItem('catUsage', JSON.stringify(usage));
  }
  function getMostUsedCategory() {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    if (Object.keys(usage).length === 0) return null; // No usage data
    // Find the category with the highest count
    const sortedUsage = Object.entries(usage).sort(([,a],[,b]) => b-a);
    return sortedUsage[0][0]; // Return the ID of the most used category
  }

  // --- Push Notifications (Helper and Subscription Logic) ---
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  async function requestAndSubscribePushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      showAppNotification('Push notifications are not supported by your browser.', 'info');
      return null;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showAppNotification('Notification permission was denied.', 'info');
        return null;
      }

      const registration = await navigator.serviceWorker.ready; // Wait for SW to be ready
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'BBOTRj3yGFqeY_CAmjIuLbxRX6xKC5TUwAvdpaMppgz8AqSkX9mxs16CHbOVkhS6siGgqgwkEGQSjqM-tGe5A0k') {
            console.error('VAPID_PUBLIC_KEY is not set or is the default placeholder. Cannot subscribe to push notifications.');
            showAppNotification('Push notification setup error (Admin: VAPID key missing).', 'error');
            return null;
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        console.log('New Push Subscription: ', JSON.stringify(subscription));
        // TODO: Send the 'subscription' object to your backend server to store it.
        // Example: sendSubscriptionToServer(subscription); 
        showAppNotification('Subscribed to daily quote notifications!', 'success');
      } else {
        console.log('Existing Push Subscription found.');
        // Optionally, re-send to server to ensure it's up-to-date if your app logic requires it.
      }
      return subscription;
    } catch (error) {
      console.error('Error during push notification subscription:', error);
      showAppNotification(`Failed to subscribe to notifications: ${error.message}`, 'error');
      return null;
    }
  }
  // function sendSubscriptionToServer(subscription) { /* ... AJAX call to your backend ... */ }
  // Example: Call requestAndSubscribePushNotifications() when a user clicks a "Subscribe to Daily Quotes" button/toggle.
  // For now, it's not called automatically.

  // --- Image Generation Feature ---
  function adjustTextToFit({ textElement, containerElement, authorElement, initialFontSize = 64, minQuoteFontSize = 28, maxFontSize = 90 }) {
      if(!textElement || !containerElement) return;

      textElement.style.fontSize = initialFontSize + 'px';
      textElement.style.lineHeight = '1.3'; // Default line height

      const containerStyle = getComputedStyle(containerElement);
      const containerPaddingTop = parseFloat(containerStyle.paddingTop) || 0;
      const containerPaddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
      const containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
      const containerPaddingRight = parseFloat(containerStyle.paddingRight) || 0;
      
      const targetWidth = containerElement.clientWidth - containerPaddingLeft - containerPaddingRight;
      
      let authorActualHeight = 0;
      let authorFontSize = 18; // Default author font size
      if (authorElement && getComputedStyle(authorElement).display !== 'none') {
          const authorStyle = getComputedStyle(authorElement);
          authorActualHeight = authorElement.offsetHeight + (parseFloat(authorStyle.marginTop) || 0) + (parseFloat(authorStyle.marginBottom) || 0);
          authorFontSize = parseFloat(authorStyle.fontSize) || 18;
      }
      
      // Ensure quote font size is reasonably larger than author's
      const effectiveMinQuoteFontSize = Math.max(minQuoteFontSize, authorFontSize + 6);
      const textMarginBottom = parseFloat(getComputedStyle(textElement).marginBottom) || 0;
      const targetHeight = containerElement.clientHeight - containerPaddingTop - containerPaddingBottom - authorActualHeight - textMarginBottom;

      let currentFontSize = initialFontSize;

      const checkOverflow = () => {
          textElement.style.fontSize = currentFontSize + 'px';
          // Check both scrollHeight and scrollWidth against target dimensions
          return textElement.scrollHeight > targetHeight || textElement.scrollWidth > targetWidth;
      };

      // Reduce font size until it fits or hits the minimum
      while (checkOverflow() && currentFontSize > effectiveMinQuoteFontSize) {
          currentFontSize--;
      }
      textElement.style.fontSize = currentFontSize + 'px';

      // If it still overflows at min font size, log a warning
      if (currentFontSize === effectiveMinQuoteFontSize && checkOverflow()) {
          console.warn(`Text might be cut off. Min font size enforced: ${effectiveMinQuoteFontSize}px. Content: "${textElement.textContent.substring(0, 50)}..."`);
      }

      // If text is short, try to make it larger up to maxFontSize
      const quoteLength = textElement.textContent.length;
      if (quoteLength < 120 && currentFontSize < maxFontSize) {
          let testSize = currentFontSize;
          while (testSize < maxFontSize) {
              testSize++;
              textElement.style.fontSize = testSize + 'px';
              if (textElement.scrollHeight > targetHeight || textElement.scrollWidth > targetWidth) {
                  testSize--; // Revert to previous size that fit
                  textElement.style.fontSize = testSize + 'px';
                  break;
              }
          }
          currentFontSize = Math.max(testSize, effectiveMinQuoteFontSize); // Ensure it's not below min
      }
      textElement.style.fontSize = currentFontSize + 'px'; // Final font size
  }

  if (generateImageShareOption && quoteImagePreviewContainer && imageQuoteText && imageQuoteAuthor && quoteImageContent && imageWatermark && downloadImageBtn && shareGeneratedImageBtn && closeImagePreviewBtn && qText && qAuth) {
    generateImageShareOption.addEventListener('click', () => {
      closeShareMenu(); // Close the main share popover first
      if (!lastQuote || !lastQuote.text) {
        showAppNotification("Please generate a quote first to create an image.", 'info');
        return;
      }

      const isDarkMode = document.body.classList.contains('dark');
      imageQuoteText.textContent = lastQuote.text;
      imageQuoteAuthor.textContent = lastQuote.author ? `— ${lastQuote.author}` : '';
      imageQuoteAuthor.style.display = lastQuote.author ? 'block' : 'none'; // Show/hide based on author presence

      // Apply styles from main quote to image quote for consistency (optional)
      const mainQuoteStyle = window.getComputedStyle(qText);
      const mainAuthorStyle = window.getComputedStyle(qAuth);
      imageQuoteText.style.fontFamily = mainQuoteStyle.fontFamily;
      imageQuoteText.style.fontStyle = mainQuoteStyle.fontStyle; // e.g. if main quote text is italic
      if (imageQuoteAuthor.style.display !== 'none') {
        imageQuoteAuthor.style.fontFamily = mainAuthorStyle.fontFamily;
        imageQuoteAuthor.style.fontStyle = mainAuthorStyle.fontStyle;
      }
      
      // Set background and text colors for the image based on theme
      if (isDarkMode) {
        quoteImageContent.style.backgroundColor = 'var(--image-bg-dark, #232336)';
        imageQuoteText.style.color = 'var(--image-text-dark, #f0f0f8)';
        if (imageQuoteAuthor.style.display !== 'none') imageQuoteAuthor.style.color = 'var(--image-author-dark, #b0b0c0)';
        imageWatermark.style.color = 'var(--image-author-dark, #b0b0c0)'; // Watermark color in dark mode
      } else {
        quoteImageContent.style.backgroundColor = 'var(--image-bg-light, #f0f0f3)';
        imageQuoteText.style.color = 'var(--image-text-light, #000000)';
        if (imageQuoteAuthor.style.display !== 'none') imageQuoteAuthor.style.color = 'var(--image-author-text-light, #000000)';
        imageWatermark.style.color = 'var(--image-watermark-light, #555555)'; // Watermark color in light mode
      }

      // Adjust text size after setting content and styles
      adjustTextToFit({
          textElement: imageQuoteText,
          containerElement: quoteImageContent,
          authorElement: imageQuoteAuthor.style.display !== 'none' ? imageQuoteAuthor : null
          // You can pass initialFontSize, minQuoteFontSize, maxFontSize here if needed
      });
      
      openModal(quoteImagePreviewContainer, closeImagePreviewBtn); // Use modal helper
      
      downloadImageBtn.disabled = true; // Disable buttons until canvas is ready
      shareGeneratedImageBtn.disabled = true;

      // Use a small timeout to ensure DOM updates (styles, text) are rendered before html2canvas runs
      setTimeout(() => {
          if (typeof html2canvas === 'undefined') {
              showAppNotification("Image generation library (html2canvas) not loaded.", 'error');
              console.error("html2canvas is not defined. Ensure the script is loaded correctly.");
              closeImagePreview();
              return;
          }
          html2canvas(quoteImageContent, {
              allowTaint: true, // May be needed if using external images/fonts not properly CORS-configured
              useCORS: true,    // Try to use CORS to load images, useful for external resources
              backgroundColor: quoteImageContent.style.backgroundColor, // Explicitly set background
              scale: 2,         // Generate higher resolution image
              logging: false    // Disable html2canvas logging unless debugging
          }).then(canvas => {
              currentCanvas = canvas; // Store the generated canvas
              downloadImageBtn.disabled = false;
              shareGeneratedImageBtn.disabled = false;
          }).catch(err => {
              console.error("Error generating image with html2canvas:", err);
              showAppNotification("Sorry, couldn't generate the image. Please try again.", 'error');
              closeImagePreview(); // Close modal on error
          });
      }, 250); // 250ms delay, adjust if needed
    });
  } else {
    console.warn("Some image generation elements are not available.");
  }

  function closeImagePreview() {
    if (quoteImagePreviewContainer) {
        closeModal(quoteImagePreviewContainer); // Use modal helper
    }
    currentCanvas = null; // Clear stored canvas
  }

  if (closeImagePreviewBtn) closeImagePreviewBtn.addEventListener('click', closeImagePreview);

  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
      if (!currentCanvas) {
          showAppNotification("Image not generated yet or failed.", 'info');
          return;
      }
      const imageURL = currentCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      // Generate a filename
      const authorNameForFile = lastQuote && lastQuote.author ? lastQuote.author.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'Unknown';
      const quoteStartForFile = lastQuote && lastQuote.text ? lastQuote.text.substring(0,20).replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'Quote';
      a.download = `WOW_Quote_${quoteStartForFile}_${authorNameForFile}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showAppNotification('Image download started!', 'success');
    });
  }

  if (shareGeneratedImageBtn) {
    shareGeneratedImageBtn.addEventListener('click', async () => {
      if (!currentCanvas) {
          showAppNotification("Image not generated yet or failed.", 'info');
          return;
      }
      if (navigator.share && navigator.canShare) { // Check if Web Share API is supported
        currentCanvas.toBlob(async (blob) => {
          if (!blob) {
              showAppNotification("Error creating image blob for sharing.", 'error');
              return;
          }
          const authorName = (lastQuote && lastQuote.author) ? lastQuote.author : 'Words of Wisdom';
          const fileName = `WOW_Quote_${((lastQuote && lastQuote.author) || 'Unknown').replace(/[^a-z0-9]/gi, '_')}.png`;
          const filesArray = [ new File([blob], fileName, { type: 'image/png', lastModified: new Date().getTime() }) ];
          
          const shareData = { 
            files: filesArray, 
            title: `Quote by ${authorName}`, 
            text: `"${(lastQuote && lastQuote.text) ? lastQuote.text : ''}" — ${authorName}\nShared via wordsofwisdom.in` 
          };

          try {
            if (navigator.canShare({ files: filesArray })) { // Check if sharing files is supported
                await navigator.share(shareData);
                showAppNotification('Image shared!', 'success');
            } else { // Fallback for browsers that support Web Share but not files
                console.warn("File sharing not supported, falling back to text/URL share.");
                await navigator.share({ title: shareData.title, text: shareData.text, url: window.location.href });
                showAppNotification('Shared quote link!', 'success');
            }
          } catch (err) {
            if (err.name !== 'AbortError') { // Don't show error if user cancels the share dialog
                console.error('Error sharing image:', err);
                showAppNotification('Sharing failed. You can try downloading the image.', 'error');
            }
          }
        }, 'image/png');
      } else {
        showAppNotification('Sharing images this way is not supported on your browser/device. Please download the image to share it.', 'info', 5000);
      }
    });
  }

  // --- App Initialization ---
  (async function initApp(){
    if(qText) qText.textContent = "✨ Loading Wisdom...";
    if(qAuth) qAuth.textContent = "";
    if(quoteMark) { quoteMark.textContent = "“"; quoteMark.style.opacity = 0.18; }

    await loadCategoriesAndQuotes(); // Load all data first
    
    if (categoryMenu) { // Ensure menu DOM element exists
        renderMenu(); // Then render the menu based on loaded categories
    } else {
        console.error("Category menu element not found, cannot render menu on init.");
    }

    let initialCategory = "inspiration"; // Default initial category
    const lastAutoCat = localStorage.getItem("lastAutoSelectedCategory");
    const todayStrInit = new Date().toISOString().slice(0,10);
    const lastBannerDateInit = localStorage.getItem("wowBannerDate");

    // Determine initial category based on banner, then most used, then default
    if (categories && categories.length > 0) { // Ensure categories are loaded before trying to use them
        if (lastBannerDateInit === todayStrInit && lastAutoCat && categories.some(c => c.id === lastAutoCat || (c.children && c.children.some(ch => ch.id === lastAutoCat)))) {
            initialCategory = lastAutoCat;
        } else {
            const mostUsed = getMostUsedCategory();
            if (mostUsed && categories.some(c => c.id === mostUsed || (c.children && c.children.some(ch => ch.id === mostUsed)))) {
                initialCategory = mostUsed;
            }
        }
    }
    selectedCat = initialCategory;
    if (currentCategoryDisplay) currentCategoryDisplay.textContent = capitalize(selectedCat);

    showRotatingBanner(); // This might change selectedCat based on the daily theme

    // Ensure a quote is displayed, respecting banner's potential category change
    // and checking if quotes are actually loaded.
    const quotesAvailable = Object.keys(quotes).length > 0 || (localStorage.getItem('userQuotes') && JSON.parse(localStorage.getItem('userQuotes') || '[]').length > 0);

    if (quotesAvailable) {
        // If no quote is displayed OR if the current quote's category doesn't match the selected one
        // (and the selected one wasn't just set by the banner to the same category as the current quote)
        // then display a new quote.
        const bannerThemeInfo = bannerThemes.find(b => bannerText && b.text === bannerText.textContent);
        const bannerCat = bannerThemeInfo ? bannerThemeInfo.cat : null;

        if (!lastQuote || !lastQuote.text || (lastQuote.category !== selectedCat && selectedCat !== bannerCat) ) {
            displayQuote();
        } else if (!lastQuote && qText && qText.textContent.includes("Loading Wisdom")) {
            // If still showing "Loading Wisdom" and quotes are available but lastQuote is null (e.g. first load after clearing cache)
            displayQuote();
        }
    } else if (qText && qText.textContent.includes("Loading Wisdom")) {
        // If still showing "Loading Wisdom" and no quotes became available
        const noQuotesMsg = "Sorry, we couldn't load any quotes right now. Please check your connection or try again later.";
        qText.textContent = noQuotesMsg;
        if(qAuth) qAuth.textContent = "";
        showAppNotification(noQuotesMsg, 'error', 6000);
    }

    // Initialize streak display and favorite button state
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count); // Display initial streak
    updateFavoriteButtonState(); // Set initial state of fav button

    // Hide the main loading screen once everything is set up
    // This is handled by index.html's inline script after window.load
  })();
});
```

**Key improvements and reminders for this `app.js`:**
1.  **Robust `fetchJSON`**: It now correctly forms absolute URLs, which is more reliable.
2.  **Improved `loadCategoriesAndQuotes`**: Better error handling and path management for fetching category and quote files. It now includes a fallback for `categories.json` and for individual quote files if they are not found in the `data/` subdirectory.
3.  **Modal Management**: `openModal` and `closeModal` are more robust. The image preview modal (`quoteImagePreviewContainer`) should now correctly use these functions.
4.  **Initialization (`initApp`)**:
    * It waits for `loadCategoriesAndQuotes` before rendering the menu and displaying the initial quote.
    * It checks if `categoryMenu` and other critical DOM elements exist before trying to use them.
    * It handles the initial quote display more carefully, considering if quotes were successfully loaded.
5.  **Error Notifications**: More specific error notifications are provided to the user if data loading fails.
6.  **Author Search**: Improved handling for when no authors are found.
7.  **Static Menu Items**: "View Favorites", "My Favorites Category", and "Submit a Quote" are now explicitly added after dynamic categories and have their event listeners correctly attached in `attachMenuEventListeners`.
8.  **Image Generation**:
    * Ensured `html2canvas` is checked for definition before use.
    * Image generation is triggered after a short timeout to allow DOM updates.
9.  **Global Escape Key**: The logic for closing modals with the Escape key now prioritizes the image preview modal if it's open.
10. **VAPID Key**: The placeholder `VAPID_PUBLIC_KEY` is still there. **You must replace this with your own valid VAPID public key if you intend for push notifications to work.**

**Before Deploying:**
* **Thoroughly test** this `app.js` with your updated `index.html`, `sw.js`, and `manifest.json`.
* **Verify all paths** in `categories.json` (for the `file` properties) and ensure they correctly point to your quote JSON files relative to the root of your deployment (e.g., `data/quotes_inspiration.json`).
* **Check the browser console** for any errors during loading and interaction.

This comprehensive `app.js` should provide a much more stable and functional experience. Remember that JavaScript can be sensitive to the order of operations and the availability of DOM elements, so careful testing is k
