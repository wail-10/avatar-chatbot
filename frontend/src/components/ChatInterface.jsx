import React, {useState, useRef, useEffect} from 'react'
import { AvatarScene } from './Avatar';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLipsync, setCurrentLipsync] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const handleAudioPlay = (audioUrl) => {
  //   if (audioRef.current) {
  //     audioRef.current.src = audioUrl;
      
  //     audioRef.current.onplay = () => {
  //       setIsPlaying(true);
  //     };
      
  //     audioRef.current.onended = () => {
  //       setIsPlaying(false);
  //     };
      
  //     audioRef.current.play();
  //   }
  // };
  const handleAudioPlay = (audioUrl, lipsyncData) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      setCurrentLipsync(lipsyncData);
      
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current.currentTime);
        setIsPlaying(true);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentLipsync(null);
      };
      
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const newUserMessage = { type: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!res.ok) {
        throw new Error('Server error');
      }
      
      const data = await res.json();
      
      // Update emotion and add AI response
      setCurrentEmotion(data.emotion);
      const newAIMessage = { 
        type: 'ai', 
        content: data.response,
        emotion: data.emotion 
      };
      setMessages(prev => [...prev, newAIMessage]);
      
      // Handle audio
      if (data.audio) {
        const binaryString = window.atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes.buffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleAudioPlay(audioUrl, data.lipsync);
      }
      // if (data.audio) {
      //   const binaryString = window.atob(data.audio);
      //   const bytes = new Uint8Array(binaryString.length);
      //   for (let i = 0; i < binaryString.length; i++) {
      //     bytes[i] = binaryString.charCodeAt(i);
      //   }
        
      //   const audioBlob = new Blob([bytes.buffer], { type: 'audio/mpeg' });
      //   const audioUrl = URL.createObjectURL(audioBlob);
      //   handleAudioPlay(audioUrl);
      // }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong');
      const errorMessage = { type: 'error', content: error.message };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  // Emotion-based styling
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-yellow-100',
      sad: 'bg-blue-100',
      excited: 'bg-green-100',
      angry: 'bg-red-100',
      neutral: 'bg-gray-100',
      curious: 'bg-purple-100',
      anxious: 'bg-orange-100',
      surprised: 'bg-pink-100'
    };
    return colors[emotion] || colors.neutral;
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
  {/* Avatar section - unchanged */}
  <div className="w-1/2 h-full relative border-r border-amber-200/20">
    <div className="absolute inset-0 backdrop-blur-sm">
      <AvatarScene
        emotion={currentEmotion} 
        isPlaying={isPlaying} 
        // lipsync={currentLipsync}
        // currentTime={currentTime}
      />
    </div>
  </div>

  {/* Moroccan Style Chat section */}
  <div className="w-1/2 flex flex-col h-full bg-[#FDF6E3]/90 backdrop-blur-md">
    {/* Header with Moroccan pattern */}
    <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 border-b-4 border-amber-800
                    bg-amber-100/80 bg-opacity-10">
      <h1 className="text-3xl font-bold text-amber-50 tracking-wider">
      Maroc EmoGuide
      </h1>
      {currentEmotion && (
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                      bg-amber-50/10 border border-amber-100/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-sm font-medium text-amber-50">Current Mood: {currentEmotion}</span>
        </div>
      )}
    </div>

    <audio ref={audioRef} className="hidden" />

    {/* Messages with Moroccan styling */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6 
                    scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-amber-100/20
                    bg-amber-100/80 bg-repeat">
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
          <div className={`
            max-w-[80%] p-4 rounded-2xl backdrop-blur-sm shadow-lg
            ${msg.type === 'user' 
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 rounded-br-none border-2 border-amber-400/20'
              : msg.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-amber-50/90 text-amber-900 border-2 border-amber-200 rounded-bl-none'
            }
            transform transition-all duration-200 hover:scale-[1.02]
          `}>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Input area with Moroccan design */}
    <div className="p-6 bg-amber-100/80 border-t-4 border-amber-200 
                    bg-amber-100/80 bg-opacity-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me about any destination..."
          className="w-full p-4 bg-amber-50/90 border-2 border-amber-200 rounded-xl
                     text-amber-900 placeholder-amber-500
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-300
                     transition-all duration-200 resize-none h-24 shadow-inner"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="self-end px-8 py-3 rounded-xl
                   bg-gradient-to-r from-amber-600 to-orange-600
                   text-amber-50 font-medium
                   transform transition-all duration-200
                   hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25
                   disabled:opacity-50 disabled:hover:scale-100
                   focus:outline-none focus:ring-2 focus:ring-amber-500/50
                   border-2 border-amber-400/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing...</span>
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  </div>
</div>
    // <div className="flex h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
    //   {/* Avatar section */}
    //   <div className="w-1/2 h-full relative border-r border-purple-200">
    //     <div className="absolute inset-0">
    //       <AvatarScene
    //         emotion={currentEmotion} 
    //         isPlaying={isPlaying} 
    //         lipsync={currentLipsync}
    //         currentTime={currentTime}
    //       />
    //     </div>
    //   </div>

    //   {/* Chat section */}
    //   <div className="w-1/2 flex flex-col h-full bg-white bg-opacity-80 backdrop-blur-sm">
    //     {/* Chat header with emotion indicator */}
    //     <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
    //       <h1 className="text-xl font-semibold">Tourist Guide AI</h1>
    //       {currentEmotion && (
    //         <div className={`text-sm mt-1 ${getEmotionColor(currentEmotion)} text-gray-800 px-2 py-1 rounded-full inline-block`}>
    //           Detected mood: {currentEmotion}
    //         </div>
    //       )}
    //     </div>

    //     {/* Messages area */}
    //     <div className="flex-1 overflow-y-auto p-4 space-y-4">
    //       {messages.map((msg, index) => (
    //         <div
    //           key={index}
    //           className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
    //         >
    //           <div
    //             className={`max-w-[80%] rounded-lg p-4 ${
    //               msg.type === 'user'
    //                 ? 'bg-indigo-500 text-white rounded-br-none'
    //                 : msg.type === 'error'
    //                 ? 'bg-red-100 text-red-700'
    //                 : `${getEmotionColor(msg.emotion)} text-gray-800 rounded-bl-none`
    //             }`}
    //           >
    //             <p className="whitespace-pre-wrap">{msg.content}</p>
    //           </div>
    //         </div>
    //       ))}
    //       <div ref={messagesEndRef} />
    //     </div>

    //     {/* Audio element */}
    //     <audio ref={audioRef} className="hidden" />
        
    //     {/* Input area */}
    //     <div className="border-t border-purple-100 bg-white p-4">
    //       <form onSubmit={handleSubmit} className="flex gap-2">
    //         <input
    //           type="text"
    //           value={message}
    //           onChange={(e) => setMessage(e.target.value)}
    //           placeholder="Ask me about any destination..."
    //           className="flex-1 p-3 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    //           disabled={loading}
    //         />
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full hover:opacity-90 disabled:opacity-50 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
    //         >
    //           {loading ? (
    //             <span className="flex items-center gap-2">
    //               <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    //               </svg>
    //               Processing...
    //             </span>
    //           ) : (
    //             'Send'
    //           )}
    //         </button>
    //       </form>
    //     </div>
    //   </div>
    // </div>
  )
}

export default ChatInterface