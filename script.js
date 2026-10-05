/**
 * SWEET BIRTHDAY JOURNEY - MAIN SCRIPT
 * Manages interactions, scroll-based audio section transitions,
 * canvas particles, scratch-card, candle blowing, balloon popping, and personalization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const entranceGate = document.getElementById('entrance-gate');
  const btnEnter = document.getElementById('btn-enter');
  const gateSealBtn = document.getElementById('gate-seal-btn');

  const jukeboxDisc = document.getElementById('jukebox-disc');
  const jukeboxEq = document.getElementById('jukebox-eq');
  const btnToggleAudio = document.getElementById('btn-toggle-audio');
  const audioIcon = document.getElementById('audio-icon');
  const btnAudioVolume = document.getElementById('btn-audio-volume');
  const volumeIcon = document.getElementById('volume-icon');
  const btnSettingsOpen = document.getElementById('btn-settings-open');

  const navDots = document.querySelectorAll('.nav-dot');
  const sections = document.querySelectorAll('.section-wrapper');

  // Hero Elements
  const heroBubbles = document.querySelectorAll('.reveal-bubble');
  const heroRevealBox = document.getElementById('hero-bubble-reveal-box');
  const heroRevealText = document.getElementById('hero-bubble-text');

  // Polaroid Cards
  const polaroids = document.querySelectorAll('.polaroid-card');

  // Cake Elements
  const candles = document.querySelectorAll('.candle');
  const btnBlowCandles = document.getElementById('btn-blow-candles');
  const btnCutCake = document.getElementById('btn-cut-cake');
  const btnRelightCandles = document.getElementById('btn-relight-candles');
  const cakeWishReveal = document.getElementById('cake-wish-reveal');
  const cakeSliceNote = document.getElementById('cake-slice-note');

  // Vault Elements
  const envelope = document.getElementById('envelope-interactive');
  const envelopeSeal = document.getElementById('envelope-seal');
  const scratchCanvas = document.getElementById('scratch-canvas');
  const btnScratchReveal = document.getElementById('btn-scratch-reveal');
  const giftBoxes = document.querySelectorAll('.gift-box-item');

  // Balloons Elements
  const balloonField = document.getElementById('balloon-field');
  const balloons = document.querySelectorAll('.heart-balloon');
  const poppedCountEl = document.getElementById('popped-count');
  const reasonsList = document.getElementById('reasons-list');
  const reasonsEmptyNotice = document.getElementById('reasons-empty-notice');

  // Finale Elements
  const btnFireworks = document.getElementById('btn-fireworks');
  const btnReplayJourney = document.getElementById('btn-replay-journey');
  const btnSendHug = document.getElementById('btn-send-hug');
  const hugCountNumber = document.getElementById('hug-count-number');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settings-modal');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnResetSettings = document.getElementById('btn-reset-settings');
  const inputRecipient = document.getElementById('input-recipient-name');
  const inputSender = document.getElementById('input-sender-name');
  const inputHeroText = document.getElementById('input-hero-text');
  const inputLetterText = document.getElementById('input-letter-text');
  const audioVolumeSlider = document.getElementById('audio-volume-slider');
  const volumeValDisplay = document.getElementById('volume-val-display');
  const radioAudioSynth = document.getElementById('radio-audio-synth');
  const radioAudioCustom = document.getElementById('radio-audio-custom');
  const customAudioPanel = document.getElementById('custom-audio-panel');
  const userAudioFileInput = document.getElementById('user-audio-file');

  // Canvas
  const ambientCanvas = document.getElementById('ambient-canvas');
  const fireworksCanvas = document.getElementById('fireworks-canvas');

  // State Variables
  let unlocked = false;
  let poppedBalloonsCount = 0;
  let hugsSentCount = parseInt(localStorage.getItem('birthday_hugs_count') || '0', 10);
  if (hugCountNumber) hugCountNumber.textContent = hugsSentCount;

  // Reasons list for balloons
  const sweetReasons = [
    { num: 1, text: "Your empathy and ability to truly understand people is a rare superpower." },
    { num: 2, text: "The spontaneous laughter we share when something ridiculously silly happens." },
    { num: 3, text: "Your determination to never give up, even when things get overwhelming." },
    { num: 4, text: "How you make everyone around you feel valued, safe, and truly listened to." },
    { num: 5, text: "Your gorgeous smile that immediately brightens any room you walk into." },
    { num: 6, text: "Just being you: authentic, fiercely loyal, deeply thoughtful, and irreplaceable." }
  ];

  /* ===================================================================
     1. UNLOCK / ENTRANCE GATE
     =================================================================== */
  function unlockSurprise() {
    if (unlocked) return;
    unlocked = true;

    // Start Audio
    window.audioEngine.start();
    window.audioEngine.switchSectionTrack(0);
    updateAudioUI(true);

    // Audio Chime + Confetti
    window.audioEngine.playSparkleSound();
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);

    // Fade out gate
    entranceGate.classList.add('unlocked');
  }

  btnEnter.addEventListener('click', unlockSurprise);
  gateSealBtn.addEventListener('click', unlockSurprise);

  /* ===================================================================
     2. AUDIO CONTROLS & FLOATING JUKEBOX
     =================================================================== */
  function updateAudioUI(isPlaying) {
    if (isPlaying) {
      jukeboxDisc.classList.add('playing');
      jukeboxEq.classList.add('active');
      audioIcon.textContent = '⏸️';
    } else {
      jukeboxDisc.classList.remove('playing');
      jukeboxEq.classList.remove('active');
      audioIcon.textContent = '🎵';
    }
  }

  btnToggleAudio.addEventListener('click', () => {
    const isPlaying = window.audioEngine.togglePlayPause();
    updateAudioUI(isPlaying);
  });

  btnAudioVolume.addEventListener('click', () => {
    const isMuted = window.audioEngine.toggleMute();
    volumeIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  audioVolumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    volumeValDisplay.textContent = val + '%';
    window.audioEngine.setVolume(val / 100);
  });

  radioAudioSynth.addEventListener('change', () => {
    customAudioPanel.classList.add('hidden');
    window.audioEngine.setProceduralMode();
  });

  radioAudioCustom.addEventListener('change', () => {
    customAudioPanel.classList.remove('hidden');
  });

  userAudioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      window.audioEngine.loadCustomAudio(file);
    }
  });

  /* ===================================================================
     3. SCROLL-TRIGGERED SECTION TRACK SWITCHER & NAV OBSERVER
     =================================================================== */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const trackIndex = parseInt(entry.target.getAttribute('data-track'), 10);
        const sectionId = entry.target.getAttribute('id');

        // Update Nav dots
        navDots.forEach(dot => {
          if (dot.getAttribute('href') === '#' + sectionId) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        // Switch background track
        if (unlocked && !isNaN(trackIndex)) {
          window.audioEngine.switchSectionTrack(trackIndex);
        }
      }
    });
  }, {
    threshold: 0.45
  });

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ===================================================================
     4. SECTION 1: HERO INTERACTIVE BUBBLES
     =================================================================== */
  heroBubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      window.audioEngine.playSparkleSound();
      const msg = bubble.getAttribute('data-msg');
      heroRevealText.textContent = msg;
      heroRevealBox.classList.remove('hidden');
      bubble.classList.add('popped');

      const rect = bubble.getBoundingClientRect();
      spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    });
  });

  /* ===================================================================
     5. SECTION 2: POLAROID 3D FLIP CARDS
     =================================================================== */
  polaroids.forEach(card => {
    const handleFlip = () => {
      card.classList.toggle('flipped');
      window.audioEngine.playCardFlipSound();
      const rect = card.getBoundingClientRect();
      spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);
    };

    card.addEventListener('click', handleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    });
  });

  /* ===================================================================
     6. SECTION 3: THE BIRTHDAY CAKE & CANDLE BLOWING
     =================================================================== */
  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      const flame = candle.querySelector('.flame');
      if (flame && flame.classList.contains('active')) {
        flame.classList.remove('active');
        flame.classList.add('smoking');
        window.audioEngine.playCandleBlowSound();
        setTimeout(() => flame.classList.remove('smoking'), 1200);
        checkAllCandlesBlown();
      }
    });
  });

  function checkAllCandlesBlown() {
    const activeCandles = document.querySelectorAll('.flame.active');
    if (activeCandles.length === 0) {
      celebrateWish();
    }
  }

  function celebrateWish() {
    cakeWishReveal.classList.remove('hidden');
    btnBlowCandles.classList.add('hidden');
    btnRelightCandles.classList.remove('hidden');
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 90);
    window.audioEngine.playSparkleSound();
  }

  btnBlowCandles.addEventListener('click', () => {
    window.audioEngine.playCandleBlowSound();
    candles.forEach((c, idx) => {
      setTimeout(() => {
        const flame = c.querySelector('.flame');
        if (flame) {
          flame.classList.remove('active');
          flame.classList.add('smoking');
          setTimeout(() => flame.classList.remove('smoking'), 1200);
        }
      }, idx * 120);
    });
    setTimeout(() => {
      celebrateWish();
    }, candles.length * 120 + 300);
  });

  btnRelightCandles.addEventListener('click', () => {
    candles.forEach(c => {
      const flame = c.querySelector('.flame');
      if (flame) flame.classList.add('active');
    });
    btnRelightCandles.classList.add('hidden');
    btnBlowCandles.classList.remove('hidden');
    cakeWishReveal.classList.add('hidden');
    window.audioEngine.playSparkleSound();
  });

  btnCutCake.addEventListener('click', () => {
    window.audioEngine.playSparkleSound();
    cakeSliceNote.style.animation = 'gentlePulse 1s';
    cakeSliceNote.innerHTML = `<span>🍰 <strong>A piece of pure happiness just for you!</strong> (And yes, you get the biggest slice with all the strawberries!) 🍓</span>`;
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
  });

  /* ===================================================================
     7. SECTION 4: THE LOVE VAULT, ENVELOPE, SCRATCH & GIFTS
     =================================================================== */
  // Envelope
  function toggleEnvelope() {
    envelope.classList.toggle('open');
    window.audioEngine.playUnwrapSound();
    const rect = envelope.getBoundingClientRect();
    spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
  }
  envelope.addEventListener('click', toggleEnvelope);
  envelopeSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEnvelope();
  });

  // Scratch to Reveal Canvas Card
  function initScratchCard() {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    const width = 290;
    const height = 190;
    scratchCanvas.width = width;
    scratchCanvas.height = height;

    // Golden foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fcd34d');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.8, '#d97706');
    grad.addColorStop(1, '#fde68a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative foil patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch Here to Reveal VIP Coupon ✨', width / 2, height / 2 + 5);

    let isScratching = false;

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    function getCoords(e) {
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    scratchCanvas.addEventListener('mousedown', (e) => {
      isScratching = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isScratching) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    window.addEventListener('mouseup', () => {
      if (isScratching) {
        isScratching = false;
      }
    });

    // Touch support
    scratchCanvas.addEventListener('touchstart', (e) => {
      isScratching = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: true });

    scratchCanvas.addEventListener('touchmove', (e) => {
      if (!isScratching) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: true });

    scratchCanvas.addEventListener('touchend', () => {
      isScratching = false;
    });
  }

  initScratchCard();

  btnScratchReveal.addEventListener('click', () => {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    window.audioEngine.playSparkleSound();
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 45);
  });

  // Mystery Gift Boxes
  giftBoxes.forEach(box => {
    box.addEventListener('click', () => {
      if (!box.classList.contains('unwrapped')) {
        box.classList.add('unwrapped');
        window.audioEngine.playUnwrapSound();
        const modal = box.querySelector('.gift-revealed-modal');
        if (modal) modal.classList.remove('hidden');
        const hint = box.querySelector('.box-tap-hint');
        if (hint) hint.textContent = '🎉 Unwrapped!';
        const rect = box.getBoundingClientRect();
        spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
      }
    });
  });

  /* ===================================================================
     8. SECTION 5: BALLOON GARDEN OF AFFECTION (POP TO REVEAL)
     =================================================================== */
  balloons.forEach(balloon => {
    balloon.addEventListener('click', () => {
      if (balloon.classList.contains('popped')) return;

      const reasonId = parseInt(balloon.getAttribute('data-reason'), 10);
      balloon.classList.add('popped');
      poppedBalloonsCount++;
      poppedCountEl.textContent = poppedBalloonsCount;

      // SFX
      window.audioEngine.playBalloonPopSound();

      // Confetti burst from balloon position
      const rect = balloon.getBoundingClientRect();
      triggerCelebratoryConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

      // Add reason card
      if (reasonsEmptyNotice) reasonsEmptyNotice.style.display = 'none';
      const reasonData = sweetReasons.find(r => r.num === reasonId);
      if (reasonData) {
        const card = document.createElement('div');
        card.className = 'reason-card';
        card.innerHTML = `
          <span class="reason-num">Reason #${reasonData.num}</span>
          <p class="reason-quote">“${reasonData.text}”</p>
        `;
        reasonsList.appendChild(card);
      }

      // If all popped
      if (poppedBalloonsCount === 6) {
        setTimeout(() => {
          triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
          window.audioEngine.playSparkleSound();
        }, 500);
      }
    });
  });

  /* ===================================================================
     9. SECTION 6: FINALE & HUG COUNTER
     =================================================================== */
  btnFireworks.addEventListener('click', () => {
    window.audioEngine.playSparkleSound();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const randX = Math.random() * (window.innerWidth - 200) + 100;
        const randY = Math.random() * (window.innerHeight - 200) + 100;
        triggerCelebratoryConfetti(randX, randY, 60);
      }, i * 250);
    }
  });

  btnReplayJourney.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnSendHug.addEventListener('click', () => {
    hugsSentCount++;
    hugCountNumber.textContent = hugsSentCount;
    localStorage.setItem('birthday_hugs_count', hugsSentCount.toString());

    window.audioEngine.playHugSound();

    // Spawn heart explosion
    const rect = btnSendHug.getBoundingClientRect();
    spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
  });

  /* ===================================================================
     10. SETTINGS & PERSONALIZATION MODAL
     =================================================================== */
  function openSettings() {
    settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModal.classList.add('hidden');
  }

  btnSettingsOpen.addEventListener('click', openSettings);
  btnCloseSettings.addEventListener('click', closeSettings);

  // Load saved personalization
  function loadSavedCustomization() {
    const savedName = localStorage.getItem('birthday_recipient_name');
    const savedSender = localStorage.getItem('birthday_sender_name');
    const savedHero = localStorage.getItem('birthday_hero_text');
    const savedLetter = localStorage.getItem('birthday_letter_text');

    if (savedName) {
      document.querySelectorAll('.recipient-name-display').forEach(el => el.textContent = savedName);
      if (inputRecipient) inputRecipient.value = savedName;
    }
    if (savedSender) {
      document.querySelectorAll('.author-signature-display').forEach(el => el.textContent = savedSender);
      if (inputSender) inputSender.value = savedSender;
    }
    if (savedHero) {
      const heroEl = document.getElementById('hero-custom-message');
      if (heroEl) heroEl.textContent = savedHero;
      if (inputHeroText) inputHeroText.value = savedHero;
    }
    if (savedLetter) {
      const letterEl = document.getElementById('envelope-custom-letter');
      if (letterEl) letterEl.textContent = savedLetter;
      if (inputLetterText) inputLetterText.value = savedLetter;
    }
  }

  loadSavedCustomization();

  btnSaveSettings.addEventListener('click', () => {
    const newName = inputRecipient.value.trim() || 'My Beloved One';
    const newSender = inputSender.value.trim() || 'Your Forever Person ♡';
    const newHero = inputHeroText.value.trim();
    const newLetter = inputLetterText.value.trim();

    localStorage.setItem('birthday_recipient_name', newName);
    localStorage.setItem('birthday_sender_name', newSender);
    if (newHero) localStorage.setItem('birthday_hero_text', newHero);
    if (newLetter) localStorage.setItem('birthday_letter_text', newLetter);

    loadSavedCustomization();
    closeSettings();
    window.audioEngine.playSparkleSound();
  });

  btnResetSettings.addEventListener('click', () => {
    localStorage.removeItem('birthday_recipient_name');
    localStorage.removeItem('birthday_sender_name');
    localStorage.removeItem('birthday_hero_text');
    localStorage.removeItem('birthday_letter_text');
    location.reload();
  });

  /* ===================================================================
     11. AMBIENT PARTICLES CANVAS (GENTLE FLOATING HEARTS & SPARKLES)
     =================================================================== */
  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    const ctx = ambientCanvas.getContext('2d');
    let width = ambientCanvas.width = window.innerWidth;
    let height = ambientCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 35;
    const symbols = ['💖', '🌸', '✨', '💕', '💫', '♡'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 10,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        symbol: symbols[Math.floor(Math.random() * symbols.length)]
      });
    }

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        ctx.font = `${p.size}px sans-serif`;
        ctx.globalAlpha = p.opacity;
        ctx.fillText(p.symbol, p.x, p.y);
      });

      requestAnimationFrame(renderAmbient);
    }

    renderAmbient();
  }

  initAmbientCanvas();

  /* ===================================================================
     12. CURSOR TRAIL SPARKLES
     =================================================================== */
  const trailContainer = document.getElementById('cursor-trail-container');
  let lastTrailTime = 0;

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 45) return; // Throttled for performance
    lastTrailTime = now;

    if (!trailContainer) return;
    const heart = document.createElement('span');
    heart.className = 'cursor-heart-particle';
    heart.textContent = ['💖', '✨', '🌸', '💕'][Math.floor(Math.random() * 4)];
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    trailContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 1000);
  });

  /* ===================================================================
     13. MINI HEARTS SPRAY HELPER
     =================================================================== */
  function spawnMiniHearts(x, y, count = 10) {
    if (!trailContainer) return;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'cursor-heart-particle';
      heart.textContent = ['💖', '💕', '💗', '✨', '🌸'][Math.floor(Math.random() * 5)];
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 60;
      heart.style.left = (x + offsetX) + 'px';
      heart.style.top = (y + offsetY) + 'px';
      trailContainer.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }
  }

  /* ===================================================================
     14. CELEBRATORY CONFETTI / FIREWORKS ENGINE
     =================================================================== */
  const confettiParticles = [];

  function triggerCelebratoryConfetti(originX, originY, count = 50) {
    if (!fireworksCanvas) return;
    const colors = ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#38bdf8', '#c084fc', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }
  }

  function renderConfetti() {
    if (!fireworksCanvas) return;
    const ctx = fireworksCanvas.getContext('2d');
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;

    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // Gravity
      p.vx *= 0.98; // Air friction
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;

      if (p.opacity <= 0 || p.y > fireworksCanvas.height + 20) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    requestAnimationFrame(renderConfetti);
  }

  renderConfetti();
});
