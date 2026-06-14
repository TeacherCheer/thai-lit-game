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

document.getElementById('start-action-btn')?.addEventListener('click', () => {
    switchTab('quiz');
});

document.getElementById('enter-battle-btn')?.addEventListener('click', () => {
    startActionGame();
});

document.getElementById('quit-action-btn')?.addEventListener('click', () => {
    quitActionGame();
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

document.getElementById('next-question-btn')?.addEventListener('click', () => {
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

document.getElementById('retry-btn')?.addEventListener('click', startQuiz);
document.getElementById('home-btn-summary')?.addEventListener('click', () => {
    lessonScreen.classList.remove('active');
    homeScreen.classList.add('active');
    document.getElementById('hearts-container').classList.add('hidden');
    stopConfetti();
    drawMap();
});

// Init app
document.addEventListener('DOMContentLoaded', initDashboard);

// ==========================================
// Action Game Engine (Survivor-like)
// ==========================================
// Load Assets
const playerImg = new Image();
playerImg.src = 'img/characters/Actor1.png'; // Using first character sprite

const enemyImg = new Image();
enemyImg.src = 'img/enemies/Goblin.png';

const bgImg = new Image();
bgImg.src = 'img/battlebacks1/Grassland.png'; // Static background to prevent dizziness

const gameCanvas = document.getElementById('game-canvas');
const gCtx = gameCanvas.getContext('2d');
let gameActive = false;
let gamePaused = false;
let animationFrameId;
let lastTime = 0;

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

let player = { x: 0, y: 0, radius: 24, speed: 150, hp: 3, maxHp: 3, level: 1, xp: 0, maxXp: 2, attackCooldown: 1, currentCooldown: 0, damage: 1, projectiles: 1 };
let enemies = [];
let projectiles = [];
let gameTimer = 0;
let enemySpawnTimer = 0;
let currentQuestionForUpgrade = null;

const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

function startActionGame() {
    lessonScreen.classList.remove('active');
    document.getElementById('action-screen').classList.add('active');
    
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    
    // Handle window resize/orientation change
    window.addEventListener('resize', resizeCanvas);
    
    // Reset State
    player = { 
        x: WORLD_WIDTH / 2, 
        y: WORLD_HEIGHT / 2, 
        radius: 24, speed: 200, hp: 3, maxHp: 3, 
        level: 1, xp: 0, maxXp: 2, 
        attackCooldown: 1.5, currentCooldown: 0, 
        damage: 1, projectiles: 1 
    };
    enemies = [];
    projectiles = [];
    gameTimer = 0;
    enemySpawnTimer = 0;
    gameActive = true;
    gamePaused = false;
    currentQuestionIndex = 0;
    
    updateGameHUD();
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function quitActionGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resizeCanvas);
    document.getElementById('action-screen').classList.remove('active');
    homeScreen.classList.add('active');
    drawMap();
}

function resizeCanvas() {
    if (gameActive) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    }
}

function updateGameHUD() {
    document.getElementById('game-hp').innerText = '❤️'.repeat(player.hp) + '🖤'.repeat(player.maxHp - player.hp);
    document.getElementById('game-level-text').innerText = player.level;
    document.getElementById('game-xp-fill').style.width = `${(player.xp / player.maxXp) * 100}%`;
    
    const m = Math.floor(gameTimer / 60).toString().padStart(2, '0');
    const s = Math.floor(gameTimer % 60).toString().padStart(2, '0');
    document.getElementById('game-timer').innerText = `⏳ ${m}:${s}`;
}

function gameLoop(timestamp) {
    if (!gameActive) return;
    
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    if (!gamePaused) {
        updateGame(dt);
    }
    drawGame();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame(dt) {
    gameTimer += dt;
    enemySpawnTimer += dt;
    
    // Player movement
    let dx = 0, dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;
    
    if (joystickActive) {
        dx = joystickInput.x;
        dy = joystickInput.y;
    }
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len > 1 || (!joystickActive && len > 0)) {
            dx /= len;
            dy /= len;
        }
        player.x += dx * player.speed * dt;
        player.y += dy * player.speed * dt;
    }
    
    // Boundary check
    player.x = Math.max(player.radius, Math.min(WORLD_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(WORLD_HEIGHT - player.radius, player.y));
    
    // Attack
    player.currentCooldown -= dt;
    if (player.currentCooldown <= 0 && enemies.length > 0) {
        player.currentCooldown = player.attackCooldown;
        fireProjectile();
    }
    
    // Spawning enemies - fast spawn from the start but capped
    const spawnRate = Math.max(0.25, 0.5 - (gameTimer / 120)); 
    if (enemySpawnTimer > spawnRate) {
        enemySpawnTimer = 0;
        if (enemies.length < 40) { // Cap maximum enemies on screen to 40
            spawnEnemy();
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let ex = player.x - e.x;
        let ey = player.y - e.y;
        let dist = Math.sqrt(ex*ex + ey*ey);
        
        e.x += (ex / dist) * e.speed * dt;
        e.y += (ey / dist) * e.speed * dt;
        
        // Damage player
        if (dist < player.radius + e.radius) {
            player.hp -= 1;
            enemies.splice(i, 1); // remove enemy on hit
            updateGameHUD();
            document.getElementById('action-screen').classList.add('screen-shake');
            setTimeout(() => document.getElementById('action-screen').classList.remove('screen-shake'), 300);
            playWrongSound();
            
            if (player.hp <= 0) {
                gameOverAction();
            }
        }
    }
    
    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        
        if (p.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            let dist = Math.sqrt(Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2));
            if (dist < p.radius + e.radius) {
                e.hp -= player.damage;
                projectiles.splice(i, 1);
                
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    playTone(400, 'triangle', 0.1, 0.1); // hit sound
                    
                    // Directly gain XP (Kill 2 = Level Up)
                    player.xp += 1;
                    if (player.xp >= player.maxXp) {
                        levelUpAction();
                    }
                    updateGameHUD();
                }
                break;
            }
        }
    }
    
    // Win condition check (survive 90 seconds)
    if (gameTimer >= 90) {
        stageClearAction();
    }
    
    // Update Timer UI occasionally
    if (Math.floor(gameTimer * 10) % 10 === 0) updateGameHUD();
}

