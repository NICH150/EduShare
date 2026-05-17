/* =========================================
   EduShare – Upload Page Script
   ========================================= */

(function () {
  "use strict";

  /* ── DOM References ─────────────────────────── */

  // Navbar / Drawer
  const hamburger     = document.getElementById("hamburger");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const mobileDrawer  = document.getElementById("mobileDrawer");
  const drawerClose   = document.getElementById("drawerClose");

  // Upload
  const dropzone    = document.getElementById("dropzone");
  const selectBtn   = document.getElementById("selectFileBtn");
  const fileInput   = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const fileNameEl  = document.getElementById("fileName");
  const removeBtn   = document.getElementById("removeFile");
  const uploadBtn   = document.getElementById("uploadBtn");
  const toastEl     = document.getElementById("toast");

  // Form fields
  const titleInput     = document.getElementById("titleInput");
  const descInput      = document.getElementById("descInput");
  const categorySelect = document.getElementById("categorySelect");
  const levelInput     = document.getElementById("levelInput");
  const tagsInput      = document.getElementById("tagsInput");
  const priceInput     = document.getElementById("priceInput");

  let selectedFile = null;

  /* ══════════════════════════════════════════════
     MOBILE DRAWER
     ══════════════════════════════════════════════ */

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

  /* ══════════════════════════════════════════════
     TOAST HELPER
     ══════════════════════════════════════════════ */
  let toastTimer = null;

  function showToast(message, duration = 3000) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), duration);
  }

  /* ══════════════════════════════════════════════
     FILE VALIDATION
     ══════════════════════════════════════════════ */
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("❌ File type not allowed. Use PDF, DOCX, PNG, or JPG.");
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      showToast("❌ File too large. Max 50MB.");
      return false;
    }
    return true;
  }

  function formatSize(bytes) {
    if (bytes < 1024)        return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  /* ══════════════════════════════════════════════
     FILE APPLY / CLEAR
     ══════════════════════════════════════════════ */
  function applyFile(file) {
    if (!validateFile(file)) return;
    selectedFile = file;

    const inner = dropzone.querySelector(".dropzone-inner");
    inner.style.display = "none";
    fileNameEl.textContent = `${file.name}  (${formatSize(file.size)})`;
    filePreview.style.display = "flex";

    showToast(`✅ "${file.name}" selected.`);
  }

  function clearFile() {
    selectedFile = null;
    fileInput.value = "";

    const inner = dropzone.querySelector(".dropzone-inner");
    inner.style.display = "flex";
    filePreview.style.display = "none";
    fileNameEl.textContent = "";
  }

  /* ══════════════════════════════════════════════
     SELECT FILE BUTTON
     ══════════════════════════════════════════════ */
  selectBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) applyFile(fileInput.files[0]);
  });

  /* ══════════════════════════════════════════════
     DROPZONE CLICK
     ══════════════════════════════════════════════ */
  dropzone.addEventListener("click", () => {
    if (!selectedFile) fileInput.click();
  });

  /* ══════════════════════════════════════════════
     DRAG & DROP
     ══════════════════════════════════════════════ */
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });

  dropzone.addEventListener("dragleave", (e) => {
    if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove("drag-over");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      applyFile(e.dataTransfer.files[0]);
    }
  });

  /* ══════════════════════════════════════════════
     REMOVE FILE
     ══════════════════════════════════════════════ */
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearFile();
    showToast("🗑️ File removed.");
  });

  /* ══════════════════════════════════════════════
     UPLOAD BUTTON
     ══════════════════════════════════════════════ */
  uploadBtn.addEventListener("click", () => {
    const title    = titleInput.value.trim();
    const category = categorySelect.value;

    if (!selectedFile) {
      showToast("⚠️ Please select a file to upload.");
      return;
    }
    if (!title) {
      showToast("⚠️ Please enter a title for your notes.");
      titleInput.focus();
      return;
    }
    if (!category) {
      showToast("⚠️ Please select a category.");
      categorySelect.focus();
      return;
    }

    simulateUpload({ title, category });
  });

  /* ══════════════════════════════════════════════
     SIMULATE UPLOAD
     ══════════════════════════════════════════════ */
  const originalUploadHTML = uploadBtn.innerHTML;

  function simulateUpload(data) {
    uploadBtn.disabled = true;

    // Inject spinner keyframe once
    if (!document.getElementById("spinKF")) {
      const s = document.createElement("style");
      s.id = "spinKF";
      s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }

    uploadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        style="animation:spin 0.9s linear infinite;">
        <line x1="12" y1="2"  x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93"   x2="7.76"  y2="7.76"/>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12"  x2="6"  y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93"  y1="19.07" x2="7.76"  y2="16.24"/>
        <line x1="16.24" y1="7.76"  x2="19.07" y2="4.93"/>
      </svg>
      Uploading…
    `;

    setTimeout(() => {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = originalUploadHTML;
      showToast(`🎉 "${data.title}" uploaded successfully!`, 4000);
      resetForm();
    }, 2200);
  }

  /* ══════════════════════════════════════════════
     RESET FORM
     ══════════════════════════════════════════════ */
  function resetForm() {
    clearFile();
    titleInput.value     = "";
    descInput.value      = "";
    categorySelect.value = "";
    levelInput.value     = "";
    tagsInput.value      = "";
    priceInput.value     = "";
  }

  /* ══════════════════════════════════════════════
     TAGS: auto-prefix #
     ══════════════════════════════════════════════ */
  tagsInput.addEventListener("blur", () => {
    const raw = tagsInput.value.trim();
    if (!raw) return;
    tagsInput.value = raw
      .split(",")
      .map((t) => { t = t.trim(); return t && !t.startsWith("#") ? "#" + t : t; })
      .join(", ");
  });

  /* ══════════════════════════════════════════════
     PRICE: non-negative guard
     ══════════════════════════════════════════════ */
  priceInput.addEventListener("input", () => {
    if (parseFloat(priceInput.value) < 0) priceInput.value = 0;
  });

})();