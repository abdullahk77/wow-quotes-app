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

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = "inspiration";

  // --- Load categories and quotes dynamically ---
  async function loadCategoriesAndQuotes() {
    try {
      // Load categories.json
      const catRes = await fetch('data/categories.json');
      categories = await catRes.json();

      // Load all quote files
      const quotePromises = [];
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) collectCategories(cat.children);
          else if (cat.file) {
            quotePromises.push(
              fetch(cat.file)
                .then(res => res.json())
                .then(data => {
                  quotes[cat.id] = data;
                  buildAuthorIndex(data, cat.id);
                })
            );
          }
        });
      }
      collectCategories(categories);

      await Promise.all(quotePromises);

    } catch (err) {
      console.error('Failed to load categories or quotes:', err);
    }
  }

  function buildAuthorIndex(quoteList, categoryId) {
    quoteList.forEach(quote => {
      const by = quote.author || quote.by;
      if (by) {
        const authorKey = by.toLowerCase().trim();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          category: categoryId
        });
      }
    });
  }

  // --- Render Categories Menu ---
  function renderMenu() {
    categoryMenu.innerHTML = "";
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) {
          // Search by Author section
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down"></i></button>
            <div class="author-search-wrapper">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" />
              <ul id="authorList" class="suggestions-list"></ul>
            </div>`;
          categoryMenu.appendChild(sec);
        } else {
          const sec = document.createElement("div");
          sec.className = "section";
          sec.innerHTML = `<button class="section-btn">
            ${cat.icon ? `<i class="fa-solid ${cat.icon} section-icon"></i>` : ""}
            ${cat.name} <i class="fa-solid fa-chevron-down"></i>
          </button>
          <ul class="section-list"></ul>`;
          const ul = sec.querySelector(".section-list");
          if (cat.children) {
            cat.children.forEach(child => {
              if (child.children) {
                // Subcategory
                const li = document.createElement("li");
                li.className = "has-children";
                li.innerHTML = `<span>
                  ${child.icon ? `<i class="fa-solid ${child.icon}"></i>` : ""}
                  ${child.name} <i class="fa-solid fa-caret-right"></i>
                </span>
                <ul class="nested-list"></ul>`;
                const subul = li.querySelector(".nested-list");
                child.children.forEach(sub => {
                  const subli = document.createElement("li");
                  subli.innerHTML = `<a href="#" data-cat="${sub.id}">
                    ${sub.icon ? `<i class="fa-solid ${sub.icon}"></i>` : ""}
                    ${sub.name}
                  </a>`;
                  subul.appendChild(subli);
                });
                ul.appendChild(li);
              } else {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#" data-cat="${child.id}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}"></i>` : ""}
                  ${child.name}
                </a>`;
                ul.appendChild(li);
              }
            });
          }
          categoryMenu.appendChild(sec);
        }
      });
    }
    renderCategoryList(categories, categoryMenu);

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
        if (!q) return;
        // Collect matching authors
        Object.keys(authors)
          .filter(name => name.includes(q))
          .slice(0, 10)
          .forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
              // Show a random quote by this author
              const found = authors[name];
              if (found && found.length) {
                showQuote(found[Math.floor(Math.random() * found.length)], found[0].category);
              }
              authorInput.value = "";
              authorList.innerHTML = "";
              closeMenu();
            });
            authorList.appendChild(li);
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

  // --- Generate Quote Button ---
  genBtn.addEventListener("click", displayQuote);

  // --- Init ---
  (async function(){
    await loadCategoriesAndQuotes();
    renderMenu();
    displayQuote();
    currentCategory.textContent = "Inspiration";
  })();
});
