// editLogic.js — handles loading and saving an existing study set

let editId = null;

// ─── BOOT ────────────────────────────────────────────────
function initEdit() {
    const params = new URLSearchParams(window.location.search);
    editId = params.get('id');

    if (!editId) return showEditError('No set ID provided. Please go back and try again.');

    const sets = JSON.parse(localStorage.getItem('studySets') || '[]');
    const set  = sets.find(s => s.id == editId);

    if (!set) return showEditError('Set not found. It may have been deleted.');

    document.title = `Edit: ${set.title} | AI Study Pro`;

    // Pre-fill title
    document.getElementById('editTitle').value = set.title;

    // Render all existing cards
    const container = document.getElementById('cardInputs');
    container.innerHTML = '';
    set.cards.forEach((card, i) => addCardRow(card.t, card.d, i));
}

// ─── ADD A CARD ROW ──────────────────────────────────────
function addCardRow(term = '', def = '', index = null) {
    const container = document.getElementById('cardInputs');
    const num       = index !== null ? index + 1 : container.children.length + 1;

    const block = document.createElement('div');
    block.className = 'edit-card-block';
    block.innerHTML = `
        <span class="card-number-label">Card ${num}</span>
        <div class="card-row">
            <input type="text" class="term-input" placeholder="Term"       value="${escapeHtml(term)}">
            <input type="text" class="def-input"  placeholder="Definition" value="${escapeHtml(def)}">
            <button class="delete-row-btn" onclick="removeCard(this)" title="Remove card">−</button>
        </div>
    `;
    container.appendChild(block);
    refreshCardNumbers();
}

function removeCard(btn) {
    btn.closest('.edit-card-block').remove();
    refreshCardNumbers();
}

function refreshCardNumbers() {
    document.querySelectorAll('.card-number-label').forEach((el, i) => {
        el.textContent = `Card ${i + 1}`;
    });
}

// ─── SAVE CHANGES ────────────────────────────────────────
function saveChanges() {
    const title = document.getElementById('editTitle').value.trim();
    const terms = document.querySelectorAll('.term-input');
    const defs  = document.querySelectorAll('.def-input');

    const cards = [];
    terms.forEach((t, i) => {
        const term = t.value.trim();
        const def  = defs[i].value.trim();
        if (term && def) cards.push({ t: term, d: def });
    });

    if (!title)         return alert('Please enter a title for this set.');
    if (!cards.length)  return alert('Please add at least one complete card.');

    let sets = JSON.parse(localStorage.getItem('studySets') || '[]');
    sets = sets.map(s => s.id == editId ? { ...s, title, cards } : s);
    localStorage.setItem('studySets', JSON.stringify(sets));

    // Show success modal
    document.getElementById('successModal').style.display = 'flex';
}

// ─── HELPERS ─────────────────────────────────────────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/"/g,  '&quot;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;');
}

function showEditError(msg) {
    document.getElementById('edit-content').innerHTML = `
        <p style="color:var(--text-sub);text-align:center;padding:40px 20px;">${msg}</p>
        <a href="viewSets.html" class="primary-btn" style="margin-top:20px;">← Back to Library</a>
    `;
}