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

export function playBossSound(type = 'hit') {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const now = ctx.currentTime;

        if (type === 'hit') {
            // E5 -> A5 -> E6 quick tri arpeggio
            const notes = [659.25, 880.00, 1318.51];
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.05);
                gain.gain.setValueAtTime(0.12, now + index * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + index * 0.05);
                osc.stop(now + index * 0.05 + 0.35);
            });
        } else if (type === 'damage') {
            // Low alarm-like sawtooth frequency sweep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.4);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        } else if (type === 'victory') {
            // Triumphant pentatonic cascade: C5 -> E5 -> G5 -> C6 -> E6 -> G6 arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.06);
                gain.gain.setValueAtTime(0.12, now + index * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + index * 0.06);
                osc.stop(now + index * 0.06 + 0.65);
            });
        } else if (type === 'defeat') {
            // Deep descending minor arpeggio
            const notes = [293.66, 261.63, 220.00, 146.83];
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + index * 0.1);
                gain.gain.setValueAtTime(0.15, now + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + index * 0.1);
                osc.stop(now + index * 0.1 + 0.55);
            });
        }
    } catch (e) {
        console.warn("Boss Audio synthesis blocked or unsupported:", e);
    }
}
