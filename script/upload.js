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
     TOAST
  ══════════════════════════════════════════════ */
  function showToast(message, duration = 3000) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), duration);
  }

  /* ══════════════════════════════════════════════
     FIELD ERROR HELPERS
  ══════════════════════════════════════════════ */
  function setError(input, msg) {
    input.style.borderColor = "#dc2626";
    input.style.boxShadow   = "0 0 0 3px rgba(220,38,38,0.10)";

    const id = input.id + "-err";
    let errEl = document.getElementById(id);
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.id = id;
      errEl.style.cssText = "color:#dc2626;font-size:11.5px;margin-top:4px;display:flex;align-items:center;gap:4px;";
      input.parentNode.insertBefore(errEl, input.nextSibling);
    }
    errEl.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
  }

  function clearError(input) {
    input.style.borderColor = "";
    input.style.boxShadow   = "";
    const errEl = document.getElementById(input.id + "-err");
    if (errEl) errEl.remove();
  }

  function setSelectError(select, msg) {
    // selects are wrapped — target the wrapper's parent
    const wrapper = select.closest(".select-wrapper") || select.parentNode;
    select.style.borderColor = "#dc2626";
    select.style.boxShadow   = "0 0 0 3px rgba(220,38,38,0.10)";
    const id = select.id + "-err";
    let errEl = document.getElementById(id);
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.id = id;
      errEl.style.cssText = "color:#dc2626;font-size:11.5px;margin-top:4px;display:flex;align-items:center;gap:4px;";
      wrapper.parentNode.insertBefore(errEl, wrapper.nextSibling);
    }
    errEl.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
  }

  function clearSelectError(select) {
    select.style.borderColor = "";
    select.style.boxShadow   = "";
    const errEl = document.getElementById(select.id + "-err");
    if (errEl) errEl.remove();
  }

  function setDropzoneError(msg) {
    dropzone.style.borderColor = "#dc2626";
    let errEl = document.getElementById("dropzone-err");
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.id = "dropzone-err";
      errEl.style.cssText = "color:#dc2626;font-size:11.5px;margin-top:6px;display:flex;align-items:center;gap:4px;";
      dropzone.parentNode.insertBefore(errEl, dropzone.nextSibling);
    }
    errEl.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
  }

  function clearDropzoneError() {
    dropzone.style.borderColor = "";
    const errEl = document.getElementById("dropzone-err");
    if (errEl) errEl.remove();
  }

  /* ══════════════════════════════════════════════
     CHARACTER COUNTER
  ══════════════════════════════════════════════ */
  const TITLE_MAX = 100;
  const DESC_MAX  = 500;

  function attachCounter(input, max) {
    const id = input.id + "-counter";
    let counter = document.getElementById(id);
    if (!counter) {
      counter = document.createElement("p");
      counter.id = id;
      counter.style.cssText = "font-size:11px;color:#9ca3af;text-align:right;margin-top:3px;";
      input.parentNode.insertBefore(counter, input.nextSibling);
    }
    function update() {
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.style.color = len > max ? "#dc2626" : len > max * 0.85 ? "#f59e0b" : "#9ca3af";
    }
    input.addEventListener("input", update);
    update();
  }

  attachCounter(titleInput, TITLE_MAX);
  attachCounter(descInput,  DESC_MAX);

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
    clearDropzoneError();

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
     FILE INPUT EVENTS
  ══════════════════════════════════════════════ */
  selectBtn.addEventListener("click", (e) => { e.stopPropagation(); fileInput.click(); });
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) applyFile(fileInput.files[0]);
  });

  dropzone.addEventListener("click", () => { if (!selectedFile) fileInput.click(); });
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
  dropzone.addEventListener("dragleave", (e) => {
    if (!dropzone.contains(e.relatedTarget)) dropzone.classList.remove("drag-over");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) applyFile(e.dataTransfer.files[0]);
  });

  removeBtn.addEventListener("click", (e) => { e.stopPropagation(); clearFile(); showToast("🗑️ File removed."); });

  /* ══════════════════════════════════════════════
     REAL-TIME VALIDATION (on input)
  ══════════════════════════════════════════════ */

  // Title: clear error as soon as user types something valid
  titleInput.addEventListener("input", () => {
    const val = titleInput.value.trim();
    if (val.length > TITLE_MAX) {
      setError(titleInput, `Title must be ${TITLE_MAX} characters or fewer.`);
    } else if (val.length > 0) {
      clearError(titleInput);
    }
  });

  // Description: clear error as soon as under limit
  descInput.addEventListener("input", () => {
    if (descInput.value.length > DESC_MAX) {
      setError(descInput, `Description must be ${DESC_MAX} characters or fewer.`);
    } else {
      clearError(descInput);
    }
  });

  // Selects: clear error on change
  [categorySelect, levelSelect, difficultySelect].forEach(sel => {
    sel.addEventListener("change", () => { if (sel.value) clearSelectError(sel); });
  });

  // Price: no negatives, no decimals
  priceInput.addEventListener("input", () => {
    const val = parseFloat(priceInput.value);
    const currentCoins = parseInt(document.getElementById("nav-coins")
      .textContent.replace(/\D/g, "")) || 0;

    if (priceInput.value !== "" && (isNaN(val) || val < 0)) {
      setError(priceInput, "Price must be 0 or a positive number.");
    } else if (val > 0 && currentCoins < val) {
      setError(priceInput, "Insufficient coins. Please top up your balance to continue.");
    } else {
      clearError(priceInput);
    }
  });

  /* ══════════════════════════════════════════════
     BLUR VALIDATION (on leave field)
  ══════════════════════════════════════════════ */
  titleInput.addEventListener("blur", () => {
    const val = titleInput.value.trim();
    if (!val) {
      setError(titleInput, "Title is required.");
    } else if (val.length < 5) {
      setError(titleInput, "Title must be at least 5 characters.");
    } else if (val.length > TITLE_MAX) {
      setError(titleInput, `Title must be ${TITLE_MAX} characters or fewer.`);
    } else {
      clearError(titleInput);
    }
  });

  descInput.addEventListener("blur", () => {
    if (descInput.value.length > DESC_MAX) {
      setError(descInput, `Description must be ${DESC_MAX} characters or fewer.`);
    } else {
      clearError(descInput);
    }
  });

  /* ══════════════════════════════════════════════
     TAGS: auto-prefix # on blur
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
     FULL VALIDATION ON SUBMIT
  ══════════════════════════════════════════════ */
  function validateAll() {
    let valid = true;

    // File
    if (!selectedFile) {
      setDropzoneError("Please select a file to upload.");
      valid = false;
    }

    // Title
    const title = titleInput.value.trim();
    if (!title) {
      setError(titleInput, "Title is required.");
      valid = false;
    } else if (title.length < 5) {
      setError(titleInput, "Title must be at least 5 characters.");
      valid = false;
    } else if (title.length > TITLE_MAX) {
      setError(titleInput, `Title must be ${TITLE_MAX} characters or fewer.`);
      valid = false;
    } else {
      clearError(titleInput);
    }

    // Description (optional but bounded)
    if (descInput.value.length > DESC_MAX) {
      setError(descInput, `Description must be ${DESC_MAX} characters or fewer.`);
      valid = false;
    } else {
      clearError(descInput);
    }

    // Selects
    if (!categorySelect.value) {
      setSelectError(categorySelect, "Please select a category.");
      valid = false;
    } else { clearSelectError(categorySelect); }

    if (!levelSelect.value) {
      setSelectError(levelSelect, "Please select a level / semester.");
      valid = false;
    } else { clearSelectError(levelSelect); }

    if (!difficultySelect.value) {
      setSelectError(difficultySelect, "Please select a difficulty.");
      valid = false;
    } else { clearSelectError(difficultySelect); }

    // Price
    const price = parseFloat(priceInput.value) || 0;
    const currentCoins = parseInt(document.getElementById("nav-coins")
      .textContent.replace(/\D/g, "")) || 0;

    if (priceInput.value !== "" && price < 0) {
      setError(priceInput, "Price must be 0 or a positive number.");
      valid = false;
    } else if (price > 0 && currentCoins < price) {
      setError(priceInput, "Insufficient coins. Please top up your balance to continue.");
      valid = false;
    } else {
      clearError(priceInput);
    }
  }

  /* ══════════════════════════════════════════════
     CONFIRM TOAST
  ══════════════════════════════════════════════ */
  function showConfirmToast({ title, subtitle, onConfirm }) {
    const existing = document.getElementById("confirmToast");
    if (existing) existing.remove();

    const t = document.createElement("div");
    t.id = "confirmToast";
    t.className = "c-toast";
    t.innerHTML = `
      <div class="toast-body">
        <p class="toast-title">${title}</p>
        <p class="toast-sub">${subtitle}</p>
      </div>
      <div class="toast-actions">
        <button class="t-cancel" id="toastCancel">Cancel</button>
        <button class="t-confirm" id="toastOk">Upload</button>
      </div>`;

    document.getElementById("toastContainer").appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));

    const timer = setTimeout(() => dismissConfirmToast(t), 8000);

    document.getElementById("toastCancel").onclick = () => { clearTimeout(timer); dismissConfirmToast(t); };
    document.getElementById("toastOk").onclick = () => { clearTimeout(timer); dismissConfirmToast(t); onConfirm(); };
  }

  function dismissConfirmToast(el) {
    el.classList.remove("show");
    setTimeout(() => el?.remove(), 250);
  }

  /* ══════════════════════════════════════════════
     UPLOAD BUTTON
  ══════════════════════════════════════════════ */
  const CAT_MAP = {
    math: "Mathematics", science: "Science", engineering: "Engineering",
    business: "Business", humanities: "Humanities", language: "Language", other: "Other",
  };

  function getNow() {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  uploadBtn.addEventListener("click", () => {
    if (!validateAll()) {
      // scroll to first error
      const firstErr = document.querySelector("[id$='-err']");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const title    = titleInput.value.trim();
    const category = categorySelect.value;
    const price    = parseFloat(priceInput.value) || 0;

    showConfirmToast({
      title: `Upload "${title}"?`,
      subtitle: `${CAT_MAP[category]} · ${price > 0 ? price + " Coins" : "Free"}`,
      onConfirm: () => {
        document.getElementById("notifDocTitle").textContent = title;
        document.getElementById("notifCategory").textContent = CAT_MAP[category] || category;
        document.getElementById("notifPrice").textContent    = price > 0 ? price + " Coins" : "Free";
        document.getElementById("notifTime").textContent     = getNow();

        showState(stateLoading);
        openModal();

        setTimeout(() => showState(stateSuccess), 2000);
      }
    });
  });

  /* ══════════════════════════════════════════════
     MODAL HELPERS
  ══════════════════════════════════════════════ */
  function openModal() { notifBackdrop.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModal() { notifBackdrop.classList.remove("open"); document.body.style.overflow = ""; }
  function showState(stateEl) {
    [stateLoading, stateSuccess].forEach((s) => s.classList.add("hidden"));
    stateEl.classList.remove("hidden");
  }

  document.getElementById("notifClose").addEventListener("click", () => { closeModal(); location.href = "index.html"; });
  document.getElementById("notifNew").addEventListener("click", () => { closeModal(); resetForm(); showToast("Form cleared. Ready for new upload!"); });
  notifBackdrop.addEventListener("click", (e) => { if (e.target === notifBackdrop) closeModal(); });

  /* ══════════════════════════════════════════════
     RESET FORM
  ══════════════════════════════════════════════ */
  function resetForm() {
    clearFile();
    clearDropzoneError();
    [titleInput, descInput, tagsInput, priceInput].forEach(el => { el.value = ""; clearError(el); });
    [categorySelect, levelSelect, difficultySelect].forEach(el => { el.value = ""; clearSelectError(el); });
    // reset counters
    document.querySelectorAll("[id$='-counter']").forEach(c => c.textContent = "0 / " + (c.id.includes("title") ? TITLE_MAX : DESC_MAX));
  }

})();