// studyLogic.js — handles all flashcard study behaviour

let cards = [];
let currentIndex = 0;
let correct = 0;
let wrong = 0;
let missedCards = [];
let isFlipped = false;
let originalCards = [];
let setId = null;

const PROGRESS_KEY = () => `studyProgress_${setId}`;

// ─── BOOT ────────────────────────────────────────────────
function initStudy() {
    const params = new URLSearchParams(window.location.search);
    setId = params.get('id');

    if (!setId) return showError('No set selected. Please go back and choose a set.');

    const sets = JSON.parse(localStorage.getItem('studySets') || '[]');
    const set  = sets.find(s => s.id == setId);

    if (!set || !set.cards.length) {
        return showError('Set not found or has no cards.');
    }

    document.title = `Study: ${set.title} | AI Study Pro`;
    document.getElementById('studySetTitle').textContent = set.title;

    originalCards = [...set.cards];

    // Try to restore saved progress
    const saved = loadProgress();
    if (saved && saved.currentIndex > 0 && saved.currentIndex < set.cards.length) {
        cards        = [...set.cards];
        currentIndex = saved.currentIndex;
        correct      = saved.correct;
        wrong        = saved.wrong;
        missedCards  = saved.missedCards || [];
        showResumeBar(saved.currentIndex, set.cards.length);
    } else {
        clearProgress();
        cards = [...set.cards];
    }

    loadCard();
}

// ─── SAVE / LOAD / CLEAR PROGRESS ────────────────────────
function saveProgress() {
    if (!setId) return;
    const data = { currentIndex, correct, wrong, missedCards };
    localStorage.setItem(PROGRESS_KEY(), JSON.stringify(data));
}

function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY()));
    } catch { return null; }
}

function clearProgress() {
    if (setId) localStorage.removeItem(PROGRESS_KEY());
}

// ─── RESUME BANNER ────────────────────────────────────────
function showResumeBar(index, total) {
    const bar = document.getElementById('resumeBar');
    if (!bar) return;
    bar.style.display = 'flex';
    document.getElementById('resumeText').textContent =
        `You left off at card ${index + 1} of ${total} — resuming where you stopped.`;
}

function hideResumeBar() {
    const bar = document.getElementById('resumeBar');
    if (bar) bar.style.display = 'none';
}

// ─── LOAD CARD ────────────────────────────────────────────
function loadCard() {
    hideResumeBar();

    if (currentIndex >= cards.length) {
        clearProgress();
        showResults();
        return;
    }

    const scene = document.getElementById('cardScene');
    isFlipped = false;
    scene.classList.remove('flipped', 'card-exit');

    document.getElementById('termText').textContent      = cards[currentIndex].t;
    document.getElementById('defText').textContent       = cards[currentIndex].d;
    document.getElementById('progressText').textContent  = `${currentIndex + 1} / ${cards.length}`;
    document.getElementById('progressFill').style.width  = `${(currentIndex / cards.length) * 100}%`;
    document.getElementById('cardHint').textContent      = 'Click the card to reveal the definition';
    document.getElementById('answerBtns').classList.add('hidden');
}

// ─── FLIP ─────────────────────────────────────────────────
function flipCard() {
    isFlipped = !isFlipped;
    document.getElementById('cardScene').classList.toggle('flipped', isFlipped);

    if (isFlipped) {
        document.getElementById('cardHint').textContent = 'Click again to flip back';
        document.getElementById('answerBtns').classList.remove('hidden');
    } else {
        document.getElementById('cardHint').textContent = 'Click the card to reveal the definition';
        document.getElementById('answerBtns').classList.add('hidden');
    }
}

// ─── RECORD ANSWER ────────────────────────────────────────
function recordAnswer(gotRight) {
    if (!isFlipped) return;

    if (gotRight) {
        correct++;
    } else {
        wrong++;
        missedCards.push(cards[currentIndex]);
    }

    currentIndex++;
    saveProgress(); // auto-save after every card

    const scene = document.getElementById('cardScene');
    scene.classList.add('card-exit');
    setTimeout(() => {
        scene.classList.remove('card-exit', 'flipped');
        loadCard();
    }, 280);
}

// ─── RESTART (mid-session) ────────────────────────────────
function restartNow() {
    clearProgress();
    cards = [...originalCards];
    resetState();
}

// ─── RESULTS ─────────────────────────────────────────────
function showResults() {
    document.getElementById('studyScreen').style.display   = 'none';
    document.getElementById('resultsScreen').style.display = 'flex';

    const total = correct + wrong;
    const pct   = total === 0 ? 0 : Math.round((correct / total) * 100);

    let letter, color, headline;
    if      (pct >= 90) { letter = 'A'; color = '#22c55e'; headline = 'Excellent Work! 🎉'; }
    else if (pct >= 80) { letter = 'B'; color = '#84cc16'; headline = 'Great Job! 👍'; }
    else if (pct >= 70) { letter = 'C'; color = '#f59e0b'; headline = 'Not Bad! 📚'; }
    else if (pct >= 60) { letter = 'D'; color = '#f97316'; headline = 'Keep Practicing! 💪'; }
    else                { letter = 'F'; color = '#ef4444'; headline = 'Keep Studying! 📖'; }

    const circle = document.getElementById('gradeCircle');
    circle.style.borderColor = color;
    circle.style.background  = color + '18';
    document.getElementById('gradeLetter').style.color = color;
    document.getElementById('gradePct').style.color    = color;
    document.getElementById('gradeLetter').textContent = letter;
    document.getElementById('gradePct').textContent    = pct + '%';

    document.getElementById('resultsHeadline').textContent = headline;
    document.getElementById('resultsSubtitle').textContent =
        `You finished all ${total} card${total !== 1 ? 's' : ''}.`;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent   = wrong;
    document.getElementById('totalCount').textContent   = total;

    document.getElementById('progressFill').style.width = '100%';

    if (missedCards.length > 0) {
        document.getElementById('retryWrongBtn').style.display = 'block';
        document.getElementById('missedSection').style.display  = 'block';
        const list = document.getElementById('missedList');
        list.innerHTML = '';
        missedCards.forEach(c => {
            const div = document.createElement('div');
            div.className = 'missed-card-item';
            div.innerHTML = `<div class="missed-term">${c.t}</div><div class="missed-def">${c.d}</div>`;
            list.appendChild(div);
        });
    }
}

// ─── RETRY / RESTART (results screen) ────────────────────
function retryMissed() {
    cards = [...missedCards];
    resetState();
}

function restartAll() {
    clearProgress();
    cards = [...originalCards];
    resetState();
}

function resetState() {
    currentIndex = 0;
    correct      = 0;
    wrong        = 0;
    missedCards  = [];
    isFlipped    = false;

    document.getElementById('resultsScreen').style.display  = 'none';
    document.getElementById('studyScreen').style.display    = 'flex';
    document.getElementById('retryWrongBtn').style.display  = 'none';
    document.getElementById('missedSection').style.display  = 'none';
    document.getElementById('cardScene').classList.remove('flipped', 'card-exit');
    loadCard();
}

// ─── ERROR ────────────────────────────────────────────────
function showError(msg) {
    document.getElementById('studyScreen').innerHTML = `
        <p style="color:var(--text-sub);text-align:center;padding:40px 20px;">${msg}</p>
        <a href="viewSets.html" class="primary-btn" style="margin-top:20px;">← Back to Library</a>
    `;
}