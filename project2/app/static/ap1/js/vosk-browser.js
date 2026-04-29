// Vosk Browser Fallback - Local minimal wrapper if CDN blocked
// Download full from https://unpkg.com/vosk-browser@0.0.9/dist/vosk.js when needed

window.Vosk = {
  createModel: async function(path) {
    console.warn('Vosk local fallback: Using browser SpeechRecognition instead');
    return {
      KaldiRecognizer: function(sampleRate) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        const callbacks = { result: [], partialresult: [] };

        recognition.onresult = (event) => {
          let final = '';
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }
          if (final) {
            callbacks.result.forEach(cb => cb({ result: { text: final } }));
          }
          if (interim) {
            callbacks.partialresult.forEach(cb => cb({ result: { partial: interim } }));
          }
        };

        return {
          processor: { connect: () => {} },
          audioContext: { createMediaStreamSource: (stream) => ({ connect: () => {} }) },
          on: (event, cb) => { callbacks[event] = callbacks[event] || []; callbacks[event].push(cb); },
          start: () => recognition.start(),
          stop: () => recognition.stop()
        };
      }
    };
  }
};

console.log('Vosk fallback loaded - using browser Speech API');

