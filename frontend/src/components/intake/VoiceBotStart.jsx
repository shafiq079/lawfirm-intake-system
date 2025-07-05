import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const VoiceBotStart = ({ onAutoFill, nextStep, prevStep, intakeLink }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [preferredLanguage, setPreferredLanguage] = useState('en'); // 'en' or 'es'

  useEffect(() => {
    // Initial greeting and language selection
    setCurrentQuestion("Hello, welcome to the AI intake system. Please say \"English\" for English or \"Español\" for Spanish.");
    setConversationHistory([{ speaker: 'bot', text: "Hello, welcome to the AI intake system. Please say \"English\" for English or \"Español\" for Spanish." }]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      recorder.onstop = async () => {
        console.log('MediaRecorder stopped. Total audio chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Created audio blob with size:', audioBlob.size, 'bytes');
        audioChunksRef.current = []; // Clear chunks for next recording

        if (audioBlob.size === 0) {
          toast.error("No audio recorded. Please ensure your microphone is working and you speak after starting.");
          setIsRecording(false);
          return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('intakeLink', intakeLink);
        formData.append('currentQuestionIndex', currentQuestionIndex);
        formData.append('preferredLanguage', preferredLanguage);

        try {
          const response = await axios.post('/api/voice/guided-intake', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const { action, question, updatedFormData, field, index, twilioLang } = response.data;

          if (updatedFormData) {
            onAutoFill(updatedFormData);
          }

          if (action === 'set_language') {
            setPreferredLanguage(question === 'Español' ? 'es' : 'en');
            setCurrentQuestionIndex(1); // Move past language selection
            setConversationHistory((prev) => [...prev, { speaker: 'bot', text: "Thank you. What is your first name?" }]);
            setCurrentQuestion("Thank you. What is your first name?");
          } else if (action === 'ask_question') {
            setCurrentQuestion(question);
            setCurrentQuestionIndex(index);
            setConversationHistory((prev) => [...prev, { speaker: 'bot', text: question }]);
          } else if (action === 'complete_intake') {
            toast.success("Intake completed! You can now review and submit the form.");
            nextStep();
          } else if (action === 'clarify') {
            setCurrentQuestion(question);
            setConversationHistory((prev) => [...prev, { speaker: 'bot', text: question }]);
          }

        } catch (error) {
          console.error("Error sending audio to backend:", error);
          toast.error("Error processing voice input. Please try again.");
          setCurrentQuestion("I'm sorry, I encountered an error. Could you please repeat that?");
          setConversationHistory((prev) => [...prev, { speaker: 'bot', text: "I'm sorry, I encountered an error. Could you please repeat that?" }]);
        }
      };

      recorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error(`Could not start recording: ${error.name} - ${error.message}. Please check microphone permissions.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Recording stopped. Processing...");
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold mb-4">Voice Intake</h2>
      <p className="text-gray-600">Speak and answer questions. We'll record and transcribe to fill the form.</p>

      <div className="flex flex-col items-center justify-center space-y-4 mb-4">
        <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow-inner overflow-y-auto h-48">
          {conversationHistory.map((msg, index) => (
            <div key={index} className={`text-left ${msg.speaker === 'bot' ? 'text-blue-800' : 'text-gray-700'}`}>
              <strong>{msg.speaker === 'bot' ? 'Bot' : 'You'}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <p className="text-lg font-semibold text-gray-800">{currentQuestion}</p>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full text-white font-bold shadow-lg transition-all duration-300 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Your voice will be transcribed and used to pre-fill the form.
        You will then be able to review and edit all information.
      </p>

      {/* Navigation buttons - only show if not recording and if there's a way to proceed without voice */}
      {!isRecording && (
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={nextStep} // Allow user to proceed even if they don't use voice
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Proceed to Form (Manual Fill)
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceBotStart;