function drawGame() {
    gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gCtx.save();
    let cameraX = player.x - gameCanvas.width / 2;
    let cameraY = player.y - gameCanvas.height / 2;
    cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - gameCanvas.width));
    cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - gameCanvas.height));
    gCtx.translate(-cameraX, -cameraY);
    
    // Static Background (replaces grid to prevent dizziness)
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        let ptrn = gCtx.createPattern(bgImg, 'repeat');
        gCtx.fillStyle = ptrn;
        gCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    } else {
        gCtx.fillStyle = '#2d4b2b';
        gCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }
    
    // Enemies
    enemies.forEach(e => {
        if (enemyImg.complete && enemyImg.naturalWidth > 0) {
            gCtx.drawImage(enemyImg, e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
        } else {
            gCtx.fillStyle = '#EF4444';
            gCtx.beginPath();
            gCtx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            gCtx.fill();
        }
    });
    
    // Projectiles
    projectiles.forEach(p => {
        gCtx.fillStyle = '#FCD34D';
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        gCtx.fill();
    });
    
    // Player
    if (playerImg.complete && playerImg.naturalWidth > 0) {
        // Draw the top-left sprite from Actor1.png (48x48 pixels)
        gCtx.drawImage(playerImg, 0, 0, 48, 48, player.x - 24, player.y - 24, 48, 48);
    } else {
        gCtx.fillStyle = '#3B82F6';
        gCtx.beginPath();
        gCtx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.strokeStyle = 'white';
        gCtx.lineWidth = 2;
        gCtx.stroke();
    }
    
    gCtx.restore();
}

function spawnEnemy() {
    let angle = Math.random() * Math.PI * 2;
    let dist = Math.max(gameCanvas.width, gameCanvas.height) / 2 + 50;
    enemies.push({
        x: player.x + Math.cos(angle) * dist,
        y: player.y + Math.sin(angle) * dist,
        radius: 20 + Math.random() * 5,
        speed: 60 + Math.random() * 50 + (gameTimer * 0.5), // gets faster over time
        hp: 1 + Math.floor(gameTimer / 20)
    });
}

