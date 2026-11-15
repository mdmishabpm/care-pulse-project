// Web Speech API Service
// Text-to-Speech (TTS) for senior read-aloud and Speech Recognition for hands-free voice commands.

class SpeechAssistantService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * Speak text aloud using browser Text-to-Speech.
   * @param {string} text Text to vocalize
   * @param {Function} [onEnd] Callback when speech completes
   */
  speak(text, onEnd = null) {
    if (!this.synth) return;
    this.synth.cancel(); // cancel any active speech

    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower, clearer tempo for elderly listeners
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best natural voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.isSpeaking = true;
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Start listening for voice commands
   * @param {Function} onCommand Callback with recognized command string
   * @param {Function} onStatusChange Callback with state (listening, error, idle)
   */
  startVoiceListening(onCommand, onStatusChange = null) {
    if (!this.recognition) {
      if (onStatusChange) onStatusChange('unsupported');
      return false;
    }

    try {
      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStatusChange) onStatusChange('listening');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        this.isListening = false;
        if (onStatusChange) onStatusChange('idle');
        onCommand(transcript);
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (onStatusChange) onStatusChange('error', err);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onStatusChange) onStatusChange('idle');
      };

      this.recognition.start();
      return true;
    } catch {
      this.isListening = false;
      if (onStatusChange) onStatusChange('error');
      return false;
    }
  }

  stopVoiceListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const speechAssistant = new SpeechAssistantService();
