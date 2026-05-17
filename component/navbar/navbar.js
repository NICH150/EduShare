// bottom navbar
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