// ══════════════════════════════════════
// FILTER PILLS
// ══════════════════════════════════════
const pills       = document.querySelectorAll('#filterPills .pill');
const cards       = document.querySelectorAll('.card');
const typeFilters  = new Set(['pdf']);
const levelFilters = new Set(['intermediate']);

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    const f       = pill.dataset.filter;
    const isType  = ['pdf', 'image'].includes(f);
    const isLevel = ['beginner', 'intermediate', 'advanced'].includes(f);

    if (isType || isLevel) {
      const set = isType ? typeFilters : levelFilters;
      if (set.has(f)) {
        set.delete(f);
        pill.className = 'pill pill-outline';
      } else {
        set.add(f);
        pill.className = isType ? 'pill pill-filled' : 'pill pill-active-outline';
      }
    }
    applyFilters();
  });
});

function applyFilters() {
  cards.forEach(card => {
    const t      = card.dataset.type;
    const l      = card.dataset.level;
    const typeOk  = typeFilters.size === 0  || typeFilters.has(t);
    const levelOk = levelFilters.size === 0 || levelFilters.has(l);
    card.style.display = (typeOk && levelOk) ? '' : 'none';
  });
}

// ══════════════════════════════════════
// FILTERS BUTTON TOGGLE
// ══════════════════════════════════════
const filterToggleBtn = document.getElementById('filterToggleBtn');
filterToggleBtn.addEventListener('click', function () {
  const active = this.dataset.active === 'true';
  this.dataset.active = (!active).toString();
});

// ══════════════════════════════════════
// SEARCH — sync desktop & mobile inputs
// ══════════════════════════════════════
function doSearch(query) {
  const q = query.toLowerCase().trim();
  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const meta  = card.querySelector('.card-meta').textContent.toLowerCase();
    card.style.display = (!q || title.includes(q) || meta.includes(q)) ? '' : 'none';
  });
}

const desktopSearchInput = document.getElementById('desktopSearch');
const mobileSearchInput  = document.getElementById('mobileSearch');

if (desktopSearchInput) {
  desktopSearchInput.addEventListener('input', function () {
    doSearch(this.value);
    if (mobileSearchInput) mobileSearchInput.value = this.value;
  });
}

if (mobileSearchInput) {
  mobileSearchInput.addEventListener('input', function () {
    doSearch(this.value);
    if (desktopSearchInput) desktopSearchInput.value = this.value;
  });
}

// mobile search go button
const searchGoBtn = document.querySelector('.search-go-btn');
if (searchGoBtn && mobileSearchInput) {
  searchGoBtn.addEventListener('click', () => doSearch(mobileSearchInput.value));
}

// ══════════════════════════════════════
// VIEW DETAILS
// ══════════════════════════════════════
function viewDetail(btn, title) {
  btn.textContent   = 'Loading...';
  btn.style.opacity = '0.6';
  setTimeout(() => {
    btn.textContent   = 'View Details';
    btn.style.opacity = '';
    alert('📄 Membuka: ' + title);
  }, 700);
}

// ══════════════════════════════════════
// SIDEBAR CARDS
// ══════════════════════════════════════
document.querySelectorAll('.s-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('.s-card-title').textContent;
    alert('📄 Membuka: ' + title);
  });
});

// ══════════════════════════════════════
// BOTTOM NAV — active state
// ══════════════════════════════════════
document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.bottom-nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});