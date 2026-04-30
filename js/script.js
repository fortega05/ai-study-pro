// script.js
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const homeScreen = document.getElementById('homeScreen');
const appScreen = document.getElementById('appScreen');

startBtn.addEventListener('click', () => {
    homeScreen.classList.remove('active');
    appScreen.classList.add('active');
});

backBtn.addEventListener('click', () => {
    appScreen.classList.remove('active');
    homeScreen.classList.add('active');
});