function fireProjectile() {
    if (enemies.length === 0) return;
    
    // Find closest enemy
    let closest = null;
    let minD = Infinity;
    enemies.forEach(e => {
        let d = Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2);
        if (d < minD) { minD = d; closest = e; }
    });
    
    if (closest) {
        for(let i=0; i<player.projectiles; i++) {
            let angleOffset = (i - (player.projectiles-1)/2) * 0.2;
            let targetAngle = Math.atan2(closest.y - player.y, closest.x - player.x) + angleOffset;
            
            projectiles.push({
                x: player.x, y: player.y,
                vx: Math.cos(targetAngle) * 400,
                vy: Math.sin(targetAngle) * 400,
                radius: 5,
                life: 2 // 2 seconds
            });
        }
        playTone(600, 'square', 0.1, 0.05); // shoot sound
    }
}

// Remove spawnGem completely

function gameOverAction() {
    gamePaused = true;
    setTimeout(() => {
        quitActionGame();
        document.getElementById('game-over-modal').classList.remove('hidden');
    }, 1000);
}

function stageClearAction() {
    gamePaused = true;
    setTimeout(() => {
        quitActionGame();
        
        // Unlock next stage
        const currentGlobalIndex = literatures.findIndex(l => l.id === currentLit.id);
        if (currentGlobalIndex === maxUnlockedStage) {
            maxUnlockedStage++;
            saveProgress();
        }
        
        document.getElementById('stage-score').innerText = Math.floor(gameTimer * 10 + player.level * 100);
        document.getElementById('stage-clear-modal').classList.remove('hidden');
        initConfetti();
        playCorrectSound();
    }, 1000);
}

document.getElementById('btn-back-map-clear')?.addEventListener('click', () => {
    document.getElementById('stage-clear-modal').classList.add('hidden');
    stopConfetti();
});

// ==========================================
// Upgrade Quiz System
// ==========================================

function levelUpAction() {
    gamePaused = true;
    player.xp -= player.maxXp; // Consumes required kills
    player.level++;
    player.maxXp = Math.min(6, player.maxXp + 2); // Scale up to a maximum of 6 kills needed
    updateGameHUD();
    
    // Safety fallback
    if (!currentLit || !currentLit.quiz) return resumeGame(); 
    
    // If answered all questions, clear the stage immediately!
    if (currentQuestionIndex >= currentLit.quiz.length) {
        stageClearAction();
        return;
    }
    
    currentQuestionForUpgrade = currentLit.quiz[currentQuestionIndex];
    currentQuestionIndex++;
    
    showUpgradeQuiz();
}

