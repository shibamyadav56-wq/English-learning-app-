import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Plus, Image as ImageIcon, X } from 'lucide-react';

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
    <div className="flex flex-col h-screen p-4 bg-warm-bg pb-24">
      <h1 className="text-2xl font-bold mb-4 text-center font-display text-gray-900">AI Homework Assistant</h1>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-full shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-gray-300'}`}>
              {msg.role === 'user' ? <User size={20} className="text-white"/> : <Bot size={20} className="text-gray-700"/>}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-white text-gray-900 shadow-sm'}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-xl mb-2 max-h-48 object-contain" />
              )}
              {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
            </div>
          </div>
        ))}
        {loading && <div className="p-3 bg-white self-start rounded-2xl shadow-sm">Thinking...</div>}
      </div>
      
      <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100 mb-20">
        {image && (
          <div className="relative inline-block mb-2 ml-2">
            <img src={image.preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-200" />
            <button 
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
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
            className="p-3 bg-blue-50 text-primary rounded-full hover:bg-blue-100 transition shrink-0 mb-1 ml-1"
            title="Upload Photo or Take Picture"
          >
            <Plus size={24} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-3 outline-none resize-none max-h-32 min-h-[50px] bg-transparent"
            placeholder="Ask your question or upload a photo..."
            rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
          />
          <button 
            onClick={handleAsk} 
            className={`p-4 rounded-full shrink-0 mb-1 mr-1 transition ${
              (input.trim() || image) && !loading 
                ? 'bg-primary text-white hover:bg-blue-700 shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`} 
            disabled={loading || (!input.trim() && !image)}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
