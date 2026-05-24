/* =========================================
   EduShare – Upload Page Script
   ========================================= */

(function () {
  "use strict";

  /* ── DOM References ─────────────────────────── */
  const dropzone         = document.getElementById("dropzone");
  const selectBtn        = document.getElementById("selectFileBtn");
  const fileInput        = document.getElementById("fileInput");
  const filePreview      = document.getElementById("filePreview");
  const fileNameEl       = document.getElementById("fileName");
  const removeBtn        = document.getElementById("removeFile");
  const uploadBtn        = document.getElementById("uploadBtn");
  const toastEl          = document.getElementById("toast");

  const titleInput       = document.getElementById("titleInput");
  const descInput        = document.getElementById("descInput");
  const categorySelect   = document.getElementById("categorySelect");
  const levelSelect      = document.getElementById("levelSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const tagsInput        = document.getElementById("tagsInput");
  const priceInput       = document.getElementById("priceInput");

  const notifBackdrop    = document.getElementById("notifBackdrop");
  const stateLoading     = document.getElementById("stateLoading");
  const stateSuccess     = document.getElementById("stateSuccess");

  let selectedFile = null;
  let toastTimer   = null;

  /* ══════════════════════════════════════════════
     TOAST HELPER
     ══════════════════════════════════════════════ */
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
  const MAX_SIZE_BYTES = 50 * 1024 * 1024;

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
     DROPZONE CLICK & DRAG-DROP
     ══════════════════════════════════════════════ */
  dropzone.addEventListener("click", () => {
    if (!selectedFile) fileInput.click();
  });

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
     MODAL HELPERS
     ══════════════════════════════════════════════ */
  function openModal() {
    notifBackdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    notifBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  function showState(stateEl) {
    [stateLoading, stateSuccess].forEach((s) => s.classList.add("hidden"));
    stateEl.classList.remove("hidden");
  }

  /* ══════════════════════════════════════════════
     CATEGORY LABEL MAP
     ══════════════════════════════════════════════ */
  const CAT_MAP = {
    math:        "Mathematics",
    science:     "Science",
    engineering: "Engineering",
    business:    "Business",
    humanities:  "Humanities",
    language:    "Language",
    other:       "Other",
  };

  function getNow() {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  /* ══════════════════════════════════════════════
     UPLOAD BUTTON
     ══════════════════════════════════════════════ */
  uploadBtn.addEventListener("click", () => {
    const title      = titleInput.value.trim();
    const category   = categorySelect.value;
    const level      = levelSelect.value;
    const difficulty = difficultySelect.value;

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
    if (!level) {
      showToast("⚠️ Please select a level / semester.");
      levelSelect.focus();
      return;
    }
    if (!difficulty) {
      showToast("⚠️ Please select a difficulty.");
      difficultySelect.focus();
      return;
    }

    const price = parseFloat(priceInput.value) || 0;

    // Isi data ke success state
    document.getElementById("notifDocTitle").textContent = title;
    document.getElementById("notifCategory").textContent = CAT_MAP[category] || category;
    document.getElementById("notifPrice").textContent    = price > 0 ? price + " Coins" : "Free";
    document.getElementById("notifTime").textContent     = getNow();

    // Tampilkan modal dengan state loading
    showState(stateLoading);
    openModal();

    // Setelah 2 detik ganti ke success
    setTimeout(() => {
      showState(stateSuccess);
    }, 2000);
  });

  /* ══════════════════════════════════════════════
     MODAL ACTION BUTTONS
     ══════════════════════════════════════════════ */
  document.getElementById("notifClose").addEventListener("click", () => {
    closeModal();
    location.href = "index.html";
  });

  document.getElementById("notifNew").addEventListener("click", () => {
    closeModal();
    resetForm();
    showToast("Form cleared. Ready for new upload!");
  });

  // Klik backdrop (area gelap) untuk tutup modal
  notifBackdrop.addEventListener("click", (e) => {
    if (e.target === notifBackdrop) closeModal();
  });

  /* ══════════════════════════════════════════════
     RESET FORM
     ══════════════════════════════════════════════ */
  function resetForm() {
    clearFile();
    titleInput.value       = "";
    descInput.value        = "";
    categorySelect.value   = "";
    levelSelect.value      = "";
    difficultySelect.value = "";
    tagsInput.value        = "";
    priceInput.value       = "";
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