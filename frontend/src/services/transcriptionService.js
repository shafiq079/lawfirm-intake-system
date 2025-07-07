const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

const startTranscription = (onResult, onError) => {
  if (!SpeechRecognition) {
    onError(new Error("Speech Recognition API not supported in this browser."));
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    onResult({ transcript, confidence });
  };

  recognition.onerror = (event) => {
    onError(new Error(`Speech recognition error: ${event.error}`));
  };

  recognition.onend = () => {
    // This fires even if there's no speech, so we need to handle it carefully
    // If no result was obtained, it means no speech was detected or an error occurred.
    // The promise should already be resolved or rejected by onresult/onerror.
  };

  recognition.start();
};

const stopTranscription = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
};

export { startTranscription, stopTranscription };