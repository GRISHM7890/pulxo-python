// Lightweight Web Audio Synth for Py Compiler X Achievements
// Synthesizes retro chord sequences client-side without physical audio files

export function playUnlockChime(rarity = 'common') {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        
        // Define chime note sequences based on rarity
        let notes = [261.63, 329.63, 392.00, 523.25]; // Common (C Major Chord: C4, E4, G4, C5)
        
        if (rarity === 'rare') {
            notes = [293.66, 349.23, 440.00, 587.33]; // Rare (D Minor: D4, F4, A4, D5)
        } else if (rarity === 'epic') {
            notes = [329.63, 415.30, 493.88, 659.25, 830.61]; // Epic (E Major: E4, G#4, B4, E5, G#5)
        } else if (rarity === 'legendary') {
            notes = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // Legendary (G Major Pentatonic / Sparkle)
        }

        const now = ctx.currentTime;
        
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Adjust oscillator type per rarity
            if (rarity === 'legendary') {
                osc.type = 'triangle'; // Smooth sine-like bell
            } else if (rarity === 'epic') {
                osc.type = 'triangle';
            } else {
                osc.type = 'sine'; // Pure bell tone
            }
            
            osc.frequency.setValueAtTime(freq, now + index * 0.08); // Arpeggiated sequence
            
            // Volume Envelope
            gain.gain.setValueAtTime(0.15, now + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.8);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + index * 0.08);
            osc.stop(now + index * 0.08 + 0.85);
        });
    } catch (e) {
        console.warn("Audio synthesis blocked or unsupported:", e);
    }
}
