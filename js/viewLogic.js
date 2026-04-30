let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
});

/**
 * Main function to render the study sets grid
 */
function renderLibrary() {
    const grid = document.getElementById('setsGrid');
    if (!grid) return;

    // Load sets from LocalStorage
    const sets = JSON.parse(localStorage.getItem('studySets') || '[]');

    // Empty State
    if (sets.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding: 40px;">No sets found. Click + Create to start!</p>`;
        const pagination = document.getElementById('paginationControls');
        if (pagination) pagination.innerHTML = '';
        return;
    }

    // Pagination Calculation
    const totalPages = Math.ceil(sets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const setsToDisplay = sets.slice(startIndex, startIndex + itemsPerPage);

    grid.innerHTML = ''; 
    setsToDisplay.forEach(set => {
        const row = document.createElement('div');
        row.className = 'set-row'; 
        row.innerHTML = `
            <div class="set-info">
                <span class="card-count">${set.cards.length} Cards</span>
                <h3>${set.title}</h3>
            </div>
            <div class="card-actions">
                <a href="study.html?id=${set.id}" class="btn-study">Study</a>
                <a href="createSet.html?edit=${set.id}" class="btn-edit">Edit</a>
                <button class="btn-delete" onclick="deleteSet(${set.id})">Delete</button>
            </div>
        `;
        grid.appendChild(row);
    });

    renderPagination(totalPages);
}

/**
 * Renders the minimalist pagination bar
 */
function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    if (!container) return;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    // 1. Previous Arrow
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

    // 2. Logic to show first, last, and 1 neighbor (delta=1)
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

    // 3. Next Arrow
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

    // 4. "Go to" Input Group with Button
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

    // Jump Execution Logic
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

/**
 * Handles set deletion
 */
function deleteSet(id) {
    if (confirm("Delete this set forever?")) {
        let sets = JSON.parse(localStorage.getItem('studySets') || '[]');
        sets = sets.filter(s => s.id !== id);
        localStorage.setItem('studySets', JSON.stringify(sets));
        
        // Recalculate page position if the last item on a page was deleted
        const newTotal = Math.ceil(sets.length / itemsPerPage);
        if (currentPage > newTotal && currentPage > 1) {
            currentPage = newTotal;
        }
        
        renderLibrary();
    }
}