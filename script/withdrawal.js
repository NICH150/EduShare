const COIN_RATE = 100;
const ADMIN_FEE = 1000;

const coinAmountInput = document.getElementById('coinAmount');
const convertedVal    = document.getElementById('convertedVal');
const summaryAmount   = document.getElementById('summaryAmount');
const summaryFee      = document.getElementById('summaryFee');
const summaryNet      = document.getElementById('summaryNet');
const destBtns        = document.querySelectorAll('.dest-btn');
const coinInvent = document.getElementById('balance-number');
const estimatedval = document.getElementById('estimated-value');
let availableCoins = parseInt(coinInvent.textContent);

function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function UpdateBalanceUI(){
  coinInvent.textContent = availableCoins;
  estimatedval.textContent = formatRupiah(availableCoins * COIN_RATE);
}

function updateSummary() {
  const coins = parseInt(coinAmountInput.value) || 0;
  const gross = coins * COIN_RATE;
  const net   = Math.max(0, gross - ADMIN_FEE);

  convertedVal.textContent  = formatRupiah(gross);
  summaryAmount.textContent = formatRupiah(gross);
  summaryFee.textContent    = formatRupiah(ADMIN_FEE);
  summaryNet.textContent    = formatRupiah(net);
}

coinAmountInput.addEventListener('input', updateSummary);

destBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    destBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

updateSummary();
UpdateBalanceUI();

const confirmBtn = document.querySelector('.confirm-btn');
const notifBackdrop = document.getElementById('notifBackdrop');
const stateLoading = document.getElementById('stateLoading');
const stateSuccess = document.getElementById('stateSuccess');
const stateError = document.getElementById('stateError');
const notifDest = document.getElementById('notifDest');
const notifAmount = document.getElementById('notifAmount');
const notifNet = document.getElementById('notifNet');
const notifTime = document.getElementById('notifTime');

function showState(state) {
  [stateLoading, stateSuccess, stateError].forEach(s => s.classList.add('hidden'));
  state.classList.remove('hidden');
}

function openModal() {
  notifBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  notifBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function formatRupiahNotif(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function getActiveDest() {
  const active = document.querySelector('.dest-btn.active');
  return active ? (active.dataset.dest.charAt(0).toUpperCase() + active.dataset.dest.slice(1)) : 'Gopay';
}

function getNow() {
  const now = new Date();
  return now.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' WIB';
}

confirmBtn.addEventListener('click', () => {
  const coins = parseInt(coinAmountInput.value) || 0;

  if (coins <= 0 || coins > availableCoins) {
    console.log("gagal " + availableCoins);
    coinAmountInput.focus();
    coinAmountInput.style.borderColor = '#dc2626';
    coinAmountInput.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)';
    setTimeout(() => {
      coinAmountInput.style.borderColor = '';
      coinAmountInput.style.boxShadow = '';
    }, 1800);
    return;
  }

  const gross = coins * COIN_RATE;
  const net = Math.max(0, gross - ADMIN_FEE);

  notifDest.textContent = getActiveDest();
  notifAmount.textContent = formatRupiahNotif(gross);
  notifNet.textContent = formatRupiahNotif(net);
  notifTime.textContent = getNow();

  showState(stateLoading);
  openModal();

  setTimeout(() => {
    const success = Math.random() > 0.15; 
    if(success){
      availableCoins -= coins;
      UpdateBalanceUI();
      showState(stateSuccess);
    } else {
      showState(stateError);
    }
  }, 1800); 
});

document.getElementById('notifClose').addEventListener('click', closeModal);
document.getElementById('notifNew').addEventListener('click', () => {
  closeModal();
  coinAmountInput.value = '';
  updateSummary();
  coinAmountInput.focus();
});
document.getElementById('notifErrorClose').addEventListener('click', closeModal);
document.getElementById('notifRetry').addEventListener('click', () => {
  showState(stateLoading);
  setTimeout(() => {
    showState(stateSuccess);
  }, 1800);
});

notifBackdrop.addEventListener('click', (e) => {
  if (e.target === notifBackdrop && !stateLoading.classList.contains('hidden') === false) {
    closeModal();
  }
});


const bottomItems    = document.querySelectorAll('.bottom-nav-item');
const searchOverlay  = document.getElementById('searchOverlay');
const searchClose    = document.getElementById('searchClose');
const mobileSearchInput = document.getElementById('mobileSearchInput');

bottomItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;

    if (page === 'search') {
      searchOverlay.classList.add('open');
      setTimeout(() => mobileSearchInput.focus(), 100);
      return;
    }

    bottomItems.forEach(b => b.classList.remove('active'));
    item.classList.add('active');
  });
});

searchClose.addEventListener('click', () => {
  searchOverlay.classList.remove('open');
  mobileSearchInput.value = '';
});

searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    searchOverlay.classList.remove('open');
    mobileSearchInput.value = '';
  }
});