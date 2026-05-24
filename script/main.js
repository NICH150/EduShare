// ══════════════════════════════════════
// FILTER PANEL STATE
// ══════════════════════════════════════
const cards            = document.querySelectorAll('.card');
const filterToggleBtn  = document.getElementById('filterToggleBtn');
const filterPanel      = document.getElementById('filterPanel');
const overlayBackdrop  = document.getElementById('overlayBackdrop');
const filterCloseBtn   = document.getElementById('filterCloseBtn');
const applyBtn         = document.getElementById('applyBtn');
const resetBtn         = document.getElementById('resetBtn');
const filterCount      = document.getElementById('filterCount');
const activeFiltersRow = document.getElementById('activeFiltersRow');

let pendingTypes      = new Set();
let pendingDifficulty = new Set();
let pendingJenjang    = new Set();
let appliedTypes      = new Set();  
let appliedDifficulty = new Set();
let appliedJenjang    = new Set();

const labelMap = {
  pdf:          'PDF Document',
  image:        'Image',
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  sd13:         'SD 1–3',
  sd45:         'SD 4–5',
  smp:          'SMP',
  sma:          'SMA',
};

function isMobile() {
  return window.innerWidth <= 640;
}

// ── Open panel ──
function openPanel() {
  pendingTypes      = new Set(appliedTypes);
  pendingDifficulty = new Set(appliedDifficulty);
  pendingJenjang    = new Set(appliedJenjang);
  syncChips();
  filterPanel.classList.add('open');
  overlayBackdrop.classList.add('open');
  filterToggleBtn.classList.add('active');
  if (isMobile()) document.body.style.overflow = 'hidden';
}

// ── Close panel ──
function closePanel() {
  filterPanel.classList.remove('open');
  overlayBackdrop.classList.remove('open');
  filterToggleBtn.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Sync chip visuals ke pending state ──
function syncChips() {
  document.querySelectorAll('#typeChips .chip').forEach(chip => {
    chip.className = 'chip' + (pendingTypes.has(chip.dataset.filter) ? ' active-type' : '');
  });
  document.querySelectorAll('#levelChips .chip').forEach(chip => {
    chip.className = 'chip' + (pendingDifficulty.has(chip.dataset.filter) ? ' active-level' : '');
  });
  document.querySelectorAll('#jenjangChips .chip').forEach(chip => {
    chip.className = 'chip' + (pendingJenjang.has(chip.dataset.filter) ? ' active-jenjang' : '');
  });
}

// ── Chip click handlers ──
document.querySelectorAll('#typeChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    pendingTypes.has(f) ? pendingTypes.delete(f) : pendingTypes.add(f);
    syncChips();
  });
});

document.querySelectorAll('#levelChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    pendingDifficulty.has(f) ? pendingDifficulty.delete(f) : pendingDifficulty.add(f);
    syncChips();
  });
});

document.querySelectorAll('#jenjangChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    pendingJenjang.has(f) ? pendingJenjang.delete(f) : pendingJenjang.add(f);
    syncChips();
  });
});

// ── Reset ──
resetBtn.addEventListener('click', () => {
  pendingTypes.clear();
  pendingDifficulty.clear();
  pendingJenjang.clear();
  syncChips();
});

// ── Apply filter ──
function applyFilters() {
  appliedTypes      = new Set(pendingTypes);
  appliedDifficulty = new Set(pendingDifficulty);
  appliedJenjang    = new Set(pendingJenjang);

  const total = appliedTypes.size + appliedDifficulty.size + appliedJenjang.size;
  filterCount.textContent = total;
  total > 0 ? filterCount.classList.add('show') : filterCount.classList.remove('show');

  renderActiveTags();
  filterCards();
  closePanel();
}

applyBtn.addEventListener('click', applyFilters);

