import React, { useState, useEffect, useRef } from 'react';
import './AIAssistant.css';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm SkillBot. How can I help you excel today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const botResponse = getBotResponse(input);
            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
            setIsTyping(false);
        }, 1200);
    };

    const getBotResponse = (query) => {
        const q = query.toLowerCase();

        // Technical Mappings
        if (q.includes('cicd') || q.includes('pipeline') || q.includes('devops')) {
            return "CI/CD is a crucial DevOps practice. For expert guidance, I highly recommend connecting with Nikshay Verma—he specializes in Docker, AWS, and automation pipelines.";
        }
        if (q.includes('react') || q.includes('web')) {
            return "React is excellent for dynamic apps! Akshit Sharma or Sudhanshu Mishra are our top mentors for Frontend and Full-stack development.";
        }
        if (q.includes('python') || q.includes('django') || q.includes('flask')) {
            return "Python is very versatile. Anmol is a specialist who can help you from basics to advanced backend frameworks like Django.";
        }
        if (q.includes('ml') || q.includes('machine learning') || q.includes('ai') || q.includes('tensorflow')) {
            return "For AI and Machine Learning, Harshit Chetal is your best bet. He has a Master's from Stanford and works on LLMs!";
        }
        if (q.includes('design') || q.includes('figma') || q.includes('ui') || q.includes('ux')) {
            return "Design is the heart of a product. Bhanu Pratap is an incredible UX designer who can help you master Figma and user research.";
        }
        if (q.includes('mobile') || q.includes('firebase') || q.includes('native')) {
            return "Building mobile apps? Satwik specializes in React Native and Firebase integration.";
        }
        if (q.includes('data') || q.includes('sql') || q.includes('tableau')) {
            return "Data insights are powerful. Sukrant is our resident Data Scientist who can help you with Python, SQL, and visualization.";
        }

        // General / Helper Mappings
        if (q.includes('mentor')) return "You can find amazing mentors on our 'Discover' page. Are you looking for a specific skill like React, CI/CD, or Python?";
        if (q.includes('hello') || q.includes('hi')) return "Hi there! I'm SkillBot. I can help you find mentors, generate learning roadmaps, or explain project basics. What do you want to learn today?";
        if (q.includes('roadmap')) return "I can help you build a custom learning roadmap! Just click '✨ Roadmap' on your Student Dashboard for any skill you're learning.";

        return "I'm not 100% sure about that specific topic, but I can definitely help you find a mentor for it! Try searching for it on the 'Discover' page or ask me about 'roadmaps'.";
    };

    return (
        <div className={`ai-assistant-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Floating Bubble */}
            <div className="ai-bubble" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '✨'}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="bot-info">
                            <span className="bot-status">●</span>
                            <strong>SkillBot AI</strong>
                        </div>
                    </div>

                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.isBot ? 'bot' : 'user'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && <div className="ai-message bot typing">...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-input-area">
                        <input
                            type="text"
                            placeholder="Ask SkillBot something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
