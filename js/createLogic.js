document.addEventListener('DOMContentLoaded', () => {
    const addRowBtn = document.getElementById('addRowBtn');
    const cardInputs = document.getElementById('cardInputs');
    const saveSetBtn = document.getElementById('saveSetBtn');
    const pageTitle = document.getElementById('pageTitle');
    const saveLabel = document.getElementById('saveLabel');

    // --- CHECK IF WE'RE IN EDIT MODE ---
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    let editingSet = null;

    if (editId) {
        const sets = JSON.parse(localStorage.getItem('studySets') || '[]');
        editingSet = sets.find(s => s.id == editId);

        if (editingSet) {
            // Switch UI to Edit mode
            pageTitle.textContent = 'Edit Study Set';
            saveLabel.textContent = 'Save Changes';

            // Pre-fill the title
            document.getElementById('setTitle').value = editingSet.title;

            // Clear the default empty row
            cardInputs.innerHTML = '';

            // Pre-fill all existing cards
            editingSet.cards.forEach(card => {
                const div = document.createElement('div');
                div.className = 'card-row';
                div.innerHTML = `
                    <input type="text" class="term-input" placeholder="Term" value="${escapeHtml(card.t)}">
                    <input type="text" class="def-input" placeholder="Definition" value="${escapeHtml(card.d)}">
                    <button class="delete-row-btn" onclick="this.parentElement.remove()">−</button>
                `;
                cardInputs.appendChild(div);
            });
        }
    }

    // --- ADD CARD ROW ---
    if (addRowBtn) {
        addRowBtn.onclick = () => {
            const div = document.createElement('div');
            div.className = 'card-row';
            div.innerHTML = `
                <input type="text" class="term-input" placeholder="Term">
                <input type="text" class="def-input" placeholder="Definition">
                <button class="delete-row-btn" onclick="this.parentElement.remove()">−</button>
            `;
            cardInputs.appendChild(div);
        };
    }

    // --- SAVE (CREATE OR UPDATE) ---
    if (saveSetBtn) {
        saveSetBtn.onclick = () => {
            const title = document.getElementById('setTitle').value.trim();
            const terms = document.querySelectorAll('.term-input');
            const defs = document.querySelectorAll('.def-input');

            let cards = [];
            terms.forEach((t, i) => {
                if (t.value.trim() && defs[i].value.trim()) {
                    cards.push({ t: t.value.trim(), d: defs[i].value.trim() });
                }
            });

            if (!title || cards.length === 0) {
                return alert("Please fill out the title and at least one card!");
            }

            let sets = JSON.parse(localStorage.getItem('studySets') || '[]');

            if (editingSet) {
                // UPDATE existing set (keep original ID and position)
                sets = sets.map(s => s.id == editId ? { ...s, title, cards } : s);
                localStorage.setItem('studySets', JSON.stringify(sets));

                document.getElementById('successModal').style.display = 'flex';
                document.getElementById('modalTitle').textContent = 'Changes Saved!';
                document.getElementById('modalSubtitle').textContent = 'Your study set has been updated.';
                document.getElementById('modalSecondaryBtn').textContent = 'Keep Editing';
                document.getElementById('modalSecondaryBtn').onclick = () => {
                    document.getElementById('successModal').style.display = 'none';
                };
            } else {
                // CREATE new set
                sets.push({ id: Date.now(), title, cards });
                localStorage.setItem('studySets', JSON.stringify(sets));

                document.getElementById('successModal').style.display = 'flex';
                document.getElementById('modalTitle').textContent = 'Set Saved!';
                document.getElementById('modalSubtitle').textContent = 'What would you like to do next?';
                document.getElementById('modalSecondaryBtn').textContent = 'Create Another';
                document.getElementById('modalSecondaryBtn').onclick = () => location.reload();
            }
        };
    }
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}