// ── Render active tags di bawah search bar ──
function renderActiveTags() {
  activeFiltersRow.innerHTML = '';
  const all = [...appliedTypes, ...appliedDifficulty, ...appliedJenjang];

  if (all.length === 0) {
    activeFiltersRow.classList.remove('show');
    return;
  }
  activeFiltersRow.classList.add('show');

  all.forEach(f => {
    const tag = document.createElement('div');
    tag.className = 'active-tag';

    const label = document.createElement('span');
    label.textContent = labelMap[f];

    const removeBtn = document.createElement('button');
    removeBtn.className = 'active-tag-remove';
    removeBtn.setAttribute('aria-label', 'Hapus filter ' + labelMap[f]);
    removeBtn.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;
    removeBtn.addEventListener('click', () => {
      appliedTypes.delete(f);
      appliedDifficulty.delete(f);
      appliedJenjang.delete(f);
      pendingTypes.delete(f);
      pendingDifficulty.delete(f);
      pendingJenjang.delete(f);
      applyFilters();
    });

    tag.appendChild(label);
    tag.appendChild(removeBtn);
    activeFiltersRow.appendChild(tag);
  });
}

// ── Filter cards ──
function filterCards() {
  const q = (document.getElementById('mobileSearch').value || '').toLowerCase().trim();
  cards.forEach(card => {
    const typeOk       = appliedTypes.size      === 0 || appliedTypes.has(card.dataset.type);
    const difficultyOk = appliedDifficulty.size === 0 || appliedDifficulty.has(card.dataset.difficulty);
    const jenjangOk    = appliedJenjang.size    === 0 || appliedJenjang.has(card.dataset.jenjang);
    const title        = card.querySelector('.card-title').textContent.toLowerCase();
    const meta         = card.querySelector('.card-meta').textContent.toLowerCase();
    const searchOk     = !q || title.includes(q) || meta.includes(q);
    card.style.display = (typeOk && difficultyOk && jenjangOk && searchOk) ? '' : 'none';
  });
}

// ── Open / close triggers ──
filterToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  filterPanel.classList.contains('open') ? closePanel() : openPanel();
});

overlayBackdrop.addEventListener('click', closePanel);

document.addEventListener('click', (e) => {
  if (
    filterPanel.classList.contains('open') &&
    !filterPanel.contains(e.target) &&
    !filterToggleBtn.contains(e.target)
  ) {
    closePanel();
  }
});

if (filterCloseBtn) {
  filterCloseBtn.addEventListener('click', closePanel);
}

