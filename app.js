
// app.js
document.addEventListener('DOMContentLoaded', () => {
    const catSelect = document.getElementById('category');
    const gen = document.getElementById('generate');
    const cpy = document.getElementById('copy');
    const qEl = document.getElementById('quote');
    const aEl = document.getElementById('author');
    const quoteCard = document.querySelector('.quote-card');
    const wa = document.getElementById('whatsapp');
    const th = document.getElementById('threads');
    const xs = document.getElementById('xshare');
    const tm = document.getElementById('themeToggle');
    const root = document.documentElement;
    const loadingIndicator = qEl;

    let categories = [];
    let loadedQuotesCache = {};
    let currentQuoteText = '';

    const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch data:", error);
            qEl.textContent = "Failed to load quotes. Please try again later.";
            aEl.textContent = "— Error";
            return null;
        }
    }

    function updateShareLinks() {
        const encodedText = encodeURIComponent(currentQuoteText);
        wa.href = `https://api.whatsapp.com/send?text=${encodedText}`;
        th.href = `https://threads.net/intent/post?text=${encodedText}`;
        xs.href = `https://x.com/intent/tweet?text=${encodedText}`;
    }

    function displaySingleQuote(quotesArray) {
        if (!quotesArray || quotesArray.length === 0) {
            qEl.textContent = "No quotes found for this category.";
            aEl.textContent = "—";
            currentQuoteText = "";
            return;
        }
        const { quote, by } = rnd(quotesArray);
        qEl.textContent = quote;
        aEl.textContent = `— ${by}`;
        currentQuoteText = `"${quote}" — ${by}`;
        updateShareLinks();

        quoteCard.classList.remove('fade-in');
        requestAnimationFrame(() => { quoteCard.classList.add('fade-in'); });
    }

    async function getQuotesForCategory(categoryName) {
        if (loadedQuotesCache[categoryName]) {
            return loadedQuotesCache[categoryName];
        }

        const categoryInfo = categories.find(c => c.name === categoryName);
        if (!categoryInfo || !categoryInfo.file) {
            console.error(`Category info not found for ${categoryName}`);
            return null;
        }

        loadingIndicator.textContent = "Loading quotes...";
        const filePath = `data/${categoryInfo.file}`;
        const quotes = await fetchData(filePath);

        if (quotes) {
            loadedQuotesCache[categoryName] = quotes;
        } else {
            loadingIndicator.textContent = "Failed to load.";
        }

        return quotes;
    }

    async function showNewQuote() {
        const selectedCategoryName = catSelect.value;
        const quotesArray = await getQuotesForCategory(selectedCategoryName);
        if (quotesArray) {
            displaySingleQuote(quotesArray);
        }
    }

    function copyToClipboard() {
        if (!currentQuoteText) return;
        navigator.clipboard.writeText(currentQuoteText).then(() => {
            const originalIcon = cpy.innerHTML;
            cpy.innerHTML = '<i class="fas fa-check"></i>';
            cpy.style.color = '#28a745';
            setTimeout(() => {
                cpy.innerHTML = originalIcon;
                cpy.style.color = '';
            }, 1500);
        }).catch(err => { console.error('Failed to copy: ', err); });
    }

    function toggleTheme() {
        const isLight = root.classList.toggle('light');
        tm.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('quoteAppTheme', isLight ? 'light' : 'dark');
    }

    async function initialize() {
        const savedTheme = localStorage.getItem('quoteAppTheme');
        if (savedTheme === 'light') {
            root.classList.add('light');
            tm.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            root.classList.remove('light');
            tm.innerHTML = '<i class="fas fa-sun"></i>';
        }

        categories = await fetchData('data/categories.json');
        if (!categories) {
            catSelect.disabled = true;
            qEl.textContent = "Could not load quote categories.";
            aEl.textContent = "— Error";
            return;
        }

        catSelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            catSelect.appendChild(option);
        });

        await showNewQuote();
        gen.addEventListener('click', showNewQuote);
        cpy.addEventListener('click', copyToClipboard);
        catSelect.addEventListener('change', showNewQuote);
        tm.addEventListener('click', toggleTheme);
    }

    initialize();
});
