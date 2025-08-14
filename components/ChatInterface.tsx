'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot } from 'lucide-react';
import Image from 'next/image';
import { Youtube } from "lucide-react";


interface Message {
  id: string;
  persona: Persona;
  sender: 'user' | 'hitesh' | 'piyush';
  content: string;
  timestamp: Date;
  isAnimating?: boolean;
}

type Persona = 'hitesh' | 'piyush';

const TypewriterText: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
};

const ChatInterface: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>('hitesh');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Function to send message - prepared for API integration
  const sendMessage = async (persona: Persona, userMessage: string) => {
    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      persona,
      sender: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMsg]);
    const filteredChat = chatHistory.filter(msg => msg.persona === selectedPersona);

    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', { // make sure this path matches your route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          persona,
          conversationHistory: filteredChat.map(msg => ({
            content: msg.content,
            sender: msg.sender === 'user' ? 'user' : 'bot',
          })),
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        persona,
        sender: persona,
        content: data.reply,
        timestamp: new Date(),
        isAnimating: true,
      };

      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
  };


  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(selectedPersona, message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStyle = (sender: Message['sender']) => {
    switch (sender) {
      case 'user':
        return "bg-gradient-to-r from-purple-500 to-purple-400 dark:from-purple-700 dark:to-purple-600 text-white ml-auto shadow-lg border border-purple-300 dark:border-purple-700";
      case 'hitesh':
        return "bg-gradient-to-r from-green-500 to-green-400 dark:from-green-700 dark:to-green-600 text-white mr-auto shadow-lg border border-green-300 dark:border-green-700";
      case 'piyush':
        return "bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-700 dark:to-blue-600 text-white mr-auto shadow-lg border border-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-200 dark:bg-gray-800 text-black dark:text-white mr-auto";
    }
  };


  const getPersonaIcon = (sender: Message['sender']) => {
    if (sender === 'user') return <User className="w-4 h-4" />;
    if (sender === 'hitesh') return <Image src="/hitesh1.jpg" alt="img" width={22} height={22} className="rounded-full" />;
    if (sender === 'piyush') return <Image src="/piyush.png" alt="img" width={22} height={22} className="rounded-full" />;
    return <Bot className="w-4 h-4" />;
  };

  const getPersonaName = (sender: Message['sender']) => {
    switch (sender) {
      case 'user':
        return 'You';
      case 'hitesh':
        return 'Hitesh Sir';
      case 'piyush':
        return 'Piyush Sir';
      default:
        return sender;
    }
  };

  const PersonaToggle: React.FC<{ persona: Persona; isActive: boolean; onClick: () => void }> = ({
    persona,
    isActive,
    onClick
  }) => {
    const personaData = {
      hitesh: {
        name: 'Hitesh Sir',
        icon: <Image src="/hitesh1.jpg" alt="img" width={44} height={44} className="rounded-full" />,
        gradient: 'from-green-500 to-emerald-600',
        description: 'Chai aur Code'
      },
      piyush: {
        name: 'Piyush Sir',
        icon: <Image src="/piyush.png" alt="img" width={44} height={44} className="rounded-full" />,
        gradient: 'from-blue-500 to-cyan-600',
        description: 'Piyush Garg'
      }
    };

    const data = personaData[persona];

    return (
      <button
        onClick={onClick}
        className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isActive
            ? `border-transparent bg-gradient-to-br ${data.gradient} text-white shadow-2xl animate-glow-pulse`
            : 'border-border bg-card/50 hover:bg-card/80 hover:border-primary/30'
          }`}
      >
        <div className="flex flex-col items-center space-y-2 relative z-10">
          <div >
            {data.icon}
          </div>
          <div className="text-center">
            <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-foreground'}`}>
              {data.name}
            </p>
            <p className={`text-xs flex items-center gap-2 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
              <Youtube className="w-6 h-6 text-red-600" />
              {data.description}
            </p>
          </div>
        </div>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        )}
      </button>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-border/50 bg-card/30 backdrop-blur-xl p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent mb-2 ">
              AI Guru Chat
            </h1>
            <p className="text-muted-foreground text-sm">  Pick a mentor below and see how Hitesh Sir or Piyush Sir would respond to your questions!
            </p>
          </div>

          {/* Persona Selection */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <PersonaToggle
              persona="hitesh"
              isActive={selectedPersona === 'hitesh'}
              onClick={() => setSelectedPersona('hitesh')}
            />
            <PersonaToggle
              persona="piyush"
              isActive={selectedPersona === 'piyush'}
              onClick={() => setSelectedPersona('piyush')}
            />
          </div>
        </div>
      </div>

      {/* Chat Messages */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full relative z-10">
        {chatHistory.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20 animate-fade-in">
            <div className="relative mb-6">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-primary/30 rounded-full animate-ping"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Ready to Chat!</h3>
            <p>Start a conversation with {selectedPersona === 'hitesh' ? 'Hitesh Sir' : 'Piyush Sir'}</p>
            <p className="text-sm mt-2 opacity-60">Chat with Your Favorite Tech Gurus!</p>
          </div>
        ) : (
          <>
            {chatHistory
              .filter(msg => msg.persona === selectedPersona || msg.sender === 'user' && msg.persona === selectedPersona)
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-5 py-4 rounded-3xl backdrop-blur-sm ${getMessageStyle(msg.sender)} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getPersonaIcon(msg.sender)}
                      <span className="text-xs font-semibold opacity-90">
                        {getPersonaName(msg.sender)}
                      </span>
                      <div className="flex-1"></div>
                      <span className="text-xs opacity-60">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed">
                      {msg.isAnimating && msg.sender !== 'user' ? (
                        <TypewriterText
                          text={msg.content}
                          onComplete={() => {
                            setChatHistory(prev =>
                              prev.map(m =>
                                m.id === msg.id ? { ...m, isAnimating: false } : m
                              )
                            );
                          }}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}


            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-xs lg:max-w-md px-5 py-4 rounded-3xl bg-muted/50 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPersona === 'hitesh' ? <Image src="/hitesh1.jpg" alt="img" width={22} height={22} className="rounded-full" /> : <Image src="/piyush.png" alt="img" width={22} height={22} className="rounded-full" />}
                    <span className="text-xs font-semibold opacity-90">
                      {selectedPersona === 'hitesh' ? 'Hitesh Sir' : 'Piyush Sir'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-xl p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 p-2 bg-background/50 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedPersona === 'hitesh' ? 'Hitesh Sir' : 'Piyush Sir'}... (Press Enter to send)`}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              variant="chat"
              size="icon"
              className="shrink-0 rounded-xl h-12 w-12 bg-purple-600 hover:bg-purple-600 transition-all duration-200 flex items-center justify-center"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>

          </div>
          <p className="text-xs text-muted-foreground/60 text-center mt-2">
            {selectedPersona === 'hitesh' ? 'Chatting with Hitesh Sir' : 'Chatting with Piyush Sir'} • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;