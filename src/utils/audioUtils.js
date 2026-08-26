export const playBell = (type = 'single') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const generateBell = (frequency, startTime, duration = 3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Bell-like harmonic structure
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);
      
      // Envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05); // quick attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // long decay
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
      
      // Add a slight overtone for richness
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(frequency * 2.01, startTime);
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime);
      osc2.stop(startTime + duration * 0.6);
    };

    const now = ctx.currentTime;

    if (type === 'single') {
      // Start session bell (single)
      generateBell(440, now, 4); // A4
    } else if (type === 'double') {
      // Closing session bell (double)
      generateBell(440, now, 2);
      generateBell(440, now + 1.2, 4);
    } else if (type === 'intersect') {
      // Phase transition bell (subtle)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};
