document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // === CUSTOM CURSOR ===
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    function animateCursor() {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    document.querySelectorAll('a, button, .memory-card').forEach(el => {
        el.addEventListener('mouseenter', () => { ring.style.width = '52px'; ring.style.height = '52px'; ring.style.borderColor = '#e8576d'; });
        el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = '#f4a0ab'; });
    });

    // === LOADER ===
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');
    const loaderBar = document.getElementById('loaderBarFill');
    const phrases = ['Đang lật lại từng trang ký ức...', 'Tìm lại mùa hè năm ấy...', 'Sắp xong rồi...'];
    let pi = 0, ci = 0, progress = 0;

    function typeLoader() {
        if (pi >= phrases.length) { finishLoading(); return; }
        const phrase = phrases[pi];
        if (ci <= phrase.length) {
            loaderText.textContent = phrase.substring(0, ci);
            ci++;
            progress = ((pi * 100 / phrases.length) + (ci / phrase.length) * (100 / phrases.length));
            loaderBar.style.width = Math.min(progress, 100) + '%';
            setTimeout(typeLoader, 50);
        } else {
            setTimeout(() => { ci = 0; pi++; typeLoader(); }, 600);
        }
    }
    typeLoader();

    function finishLoading() {
        loaderBar.style.width = '100%';
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(initAnimations, 300);
        }, 400);
    }

    // === PETAL PARTICLE SYSTEM ===
    const canvas = document.getElementById('petalCanvas');
    const ctx = canvas.getContext('2d');
    let petals = [];
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Petal {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20 - Math.random() * 100;
            this.size = 3 + Math.random() * 5;
            this.speedY = 0.3 + Math.random() * 0.8;
            this.speedX = -0.2 + Math.random() * 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
            this.opacity = 0.15 + Math.random() * 0.25;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.01 + Math.random() * 0.02;
        }
        update() {
            this.y += this.speedY;
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.3;
            this.rotation += this.rotSpeed;
            if (this.y > canvas.height + 20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            // Dynamically retrieve accent color based on active theme
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#e8576d';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    for (let i = 0; i < 25; i++) { const p = new Petal(); p.y = Math.random() * canvas.height; petals.push(p); }
    function animatePetals() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animatePetals);
    }
    animatePetals();

    // === NAV SCROLL ===
    const nav = document.getElementById('nav');
    const progressBar = document.getElementById('navProgressBar');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (scrollY / docH * 100) + '%';
        nav.classList.toggle('scrolled', scrollY > 80);

        // Active section tracking
        let current = '';
        sections.forEach(s => {
            if (scrollY >= s.offsetTop - 300) current = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.section === current);
        });
    });

    // === MAIN ANIMATIONS ===
    function initAnimations() {
        // Hero entrance
        const heroTL = gsap.timeline();
        heroTL
            .to('.hero-title-line', { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' })
            .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.8')
            .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
            .to('.hero-meta', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4')
            .to('.hero-scroll-cta', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');

        // Hero parallax
        gsap.to('.hero-bg-image', {
            yPercent: 20, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });

        // Quote section
        gsap.from('.quote-icon', {
            scale: 0, rotation: -180, duration: 1, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: '.quote-section', start: 'top 75%' }
        });
        gsap.from('.quote-text', {
            y: 60, opacity: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.quote-text', start: 'top 80%' }
        });
        gsap.from('.quote-author', {
            y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: '.quote-author', start: 'top 85%' }
        });

        // Memories section
        gsap.from('.memories-header', {
            y: 50, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.memories-header', start: 'top 80%' }
        });
        gsap.from('.memory-card', {
            y: 80, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.memories-gallery', start: 'top 80%' }
        });

        // Classroom parallax
        gsap.to('.classroom-bg-image', {
            y: '-15%', ease: 'none',
            scrollTrigger: { trigger: '.classroom-section', start: 'top bottom', end: 'bottom top', scrub: true }
        });
        gsap.from('.classroom-text-card', {
            x: -80, opacity: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.classroom-section', start: 'top 60%' }
        });

        // Classroom stat counter
        document.querySelectorAll('.classroom-stat-number').forEach(el => {
            const val = parseInt(el.textContent);
            if (!isNaN(val)) {
                gsap.from(el, {
                    textContent: 0, duration: 2, ease: 'power1.out',
                    snap: { textContent: 1 },
                    scrollTrigger: { trigger: el, start: 'top 85%' }
                });
            }
        });

        // Ending section
        gsap.from('.ending-icon', {
            scale: 0, duration: 0.8, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: '.ending-section', start: 'top 70%' }
        });
        gsap.from('.ending-title-line', {
            y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.ending-title', start: 'top 75%' }
        });
        gsap.from('.ending-subtitle', {
            y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: '.ending-subtitle', start: 'top 85%' }
        });
        gsap.from('.ending-cta-group', {
            y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: '.ending-cta-group', start: 'top 90%' }
        });
    }

    // Hero mouse parallax
    document.addEventListener('mousemove', e => {
        const xR = (e.clientX / window.innerWidth - 0.5) * 2;
        const yR = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to('.hero-bg-image', { x: xR * 15, y: yR * 10, duration: 1.2, ease: 'power1.out' });
    });

    // Smooth nav links
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ==========================================
    // ========== 1. THEME SWITCHER SYSTEM ======
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    
    // Check local storage for theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        
        // Soft click feedback effect on the toggle button
        gsap.fromTo(themeToggle, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    });

    // ==========================================
    // ========== 2. RETRO CASSETTE LO-FI AUDIO =
    // ==========================================
    const cassettePlayer = document.getElementById('cassettePlayer');
    const musicPlayBtn = document.getElementById('musicPlayBtn');
    const musicPauseBtn = document.getElementById('musicPauseBtn');
    const musicVolume = document.getElementById('musicVolume');
    
    let audioCtx = null;
    let mainGainNode = null;
    let crackleNode = null;
    let isSynthPlaying = false;
    
    // Create Audio Element for user's MP3 file
    let lofiAudio = new Audio('Có Công Mài Sắc.mp3');
    lofiAudio.loop = true;
    let audioSourceNode = null;
    
    // Initialize Web Audio API elements for high quality audio processing
    function initSynth() {
        if (audioCtx) return;
        
        // Create Audio Context with fallback
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        // Main volume gain node
        mainGainNode = audioCtx.createGain();
        mainGainNode.gain.value = parseFloat(musicVolume.value) || 0.45;
        mainGainNode.connect(audioCtx.destination);
        
        // Link lofiAudio element as source node under Web Audio API!
        audioSourceNode = audioCtx.createMediaElementSource(lofiAudio);
        
        // Create custom delay feedback node for warm echo
        const delayNode = audioCtx.createDelay(1.0);
        delayNode.delayTime.value = 0.45; // 450ms warm vintage echo delay
        
        const delayGain = audioCtx.createGain();
        delayGain.gain.value = 0.22; // feedback volume
        
        delayNode.connect(delayGain);
        delayGain.connect(delayNode); // feedback loop
        delayNode.connect(mainGainNode); // output delay
        
        // Deep low-pass filter to muffle the sound for authentic Lo-fi vibe
        const lowpassFilter = audioCtx.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 1350; // Set to 1350Hz to muffle high frequencies while keeping lyrics clearly readable!
        lowpassFilter.Q.value = 1.0;
        
        // Route audio source node to both main gain and the retro filter
        audioSourceNode.connect(lowpassFilter);
        audioSourceNode.connect(mainGainNode); // bypass filter slightly to keep vocals crisp
        lowpassFilter.connect(mainGainNode);
        lowpassFilter.connect(delayNode);
        
        // 1. Play realistic vinyl record crackle noise
        crackleNode = audioCtx.createBufferSource();
        const bufferSize = audioCtx.sampleRate * 2.5; // 2.5 seconds loop
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const whiteNoise = Math.random() * 2 - 1;
            let crackleClick = 0;
            // Add rare, dynamic dust snaps/clicks
            if (Math.random() < 0.00035) {
                crackleClick = (Math.random() * 2 - 1) * 0.45;
            }
            data[i] = whiteNoise * 0.012 + crackleClick;
        }
        
        crackleNode.buffer = noiseBuffer;
        crackleNode.loop = true;
        
        // Vinyl crackle level gain node
        const crackleGain = audioCtx.createGain();
        crackleGain.gain.value = 0.15;
        crackleNode.connect(crackleGain);
        crackleGain.connect(audioCtx.destination); // Direct bypass filter for high-freq crackle crispness!
        crackleNode.start(0);
    }
    
    // Play/Pause handling
    function playLoFiMusic() {
        if (!audioCtx) {
            initSynth();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        lofiAudio.play();
        isSynthPlaying = true;
        cassettePlayer.classList.add('playing');
        musicPlayBtn.classList.add('hidden');
        musicPauseBtn.classList.remove('hidden');
        
        // Animate cassette body on press
        gsap.to('.cassette-body', { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });
    }
    
    function pauseLoFiMusic() {
        lofiAudio.pause();
        isSynthPlaying = false;
        cassettePlayer.classList.remove('playing');
        musicPlayBtn.classList.remove('hidden');
        musicPauseBtn.classList.add('hidden');
    }
    
    musicPlayBtn.addEventListener('click', playLoFiMusic);
    musicPauseBtn.addEventListener('click', pauseLoFiMusic);
    
    // Volume Control Slider mapping
    musicVolume.addEventListener('input', () => {
        const vol = parseFloat(musicVolume.value);
        if (mainGainNode) {
            mainGainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        }
    });

    // ==========================================
    // ========== 3. DIARY MEMORY LIGHTBOX ======
    // ==========================================
    const diaryLightbox = document.getElementById('diaryLightbox');
    const diaryLightboxOverlay = document.getElementById('diaryLightboxOverlay');
    const diaryLightboxClose = document.getElementById('diaryLightboxClose');
    
    const diaryLightboxImg = document.getElementById('diaryLightboxImg');
    const diaryLightboxCaption = document.getElementById('diaryLightboxCaption');
    const diaryLightboxTag = document.getElementById('diaryLightboxTag');
    const diaryLightboxDate = document.getElementById('diaryLightboxDate');
    const diaryLightboxTitle = document.getElementById('diaryLightboxTitle');
    const diaryLightboxStory = document.getElementById('diaryLightboxStory');
    
    // Click polaroid card to trigger story book modal
    document.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', () => {
            const tag = card.getAttribute('data-story-tag') || "Kỷ niệm";
            const title = card.getAttribute('data-story-title') || "Thanh Xuân";
            const date = card.getAttribute('data-story-date') || "Mùa hè";
            const story = card.getAttribute('data-story-content') || "";
            const img = card.getAttribute('data-story-img') || "";
            
            // Populate lightbox content
            diaryLightboxTag.textContent = tag;
            diaryLightboxTitle.textContent = title;
            diaryLightboxDate.textContent = date;
            diaryLightboxStory.textContent = story;
            diaryLightboxImg.src = img;
            diaryLightboxCaption.textContent = title;
            
            // Open lightbox with clean body class control
            diaryLightbox.classList.add('active');
            document.body.classList.add('dark-theme-parent'); // Keeps styling consistent
            document.body.style.overflow = 'hidden';
            
            // Premium Entrance GSAP animation for internal diary page
            gsap.fromTo('.diary-book', {
                rotationY: -45,
                transformOrigin: 'left center',
                opacity: 0,
                scale: 0.9
            }, {
                rotationY: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
            
            gsap.fromTo('.diary-photo-frame', {
                rotation: -10,
                opacity: 0,
                x: -30
            }, {
                rotation: -2.5,
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'back.out(1.5)'
            });
        });
    });
    
    function closeDiaryLightbox() {
        diaryLightbox.classList.remove('active');
        document.body.classList.remove('dark-theme-parent');
        document.body.style.overflow = '';
    }
    
    diaryLightboxClose.addEventListener('click', closeDiaryLightbox);
    diaryLightboxOverlay.addEventListener('click', closeDiaryLightbox);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && diaryLightbox.classList.contains('active')) {
            closeDiaryLightbox();
        }
    });

    // ==========================================
    // ========== 4. UPGRADED GUESTBOOK SYSTEM ==
    // ==========================================
    const gbOverlay = document.getElementById('guestbookOverlay');
    const gbClose = document.getElementById('guestbookClose');
    const gbForm = document.getElementById('guestbookForm');
    const gbMessages = document.getElementById('guestbookMessages');
    const gbEmpty = document.getElementById('guestbookEmpty');
    const gbCount = document.getElementById('gbCount');
    const gbCharCount = document.getElementById('gbCharCount');
    const gbMessageInput = document.getElementById('gbMessage');
    const btnLuuBut = document.getElementById('btnLuuBut');

    // Open guestbook
    function openGuestbook(e) {
        if (e) e.preventDefault();
        gbOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Open book page turning GSAP animation
        gsap.fromTo('.notebook-3d', {
            rotationX: 10,
            scale: 0.95,
            opacity: 0
        }, {
            rotationX: 0,
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
        });
        
        gsap.from('.book-page-left', {
            x: -20,
            opacity: 0,
            duration: 0.5,
            delay: 0.2
        });
        
        gsap.from('.book-page-right', {
            x: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.2
        });
    }
    
    // Close guestbook
    function closeGuestbook() {
        gbOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    btnLuuBut.addEventListener('click', openGuestbook);
    gbClose.addEventListener('click', closeGuestbook);
    gbOverlay.addEventListener('click', e => {
        if (e.target === gbOverlay) closeGuestbook();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && gbOverlay.classList.contains('active')) closeGuestbook();
    });

    // Character counter
    gbMessageInput.addEventListener('input', () => {
        gbCharCount.textContent = gbMessageInput.value.length;
    });

    // Load messages from localStorage with emotional and immersive defaults
    const defaultMessages = [
        {
            name: "Trần Duy Hiếu",
            message: "Thanh xuân trôi qua nhanh như một cái chớp mắt. Cảm ơn vì chúng ta đã từng là một phần rực rỡ nhất trong tuổi trẻ của nhau. Nhớ mãi những mùa hè đầy nắng gió ấy!",
            color: "#ffccd5", // Pink paint pot
            timestamp: Date.now() - 86400000 * 3, // 3 days ago
            rotation: -1.5
        },
        {
            name: "Nguyễn Minh Thu",
            message: "Nhớ phượng đỏ, nhớ lớp học chiều tan trường nắng rực vàng trên bàn gỗ. Chúc tập thể lớp chúng mình mãi giữ trọn nụ cười thanh xuân trên môi nhé! Thương tất cả! 🌸",
            color: "#e3faf2", // Mint green paint pot
            timestamp: Date.now() - 86400000 * 1.5, // 1.5 days ago
            rotation: 1.2
        },
        {
            name: "Lê Hoàng Nam",
            message: "Nhớ những buổi trốn học đi chơi game, bị thầy chủ nhiệm bắt đứng phạt dưới cột cờ haha. Mong ngày tụ họp đông đủ lớp học năm xưa quá đi!",
            color: "#fff9db", // Light yellow paint pot
            timestamp: Date.now() - 3600000 * 4, // 4 hours ago
            rotation: -2.0
        }
    ];

    function getMessages() {
        try {
            const stored = localStorage.getItem('guestbook_messages');
            if (!stored) {
                localStorage.setItem('guestbook_messages', JSON.stringify(defaultMessages));
                return defaultMessages;
            }
            const parsed = JSON.parse(stored);
            if (parsed.length === 0) {
                localStorage.setItem('guestbook_messages', JSON.stringify(defaultMessages));
                return defaultMessages;
            }
            return parsed;
        }
        catch { return defaultMessages; }
    }
    
    function saveMessages(msgs) {
        localStorage.setItem('guestbook_messages', JSON.stringify(msgs));
    }

    // Format time ago cleanly
    function timeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ngày trước`;
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN');
    }

    // Render message cards as beautiful sticky notes
    function renderMessages() {
        const msgs = getMessages();
        gbCount.textContent = `(${msgs.length})`;

        // Clear existing cards
        gbMessages.querySelectorAll('.gb-message-card').forEach(c => c.remove());

        if (msgs.length === 0) {
            gbEmpty.style.display = 'block';
            return;
        }
        gbEmpty.style.display = 'none';

        // Render newest messages first on top of list
        msgs.slice().reverse().forEach(msg => {
            const card = document.createElement('div');
            card.className = 'gb-message-card';
            
            // Random sticky note rotation if not pre-defined
            const rot = msg.rotation !== undefined ? msg.rotation : (Math.random() * 4 - 2).toFixed(1);
            
            card.style.setProperty('--card-color', msg.color);
            card.style.setProperty('--note-rotation', `${rot}deg`);
            
            card.innerHTML = `
                <div class="gb-message-top">
                    <div class="gb-message-author">
                        <span class="gb-message-name">${escapeHtml(msg.name)}</span>
                    </div>
                    <span class="gb-message-time">${timeAgo(msg.timestamp)}</span>
                </div>
                <div class="gb-message-body">${escapeHtml(msg.message)}</div>
            `;
            gbMessages.appendChild(card);
        });
    }

    // XSS Prevention
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Premium school notebook custom toasts
    function showToast(text) {
        let toast = document.querySelector('.gb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'gb-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        
        // Toast entrance animation
        gsap.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        
        setTimeout(() => {
            gsap.to(toast, {
                y: -10,
                opacity: 0,
                duration: 0.4,
                onComplete: () => toast.classList.remove('show')
            });
        }, 3000);
    }

    // Guestbook form submission
    gbForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('gbName').value.trim();
        const message = gbMessageInput.value.trim();
        const color = document.querySelector('input[name="gbColor"]:checked').value;

        if (!name || !message) return;

        const msgs = getMessages();
        const rot = (Math.random() * 4 - 2).toFixed(1);
        msgs.push({
            name,
            message,
            color,
            timestamp: Date.now(),
            rotation: parseFloat(rot)
        });
        
        saveMessages(msgs);

        // Reset form controls
        gbForm.reset();
        gbCharCount.textContent = '0';

        // Animate form on submit success
        gsap.to('.guestbook-form-card', { y: -8, duration: 0.15, yoyo: true, repeat: 1 });

        // Update list
        renderMessages();
        showToast('✨ Lưu bút đầy hoài niệm đã được dán lên trang sổ!');
    });

    // Initial render call
    renderMessages();
});