function showUpgradeQuiz() {
    const modal = document.getElementById('upgrade-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('upgrade-question-container').classList.remove('hidden');
    document.getElementById('upgrade-feedback').classList.add('hidden');
    document.getElementById('upgrade-choices').classList.add('hidden');
    document.getElementById('upgrade-continue-btn').classList.add('hidden');
    
    document.getElementById('upgrade-question').innerText = currentQuestionForUpgrade.question;
    
    const optionsContainer = document.getElementById('upgrade-options');
    optionsContainer.innerHTML = '';
    
    currentQuestionForUpgrade.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = (e) => handleUpgradeAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function handleUpgradeAnswer(selectedIndex, btnElement) {
    const isCorrect = selectedIndex === currentQuestionForUpgrade.answer;
    
    const allBtns = document.querySelectorAll('#upgrade-options .option-btn');
    allBtns.forEach(b => b.disabled = true);
    btnElement.classList.add('selected');
    
    const feedbackBox = document.getElementById('upgrade-feedback');
    feedbackBox.classList.remove('hidden');
    document.getElementById('upgrade-question-container').classList.add('hidden');
    
    if (isCorrect) {
        btnElement.classList.add('correct');
        playCorrectSound();
        feedbackBox.className = 'feedback-box correct-bg';
        document.getElementById('upgrade-feedback-icon').innerText = '✅';
        document.getElementById('upgrade-feedback-title').innerText = 'ถูกต้อง! เลือกระดับพลัง';
        document.getElementById('upgrade-feedback-explanation').innerText = currentQuestionForUpgrade.explanation;
        
        showUpgradeChoices();
    } else {
        btnElement.classList.add('wrong');
        allBtns[currentQuestionForUpgrade.answer].classList.add('correct');
        playWrongSound();
        feedbackBox.className = 'feedback-box wrong-bg';
        document.getElementById('upgrade-feedback-icon').innerText = '❌';
        document.getElementById('upgrade-feedback-title').innerText = 'ผิดพลาด! ไม่ได้รับการอัปเกรด';
        document.getElementById('upgrade-feedback-explanation').innerText = currentQuestionForUpgrade.explanation;
        
        // Take a small penalty or just no upgrade
        const continueBtn = document.getElementById('upgrade-continue-btn');
        continueBtn.classList.remove('hidden');
        continueBtn.onclick = () => {
            document.getElementById('upgrade-modal').classList.add('hidden');
            resumeGame();
        };
    }
}

function showUpgradeChoices() {
    document.getElementById('upgrade-choices').classList.remove('hidden');
    const cardsContainer = document.getElementById('upgrade-cards');
    cardsContainer.innerHTML = '';
    
    const possibleUpgrades = [
        { id: 'dmg', icon: '⚔️', title: 'พลังโจมตี', desc: '+1 ดาเมจ', apply: () => player.damage += 1 },
        { id: 'spd', icon: '👟', title: 'ความเร็ว', desc: '+20 ความเร็วเคลื่อนที่', apply: () => player.speed += 20 },
        { id: 'atkSpd', icon: '⚡', title: 'ความเร็วโจมตี', desc: 'โจมตีไวขึ้น 20%', apply: () => player.attackCooldown *= 0.8 },
        { id: 'proj', icon: '✨', title: 'วิชาแยกเงา', desc: '+1 จำนวนกระสุน', apply: () => player.projectiles += 1 },
        { id: 'heal', icon: '❤️', title: 'ฟื้นฟู', desc: 'ฟื้นฟู 1 หัวใจ', apply: () => player.hp = Math.min(player.maxHp, player.hp + 1) }
    ];
    
    // Pick 3 random upgrades
    const shuffled = possibleUpgrades.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 3);
    
    selected.forEach(upg => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="upgrade-icon">${upg.icon}</div>
            <div class="upgrade-title">${upg.title}</div>
            <div class="upgrade-desc">${upg.desc}</div>
        `;
        card.onclick = () => {
            upg.apply();
            playTone(800, 'sine', 0.2, 0.2);
            setTimeout(() => playTone(1200, 'sine', 0.3, 0.2), 100);
            updateGameHUD();
            document.getElementById('upgrade-modal').classList.add('hidden');
            resumeGame();
        };
        cardsContainer.appendChild(card);
    });
}

function resumeGame() {
    gamePaused = false;
    lastTime = performance.now();
    // Clear keys to prevent getting stuck moving
    Object.keys(keys).forEach(k => keys[k] = false);
}

// Init app
document.addEventListener('DOMContentLoaded', initDashboard);

// ==========================================
// Mobile/Tablet Joystick Control
// ==========================================
let joystickActive = false;
let joystickInput = { x: 0, y: 0 };
let joystickCenter = { x: 0, y: 0 };
const joystickContainer = document.getElementById('joystick-container');
const joystickKnob = document.getElementById('joystick-knob');
const joystickMaxRadius = 60; // Half of container width (120px/2)

if (joystickContainer) {
    joystickContainer.addEventListener('touchstart', handleJoystickStart, { passive: false });
    joystickContainer.addEventListener('touchmove', handleJoystickMove, { passive: false });
    joystickContainer.addEventListener('touchend', handleJoystickEnd);
    joystickContainer.addEventListener('touchcancel', handleJoystickEnd);
}

function handleJoystickStart(e) {
    e.preventDefault();
    joystickActive = true;
    const rect = joystickContainer.getBoundingClientRect();
    joystickCenter.x = rect.left + rect.width / 2;
    joystickCenter.y = rect.top + rect.height / 2;
    updateJoystickPosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
}

function handleJoystickMove(e) {
    if (!joystickActive) return;
    e.preventDefault();
    updateJoystickPosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
}

function handleJoystickEnd(e) {
    joystickActive = false;
    joystickInput = { x: 0, y: 0 };
    if (joystickKnob) joystickKnob.style.transform = `translate(-50%, -50%)`;
}

function updateJoystickPosition(clientX, clientY) {
    let dx = clientX - joystickCenter.x;
    let dy = clientY - joystickCenter.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > joystickMaxRadius) {
        dx = (dx / distance) * joystickMaxRadius;
        dy = (dy / distance) * joystickMaxRadius;
    }
    
    if (joystickKnob) {
        joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    
    joystickInput.x = dx / joystickMaxRadius;
    joystickInput.y = dy / joystickMaxRadius;
}
