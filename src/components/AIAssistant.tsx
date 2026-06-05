import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Sparkles, Mic, MicOff, Copy, Check, 
  ArrowLeft, Volume2, Plus, Image, Camera, FileText, X, 
  Settings, Sliders, VolumeX, Trash2, HelpCircle
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
}

interface TextBlock {
  type: 'text';
  text: string;
}

type MessageBlock = CodeBlock | TextBlock;

interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64 payload
  dataUrl: string; // URL for client-side preview
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: "What's on your mind today?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Multimodal attachments states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Speech Voice customizations states
  const [selectedVoicePreset, setSelectedVoicePreset] = useState<'lexi' | 'liam' | 'aria' | 'aarav'>('aarav');
  const [speakRate, setSpeakRate] = useState<number>(1.0);
  const [speakPitch, setSpeakPitch] = useState<number>(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Hidden File Inputs Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Fetch custom avatar photo from Firestore
  useEffect(() => {
    let active = true;
    const loadPhoto = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists() && active) {
            const data = docSnap.data();
            if (data.photoURL) {
              setUserPhoto(data.photoURL);
              return;
            }
          }
        } catch (e) {
          console.warn("Could not load user photo from Firestore:", e);
        }
        if (active) {
          setUserPhoto(user.photoURL);
        }
      }
    };
    loadPhoto();
    return () => {
      active = false;
    };
  }, []);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle outside clicks to close Plus menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Web Speech Synthesis voices loader
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const handleVoices = () => {
        setVoicesLoaded(true);
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Clean speaking state on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Speech-to-Text setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Retrieve Speech Voice based on selected user preset
  const getSelectedVoice = (): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    let targetLang = 'en-US';
    let preferMale = false;

    if (selectedVoicePreset === 'aria') {
      targetLang = 'en-GB';
    } else if (selectedVoicePreset === 'aarav') {
      const indianVoices = voices.filter(v => 
        v.lang.toLowerCase().includes('hi-in') || 
        v.lang.toLowerCase().includes('en-in')
      );
      if (indianVoices.length > 0) {
        const hiVoice = indianVoices.find(v => v.lang.toLowerCase().includes('hi-in'));
        if (hiVoice) return hiVoice;
        const maleIndian = indianVoices.find(v => 
          v.name.toLowerCase().includes('ravi') || 
          v.name.toLowerCase().includes('male')
        );
        return maleIndian || indianVoices[0];
      }
      targetLang = 'en-IN';
      preferMale = true;
    } else if (selectedVoicePreset === 'liam') {
      targetLang = 'en-US';
      preferMale = true;
    }

    const matchingVoices = voices.filter(v => v.lang.toLowerCase().includes(targetLang.toLowerCase()));
    if (matchingVoices.length > 0) {
      if (preferMale) {
        const maleVoice = matchingVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('ravi') ||
          v.name.toLowerCase().includes('guy')
        );
        return maleVoice || matchingVoices[0];
      } else {
        const femaleVoice = matchingVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('hazel')
        );
        return femaleVoice || matchingVoices[0];
      }
    }
    return null;
  };

  // Speak AI Response with custom voice, pitch, and rate modifications
  const speakText = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingMsgIndex(null);
      } else {
        window.speechSynthesis.cancel();
        // Clean markdown syntax from read-back string
        const cleanText = text.replace(/\*\*|`|```/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const customVoice = getSelectedVoice();
        if (customVoice) {
          utterance.voice = customVoice;
        }
        utterance.rate = speakRate;
        utterance.pitch = speakPitch;

        utterance.onend = () => setSpeakingMsgIndex(null);
        utterance.onerror = () => setSpeakingMsgIndex(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingMsgIndex(index);
      }
    }
  };

  // Sound recognition trigger toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition isn't supported inside this browser/tab. Try Chrome or Safari!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Handle multimodal file uploads
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image' | 'camera') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select a file smaller than 10MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const parts = dataUrl.split(',');
      const mimeType = file.type || 'application/octet-stream';
      const base64Data = parts[1];

      const newAttachment: Attachment = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        mimeType: mimeType,
        data: base64Data,
        dataUrl: dataUrl
      };

      // Add to list, allowing max 3 sheets
      setAttachments(prev => [...prev.slice(-2), newAttachment]);
      setShowPlusMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to permit selecting again
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Parse Markdown fields (paragraphs, lists, highlights, blocks)
  const parseMessage = (text: string): MessageBlock[] => {
    const blocks: MessageBlock[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore.trim() || blocks.length === 0 && textBefore) {
        blocks.push({ type: 'text', text: textBefore });
      }
      blocks.push({
        type: 'code',
        language: match[1] || 'code',
        code: match[2],
      });
      lastIndex = regex.lastIndex;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter.trim() || blocks.length === 0) {
      blocks.push({ type: 'text', text: textAfter || text });
    }

    return blocks;
  };

  const handleSendPrompt = async (promptText: string) => {
    const targetText = promptText.trim();
    if (!targetText && attachments.length === 0) return;

    const activeAttachments = [...attachments];
    setAttachments([]); // Reset working list

    // Push message to log with attachments preview
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: targetText || `Sent ${activeAttachments.length} attachments.`, 
      timestamp: new Date(),
      attachments: activeAttachments
    }]);
    
    setInput('');
    setIsTyping(true);

    try {
      // Structure attachments for multimodal backend
      const payloadAttachments = activeAttachments.map(att => ({
        mimeType: att.mimeType,
        data: att.data
      }));

      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: targetText,
          attachments: payloadAttachments
        })
      });
      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.response || "No response.", 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error("AI assistant error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I am having trouble connecting to the homework servers right now. Please test your Internet connection and try again! 🌐", 
        timestamp: new Date() 
      }]);
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="p-4 md:p-6 min-h-[100dvh] flex flex-col bg-white text-slate-800 select-none relative overflow-hidden">
      
      {/* Decorative Outer ambient neon glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hidden file selectors */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileSelection(e, 'file')} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={(e) => handleFileSelection(e, 'image')} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={(e) => handleFileSelection(e, 'camera')} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
      />

      {/* Sleek, attractive Premium Header */}
      <div className="w-full max-w-3xl mx-auto shrink-0 bg-slate-50 border border-slate-205/60 rounded-[28px] p-4 shadow-sm mb-4 flex items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl active:scale-95 transition border border-slate-200 flex items-center gap-2 shadow-xs"
            title="Go Back"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-wider font-sans">Go Back</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Dynamic Speech Tuning Side drawer overlay panel when toggled */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full shrink-0 bg-slate-900/90 border-2 border-indigo-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="absolute top-0 right-0 p-3">
                <button onClick={() => setShowVoiceSettings(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>

              <h4 className="font-extrabold text-sm text-indigo-300 flex items-center gap-2 mb-4 uppercase tracking-widest font-mono">
                <Volume2 size={16} /> Speach & Accent Tuner (Lexi Voice)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Voice preset options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Voice Character</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedVoicePreset('lexi')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        selectedVoicePreset === 'lexi' 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      👩‍🏫 Lexi (US)
                    </button>
                    <button 
                      onClick={() => setSelectedVoicePreset('aria')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        selectedVoicePreset === 'aria' 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      👑 Aria (UK)
                    </button>
                    <button 
                      onClick={() => setSelectedVoicePreset('liam')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        selectedVoicePreset === 'liam' 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      👨‍🏫 Liam (US Male)
                    </button>
                    <button 
                      onClick={() => setSelectedVoicePreset('aarav')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        selectedVoicePreset === 'aarav' 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-black' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      🇮🇳 Aarav (Ind)
                    </button>
                  </div>
                </div>

                {/* Speed rate modifier slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <span>Speed Rate</span>
                    <span className="text-indigo-400 font-mono font-bold">{speakRate}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={speakRate}
                    onChange={(e) => setSpeakRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>Slow</span>
                    <span>Normal (1.0x)</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Tone Pitch modifier slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <span>Voice Pitch</span>
                    <span className="text-indigo-400 font-mono font-bold">{speakPitch}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.5" 
                    step="0.1" 
                    value={speakPitch}
                    onChange={(e) => setSpeakPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>Deep</span>
                    <span>Standard</span>
                    <span>High Pitch</span>
                  </div>
                </div>

              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 italic text-center">
                *Tuning applies instantly when you click "Speak" under any AI solution message bubble.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat UI Container (Glow Box Light Theme) */}
        <div className="w-full bg-slate-50/80 backdrop-blur-2xl border-2 border-slate-200 border-b-[8px] rounded-[36px] flex flex-col flex-1 min-h-[300px] overflow-hidden shadow-xl relative animate-fadeIn">
          
          {/* Conversation history messages container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {/* Render speech history items list */}
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 justify-start ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                
                {/* Author Avatar Column */}
                <div className="shrink-0 flex items-end">
                  {msg.role === 'user' ? (
                    <div className="w-10 h-10 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center font-black text-sm text-slate-600 uppercase select-none relative shadow-sm">
                      {userPhoto ? (
                        <img src={userPhoto} alt="User Avatar" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span>{(currentUser?.displayName || 'U').substring(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white relative shadow-lg">
                      <Bot size={22} strokeWidth={2.5} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Message Bubble Column */}
                <div className="flex flex-col max-w-[80%] min-w-[120px]">
                  
                  {/* Sender label metadata flag */}
                  <span className={`text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 select-none ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.role === 'user' ? 'You' : 'Lexi Robot'}
                  </span>

                  {/* Bubble wrapper component content */}
                  <div 
                    className={`p-4 md:p-5 text-sm leading-relaxed relative ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[24px] rounded-br-[4px] border-t-[1px] border-indigo-400 border-b-4 border-b-indigo-800 shadow-sm' 
                        : 'bg-white text-slate-800 rounded-[24px] rounded-bl-[4px] border-2 border-slate-205 border-b-4 border-b-slate-300 shadow-md'
                    }`}
                  >
                    
                    {/* Render text parts */}
                    <div className="space-y-3">
                      {msg.role === 'user' ? (
                        <p className="font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      ) : (
                        parseMessage(msg.text).map((block, bIdx) => {
                          if (block.type === 'code') {
                            return <CodeBlockComponent key={bIdx} language={block.language} code={block.code} />;
                          } else {
                            return <TextBlockComponent key={bIdx} text={block.text} />;
                          }
                        })
                      )}
                    </div>

                    {/* Render visual attached items if any inside the chat bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-indigo-500/35">
                        {msg.attachments.map((att) => (
                          <div 
                            key={att.id} 
                            className="p-2 bg-slate-950/60 rounded-2xl flex items-center gap-2 max-w-[200px] text-xs border border-indigo-400/20"
                          >
                            {att.mimeType.startsWith('image/') ? (
                              <img 
                                src={att.dataUrl} 
                                alt={att.name} 
                                referrerPolicy="no-referrer" 
                                className="w-11 h-11 object-cover rounded-xl border border-indigo-500/30" 
                              />
                            ) : (
                              <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400">
                                <FileText size={20} />
                              </div>
                            )}
                            <div className="truncate text-left text-indigo-100 flex-1 min-w-0">
                              <p className="font-black truncate text-[11px] text-indigo-200">{att.name}</p>
                              <p className="text-[9px] opacity-75 font-mono text-slate-400">
                                {(att.mimeType.split('/')[1] || 'file').toUpperCase()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sound synthesizer controls underneath AI responses */}
                    {msg.role === 'assistant' && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => speakText(msg.text, i)} 
                          className={`p-1.5 px-3 rounded-xl border text-xs font-black transition flex items-center gap-1.5 select-none active:scale-95 duration-200 ${
                            speakingMsgIndex === i 
                            ? 'bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-400 shadow-xs' 
                            : 'bg-slate-50 border-slate-205 text-indigo-600 hover:text-indigo-700 hover:bg-slate-100'
                          }`}
                          title={speakingMsgIndex === i ? 'Stop Speech' : 'Speak Out Loud'}
                        >
                          <Volume2 size={13} className={speakingMsgIndex === i ? 'animate-bounce' : ''} />
                          <span>{speakingMsgIndex === i ? 'Mute' : 'Speak'}</span>
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 select-none">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            ))}

            {/* AI Typing skeleton indicator loader bubble */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 flex items-end">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white relative shadow-sm">
                    <Bot size={22} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 select-none">Lexi Robot</span>
                  <div className="bg-white border-2 border-slate-205 border-b-4 rounded-[22px] rounded-bl-[4px] p-4 px-6 flex items-center justify-center w-20 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Attachments Preview bar right above input bar */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 mt-1 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2 animate-fadeIn">
              {attachments.map((att) => (
                <div 
                  key={att.id}
                  className="bg-white border border-slate-205 rounded-2xl p-2.5 flex items-center gap-2 relative group/item hover:border-slate-300 transition shadow-xs"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img 
                      src={att.dataUrl} 
                      alt={att.name} 
                      referrerPolicy="no-referrer" 
                      className="w-10 h-10 object-cover rounded-xl border border-slate-100" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="max-w-[140px] text-left pr-3">
                    <p className="font-bold text-[11px] text-slate-800 truncate">{att.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">
                      {(att.mimeType.split('/')[1] || 'file').substring(0, 4)}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeAttachment(att.id)}
                    className="absolute -top-1 -right-1.5 bg-rose-500 hover:bg-rose-650 text-white rounded-full p-0.5 border border-white shadow transition-transform hover:scale-110"
                    title="Remove attachment"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Floating Input panel section */}
          <div className="p-4 pt-2 bg-slate-50 border-t border-slate-200 z-15 relative">
            <div className="max-w-3xl mx-auto flex gap-2 items-center relative">
              
              {/* Mic transcription toggle button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3.5 rounded-full border-2 hover:-translate-y-0.5 active:translate-y-0.5 transition-all shrink-0 flex items-center justify-center border-b-4 ${
                  isListening 
                    ? 'bg-rose-600 border-rose-800 text-white animate-pulse' 
                    : 'bg-white border-slate-205 text-indigo-600 hover:bg-slate-100 hover:text-indigo-700'
                }`}
                title={isListening ? "Listening... Speak now!" : "Speech-to-Text Input"}
              >
                {isListening ? (
                  <MicOff size={19} className="animate-spin text-white" />
                ) : (
                  <Mic size={19} className="text-indigo-600" />
                )}
              </button>

              {/* Plus Button with Dropdown (Gallery, Camera, File upload options) */}
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className={`p-3.5 rounded-full border-2 border-b-4 transition-all shrink-0 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0.5 ${
                    showPlusMenu 
                      ? 'bg-indigo-600 border-indigo-800 text-white rotate-45' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-sm'
                  }`}
                  title="Upload homework photos / files"
                >
                  <Plus size={19} className="transition-transform duration-300" />
                </button>

                {/* Animated Dropdown Menu overlay */}
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 15 }}
                      className="absolute bottom-16 left-0 bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-xl min-w-[180px] z-50 flex flex-col gap-1 backdrop-blur-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white active:scale-95 transition text-left"
                      >
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white">
                          <Camera size={14} />
                        </div>
                        <span>📸 Capture Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white active:scale-95 transition text-left"
                      >
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Image size={14} />
                        </div>
                        <span>🖼️ Select Gallery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white active:scale-95 transition text-left"
                      >
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                          <FileText size={14} />
                        </div>
                        <span>📁 Choose File</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text Input Selector frame */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendPrompt(input);
                    }
                  }}
                  placeholder={
                    isListening 
                      ? "Speak clearly into your microphone..." 
                      : (attachments.length > 0 
                          ? "Add a request description or send now!" 
                          : "Type homework query or upload a photo...")
                  }
                  className="w-full p-4 pr-12 rounded-[25px] border-2 border-slate-205 border-b-4 focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 bg-white text-slate-800 font-medium shadow-sm"
                />
                
                {/* Clear text helper banner */}
                {input.trim() && (
                  <button 
                    onClick={() => setInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 text-xs font-bold p-1 bg-slate-100 hover:bg-slate-200 rounded-full animate-fadeIn"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={() => handleSendPrompt(input)}
                className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-2 border-green-800 border-b-4 active:border-b-2 active:translate-y-0.5 transition-all outline-none flex items-center justify-center shadow-md animate-scaleUp"
                title="Send Prompt Button"
              >
                <Send size={18} className="translate-x-[-1px]" />
              </button>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// 2. Syntax formatted Code components
const CodeBlockComponent = ({ language, code }: { language: string; code: string; key?: any }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl border-2 border-slate-850 bg-slate-950 overflow-hidden shadow-lg select-all text-left">
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-white/5">
        <span className="uppercase tracking-wider font-extrabold text-indigo-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg font-black select-none"
          title="Copy Code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs text-indigo-150 select-text leading-relaxed max-h-96">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

// 3. Render formatting parser lines helper
const renderFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 rounded mx-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 p-0.5 px-1.5 rounded text-xs select-all">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// 4. Text component representing details
const TextBlockComponent = ({ text }: { text: string; key?: any }) => {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2 text-left">
      {lines.map((line, lIdx) => {
        // Bullet checks
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const content = isBullet ? line.trim().substring(2) : line;

        // Process bold and inline code
        const formatted = renderFormattedText(content);

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="text-emerald-500 mt-1.5 select-none text-xs">✦</span>
              <span className="text-slate-700 font-medium leading-relaxed">{formatted}</span>
            </div>
          );
        }
        
        return (
          <p key={lIdx} className="text-slate-700 font-semibold leading-relaxed min-h-[0.5rem] whitespace-pre-wrap">
            {formatted}
          </p>
        );
      })}
    </div>
  );
};
