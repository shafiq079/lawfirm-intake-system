import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const VoiceBotStart = ({ onAutoFill, intakeLink }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [preferredLanguage, setPreferredLanguage] = useState('en'); // 'en' or 'es'
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  useEffect(() => {
    // Initial greeting and language selection
    setCurrentQuestion("Hello, welcome to the AI intake system. Please say \"English\" for English or \"Español\" for Spanish.");
    setConversationHistory([{ speaker: 'bot', text: "Hello, welcome to the AI intake system. Please say \"English\" for English or \"Español\" for Spanish." }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

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

          // Add user's speech to history (assuming transcription is handled by backend and returned)
          // For now, we'll just add a placeholder for user's turn
          setConversationHistory((prev) => [...prev, { speaker: 'user', text: "(Processing your speech...)" }]);

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
            setConversationHistory((prev) => [...prev, { speaker: 'bot', text: "Intake completed! Please proceed to review and submit the form." }]);
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

  const handleSkipQuestion = async () => {
    try {
      setConversationHistory((prev) => [...prev, { speaker: 'user', text: "(Skipped question)" }]);
      const response = await axios.post('/api/voice/guided-intake', {
        intakeLink,
        currentQuestionIndex: currentQuestionIndex + 1,
        preferredLanguage,
        skipped: true,
      });

      const { action, question, index, updatedFormData } = response.data;

      if (updatedFormData) {
        onAutoFill(updatedFormData);
      }

      if (action === 'ask_question') {
        setCurrentQuestion(question);
        setCurrentQuestionIndex(index);
        setConversationHistory(prev => [...prev, { speaker: 'bot', text: question }]);
      } else if (action === 'complete_intake') {
        toast.success("Intake completed.");
        setConversationHistory((prev) => [...prev, { speaker: 'bot', text: "Intake completed! Please proceed to review and submit the form." }]);
      }

    } catch (err) {
      toast.error("Failed to skip question. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            {/* Placeholder for avatar */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">AI Voice Assistant</h3>
            <p className="text-sm">How can I help you today?</p>
          </div>
        </div>
      </div>

      {/* Chat Body - Conversation History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {conversationHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.speaker === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg shadow-md ${msg.speaker === 'bot' ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-blue-500 text-white rounded-br-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll to this element */}
      </div>

      {/* Chat Input Area - now just buttons */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {/* Microphone Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3h-4zm2 14v-2m-6 0H3.5A3.5 3.5 0 010 14.5V11a1 1 0 012 0v3.5c0 .827.673 1.5 1.5 1.5H9v-2zm7 0v2h3.5A3.5 3.5 0 0020 14.5V11a1 1 0 01-2 0v3.5c0 .827-.673 1.5-1.5 1.5H11v-2z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSkipQuestion}
            className="p-3 rounded-full bg-gray-300 hover:bg-gray-400 shadow-lg transition-all duration-300"
            title="Skip Question"
          >
            {/* Skip Icon (e.g., a fast-forward icon or simple arrow) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceBotStart;
