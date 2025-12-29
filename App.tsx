
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Trophy, Code2, Play, Send, RotateCcw, Cpu, MessageSquare, 
  Lightbulb, AlertCircle, CheckCircle2, ChevronRight, Loader2,
  Volume2, VolumeX, Terminal, Layout, History, Zap, BrainCircuit,
  Settings, ChevronLeft, Sparkles, BookOpen
} from 'lucide-react';
import { AppStatus, CodingProblem, EvaluationResult, UserStats } from './types';
import { generateProblem, evaluateSolution, generateSenseiVoice, askSenseiHint } from './services/geminiService';

/**
 * CodeSensei - AI Judge & Mentor
 * 
 * Performance Optimizations Applied:
 * 1. useCallback hooks for all event handlers to prevent unnecessary re-renders
 * 2. useMemo for expensive computations (line numbers generation)
 * 3. Optimized base64 to binary conversion using Uint8Array.from
 * 4. Optimized audio buffer creation using channelData.set()
 * 5. Memoized all callback functions that are passed as props
 */
const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'sensei', text: string}[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({ xp: 0, rank: 'Novice', solvedCount: 0, streak: 0 });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('codesensei_stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('codesensei_stats', JSON.stringify(stats));
  }, [stats]);

  // Audio Playback - Optimized for performance
  const playVoice = useCallback(async (base64: string) => {
    if (!isVoiceEnabled || !base64) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    // Optimized: Use Uint8Array.from with callback instead of manual for loop
    // This is faster as it's a single operation vs manual iteration
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    // Optimized: Pre-allocate Float32Array and use channelData.set()
    // This batches the write operation instead of setting each value individually
    const normalizedData = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      normalizedData[i] = dataInt16[i] / 32768.0;
    }
    channelData.set(normalizedData);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }, [isVoiceEnabled]);

  const startNewContest = useCallback(async () => {
    try {
      setStatus(AppStatus.GENERATING);
      const newProblem = await generateProblem();
      setProblem(newProblem);
      const defaultCode = language === 'python' 
        ? '# Optimize your logic here\ndef solution(data):\n    pass' 
        : '// Professional Logic Hub\nfunction solution(data) {\n    return null;\n}';
      setCode(defaultCode);
      setChatHistory([{ role: 'sensei', text: "Namaste! Main aapka judge hoon. Start coding whenever you are ready!" }]);
      setStatus(AppStatus.CONTEST_READY);
      setResult(null);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.IDLE);
    }
  }, [language]);

  const handleAssistantAsk = useCallback(async () => {
    if (!chatMessage.trim() || !problem) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsAssistantLoading(true);
    
    try {
      const hint = await askSenseiHint(problem, code, msg);
      setChatHistory(prev => [...prev, { role: 'sensei', text: hint }]);
      const voice = await generateSenseiVoice(hint);
      playVoice(voice);
    } finally {
      setIsAssistantLoading(false);
    }
  }, [chatMessage, problem, code, playVoice]);

  const submitSolution = useCallback(async () => {
    if (!problem || !code.trim()) return;
    try {
      setStatus(AppStatus.JUDGING);
      const evalResult = await evaluateSolution(problem, code, language);
      setResult(evalResult);
      setStatus(AppStatus.RESULT_READY);
      
      const feedbackVoice = await generateSenseiVoice(evalResult.feedback);
      playVoice(feedbackVoice);

      if (evalResult.isCorrect) {
        setStats(prev => ({
          ...prev,
          xp: prev.xp + 100,
          solvedCount: prev.solvedCount + 1,
          streak: prev.streak + 1,
          rank: prev.xp > 500 ? 'Architect' : prev.xp > 200 ? 'Engineer' : 'Novice'
        }));
      }
    } catch (err) {
      setStatus(AppStatus.CONTEST_READY);
    }
  }, [problem, code, language, playVoice]);

  // Memoize line numbers to avoid recreating on every render
  const lineNumbers = useMemo(() => 
    Array.from({length: 40}, (_, i) => <div key={i} className="h-[1.4rem]">{i+1}</div>),
    []
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  const handleChatMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChatMessage(e.target.value);
  }, []);

  const handleChatKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAssistantAsk();
    }
  }, [handleAssistantAsk]);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => !prev);
  }, []);

  const returnToAssistant = useCallback(() => {
    setStatus(AppStatus.CONTEST_READY);
  }, []);

  return (
    <div className="h-screen bg-[#050505] text-slate-200 flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl">CODE<span className="text-indigo-500">SENSEI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
              <History className="w-3 h-3" /> Streak: {stats.streak}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
              <Trophy className="w-3 h-3 text-amber-500" /> Rank: {stats.rank}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleVoice}
            className={`p-2 rounded-lg border transition-colors ${isVoiceEnabled ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/5' : 'border-white/5 text-slate-500'}`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {status === AppStatus.IDLE ? (
            <button onClick={startNewContest} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
              Launch Arena
            </button>
          ) : (
            <button onClick={startNewContest} className="text-slate-500 hover:text-white text-xs font-bold transition-colors">
              Reset Session
            </button>
          )}
        </div>
      </header>

      {status === AppStatus.IDLE || status === AppStatus.GENERATING ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
          {status === AppStatus.GENERATING ? (
            <div className="space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <BrainCircuit className="w-10 h-10 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Big Tech Trends...</h2>
                <p className="text-slate-500 max-w-sm mx-auto">Crafting a professional challenge that tests your logic, not your typing speed.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> WORLD CLASS CODING MENTOR
                </div>
                <h1 className="text-6xl font-black text-white leading-none tracking-tighter">
                  MASTER THE <br/> <span className="text-indigo-500">LOGIC.</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Most platforms focus on syntax. We focus on **Architecture**. 
                  Get real-time voice mentorship, industry context, and deep logic judge.
                </p>
                <div className="flex gap-4 pt-4">
                  <button onClick={startNewContest} className="bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:scale-105 active:scale-95 transition-all">
                    START SPRINT
                  </button>
                  <button className="border border-white/10 text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-white/5 transition-all">
                    DASHBOARD
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-20"><BrainCircuit className="w-32 h-32" /></div>
                 <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   </div>
                   <div className="space-y-2 mono text-left text-sm">
                     <p className="text-indigo-400"># AI Mentorship Activated</p>
                     <p className="text-slate-300">Evaluating O(N log N) logic...</p>
                     <p className="text-green-400">✓ Industry Best Practices Applied</p>
                     <p className="text-slate-500">// Shabaash! Logic ekdum sahi hai.</p>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 flex overflow-hidden">
          {/* Pane 1: Problem Details */}
          <section className="w-[380px] border-r border-white/5 flex flex-col bg-black/20 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400 uppercase">
                    Challenge
                  </span>
                  <div className="flex gap-1">
                    {problem?.tags.map(t => <span key={t} className="text-[9px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 px-1.5 rounded uppercase">{t}</span>)}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{problem?.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{problem?.description}</p>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" /> Industry Context
                </h4>
                <p className="text-xs text-slate-300 italic">
                  {problem?.industryContext}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requirements</h4>
                <div className="space-y-3">
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase">Input</p>
                    <code className="text-xs text-cyan-400">{problem?.inputFormat}</code>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase">Output</p>
                    <code className="text-xs text-green-400">{problem?.outputFormat}</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pane 2: Code Editor */}
          <section className="flex-1 flex flex-col relative bg-[#080808]">
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/20">
               <div className="flex gap-4">
                 <select value={language} onChange={handleLanguageChange} className="bg-transparent text-xs font-bold text-slate-400 outline-none hover:text-white transition-colors cursor-pointer">
                    <option value="python">PYTHON 3.11</option>
                    <option value="javascript">NODE.JS 20</option>
                 </select>
               </div>
               <div className="text-[10px] font-bold text-slate-600 tracking-tighter uppercase">Professional IDE v2.0</div>
            </div>
            
            <div className="flex-1 relative group">
              {/* Line Numbers Sim */}
              <div className="absolute left-0 top-0 w-10 h-full bg-black/40 text-[10px] text-slate-700 mono py-6 flex flex-col items-center select-none">
                {lineNumbers}
              </div>
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full h-full bg-transparent pl-12 pr-6 py-6 mono text-[13px] text-indigo-100 outline-none resize-none leading-[1.4rem] selection:bg-indigo-500/30"
                spellCheck={false}
              />
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                  <Play className="w-3 h-3" /> Run Tests
                </button>
              </div>
              <button 
                onClick={submitSolution}
                disabled={status === AppStatus.JUDGING}
                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2"
              >
                {status === AppStatus.JUDGING ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                SUBMIT FOR JUDGING
              </button>
            </div>
          </section>

          {/* Pane 3: Assistant & Results */}
          <section className="w-[420px] border-l border-white/5 flex flex-col bg-black/20">
            {status === AppStatus.RESULT_READY && result ? (
               <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Sensei Evaluation</h3>
                       <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase">
                          Score: {result.score}
                       </div>
                     </div>
                     <p className="text-sm text-slate-200 italic leading-relaxed">"{result.feedback}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Complexity</p>
                      <p className="text-xs text-white mono">{result.timeComplexity}</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Memory</p>
                      <p className="text-xs text-white mono">{result.spaceComplexity}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="h-px bg-white/5 flex-1"></div>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Insights</span>
                       <div className="h-px bg-white/5 flex-1"></div>
                    </div>
                    
                    {result.optimization && (
                      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                        <h5 className="text-[10px] font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Professional Optimization
                        </h5>
                        <p className="text-xs text-cyan-200 leading-relaxed">{result.optimization}</p>
                      </div>
                    )}
                    
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Deep Logic Breakdown</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>

                  <button onClick={returnToAssistant} className="w-full py-3 border border-white/10 hover:bg-white/5 text-slate-400 text-xs font-bold rounded-xl transition-all uppercase tracking-widest mt-4">
                    Back to Assistant
                  </button>
               </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sensei Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-500">ONLINE</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        chat.role === 'user' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white/5 text-slate-300 border border-white/5'
                      }`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  {isAssistantLoading && (
                    <div className="flex justify-start">
                       <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                         <div className="flex gap-1">
                           <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                           <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                           <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                         </div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5">
                  <div className="relative">
                    <input 
                      type="text"
                      value={chatMessage}
                      onChange={handleChatMessageChange}
                      onKeyDown={handleChatKeyDown}
                      placeholder="Ask for a logic hint..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <button 
                      onClick={handleAssistantAsk}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default App;
