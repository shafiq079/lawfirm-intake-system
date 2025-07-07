const getAudioConstraints = () => {
  return {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000,
    sampleRate: 16000, // Optimal for speech recognition
    channelCount: 1,    // Mono for speech
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };
};

export { getAudioConstraints };