// ══════════════════════════════════════
// SEARCH — real-time
// ══════════════════════════════════════
const searchInput = document.getElementById('mobileSearch');
if (searchInput) {
  searchInput.addEventListener('input', filterCards);
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

// ══════════════════════════════════════
// VIEW DETAIL MODAL
// ══════════════════════════════════════

const cardData = {
  'Advanced Calculus Fall 2023 Comprehensive Notes': {
    badge: 'PDF',
    meta: 'By Prof. J. Harrison • 42 Pages',
    rating: '4.8',
    downloads: '1.2k downloads',
    date: 'Jan 2024',
    desc: 'Comprehensive notes covering all major topics including limits, derivatives, integrals, and series. Perfect for exam preparation and deep understanding of calculus concepts.',
    tags: ['Calculus', 'Mathematics', 'SMA', 'Advanced'],
    price: 15,
    thumbType: 'img',
    thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=60',
  },
  'Cellular Biology Midterm Prep Diagram Pack': {
    badge: 'IMG',
    meta: 'By Sarah Jenkins • 12 Images',
    rating: '4.5',
    downloads: '890 downloads',
    date: 'Mar 2024',
    desc: 'Visual diagram pack covering cell structure, mitosis, meiosis, and organelle functions. Ideal for quick visual review before midterms.',
    tags: ['Biology', 'Science', 'SD 1-3', 'Beginner'],
    price: 0,
    thumbType: 'text',
    thumbText: 'Cellular\nBiology\nMidterm Prep',
  },
  'Data Structures & Algorithms Cheatsheet': {
    badge: 'PDF',
    meta: 'By CS Dept • 5 Pages',
    rating: '4.9',
    downloads: '3.4k downloads',
    date: 'Aug 2023',
    desc: 'Concise cheatsheet covering arrays, linked lists, trees, graphs, sorting algorithms, and Big-O complexity. Must-have for coding interviews and exams.',
    tags: ['CS', 'Algorithms', 'SMP', 'Advanced'],
    price: 5,
    thumbType: 'img',
    thumb: 'https://images.unsplash.com/photo-1542903660-eedba2cda473?w=600&q=60',
  },
};

let userCoins        = 25;
let currentCardPrice = 0;
let currentCardTitle = '';

const detailBackdrop = document.getElementById('detailBackdrop');
const detailBuyBtn   = document.getElementById('detailBuy');
const buyToast       = document.getElementById('buyToast');

function openDetailModal(title) {
  const data = cardData[title];
  if (!data) return;

  currentCardTitle = title;
  currentCardPrice = data.price;

  // thumb
  const thumbEl = document.getElementById('detailThumb');
  if (data.thumbType === 'img' && data.thumb) {
    thumbEl.innerHTML = `<img src="${data.thumb}" alt="${title}"/>`;
  } else {
    thumbEl.innerHTML = `<div class="detail-thumb-placeholder">${(data.thumbText || title).replace(/\n/g, '<br>')}</div>`;
  }

  document.getElementById('detailBadge').textContent     = data.badge;
  document.getElementById('detailTitle').textContent     = title;
  document.getElementById('detailMeta').textContent      = data.meta;
  document.getElementById('detailRating').textContent    = data.rating;
  document.getElementById('detailDownloads').textContent = data.downloads;
  document.getElementById('detailDate').textContent      = data.date;
  document.getElementById('detailDesc').textContent      = data.desc;
  document.getElementById('detailBalance').textContent   = userCoins;

  // price & buy button
  const priceValEl = document.getElementById('detailPriceVal');
  if (data.price === 0) {
    priceValEl.textContent     = 'Free';
    document.querySelector('.detail-price-label').textContent = '';
    detailBuyBtn.disabled      = false;
    detailBuyBtn.innerHTML     = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download Free`;
  } else {
    priceValEl.textContent     = data.price;
    document.querySelector('.detail-price-label').textContent = 'Coins';
    if (userCoins < data.price) {
      detailBuyBtn.disabled    = true;
      detailBuyBtn.innerHTML   = '⚠ Coins Not Enough';
    } else {
      detailBuyBtn.disabled    = false;
      detailBuyBtn.innerHTML   = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Buy Now`;
    }
  }

  // tags
  const tagsEl = document.getElementById('detailTags');
  tagsEl.innerHTML = data.tags.map(t => `<span class="detail-tag">${t}</span>`).join('');

  detailBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  detailBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function showBuyToast(title) {
  document.getElementById('buyToastSub').textContent = `"${title}" is now accessible.`;
  buyToast.classList.add('show');
  setTimeout(() => buyToast.classList.remove('show'), 3200);
}

// tombol View Details di card
function viewDetail(btn, title) {
  openDetailModal(title);
}

// buy
detailBuyBtn.addEventListener('click', () => {
  const data = cardData[currentCardTitle];
  if (!data) return;
  if(data.price > userCoins) {
    alert('coins tidak cukup');
    return;
  }
  if (data.price > 0) {
    userCoins -= data.price;
    const navCoinsEl       = document.getElementById('nav-coins');
    const mobileNavCoinsEl = document.getElementById('mobile-nav-coins');
    if (navCoinsEl)       navCoinsEl.textContent       = userCoins + ' Coins';
    if (mobileNavCoinsEl) mobileNavCoinsEl.textContent = userCoins + ' Coins';
  }

  closeDetailModal();
  showBuyToast(currentCardTitle);
});

document.getElementById('detailCancel').addEventListener('click', closeDetailModal);
document.getElementById('detailClose').addEventListener('click', closeDetailModal);

// klik backdrop = tutup
detailBackdrop.addEventListener('click', (e) => {
  if (e.target === detailBackdrop) closeDetailModal();
});