

'use strict';

const PACKAGES = [
  { coins: 3,   price: 1171 },
  { coins: 5,   price: 1423 },
  { coins: 12,  price: 3323 },
  { coins: 19,  price: 5232 },
  { coins: 28,  price: 7600 },
  { coins: 44,  price: 11400 },
  { coins: 50,  price: 15000 },
  { coins: 100, price: 28000, popular: true },
  { coins: 170, price: 43700 },
  { coins: 240, price: 61750 },
  { coins: 300, price: 77000 },
  { coins: 408, price: 105000 },
  { coins: 568, price: 143000 },
  { coins: 875, price: 218000 },
];

const PAYMENT_METHODS = [
  {
    id: 'E-Wallet',
    name: 'E-Wallet',
    sub: 'Gopay, OVO, Dana',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
  {
    id: 'Virtual-Account',
    name: 'Virtual Account',
    sub: 'BCA, Mandiri, BNI',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 7 22 7"/></svg>`,
  },
  {
    id: 'Card',
    name: 'Credit/Debit Card',
    sub: 'Visa, Mastercard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
];

let selectedPackageIndex = 7;
let selectedMethodId     = null;
let customAmount         = null;
let currentBalance       = 25;

let notifBackdrop, stateLoading, stateSuccess, stateError;

const fmt = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID').replace(/,/g, '.');

const fmtShort = (n) =>
  Number(n).toLocaleString('id-ID').replace(/,/g, '.');

function showToast(msg, duration = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

function getNow() {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' WIB';
}

/* ─── MODAL FUNCTIONS ─── */
function openModal() {
  notifBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  notifBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function showState(state) {
  [stateLoading, stateSuccess, stateError].forEach(s => s.classList.add('hidden'));
  state.classList.remove('hidden');
}

/* ─── RENDER PACKAGES ─── */
function renderPackages() {
  const grid = document.getElementById('package-grid');
  grid.innerHTML = '';

  PACKAGES.forEach((pkg, i) => {
    const card = document.createElement('div');
    card.className = 'pkg-card' + (i === selectedPackageIndex ? ' selected' : '');
    card.setAttribute('data-index', i);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', i === selectedPackageIndex);

    card.innerHTML = `
      ${pkg.popular ? '<span class="pkg-badge">POPULAR</span>' : ''}
      <div class="check-mark">
        <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none"/></svg>
      </div>
      <div class="pkg-top">
        <span class="pkg-coin-icon">●</span>
        <span class="pkg-amount">${pkg.coins}</span>
      </div>
      <div class="pkg-price">Rp ${fmtShort(pkg.price)}</div>
    `;

    card.addEventListener('click', () => selectPackage(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPackage(i); }
    });

    grid.appendChild(card);
  });
}

function selectPackage(index) {
  selectedPackageIndex = index;
  customAmount = null;
  document.getElementById('custom-amount').value = '';
  renderPackages();
  updateTotal();
}

/* ─── RENDER PAYMENT METHODS ─── */
function renderPaymentMethods() {
  const container = document.getElementById('payment-methods');
  container.innerHTML = '';

  PAYMENT_METHODS.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'method-card' + (m.id === selectedMethodId ? ' selected' : '');
    card.setAttribute('data-id', m.id);
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', m.id === selectedMethodId);
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <div class="method-left">
        <div class="method-icon">${m.icon}</div>
        <div>
          <div class="method-name">${m.name}</div>
          <div class="method-sub">${m.sub}</div>
        </div>
      </div>
      <div class="radio-circle">
        <div class="radio-dot"></div>
      </div>
    `;

    card.addEventListener('click', () => selectMethod(m.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMethod(m.id); }
    });

    container.appendChild(card);
  });
}

function selectMethod(id) {
  selectedMethodId = id;
  renderPaymentMethods();
}

/* ─── UPDATE TOTAL ─── */
function updateTotal() {
  const totalEl = document.getElementById('total-amount');

  if (customAmount !== null && customAmount >= 10 && customAmount <= 100000) {
    const estimatedPrice = Math.round((customAmount / 100) * 28000);
    totalEl.textContent = fmt(estimatedPrice);
    return;
  }

  if (selectedPackageIndex !== null) {
    totalEl.textContent = fmt(PACKAGES[selectedPackageIndex].price);
    return;
  }

  totalEl.textContent = 'Rp 0';
}

/* ─── CUSTOM AMOUNT INPUT ─── */
function initCustomAmount() {
  const input = document.getElementById('custom-amount');

  let warning = document.getElementById('custom-amount-warning');
  if (!warning) {
    warning = document.createElement('span');
    warning.id = 'custom-amount-warning';
    warning.style.cssText = 'color: #e74c3c; font-size: 12px; display: none; margin-top: 4px;';
    warning.textContent = '⚠️ Maksimal jumlah adalah 100.000';
    input.parentNode.insertBefore(warning, input.nextSibling);
  }

  const MAX_AMOUNT = 100000;

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);

    if (!isNaN(val) && val > MAX_AMOUNT) {
      warning.style.display = 'block';
      input.style.borderColor = '#e74c3c';
      customAmount = null;
      updateTotal();
      return;
    }

    warning.style.display = 'none';
    input.style.borderColor = '';

    if (!isNaN(val) && val >= 10) {
      customAmount = val;
      selectedPackageIndex = null;
      document.querySelectorAll('.pkg-card').forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });
    } else {
      customAmount = null;
    }

    updateTotal();
  });
}


function showConfirmToast({ title, subtitle, onConfirm }) {
  const existing = document.getElementById('confirmToast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'confirmToast';
  t.className = 'c-toast';
  t.innerHTML = `
    <div class="toast-body">
      <p class="toast-title">${title}</p>
      <p class="toast-sub">${subtitle}</p>
    </div>
    <div class="toast-actions">
      <button class="t-cancel" id="toastCancel">Cancel</button>
      <button class="t-confirm" id="toastOk">Confirm</button>
    </div>`;

  document.getElementById('toastContainer').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));

  const timer = setTimeout(() => dismissConfirmToast(t), 8000);

  document.getElementById('toastCancel').onclick = () => {
    clearTimeout(timer);
    dismissConfirmToast(t);
  };
  document.getElementById('toastOk').onclick = () => {
    clearTimeout(timer);
    dismissConfirmToast(t);
    onConfirm();
  };
}

function dismissConfirmToast(el) {
  el.classList.remove('show');
  setTimeout(() => el?.remove(), 250);
}

function initConfirmBtn() {
  const btn = document.getElementById('confirm-btn');

  btn.addEventListener('click', () => {
    const hasAmount = (selectedPackageIndex !== null) ||
                      (customAmount !== null && customAmount >= 10);
    if (!hasAmount) {
      showToast('⚠️ Pilih paket atau masukkan jumlah koin.');
      return;
    }
    if (!selectedMethodId) {
      showToast('⚠️ Pilih metode pembayaran terlebih dahulu.');
      return;
    }

    const coinsToAdd = customAmount !== null
      ? customAmount
      : PACKAGES[selectedPackageIndex].coins;

    const totalPrice = customAmount !== null
      ? Math.round((customAmount / 100) * 28000)
      : PACKAGES[selectedPackageIndex].price;

    showConfirmToast({
      title: `Top up ${coinsToAdd} coins?`,
      subtitle: `${selectedMethodId} · ${fmt(totalPrice)}`,
      onConfirm: () => {
        document.getElementById('notifPkg').textContent    = coinsToAdd + ' Coins';
        document.getElementById('notifMethod').textContent = selectedMethodId;
        document.getElementById('notifTotal').textContent  = fmt(totalPrice);
        document.getElementById('notifNewBal').textContent = (currentBalance + coinsToAdd) + ' Coins';
        document.getElementById('notifTime').textContent   = getNow();

        showState(stateLoading);
        openModal();

        setTimeout(() => {
          currentBalance += coinsToAdd;
          document.getElementById('balance-display').textContent = currentBalance;
          document.getElementById('nav-coins').textContent = currentBalance + ' Coins';

          const balanceEl = document.getElementById('balance-display');
          balanceEl.style.color = '#f5a623';
          setTimeout(() => { balanceEl.style.color = ''; }, 800);

          selectedPackageIndex = 7;
          selectedMethodId = null;
          customAmount = null;
          document.getElementById('custom-amount').value = '';

          renderPackages();
          renderPaymentMethods();
          updateTotal();
          showState(stateSuccess);
        }, 1800);
      }
    });
  });
}
/* ─── MODAL BUTTONS ─── */
function initModalButtons() {
  document.getElementById('notifClose').addEventListener('click', closeModal);
  document.getElementById('notifNew').addEventListener('click', closeModal);
  document.getElementById('notifErrorClose').addEventListener('click', closeModal);
  document.getElementById('notifRetry').addEventListener('click', () => {
    showState(stateLoading);
    setTimeout(() => showState(stateSuccess), 1800);
  });
  notifBackdrop.addEventListener('click', (e) => {
    if (e.target === notifBackdrop) closeModal();
  });
}

/* ─── INIT ─── */
(function init() {
  notifBackdrop = document.getElementById('notifBackdrop');
  stateLoading  = document.getElementById('stateLoading');
  stateSuccess  = document.getElementById('stateSuccess');
  stateError    = document.getElementById('stateError');

  renderPackages();
  renderPaymentMethods();
  updateTotal();
  initCustomAmount();
  initConfirmBtn();
  initModalButtons();
})();