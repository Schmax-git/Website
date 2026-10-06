/**
 * SWEET BIRTHDAY JOURNEY - MAIN SCRIPT
 * Reads all data directly from window.SURPRISE_CONFIG (assets/config.js)
 * Enables complete dynamic personalization directly from code.
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.SURPRISE_CONFIG || {};

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

  const navDots = document.querySelectorAll('.nav-dot');
  const sections = document.querySelectorAll('.section-wrapper');

  // Hero Elements
  const heroBubblesContainer = document.getElementById('hero-bubbles');
  const heroRevealBox = document.getElementById('hero-bubble-reveal-box');
  const heroRevealText = document.getElementById('hero-bubble-text');
  const heroParagraph = document.getElementById('hero-custom-message');

  // Polaroid Grid
  const polaroidsGrid = document.getElementById('polaroids-grid');

  // Cake Elements
  const candlesRack = document.getElementById('candles-rack');
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
  const giftBoxesGrid = document.querySelector('.gift-boxes-grid');

  // Balloons Elements
  const balloonField = document.getElementById('balloon-field');
  const poppedCountEl = document.getElementById('popped-count');
  const reasonsList = document.getElementById('reasons-list');
  const reasonsEmptyNotice = document.getElementById('reasons-empty-notice');

  // Finale Elements
  const finaleLetterBody = document.getElementById('finale-letter-body');
  const btnFireworks = document.getElementById('btn-fireworks');
  const btnReplayJourney = document.getElementById('btn-replay-journey');
  const btnSendHug = document.getElementById('btn-send-hug');
  const hugCountNumber = document.getElementById('hug-count-number');



  // Canvas
  const ambientCanvas = document.getElementById('ambient-canvas');
  const fireworksCanvas = document.getElementById('fireworks-canvas');

  // State Variables
  let unlocked = false;
  let poppedBalloonsCount = 0;
  let totalBalloonsCount = (config.balloonsReasons && config.balloonsReasons.length) || 6;
  let hugsSentCount = parseInt(localStorage.getItem('birthday_hugs_count') || '0', 10);
  if (hugCountNumber) hugCountNumber.textContent = hugsSentCount;

  /* ===================================================================
     APPLY DYNAMIC CONFIGURATION (FROM assets/config.js)
     =================================================================== */
  function applyConfig() {
    // 1. Recipient & Sender names directly from config
    const recipientName = config.recipientName || 'Dia';
    const senderName = config.senderName || 'Manix';

    document.querySelectorAll('.recipient-name-display').forEach(el => el.textContent = recipientName);
    document.querySelectorAll('.author-signature-display').forEach(el => el.textContent = senderName);

    // 2. Hero Section
    if (config.hero) {
      if (config.hero.welcomeParagraph && heroParagraph) {
        heroParagraph.textContent = config.hero.welcomeParagraph;
      }

      // Render Hero Bubbles
      if (config.hero.bubbles && heroBubblesContainer) {
        heroBubblesContainer.innerHTML = '';
        config.hero.bubbles.forEach(b => {
          const bubble = document.createElement('div');
          bubble.className = 'reveal-bubble';
          bubble.setAttribute('data-msg', b.message);
          bubble.innerHTML = `
            <span class="bubble-heart">${b.emoji}</span>
            <span class="bubble-label">${b.preview}</span>
          `;
          bubble.addEventListener('click', () => {
            window.audioEngine.playSparkleSound();
            heroRevealText.textContent = b.message;
            heroRevealBox.classList.remove('hidden');
            bubble.classList.add('popped');
            const rect = bubble.getBoundingClientRect();
            spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
          });
          heroBubblesContainer.appendChild(bubble);
        });
      }
    }

    // 3. Polaroid Memory Lane
    if (config.memories && polaroidsGrid) {
      polaroidsGrid.innerHTML = '';
      config.memories.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Flip polaroid: ${m.title}`);

        // Normalize custom image path or fallback to assets/images/photo{idx + 1}.jpg
        let imageSrc = (m.image || '').trim();
        if (!imageSrc) {
          imageSrc = `assets/images/photo${idx + 1}.jpg`;
        } else if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://') && !imageSrc.startsWith('data:') && !imageSrc.startsWith('/') && !imageSrc.startsWith('assets/')) {
          imageSrc = `assets/images/${imageSrc}`;
        }

        const fallbackPhoto = `assets/images/photo${idx + 1}.jpg`;
        const photoContent = `
          <img src="${imageSrc}" alt="${m.title}" class="photo-img" loading="lazy" onerror="if(this.dataset.fallbackTried !== 'true' && this.getAttribute('src') !== '${fallbackPhoto}'){ this.dataset.fallbackTried = 'true'; this.src = '${fallbackPhoto}'; } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }">
          <div class="photo-art photo-art-${(idx % 6) + 1}" style="display:none;">
            <span class="photo-emoji">${m.defaultEmoji || '💖'}</span>
            <span class="photo-subtext">${m.subtitle || ''}</span>
          </div>`;

        card.innerHTML = `
          <div class="card-inner">
            <div class="card-front">
              <div class="tape-strip"></div>
              <div class="photo-frame">
                ${photoContent}
              </div>
              <div class="polaroid-caption">
                <h3>${m.title}</h3>
                <span class="flip-hint">↺ Tap to flip</span>
              </div>
            </div>
            <div class="card-back">
              <div class="back-heart">${m.defaultEmoji || '💌'}</div>
              <h4 class="back-title">${m.memoryTitle}</h4>
              <p class="back-text">${m.memoryText}</p>
              <span class="memory-date">${m.dateTag}</span>
            </div>
          </div>
        `;

        const flipCard = () => {
          card.classList.toggle('flipped');
          window.audioEngine.playCardFlipSound();
          const rect = card.getBoundingClientRect();
          spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
        };

        card.addEventListener('click', flipCard);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flipCard();
          }
        });

        polaroidsGrid.appendChild(card);
      });
    }

    // 4. Cake Section
    if (config.cake) {
      if (candlesRack && config.cake.numberOfCandles) {
        candlesRack.innerHTML = '';
        for (let i = 1; i <= config.cake.numberOfCandles; i++) {
          const candle = document.createElement('div');
          candle.className = 'candle';
          candle.setAttribute('data-id', i);
          candle.innerHTML = `
            <div class="flame active"><span class="flame-core"></span></div>
            <div class="wick"></div>
            <div class="candle-stick candle-stripe-${(i % 3) + 1}"></div>
          `;
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
          candlesRack.appendChild(candle);
        }
      }

      if (cakeWishReveal) {
        const titleEl = cakeWishReveal.querySelector('.wish-title');
        const bodyEl = cakeWishReveal.querySelector('.wish-body');
        if (titleEl && config.cake.wishRevealedTitle) titleEl.textContent = config.cake.wishRevealedTitle;
        if (bodyEl && config.cake.wishRevealedBody) bodyEl.textContent = config.cake.wishRevealedBody;
      }
    }

    // 5. Love Vault
    if (config.vault) {
      // Envelope
      if (config.vault.envelope) {
        const savedLetter = localStorage.getItem('birthday_letter_text');
        const envelopeBody = document.getElementById('envelope-custom-letter');
        const envelopeDate = document.querySelector('.paper-date');
        const envelopeTitle = document.querySelector('.paper-title');
        const envelopeSign = document.querySelector('.paper-sign');

        if (envelopeBody) envelopeBody.textContent = config.vault.envelope.letterBody;
        if (envelopeDate && config.vault.envelope.tag) envelopeDate.textContent = config.vault.envelope.tag;
        if (envelopeTitle && config.vault.envelope.salutation) envelopeTitle.textContent = config.vault.envelope.salutation;
        if (envelopeSign && config.vault.envelope.signoff) envelopeSign.textContent = config.vault.envelope.signoff;
      }

      // Scratch Card
      if (config.vault.scratchCard) {
        const titleEl = document.querySelector('.scratch-title');
        const descEl = document.querySelector('.scratch-coupon-desc');
        const codeEl = document.querySelector('.scratch-code');
        if (titleEl) titleEl.textContent = config.vault.scratchCard.title;
        if (descEl) descEl.textContent = config.vault.scratchCard.description;
        if (codeEl) codeEl.textContent = config.vault.scratchCard.code;
      }

      // Gift Boxes
      if (config.vault.giftBoxes && giftBoxesGrid) {
        giftBoxesGrid.innerHTML = '';
        config.vault.giftBoxes.forEach((g, idx) => {
          const item = document.createElement('div');
          item.className = 'gift-box-item';
          item.setAttribute('data-box', idx + 1);
          item.setAttribute('role', 'button');
          item.setAttribute('tabindex', '0');
          item.setAttribute('aria-label', `Unwrap ${g.title}`);

          item.innerHTML = `
            <div class="gift-box-3d">
              <div class="gift-box-lid">
                <div class="gift-ribbon-bow">🎀</div>
              </div>
              <div class="gift-box-body">
                <span class="box-number">${g.number || `Box #${idx + 1}`}</span>
              </div>
            </div>
            <div class="gift-revealed-modal hidden">
              <span class="revealed-emoji">${g.emoji || '🎁'}</span>
              <h4>${g.title}</h4>
              <p>${g.message}</p>
            </div>
            <span class="box-tap-hint">Tap to Unwrap</span>
          `;

          item.addEventListener('click', () => {
            if (!item.classList.contains('unwrapped')) {
              item.classList.add('unwrapped');
              window.audioEngine.playUnwrapSound();
              const modal = item.querySelector('.gift-revealed-modal');
              if (modal) modal.classList.remove('hidden');
              const hint = item.querySelector('.box-tap-hint');
              if (hint) hint.textContent = '🎉 Unwrapped!';
              const rect = item.getBoundingClientRect();
              spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
            }
          });

          giftBoxesGrid.appendChild(item);
        });
      }
    }

    // 6. Balloon Garden
    if (config.balloonsReasons && balloonField) {
      balloonField.innerHTML = '';
      totalBalloonsCount = config.balloonsReasons.length;
      const countDisplay = document.querySelector('.balloon-counter-badge');
      if (countDisplay) {
        countDisplay.innerHTML = `Balloons Popped: <span id="popped-count">0</span> / ${totalBalloonsCount}`;
      }

      const balloonColors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'];
      const balloonEmojis = ['❤️', '💕', '💖', '💗', '💝', '💓'];

      config.balloonsReasons.forEach((reason, idx) => {
        const balloon = document.createElement('div');
        balloon.className = 'heart-balloon';
        balloon.setAttribute('data-reason', idx + 1);
        balloon.setAttribute('role', 'button');
        balloon.setAttribute('tabindex', '0');
        balloon.setAttribute('aria-label', `Pop Balloon ${idx + 1}`);

        balloon.innerHTML = `
          <div class="balloon-shape ${balloonColors[idx % balloonColors.length]}">
            <span class="balloon-heart-symbol">${balloonEmojis[idx % balloonEmojis.length]}</span>
          </div>
          <div class="balloon-string"></div>
          <span class="balloon-tag">Reason #${idx + 1}</span>
        `;

        balloon.addEventListener('click', () => {
          if (balloon.classList.contains('popped')) return;

          balloon.classList.add('popped');
          poppedBalloonsCount++;
          const curCount = document.getElementById('popped-count');
          if (curCount) curCount.textContent = poppedBalloonsCount;

          window.audioEngine.playBalloonPopSound();

          const rect = balloon.getBoundingClientRect();
          triggerCelebratoryConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

          if (reasonsEmptyNotice) reasonsEmptyNotice.style.display = 'none';
          const card = document.createElement('div');
          card.className = 'reason-card';
          card.innerHTML = `
            <span class="reason-num">Reason #${idx + 1}</span>
            <p class="reason-quote">“${reason}”</p>
          `;
          reasonsList.appendChild(card);

          if (poppedBalloonsCount === totalBalloonsCount) {
            setTimeout(() => {
              triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
              window.audioEngine.playSparkleSound();
            }, 500);
          }
        });

        balloonField.appendChild(balloon);
      });
    }

    // 7. Grand Finale Paragraphs
    if (config.finale && finaleLetterBody) {
      if (config.finale.paragraphs && config.finale.paragraphs.length > 0) {
        finaleLetterBody.innerHTML = '';
        config.finale.paragraphs.forEach(p => {
          const pEl = document.createElement('p');
          pEl.textContent = p;
          finaleLetterBody.appendChild(pEl);
        });
      }
    }
  }

  // Run initial population from config
  applyConfig();

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

    window.audioEngine.playSparkleSound();
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);

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


  let scrollTicking = false;
  let activeSectionTrack = -1;

  function updateActiveSectionOnScroll() {
    const viewportMiddle = window.innerHeight * 0.45;
    let closestSection = null;
    let minDistance = Infinity;

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        closestSection = sec;
        minDistance = 0;
      } else if (minDistance !== 0) {
        const dist = Math.abs(rect.top - viewportMiddle);
        if (dist < minDistance) {
          minDistance = dist;
          closestSection = sec;
        }
      }
    });

    if (closestSection) {
      const trackIndex = parseInt(closestSection.getAttribute('data-track'), 10);
      const sectionId = closestSection.getAttribute('id');

      if (!isNaN(trackIndex) && trackIndex !== activeSectionTrack) {
        activeSectionTrack = trackIndex;

        // Update nav dots
        navDots.forEach(dot => {
          if (dot.getAttribute('href') === '#' + sectionId) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        // Switch background track
        if (unlocked) {
          window.audioEngine.switchSectionTrack(trackIndex);
        }
      }
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateActiveSectionOnScroll);
      scrollTicking = true;
    }
  }, { passive: true });


  updateActiveSectionOnScroll();

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
    const currentCandles = document.querySelectorAll('.candle');
    currentCandles.forEach((c, idx) => {
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
    }, currentCandles.length * 120 + 300);
  });

  btnRelightCandles.addEventListener('click', () => {
    const currentCandles = document.querySelectorAll('.candle');
    currentCandles.forEach(c => {
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
    const sliceMsg = (config.cake && config.cake.cakeSliceMessage) ||
      `🍰 A sweet slice of happiness for the sweetest person alive! 🍓`;
    cakeSliceNote.innerHTML = `<span>${sliceMsg}</span>`;
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
  });

  function openEnvelope() {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      window.audioEngine.playUnwrapSound();
      const sealLabel = document.querySelector('.seal-tap-label');
      if (sealLabel) sealLabel.textContent = 'Click to Fold';
      const rect = envelope.getBoundingClientRect();
      spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    }
  }

  function closeEnvelope() {
    if (envelope.classList.contains('open')) {
      envelope.classList.remove('open');
      window.audioEngine.playUnwrapSound();
      const sealLabel = document.querySelector('.seal-tap-label');
      if (sealLabel) sealLabel.textContent = 'Click to Open';
    }
  }

  function toggleEnvelope(e) {
    // If clicking inside the paper while reading/scrolling, don't close
    if (envelope.classList.contains('open') && e.target.closest('#envelope-paper') && !e.target.closest('#btn-fold-letter')) {
      return;
    }
    if (envelope.classList.contains('open')) {
      closeEnvelope();
    } else {
      openEnvelope();
    }
  }

  envelope.addEventListener('click', toggleEnvelope);
  envelopeSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEnvelope(e);
  });

  const btnFoldLetter = document.getElementById('btn-fold-letter');
  if (btnFoldLetter) {
    btnFoldLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEnvelope();
    });
  }

  function initScratchCard() {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    const width = 290;
    const height = 190;
    scratchCanvas.width = width;
    scratchCanvas.height = height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fcd34d');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.8, '#d97706');
    grad.addColorStop(1, '#fde68a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

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

    window.addEventListener('mouseup', () => { isScratching = false; });

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

    scratchCanvas.addEventListener('touchend', () => { isScratching = false; });
  }

  initScratchCard();

  btnScratchReveal.addEventListener('click', () => {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    window.audioEngine.playSparkleSound();
    triggerCelebratoryConfetti(window.innerWidth / 2, window.innerHeight / 2, 45);
  });

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

    const rect = btnSendHug.getBoundingClientRect();
    spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
  });


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

  const trailContainer = document.getElementById('cursor-trail-container');
  let lastTrailTime = 0;

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 45) return;
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

  const MAX_TOTAL_PARTICLES = 120;
  const MAX_RAIN_PARTICLES = 50;
  const MAX_ROCKETS = 3;
  const BURST_MIN = 15;
  const BURST_RANGE = 15;

  const confettiParticles = [];
  const fireworksRockets = [];
  let celebrationEndTime = 0;
  let lastRocketTime = 0;
  let toastEl = null;
  let rafId = null;
  let ctx = null;


  function showCelebrationToast(remainingSeconds) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'celebration-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span>🎆</span> <span>Grand Celebration Active: <strong>${remainingSeconds}s</strong></span> <span>💖</span>`;
    toastEl.style.display = 'flex';
  }

  function hideCelebrationToast() {
    if (toastEl) toastEl.style.display = 'none';
  }

  const HEART_SIZE = 32;
  const heartSprite = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = HEART_SIZE;
    const g = c.getContext('2d');
    g.font = `${HEART_SIZE * 0.8}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('💖', HEART_SIZE / 2, HEART_SIZE / 2);
    return c;
  })();

  function resizeConfettiCanvas() {
    if (!fireworksCanvas) return;
    if (fireworksCanvas.width !== window.innerWidth) fireworksCanvas.width = window.innerWidth;
    if (fireworksCanvas.height !== window.innerHeight) fireworksCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  function startConfettiLoop() {
    if (rafId !== null || !fireworksCanvas) return;
    resizeConfettiCanvas();
    rafId = requestAnimationFrame(renderConfetti);
  }

  function startCelebrationMinute(durationMs = 60000) {
    celebrationEndTime = Math.max(celebrationEndTime, Date.now() + durationMs);
    triggerCelebratoryBurst(window.innerWidth * 0.5, window.innerHeight * 0.35, 25);
    triggerCelebratoryBurst(window.innerWidth * 0.25, window.innerHeight * 0.45, 18);
    triggerCelebratoryBurst(window.innerWidth * 0.75, window.innerHeight * 0.45, 18);
  }

  function triggerCelebratoryConfetti(originX, originY, count = 30) {
    startCelebrationMinute(60000);
    triggerCelebratoryBurst(originX, originY, count);
  }

  function triggerCelebratoryBurst(originX, originY, count = 30) {
    if (!fireworksCanvas) return;

    const room = MAX_TOTAL_PARTICLES - confettiParticles.length;
    if (room <= 0) return;
    count = Math.min(count, room);

    const colors = [
      '#f43f5e', '#fb7185', '#fbbf24', '#f59e0b', '#f472b6',
      '#ec4899', '#38bdf8', '#c084fc', '#ffffff', '#fed7aa'
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2.5;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        fadeSpeed: Math.random() * 0.008 + 0.005,
        gravity: 0.12,
        isHeart: Math.random() > 0.65,
        wobble: Math.random() * Math.PI,
        wobbleSpeed: Math.random() * 0.08 + 0.03
      });
    }
    startConfettiLoop();
  }

  function spawnRainingConfetti(count = 2) {
    const room = Math.min(
      MAX_RAIN_PARTICLES - confettiParticles.length,
      MAX_TOTAL_PARTICLES - confettiParticles.length
    );
    if (room <= 0) return;
    count = Math.min(count, room);

    const colors = ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#38bdf8', '#c084fc', '#ffffff'];
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * window.innerWidth,
        y: -15,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1.2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        opacity: Math.random() * 0.3 + 0.7,
        fadeSpeed: 0.006,
        gravity: 0.03,
        isHeart: Math.random() > 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02
      });
    }
    startConfettiLoop();
  }

  function launchRocket() {
    if (!fireworksCanvas || fireworksRockets.length >= MAX_ROCKETS) return;

    const startX = Math.random() * (window.innerWidth - 200) + 100;
    const targetY = Math.random() * (window.innerHeight * 0.45) + (window.innerHeight * 0.15);
    const colors = ['#fbbf24', '#f43f5e', '#ec4899', '#38bdf8', '#a855f7', '#ffffff'];

    fireworksRockets.push({
      x: startX,
      y: window.innerHeight + 10,
      targetY,
      speed: Math.random() * 3 + 8,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    startConfettiLoop();
  }

  function renderConfetti() {
    if (!fireworksCanvas) { rafId = null; return; }
    if (!ctx) ctx = fireworksCanvas.getContext('2d');

    const w = fireworksCanvas.width;
    const h = fireworksCanvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let r = fireworksRockets.length - 1; r >= 0; r--) {
      const rocket = fireworksRockets[r];
      rocket.y -= rocket.speed;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      if (rocket.y <= rocket.targetY) {
        triggerCelebratoryBurst(
          rocket.x,
          rocket.y,
          Math.floor(Math.random() * BURST_RANGE + BURST_MIN)
        );
        window.audioEngine?.playSparkleSound?.();
        fireworksRockets.splice(r, 1);
      }
    }

    ctx.globalAlpha = 1;
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];

      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 1.2;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0 || p.y > h + 30) {
        confettiParticles[i] = confettiParticles[confettiParticles.length - 1];
        confettiParticles.pop();
        continue;
      }

      const rad = (p.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const sx = p.isHeart ? 1 : Math.cos(p.wobble);
      ctx.setTransform(cos * sx, sin * sx, -sin, cos, p.x, p.y);
      ctx.globalAlpha = p.opacity;

      if (p.isHeart) {
        const s = p.size * 1.5;
        ctx.drawImage(heartSprite, -s / 2, -s / 2, s, s);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    if (confettiParticles.length === 0 && fireworksRockets.length === 0) {
      ctx.clearRect(0, 0, w, h);
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(renderConfetti);
  }
});
