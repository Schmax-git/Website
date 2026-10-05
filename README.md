# 💖 Romantic Birthday Surprise Website for Your Beloved Friend

A rich, romantic, interactive birthday website featuring dynamic audio tracks that change as you scroll, click-to-reveal elements, sound effects, and a soft love/pink & heart aesthetic.

---

## ✨ Features Included

### 1. 🎵 Dynamic Multi-Track Audio Engine (`audio.js`)
- **Scroll-triggered section music:** As you scroll through the 6 story chapters, the music changes smoothly to match the vibe:
  - **Section 1 (Welcome):** *Sweet Music Box Lullaby* (Delicate celeste music box melody)
  - **Section 2 (Memories):** *Nostalgic Rhodes & Warm Chords* (Nostalgic slow electric piano arpeggios)
  - **Section 3 (Birthday Cake):** *Joyful Birthday Waltz* (Playful celebratory birthday chime theme)
  - **Section 4 (Love Vault):** *Intimate Heartstrings* (Soft romantic cello/string pad chords)
  - **Section 5 (Balloon Garden):** *Playful Starlight Plucks* (Bouncy marimba/pizzicato plucks)
  - **Section 6 (Grand Finale):** *Cosmic Serenade & Celebration* (Majestic crescendo & celestial arpeggios)
- **Zero Broken Links / Works 100% Offline:** Audio is synthesized directly using the Web Audio API without needing external audio downloads.
- **Custom Audio Mode:** You can also drop your friend's favorite MP3 song directly via the Settings modal (`⚙️`).
- **Interactive Action SFX:**
  - Real latex balloon pop + chime
  - Birthday candle puff + twinkle
  - 3D Polaroid card flip
  - Wax seal breaking & gift unboxing
  - Hug counter chime

### 2. 💌 Click-to-Reveal Elements
- **Entrance Gate:** An opening wax-sealed card that unlocks the website and starts the audio experience cleanly.
- **Tap-to-Pop Bubbles:** Glowing hearts in the hero section that reveal sweet personalized messages.
- **Polaroid Memory Lane:** 6 3D flip polaroid cards with photos, tape strips, and hidden memories on the back.
- **The Interactive Birthday Cake:**
  - Tap individual candles or click **"💨 Blow Out All Candles"** to blow them out with realistic smoke animations and chime sounds.
  - Cut the first slice to reveal a sweet message.
- **The Love Vault:**
  - An interactive wax-sealed envelope that slides up an intimate letter when tapped.
  - A **real scratch-off golden card** (rub with finger or mouse cursor to reveal a VIP Bestie coupon).
  - 3 Mystery 3D gift boxes that pop open their ribbons to reveal secret vouchers.
- **Balloon Garden of Affection:**
  - 6 floating heart balloons that can be popped one by one.
  - Each pop reveals a unique reason why your friend is cherished.
- **Grand Finale:**
  - Multi-burst heart fireworks and confetti.
  - Interactive "Send a Virtual Hug" button with counter.

### 3. 🎨 Aesthetics & Visual Excellence
- Built with a curated romantic rose, blush pink, golden champagne, and velvet wine color palette.
- Floating heart & blossom ambient canvas.
- Interactive cursor trail with glowing floating heart particles.
- Glassmorphic translucent cards, elegant Google Fonts typography (*Dancing Script*, *Outfit*, *Playfair Display*).

### 4. ⚙️ Personalization System
- Click the **⚙️** gear button in the top right floating player bar to easily update:
  - Friend's name or nickname
  - Your signature name
  - Welcome and letter messages
  - Audio volume & custom audio file uploads
- All changes persist in browser storage (`localStorage`).

---

## 🚀 How to Run the Website

### Option 1: Direct File Opening
Double-click [index.html](file:///c:/Users/maxim/OneDrive/Desktop/Website/index.html) in your file explorer to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Run with Local HTTP Server (Recommended)
In PowerShell or terminal:
```powershell
# Using Python built-in server:
python -m http.server 8000

# Or using npx serve:
npx serve .
```
Then visit: `http://localhost:8000`
