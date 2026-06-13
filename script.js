// Using Web Audio API for synthetic sound effects (No need for external assets)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, type, duration, vol=0.1) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playCorrectSound() {
    // Chime
    playTone(523.25, 'sine', 0.1, 0.2); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.2, 0.2), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.4, 0.2), 200); // G5
}

function playWrongSound() {
    // Buzzer
    playTone(150, 'sawtooth', 0.3, 0.2);
    setTimeout(() => playTone(140, 'sawtooth', 0.4, 0.2), 150);
}

// Simple Confetti Implementation
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let particles = [];
let confettiActive = false;

function initConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.remove('hidden');
    confettiActive = true;
    particles = [];
    const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#4F46E5', '#10B981'];
    
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10
        });
    }
    requestAnimationFrame(renderConfetti);
}

function renderConfetti() {
    if(!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allFallen = true;
    
    particles.forEach(p => {
        p.y += p.dy;
        p.x += Math.sin(p.tilt) * 2;
        p.tilt += 0.1;
        
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
        
        if (p.y < canvas.height) allFallen = false;
    });
    
    if(!allFallen) {
        requestAnimationFrame(renderConfetti);
    } else {
        stopConfetti();
    }
}

function stopConfetti() {
    confettiActive = false;
    canvas.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Application State
let currentLit = null;
let currentQuestionIndex = 0;
let score = 0;
let answered = false;
let literatures = [];

// Gamification State
let playerLevel = 1;
let playerXP = 0;
let currentCombo = 0;
let playerHearts = 3;
let maxUnlockedStage = 0;
const XP_PER_LEVEL = 100;
const LEVEL_TITLES = ["หนอนหนังสือ", "ศิษย์ใหม่", "บัณฑิต", "ปราชญ์", "กวีเอก", "ปรมาจารย์"];

function getLevelTitle(level) {
    if (level >= LEVEL_TITLES.length) return "เทพเจ้าวรรณคดี";
    return LEVEL_TITLES[level];
}

function loadProgress() {
    const savedLevel = localStorage.getItem('playerLevel');
    const savedXP = localStorage.getItem('playerXP');
    const savedStage = localStorage.getItem('maxUnlockedStage');
    if (savedLevel) playerLevel = parseInt(savedLevel);
    if (savedXP) playerXP = parseInt(savedXP);
    if (savedStage) maxUnlockedStage = parseInt(savedStage);
    updateStatsUI();
}

function saveProgress() {
    localStorage.setItem('playerLevel', playerLevel);
    localStorage.setItem('playerXP', playerXP);
    localStorage.setItem('maxUnlockedStage', maxUnlockedStage);
}

function updateStatsUI() {
    document.getElementById('player-level').innerText = playerLevel;
    document.getElementById('player-title').innerText = getLevelTitle(playerLevel);
    
    const xpNeeded = playerLevel * XP_PER_LEVEL;
    const progress = (playerXP / xpNeeded) * 100;
    
    document.getElementById('xp-fill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('player-xp-text').innerText = `${playerXP} / ${xpNeeded} XP`;
}

function addXP(amount, event) {
    playerXP += amount;
    let xpNeeded = playerLevel * XP_PER_LEVEL;
    
    if (event) {
        showFloatingText(`+${amount} XP`, event.clientX, event.clientY);
    }
    
    if (playerXP >= xpNeeded) {
        playerXP -= xpNeeded;
        playerLevel++;
        showLevelUp();
    }
    
    updateStatsUI();
    saveProgress();
}

function showFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = (x - 20) + 'px';
    el.style.top = (y - 20) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function showLevelUp() {
    document.getElementById('level-badge-display').innerText = playerLevel;
    document.getElementById('new-level-name').innerText = getLevelTitle(playerLevel);
    document.getElementById('level-up-modal').classList.remove('hidden');
    playCorrectSound();
    setTimeout(playCorrectSound, 200);
    initConfetti();
}

document.getElementById('btn-close-levelup').addEventListener('click', () => {
    document.getElementById('level-up-modal').classList.add('hidden');
    stopConfetti();
});

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const introScreen = document.getElementById('intro-screen');
const introVideo = document.getElementById('intro-video');
const homeScreen = document.getElementById('home-screen');
const lessonScreen = document.getElementById('lesson-screen');
const mapNodesContainer = document.getElementById('map-nodes');
const mapLinesContainer = document.getElementById('map-lines');
const backBtn = document.getElementById('back-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const accordions = document.querySelectorAll('.accordion-header');

const introVideoSources = ['videos/intro01.mp4', 'videos/intro02.mp4'];
let currentVideoIndex = 0;

const mapPositions = [
    {x: 15, y: 80}, {x: 40, y: 75}, {x: 30, y: 50}, {x: 60, y: 45},
    {x: 85, y: 60}, {x: 75, y: 30}, {x: 45, y: 20}, {x: 20, y: 15}
];

// Intro Logic
document.getElementById('btn-start-adventure').addEventListener('click', () => {
    welcomeScreen.classList.remove('active');
    introScreen.classList.add('active');
    playIntroVideos();
});

function playIntroVideos() {
    currentVideoIndex = 0;
    introVideo.src = introVideoSources[currentVideoIndex];
    introVideo.play().catch(e => {
        console.error('Video auto-play failed:', e);
        endIntro();
    });
    
    introVideo.onended = () => {
        currentVideoIndex++;
        if (currentVideoIndex < introVideoSources.length) {
            introVideo.src = introVideoSources[currentVideoIndex];
            introVideo.play();
        } else {
            endIntro();
        }
    };
}

document.getElementById('btn-skip-intro').addEventListener('click', endIntro);

function endIntro() {
    introVideo.pause();
    introScreen.classList.remove('active');
    homeScreen.classList.add('active');
    document.getElementById('player-stats').classList.remove('hidden');
    drawMap();
}

// Initialize Dashboard
function initDashboard() {
    loadProgress();
    const allLits = [...literatures1, ...literatures2];
    const order = [
        "makato",
        "sukreep",
        "maiyarap",
        "sung-thong",
        "aphai-study",
        "sud-sakorn",
        "ngoh-pa",
        "thong-in"
    ];
    literatures = order.map(id => allLits.find(l => l.id === id));
    drawMap();
}

function drawMap() {
    if (!mapNodesContainer) return;
    mapNodesContainer.innerHTML = '';
    mapLinesContainer.innerHTML = '';
    
    let svgLines = '';
    for (let i = 0; i < literatures.length - 1; i++) {
        const start = mapPositions[i];
        const end = mapPositions[i+1];
        const color = (i < maxUnlockedStage) ? '#3B82F6' : '#9CA3AF';
        const strokeWidth = (i < maxUnlockedStage) ? 4 : 2;
        const dash = (i < maxUnlockedStage) ? '' : 'stroke-dasharray="5,5"';
        
        svgLines += `<line x1="${start.x}%" y1="${start.y}%" x2="${end.x}%" y2="${end.y}%" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
    }
    mapLinesContainer.innerHTML = svgLines;
    
    literatures.forEach((lit, index) => {
        const pos = mapPositions[index];
        const node = document.createElement('div');
        node.className = 'map-node';
        node.style.left = `${pos.x}%`;
        node.style.top = `${pos.y}%`;
        
        const title = document.createElement('div');
        title.className = 'node-title';
        title.innerText = lit.title;
        node.appendChild(title);
        
        if (index < maxUnlockedStage) {
            node.classList.add('node-completed');
            node.innerHTML += '⭐';
        } else if (index === maxUnlockedStage) {
            node.classList.add('node-unlocked');
            node.innerHTML += '⚔️';
        } else {
            node.classList.add('node-locked');
            node.innerHTML += '🔒';
        }
        
        node.addEventListener('click', () => {
            if (index <= maxUnlockedStage) {
                loadLesson(lit);
            } else {
                node.style.animation = 'shake 0.5s';
                setTimeout(() => node.style.animation = '', 500);
            }
        });
        
        mapNodesContainer.appendChild(node);
    });
}

// Load Lesson
function loadLesson(lit) {
    currentLit = lit;
    
    // Populate Content
    document.getElementById('lesson-title').innerText = lit.title;
    document.getElementById('lesson-author').innerText = "ผู้แต่ง: " + lit.author;
    document.getElementById('lesson-image').src = lit.image;
    
    document.getElementById('lesson-context').innerText = lit.context;
    document.getElementById('lesson-form').innerText = lit.form;
    document.getElementById('lesson-synopsis').innerText = lit.synopsis;
    document.getElementById('lesson-hidden').innerText = lit.hidden_meaning;
    document.getElementById('lesson-quote').innerText = lit.quote.replace(/"/g, '');
    
    // Reset state
    switchTab('content');
    closeAllAccordions();
    document.querySelector('.accordion-item').classList.add('active');
    document.querySelector('.accordion-item .accordion-body').style.maxHeight = '500px';

    // Switch screen
    homeScreen.classList.remove('active');
    lessonScreen.classList.add('active');
}

// Accordion Logic
accordions.forEach(acc => {
    acc.addEventListener('click', function(e) {
        const item = this.parentElement;
        const isActive = item.classList.contains('active');
        
        closeAllAccordions();
        
        if (!isActive) {
            item.classList.add('active');
            item.querySelector('.accordion-body').style.maxHeight = item.querySelector('.accordion-body').scrollHeight + "px";
            
            // Give XP for reading (only if not already read in this session)
            if (!item.dataset.read) {
                item.dataset.read = "true";
                addXP(10, e);
            }
        }
    });
});

function closeAllAccordions() {
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-body').style.maxHeight = null;
    });
}

// Tab Logic
function switchTab(tabId) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-area`);
    });
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('start-quiz-btn').addEventListener('click', () => {
    switchTab('quiz');
    startQuiz();
});

backBtn.addEventListener('click', () => {
    lessonScreen.classList.remove('active');
    homeScreen.classList.add('active');
    document.getElementById('hearts-container').classList.add('hidden');
    stopConfetti();
    drawMap();
});

// Quiz Logic
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    playerHearts = 3;
    currentCombo = 0;
    
    document.getElementById('quiz-question-container').classList.remove('hidden');
    document.getElementById('quiz-summary').classList.add('hidden');
    document.getElementById('quiz-progress').classList.remove('hidden');
    document.getElementById('combo-container').classList.add('hidden');
    
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.classList.remove('hidden');
    document.querySelectorAll('.heart').forEach(h => {
        h.className = 'heart active';
    });
    
    renderQuestion();
}

function renderQuestion() {
    answered = false;
    const q = currentLit.quiz[currentQuestionIndex];
    document.getElementById('quiz-question').innerText = `${currentQuestionIndex + 1}. ${q.question}`;
    
    // Update progress
    const progress = ((currentQuestionIndex) / 10) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('quiz-status').innerText = `ข้อ ${currentQuestionIndex + 1} / 10`;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = (e) => selectAnswer(index, btn, e);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback').className = 'feedback-box hidden';
}

function selectAnswer(selectedIndex, btnElement, event) {
    if (answered) return;
    answered = true;
    
    const q = currentLit.quiz[currentQuestionIndex];
    const isCorrect = selectedIndex === q.answer;
    
    // Disable all buttons
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    
    btnElement.classList.add('selected');
    
    if (isCorrect) {
        score++;
        currentCombo++;
        btnElement.classList.add('correct');
        playCorrectSound();
        showFeedback(true, q.explanation);
        
        // Gamification XP
        const xpGained = 20 + (currentCombo * 5);
        addXP(xpGained, event);
        
        if (currentCombo > 1) {
            const comboEl = document.getElementById('combo-container');
            comboEl.classList.remove('hidden');
            document.getElementById('combo-count').innerText = currentCombo;
            comboEl.classList.remove('animate-combo');
            void comboEl.offsetWidth; // trigger reflow
            comboEl.classList.add('animate-combo');
        }
    } else {
        btnElement.classList.add('wrong');
        allBtns[q.answer].classList.add('correct'); // Show correct answer
        playWrongSound();
        showFeedback(false, q.explanation);
        
        // Gamification Penalties
        currentCombo = 0;
        document.getElementById('combo-container').classList.add('hidden');
        
        if (playerHearts > 0) {
            const heartEl = document.getElementById(`heart-${playerHearts}`);
            heartEl.className = 'heart lost';
            playerHearts--;
            
            document.getElementById('lesson-container').classList.add('screen-shake');
            setTimeout(() => {
                document.getElementById('lesson-container').classList.remove('screen-shake');
            }, 500);
            
            if (playerHearts === 0) {
                setTimeout(showGameOver, 1500);
            }
        }
    }
}

function showGameOver() {
    document.getElementById('game-over-modal').classList.remove('hidden');
}

document.getElementById('btn-revive').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    switchTab('content');
});

