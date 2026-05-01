let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
});

function renderLibrary() {
    const grid = document.getElementById('setsGrid');
    if (!grid) return;

    const sets = JSON.parse(localStorage.getItem('studySets') || '[]');

    if (sets.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding: 40px;">No sets found. Click + Create to start!</p>`;
        const pagination = document.getElementById('paginationControls');
        if (pagination) pagination.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(sets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const setsToDisplay = sets.slice(startIndex, startIndex + itemsPerPage);

    grid.innerHTML = ''; 
    setsToDisplay.forEach(set => {
        const row = document.createElement('div');
        row.className = 'set-row'; 
        // Using set.id as a data attribute is safer than passing it directly in onclick
        row.innerHTML = `
            <div class="set-info">
                <span class="card-count">${set.cards.length} Cards</span>
                <h3>${set.title}</h3>
            </div>
            <div class="card-actions">
                <a href="studySet.html?id=${set.id}" class="btn-study">Study</a>
                <a href="editSet.html?id=${set.id}" class="btn-edit">Edit</a>
                <button class="btn-delete" data-id="${set.id}">Delete</button>
            </div>
        `;
        
        // Add event listener directly to the delete button
        const deleteBtn = row.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteSet(set.id));
        
        grid.appendChild(row);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    if (!container) return;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Arrow
    const prev = document.createElement('button');
    prev.className = `pg-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prev.innerHTML = '← Prev';
    prev.onclick = () => { 
        if (currentPage > 1) { 
            currentPage--; 
            renderLibrary(); 
            window.scrollTo(0,0); 
        } 
    };
    container.appendChild(prev);

    const delta = 1; 
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    pages.forEach(p => {
        if (p === '...') {
            const dots = document.createElement('span');
            dots.className = 'pg-ellipsis';
            dots.style.padding = "0 8px";
            dots.style.color = "var(--text-sub)";
            dots.innerText = '…';
            container.appendChild(dots);
        } else {
            const btn = document.createElement('button');
            btn.className = p === currentPage ? 'pg-btn active' : 'pg-btn';
            btn.innerText = p;
            btn.onclick = () => {
                if (p === currentPage) return;
                currentPage = p;
                renderLibrary();
                window.scrollTo(0,0);
            };
            container.appendChild(btn);
        }
    });

    // Next Arrow
    const next = document.createElement('button');
    next.className = `pg-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    next.innerHTML = 'Next →';
    next.onclick = () => { 
        if (currentPage < totalPages) { 
            currentPage++; 
            renderLibrary(); 
            window.scrollTo(0,0); 
        } 
    };
    container.appendChild(next);

    // Jump Group
    const jumpGroup = document.createElement('div');
    jumpGroup.className = 'pg-jump-group';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'pg-jump-input';
    input.placeholder = 'Go to…';
    input.min = 1;
    input.max = totalPages;

    const goBtn = document.createElement('button');
    goBtn.className = 'pg-go-btn';
    goBtn.innerText = 'Go';

    const performJump = () => {
        const val = parseInt(input.value);
        if (val >= 1 && val <= totalPages) {
            currentPage = val;
            renderLibrary();
            window.scrollTo(0,0);
        }
    };

    goBtn.onclick = performJump;
    input.onkeydown = (e) => { if (e.key === 'Enter') performJump(); };

    jumpGroup.appendChild(input);
    jumpGroup.appendChild(goBtn);
    container.appendChild(jumpGroup);
}

function deleteSet(id) {
    let sets = JSON.parse(localStorage.getItem('studySets') || '[]');
    const setToDelete = sets.find(s => s.id == id);
    if (!setToDelete) return;
    showDeleteModal(id, setToDelete.title);
}

function showDeleteModal(id, title) {
    const modal      = document.getElementById('deleteModal');
    const modalTitle = document.getElementById('deleteModalTitle');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn  = document.getElementById('cancelDeleteBtn');

    modalTitle.textContent = `Delete "${title}"?`;
    modal.style.display    = 'flex';

    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel  = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel,  cancelBtn);

    newConfirm.addEventListener('click', () => {
        modal.style.display = 'none';
        confirmDeleteSet(id);
    });
    newCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function confirmDeleteSet(id) {
    let sets = JSON.parse(localStorage.getItem('studySets') || '[]');
    sets = sets.filter(s => s.id != id);
    localStorage.setItem('studySets', JSON.stringify(sets));

    const newTotal = Math.ceil(sets.length / itemsPerPage);
    if (currentPage > newTotal && currentPage > 1) currentPage = newTotal;
    renderLibrary();
}