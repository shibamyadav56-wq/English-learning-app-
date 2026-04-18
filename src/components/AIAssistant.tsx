import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User as UserIcon, Plus, Image as ImageIcon, X } from 'lucide-react';

type Message = {
  role: 'user' | 'ai';
  text: string;
  imageUrl?: string;
};

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<{ file: File, preview: string, base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImage({
        file,
        preview: URL.createObjectURL(file),
        base64: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAsk = async () => {
    if (!input && !image) return;
    
    const userMessage: Message = { role: 'user', text: input, imageUrl: image?.preview };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = image;
    
    setInput('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      // Prioritize Vite environment variables for Netlify/Local Dev
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || 
                    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
      
      if (!apiKey) {
        throw new Error("API Key not found. Please ensure VITE_GEMINI_API_KEY is configured in your environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `You are a highly knowledgeable AI assistant. Provide deep, detailed, and comprehensive answers to all questions. 
      However, you are STRICTLY FORBIDDEN from answering questions related to sex education or coding for games. 
      If asked about these restricted topics, politely decline by saying "Sorry, main is vishay par jankari nahi de sakta."
      Answer in a mix of Hindi and English if appropriate.
      
      Question: ${currentInput || "Please explain this image."}`;

      const parts: any[] = [{ text: systemPrompt }];

      if (currentImage) {
        parts.push({
          inlineData: {
            data: currentImage.base64,
            mimeType: currentImage.file.type
          }
        });
      }

      const stream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: parts,
      });

      setMessages(prev => [...prev, { role: 'ai', text: '' }]);

      for await (const chunk of stream) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'ai') {
            lastMessage.text += chunk.text || '';
          }
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error("AI Error details:", error);
      let errorMessage = "Error getting response.";
      
      if (error.message?.includes("API Key not found")) {
        errorMessage = "Error: API Key nahi mili. Netlify settings mein VITE_GEMINI_API_KEY check karein.";
      } else if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid API key")) {
        errorMessage = "Error: Apka API Key galat hai. Kripya naya API Key generate karein.";
      } else if (error.message) {
        errorMessage = `AI Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-4">
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 px-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
            <Bot size={80} strokeWidth={1} className="mb-4" />
            <p className="font-bold text-lg">Main apki kaise madad kar sakta hoon?</p>
            <p className="text-sm">Homework ka photo bhejein ya sawaal puchein</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-slate-600'}`}>
              {msg.role === 'user' ? <UserIcon size={20}/> : <Bot size={20}/>}
            </div>
            <div className={`p-4 rounded-3xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white shadow-lg shadow-blue-500/10' : 'bg-white text-slate-900 shadow-sm border border-slate-100'}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-2xl mb-3 max-h-60 object-contain shadow-sm" />
              )}
              {msg.text && <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.text}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 p-4 bg-white self-start rounded-3xl shadow-sm border border-slate-100 italic text-slate-400">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
            </div>
            Thinking...
          </div>
        )}
      </div>
      
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-[32px] shadow-2xl border border-white sticky bottom-0 nav-shadow">
        {image && (
          <div className="relative inline-block mb-3 ml-2 group">
            <img src={image.preview} alt="Preview" className="h-24 w-24 object-cover rounded-2xl border-4 border-blue-100 shadow-lg" />
            <button 
              onClick={removeImage}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 active:scale-90 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition shrink-0 active:scale-90"
            title="Upload Photo or Take Picture"
          >
            <ImageIcon size={24} />
          </button>
          <div className="flex-grow relative bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-primary transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 outline-none resize-none max-h-40 min-h-[56px] bg-transparent text-[15px] font-medium"
              placeholder="Kuch bhi puchein..."
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
            />
          </div>
          <button 
            onClick={handleAsk} 
            className={`p-4 rounded-2xl shrink-0 transition-all duration-300 ${
              (input.trim() || image) && !loading 
                ? 'bg-primary text-white shadow-xl shadow-blue-500/30 scale-100 active:scale-90' 
                : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
            }`} 
            disabled={loading || (!input.trim() && !image)}
          >
            <Send size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
