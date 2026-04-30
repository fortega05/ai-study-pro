document.addEventListener('DOMContentLoaded', () => {
    const addRowBtn = document.getElementById('addRowBtn');
    const cardInputs = document.getElementById('cardInputs');
    const saveSetBtn = document.getElementById('saveSetBtn');

    if(addRowBtn) {
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

    if(saveSetBtn) {
        saveSetBtn.onclick = () => {
            const title = document.getElementById('setTitle').value;
            const terms = document.querySelectorAll('.term-input');
            const defs = document.querySelectorAll('.def-input');
            
            let cards = [];
            terms.forEach((t, i) => {
                if(t.value && defs[i].value) cards.push({t: t.value, d: defs[i].value});
            });

            if(!title || cards.length === 0) return alert("Fill out title and cards!");

            const sets = JSON.parse(localStorage.getItem('studySets') || '[]');
            sets.push({id: Date.now(), title, cards});
            localStorage.setItem('studySets', JSON.stringify(sets));

            // Show the smooth popup instead of redirecting
            document.getElementById('successModal').style.display = 'flex';
        };
    }
});