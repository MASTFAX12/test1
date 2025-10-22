// A simple audio utility to play a notification sound using the Web Audio API.
// This avoids needing to manage and load external audio files.

let audioContext: AudioContext | null = null;

const initializeAudio = () => {
  // Lazily initialize AudioContext on first play request.
  // This is necessary because browsers often require user interaction to start audio.
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }
};

/**
 * Plays a sequence of tones to create a notification chime.
 */
export const playNotificationSound = () => {
  // Ensure audio is initialized.
  if (document.visibilityState === 'visible') {
    initializeAudio();
  }

  // If context is suspended (e.g., due to inactivity), try to resume it.
  if (!audioContext || audioContext.state === 'suspended') {
     audioContext?.resume();
  }

  if (!audioContext) return;

  const playTone = (frequency: number, startTime: number, duration: number) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startTime + duration);

    oscillator.start(now + startTime);
    oscillator.stop(now + startTime + duration);
  };

  // A simple 3-tone chime (C5, E5, G5)
  playTone(523.25, 0, 0.2);
  playTone(659.25, 0.2, 0.2);
  playTone(783.99, 0.4, 0.3);
};

/**
 * Plays a short, distinct sound for new chat messages.
 */
export const playChatMessageSound = () => {
  if (document.visibilityState === 'visible') {
    initializeAudio();
  }

  if (!audioContext || audioContext.state === 'suspended') {
     audioContext?.resume();
  }

  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'triangle'; // A softer tone than sine
  oscillator.frequency.value = 880.00; // A5 note
  
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  oscillator.start(now);
  oscillator.stop(now + 0.15);
};