function showFeedback(isCorrect, explanation) {
    const feedbackBox = document.getElementById('quiz-feedback');
    feedbackBox.className = `feedback-box ${isCorrect ? 'correct-bg' : 'wrong-bg'}`;
    
    document.getElementById('feedback-icon').innerText = isCorrect ? '✅' : '❌';
    document.getElementById('feedback-title').innerText = isCorrect ? 'ถูกต้อง!' : 'ผิดครับ!';
    document.getElementById('feedback-explanation').innerText = explanation;
    
    // Update button text for last question
    if (currentQuestionIndex === 9) {
        document.getElementById('next-question-btn').innerText = 'ดูสรุปคะแนน';
    } else {
        document.getElementById('next-question-btn').innerText = 'ข้อต่อไป';
    }
}

document.getElementById('next-question-btn').addEventListener('click', () => {
    if (playerHearts === 0) return; // Cannot continue if game over
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
        renderQuestion();
    } else {
        showSummary();
    }
});

function showSummary() {
    document.getElementById('quiz-question-container').classList.add('hidden');
    document.getElementById('quiz-feedback').classList.add('hidden');
    document.getElementById('quiz-progress').classList.add('hidden');
    document.getElementById('combo-container').classList.add('hidden');
    
    const summaryBox = document.getElementById('quiz-summary');
    summaryBox.classList.remove('hidden');
    
    document.getElementById('final-score').innerText = score;
    
    const messageEl = document.getElementById('score-message');
    if (score >= 8) {
        messageEl.innerText = "ยอดเยี่ยมมาก! คุณมีความรู้ระดับปรมาจารย์วรรณคดี 🏆";
        initConfetti();
        playCorrectSound();
        setTimeout(playCorrectSound, 300);
    } else if (score >= 5) {
        messageEl.innerText = "ทำได้ดี! แต่ยังสามารถกลับไปทบทวนเนื้อหาเพิ่มเติมได้นะ 👍";
    } else {
        messageEl.innerText = "พยายามเข้า! ลองอ่านเนื้อหาอีกครั้งแล้วกลับมาสอบใหม่นะ 💪";
    }
    // Unlock next stage if passed (>= 5/10)
    const currentGlobalIndex = literatures.findIndex(l => l.id === currentLit.id);
    if (score >= 5 && currentGlobalIndex === maxUnlockedStage) {
        maxUnlockedStage++;
        saveProgress();
    }
}

document.getElementById('retry-btn').addEventListener('click', startQuiz);
document.getElementById('home-btn-summary').addEventListener('click', () => {
    lessonScreen.classList.remove('active');
    homeScreen.classList.add('active');
    document.getElementById('hearts-container').classList.add('hidden');
    stopConfetti();
    drawMap();
});

// Init app
document.addEventListener('DOMContentLoaded', initDashboard);
