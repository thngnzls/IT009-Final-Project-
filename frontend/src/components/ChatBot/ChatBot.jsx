import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './ChatBot.css';
import GEMINI_API_KEY from '../../config/gemini.js';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your AI assistant. How can I help you today?",
            sender: 'bot'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            text: inputMessage,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(inputMessage);
            const response = await result.response;
            const botMessage = {
                text: response.text(),
                sender: 'bot'
            };
            
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error.message.includes('API key')) {
                errorMessage = 'Error: Invalid API key. Please check your API key configuration.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            setMessages(prev => [...prev, {
                text: errorMessage,
                sender: 'bot'
            }]);
        }

        setIsLoading(false);
    };

    return (
        <div className="chatbot-container">
            {/* Chat Toggle Button */}
            <button 
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes /> : <FaRobot />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <FaRobot /> Chat Assistant
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.sender}`}
                            >
                                {message.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot loading">
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="chatbot-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;