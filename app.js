document.addEventListener("DOMContentLoaded", () => {
  // --- Fonts ---
  const defaultFonts = ['Playfair Display', 'Poppins'];
  const fontMap = {
    inspiration: ['Playfair Display', 'Poppins'],
    motivation: ['Montserrat', 'Roboto Slab'],
    positivethinking: ['Lora', 'Nunito'],
    happiness: ['Bree Serif', 'Poppins'],
    love: ['Dancing Script', 'Poppins'],
    gratitude: ['Merriweather', 'Lato'],
    resilience: ['Ubuntu', 'Open Sans'],
    courage: ['Oswald', 'Lato'],
    change: ['Quicksand', 'Roboto Slab'],
    lifelessons: ['Crimson Text', 'Nunito'],
    dreams: ['Josefin Slab', 'Poppins'],
    kindness: ['Cabin', 'Poppins'],
    beauty: ['Cormorant Garamond', 'Poppins'],
    wisdom: ['Georgia', 'Open Sans'],
    sufiwisdom: ['Noto Nastaliq Urdu', 'Poppins'],
    truth: ['Libre Baskerville', 'Poppins'],
    time: ['Abel', 'Roboto'],
    mortality: ['Spectral', 'Lora'],
    freedom: ['Merriweather', 'Roboto'],
    society: ['Fira Sans', 'Roboto Slab'],
    learning: ['EB Garamond', 'Poppins'],
    simplicity: ['Source Serif Pro', 'Nunito'],
    selfcare: ['Poppins', 'Poppins'],
    mindfulness: ['Raleway', 'Poppins'],
    selfknowledge: ['PT Serif', 'Roboto'],
    innerpeace: ['Lora', 'Poppins'],
    spirituality: ['Cormorant', 'Poppins'],
    adversity: ['Work Sans', 'Poppins'],
    urdu_aqwal: ['Noto Nastaliq Urdu', 'Noto Nastaliq Urdu'],
    urdu_ashaar: ['Noto Nastaliq Urdu', 'Noto Nastaliq Urdu'],
    goodvibes_affirmations: ['Poppins', 'Poppins'],
    goodvibes_messages: ['Poppins', 'Poppins'],
    oneword: ['Montserrat', 'Montserrat']
  };

  // --- Quotes DB (sample) ---
  const quotes = {
    inspiration: [
      { quote: "You are never too old to set another goal or to dream a new dream.", by: "C.S. Lewis" },
      { quote: "Believe you can and you're halfway there.", by: "Theodore Roosevelt" }
    ],
    motivation: [
      { quote: "Act as if what you do makes a difference. It does.", by: "William James" }
    ],
    goodvibes_affirmations: [
      { message: "I am worthy of love and happiness." }
    ]
    // Add more categories and quotes as needed...
  };

  // --- Categories (static for demo) ---
  const categories = [
    {
      id: "themesEmotions", name: "Themes & Emotions", icon: "fa-lightbulb", children: [
        { id: "inspiration", name: "Inspiration", icon: "fa-sun" },
        { id: "motivation", name: "Motivation", icon: "fa-fire" }
      ]
    },
    {
      id: "specialCollections", name: "Special Collections", icon: "fa-star", children: [
        {
          id: "goodvibes", name: "Good Vibes", icon: "fa-face-smile", children: [
            { id: "goodvibes_affirmations", name: "Affirmations", icon: "fa-sparkles" }
          ]
        }
      ]
    },
    { id: "authorSearchSection", name: "Search by Author", icon: "fa-user", isSearch: true }
  ];

  // --- DOM refs ---
  const qText = document.getElementById("quoteText"),
        qAuth = document.getElementById("quoteAuthor"),
        quoteBox = document.getElementById("quoteBox"),
        quoteMark = document.getElementById("quoteMark"),
        genBtn = document.getElementById("generateBtn"),
        shareBtn = document.getElementById("shareBtn"),
        copyBtn = document.getElementById("copyBtn"),
        themeSw = document.getElementById("themeSwitch"),
        openMenuBtn = document.getElementById("openMenuBtn"),
        categoryModal = document.getElementById("categoryModal"),
        closeMenuBtn = document.getElementById("closeMenuBtn"),
        currentCategory = document.getElementById("currentCategory"),
        categoryMenu = document.getElementById("categoryMenu");

  let selectedCat = "inspiration";

  // --- Render Categories ---
  function renderMenu() {
    categoryMenu.innerHTML = "";
    categories.forEach(cat => {
      if (cat.isSearch) {
        // Search by Author section
        const sec = document.createElement("div");
        sec.className = "section search-section";
        sec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down"></i></button>
          <div class="author-search-wrapper">
            <input id="authorSearch" type="text" placeholder="Type author name…" />
            <ul id="authorList" class="suggestions-list"></ul>
          </div>`;
        categoryMenu.appendChild(sec);
      } else {
        const sec = document.createElement("div");
        sec.className = "section";
        sec.innerHTML = `<button class="section-btn"><i class="fa-solid ${cat.icon} section-icon"></i>${cat.name} <i class="fa-solid fa-chevron-down"></i></button>
          <ul class="section-list"></ul>`;
        const ul = sec.querySelector(".section-list");
        cat.children.forEach(child => {
          if (child.children) {
            // Subcategory
            const li = document.createElement("li");
            li.className = "has-children";
            li.innerHTML = `<span><i class="fa-solid ${child.icon||'fa-angle-right'}"></i> ${child.name} <i class="fa-solid fa-caret-right"></i></span>
              <ul class="nested-list"></ul>`;
            const subul = li.querySelector(".nested-list");
            child.children.forEach(sub => {
              const subli = document.createElement("li");
              subli.innerHTML = `<a href="#" data-cat="${sub.id}"><i class="fa-solid ${sub.icon||'fa-circle'}"></i> ${sub.name}</a>`;
              subul.appendChild(subli);
            });
            ul.appendChild(li);
          } else {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#" data-cat="${child.id}"><i class="fa-solid ${child.icon||'fa-circle'}"></i> ${child.name}</a>`;
            ul.appendChild(li);
          }
        });
        categoryMenu.appendChild(sec);
      }
    });
    // Accordion
    categoryMenu.querySelectorAll('.section-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryMenu.querySelectorAll('.section').forEach(sec => {
          if (sec.querySelector('.section-btn') !== btn) sec.classList.remove('open');
        });
        btn.closest('.section').classList.toggle('open');
      });
    });
    // Subcategory toggles
    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        const li = span.parentElement;
        li.classList.toggle('open');
      });
    });
    // Category selection
    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCat = link.dataset.cat;
        currentCategory.textContent = link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim();
        closeMenu();
        displayQuote();
      });
    });
    // Author search logic
    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorList = categoryMenu.querySelector("#authorList");
    if (authorInput && authorList) {
      authorInput.addEventListener("input", () => {
        const q = authorInput.value.toLowerCase();
        authorList.innerHTML = "";
        // Collect unique authors
        const authors = new Set();
        Object.values(quotes).forEach(arr => arr.forEach(qt => {
          if (qt.by) authors.add(qt.by.trim());
        }));
        Array.from(authors).forEach(name => {
          if (name.toLowerCase().includes(q)) {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
              // Find all quotes by this author
              let found = [];
              Object.values(quotes).forEach(arr => arr.forEach(qt => {
                if ((qt.by || "").toLowerCase() === name.toLowerCase()) found.push(qt);
              }));
              if (found.length) {
                showQuote(found[Math.floor(Math.random() * found.length)], selectedCat);
              }
              authorInput.value = "";
              authorList.innerHTML = "";
              closeMenu();
            });
            authorList.appendChild(li);
          }
        });
      });
    }
  }

  // --- Modal Menu Open/Close ---
  function openMenu() {
    renderMenu();
    categoryModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    categoryModal.classList.remove("open");
    document.body.style.overflow = "";
  }
  openMenuBtn.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", closeMenu);
  categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu();
  });

  // --- Quote display ---
  function showQuote(item, cat) {
    let fonts = fontMap[cat];
    if (!Array.isArray(fonts) || fonts.length !== 2) fonts = defaultFonts;
    const [qFont, aFont] = fonts;
    const txt = item.text || item.quote || item.message || "Quote text missing.";
    const by = item.author || item.by || "";
    qText.style.fontFamily = `'${qFont}', serif, sans-serif`;
    qAuth.style.fontFamily = `'${aFont}', serif, sans-serif`;
    qText.textContent = txt;
    if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
      qAuth.textContent = "";
    } else {
      qAuth.textContent = `- ${by}`;
    }
    // Quotation mark: hide for good vibes/affirmations
    if (cat === "goodvibes_affirmations") {
      quoteMark.style.opacity = 0;
    } else {
      quoteMark.style.opacity = 0.18;
    }
  }
  function displayQuote() {
    const pool = quotes[selectedCat] || [];
    if (!pool.length) {
      qText.textContent = "Sorry, no quotes found for this category.";
      qAuth.textContent = "";
      return;
    }
    showQuote(pool[Math.floor(Math.random() * pool.length)], selectedCat);
  }

  // --- Ripple for buttons ---
  [genBtn, shareBtn, copyBtn].forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // --- Share/Copy logic ---
  shareBtn.addEventListener("click", () => {
    const textToShare = `${qText.textContent} ${qAuth.textContent}`.trim();
    if (navigator.share) {
      navigator.share({
        title: 'WOW Quote',
        text: textToShare,
        url: window.location.href
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, "_blank");
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, "_blank");
    }
  });
  copyBtn.addEventListener("click", () => {
    const textToCopy = `${qText.textContent} ${qAuth.textContent}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalIcon = copyBtn.querySelector("i").className;
      copyBtn.querySelector("i").className = "fa-solid fa-check";
      copyBtn.classList.add('copied-feedback');
      setTimeout(() => {
        copyBtn.querySelector("i").className = originalIcon;
        copyBtn.classList.remove('copied-feedback');
      }, 1200);
    });
  });

  // --- Theme switcher ---
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

  // --- Init ---
  displayQuote();
  currentCategory.textContent = "Inspiration";
});
