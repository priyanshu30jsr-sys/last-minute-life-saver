import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../components/layout/Layout';
import ChatBubble from '../components/chat/ChatBubble';
import ThinkingDots from '../components/chat/ThinkingDots';
import ChatInput from '../components/chat/ChatInput';
import MorphingBlob from '../animations/MorphingBlob';
import GeminiOrb from '../animations/GeminiOrb';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { usePlans } from '../context/PlanContext';
import { useSocket } from '../context/SocketContext';
import * as chatService from '../services/chatService';
import * as planService from '../services/planService';
import { generateSessionId } from '../utils/helpers';

const STARTERS = [
  '🚀 I have a hackathon in 48 hours and haven\'t started',
  '📝 I need to submit my final project in 3 days',
  '💪 Help me build a study plan for my exam next week',
  '⚡ I have 5 tasks due tomorrow — what do I do first?'
];

const Chat = () => {
  const [messages,   setMessages]   = useState([]);
  const [sessionId,  setSessionId]  = useState(() => generateSessionId());
  const [loading,    setLoading]    = useState(false);
  const [orbActive,  setOrbActive]  = useState(false);
  const [pendingPlan,setPendingPlan]= useState(null);
  const scrollRef = useRef(null);
  const { show } = useToast();
  const { addPlan } = usePlans();
  const { socket } = useSocket();

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Socket: listen for replanning events
  useEffect(() => {
    if (!socket) return;
    socket.on('brief:morning', (brief) => {
      show(`🌅 ${brief.focusMessage}`, 'info', 7000);
    });
    return () => { socket.off('brief:morning'); };
  }, [socket]);

  const sendMessage = async (text) => {
    // 1. Guard against empty text strings
    if (!text || !text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setOrbActive(true);

    try {
      // 2. Trigger the updated service call with pristine string parameter pass
      const data = await chatService.sendMessage(text, sessionId);

      const aiMsg = {
        role:          'model',
        content:       data.response || data.content || '',
        planGenerated: data.planDetected || false
      };
      setMessages(prev => [...prev, aiMsg]);

      if (data.planDetected && data.planData) {
        setPendingPlan(data.planData);
      }
    } catch (err) {
      // 3. Log the exact error payload from the backend to the console for inspection
      console.error('Server Validation Refusal Summary:', err.response?.data);
      show('Gemini is momentarily unavailable. Try again.', 'error');
    } finally {
      setLoading(false);
      setOrbActive(false);
    }
  };

  const confirmSavePlan = async () => {
    if (!pendingPlan) return;
    setLoading(true);
    try {
      const result = await planService.generatePlan(
        `Save this plan: ${pendingPlan.planTitle}`,
        sessionId
      );
      if (result.plan) {
        addPlan(result.plan);
        show(
          result.calendarSynced
            ? '✅ Plan saved & synced to Google Calendar!'
            : '✅ Plan saved to your dashboard!',
          'success'
        );
      }
    } catch {
      show('Failed to save plan', 'error');
    } finally {
      setLoading(false);
      setPendingPlan(null);
    }
  };

  const newSession = () => {
    setMessages([]);
    setSessionId(generateSessionId());
    setPendingPlan(null);
  };

  return (
    <Layout>
      <div className="flex h-screen relative overflow-hidden bg-[#0D1B2A]">
        
        {/* ========================================================================= */}
        {/* 1. FULLSCREEN 3D AMBIENT BACKGROUND LAYER                                 */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 z-0 w-screen h-screen overflow-hidden pointer-events-none opacity-40">
          <GeminiOrb size="100%" />
        </div>

        {/* Background complementary organic blob fallback */}
        <MorphingBlob color="#8B5CF6" size={600} opacity={0.04}
          className="top-0 right-0 -translate-y-1/4 translate-x-1/4 z-0" />

        {/* ========================================================================= */}
        {/* 2. FOREGROUND CONTENT WRAPPER (Elevated with z-10)                       */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 pt-8 pb-6 z-10 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white">
                <span className="bg-gradient-to-r from-white to-[#00B4D8] bg-clip-text text-transparent">LifeSaver AI</span>
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                Your autonomous planning agent · Powered by Gemini
              </p>
            </div>
            <Button variant="ghost" size="sm" icon="plus" onClick={newSession}>
              New Chat
            </Button>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 no-scrollbar">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-6 pb-10"
              >
                {/* Empty state content wrapper with 3D canvas moved to background backdrop */}
                <div className="text-center mt-12">
                  <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                    What do you need to accomplish?
                  </h2>
                  <p className="text-white/50 text-sm max-w-sm mx-auto">
                    Describe any goal with a deadline and I'll build your complete
                    action plan instantly.
                  </p>
                </div>
                
                {/* Starter Prompts Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                  {STARTERS.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => sendMessage(s)}
                      className="bg-[#1B263B]/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-left
                        text-white/70 text-xs hover:border-[#00B4D8]/40 hover:text-white
                        transition-all leading-relaxed shadow-lg"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  message={msg}
                  isUser={msg.role === 'user'}
                />
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ThinkingDots />
              </motion.div>
            )}

            {/* Pending plan confirm banner */}
            <AnimatePresence>
              {pendingPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="bg-[#1B263B]/80 backdrop-blur-lg border border-[#00B4D8]/40 rounded-2xl p-4
                    flex items-center justify-between gap-4 shadow-xl shadow-black/20"
                >
                  <div>
                    <p className="text-white font-bold text-sm">
                      💡 {pendingPlan.planTitle}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {pendingPlan.steps?.length} steps · Priority {pendingPlan.priorityScore}/10
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={confirmSavePlan}
                      loading={loading}
                      icon="check"
                    >
                      Save Plan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingPlan(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={scrollRef} />
          </div>

          {/* Prompt Form Input Area */}
          <div className="mt-4 relative bg-[#0D1B2A]">
            <ChatInput onSend={sendMessage} loading={loading} />
            <p className="text-center text-white/20 text-xs mt-3">
              Powered by Gemini 1.5 Pro · Google AI Studio
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Chat;