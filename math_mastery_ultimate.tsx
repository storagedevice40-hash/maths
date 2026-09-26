import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Target, Award, RotateCcw, CheckCircle2, XCircle, 
  ChevronRight, Sparkles, Zap, Brain, Flame, Home, ArrowLeft, 
  TrendingUp, Play, RefreshCw, Check, Clock, Trophy, BarChart3,
  HelpCircle, Volume2, VolumeX, ShieldAlert, CheckSquare, Infinity,
  Layers, Star, Activity, Sparkle, Award as AwardIcon, Grid, Bookmark
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'study', 'practice', 'quiz', 'results'
  const [studySubTab, setStudySubTab] = useState('tables'); // 'tables', 'squares', 'cubes'
  
  // Practice configuration state
  const [practiceType, setPracticeType] = useState('table'); // 'table', 'square', 'cube', 'mixed'
  const [selectedTargetNumber, setSelectedTargetNumber] = useState('all'); // 'all' or '2' through '30'
  const [questionCount, setQuestionCount] = useState('20'); // '20', '50', '100', 'unlimited'
  const [timeLimit, setTimeLimit] = useState('none'); // 'none', '5', '10', '15' seconds
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Quiz active state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizHistory, setQuizHistory] = useState([]);
  const [wrongQueue, setWrongQueue] = useState([]); // Questions answered incorrectly for mandatory repetition
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [sessionTotalAnswered, setSessionTotalAnswered] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLimit !== 'none' && !isAnswerSubmitted) {
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer(prev => prev - 1);
          setTotalTimeSpent(t => t + 1);
        }, 1000);
      } else {
        handleTimeOut();
      }
    } else {
      if (activeTab === 'quiz' && !isAnswerSubmitted) {
        interval = setInterval(() => {
          setTotalTimeSpent(t => t + 1);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [timer, timerActive, isAnswerSubmitted, timeLimit, activeTab]);

  const handleTimeOut = () => {
    if (isAnswerSubmitted) return;
    const currentQ = quizQuestions[currentIndex];
    setIsCorrect(false);
    setSelectedOption(null);
    setIsAnswerSubmitted(true);
    setTimerActive(false);
    setStreak(0);
    setWrongQueue(prev => [...prev, { ...currentQ, attempts: currentQ.attempts + 1 }]);
    setQuizHistory(prev => [
      ...prev,
      {
        ...currentQ,
        userAnswer: 'Timed Out',
        isCorrect: false
      }
    ]);
  };

  const generateStudyData = () => {
    const numbers = Array.from({ length: 29 }, (_, i) => i + 2); // 2 to 30
    return numbers.map(num => ({
      number: num,
      square: num * num,
      cube: num * num * num,
      table: Array.from({ length: 10 }, (_, i) => ({
        multiplier: i + 1,
        product: num * (i + 1)
      }))
    }));
  };

  const studyData = generateStudyData();

  const generateMCQOptions = (correctAnswer, type, num1) => {
    const options = new Set([correctAnswer]);
    
    while (options.size < 4) {
      let offset;
      if (type === 'table') {
        const offsets = [-num1, num1, -10, 10, -2, 2, -num1*2, num1*2];
        offset = offsets[Math.floor(Math.random() * offsets.length)];
      } else if (type === 'square') {
        offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1) * 4;
      } else {
        offset = (Math.floor(Math.random() * 12) + 1) * (Math.random() > 0.5 ? 1 : -1) * 20;
      }

      let fakeAnswer = correctAnswer + offset;
      if (fakeAnswer > 0 && fakeAnswer !== correctAnswer) {
        options.add(fakeAnswer);
      } else {
        options.add(correctAnswer + Math.floor(Math.random() * 25) + 1);
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const createSingleQuestion = () => {
    let type = practiceType;
    if (practiceType === 'mixed') {
      const types = ['table', 'square', 'cube'];
      type = types[Math.floor(Math.random() * types.length)];
    }

    let num1, num2, correctAnswer, questionText, hint;

    if (type === 'table') {
      num1 = selectedTargetNumber === 'all' 
        ? Math.floor(Math.random() * 29) + 2 
        : parseInt(selectedTargetNumber);
      num2 = Math.floor(Math.random() * 10) + 1;
      correctAnswer = num1 * num2;
      questionText = `${num1} × ${num2} = ?`;
      hint = `Table of ${num1}`;
    } else if (type === 'square') {
      num1 = selectedTargetNumber === 'all' 
        ? Math.floor(Math.random() * 29) + 2 
        : parseInt(selectedTargetNumber);
      correctAnswer = num1 * num1;
      questionText = `${num1}² = ?`;
      hint = `${num1} multiplied by itself`;
    } else if (type === 'cube') {
      num1 = selectedTargetNumber === 'all' 
        ? Math.floor(Math.random() * 29) + 2 
        : parseInt(selectedTargetNumber);
      correctAnswer = num1 * num1 * num1;
      questionText = `${num1}³ = ?`;
      hint = `${num1} multiplied three times`;
    }

    const options = generateMCQOptions(correctAnswer, type, num1);

    return {
      id: `q_${Math.random()}_${Date.now()}`,
      type,
      num1,
      num2: num2 || null,
      correctAnswer,
      questionText,
      hint,
      options,
      attempts: 0
    };
  };

  const startPractice = () => {
    let generated = [];
    const count = questionCount === 'unlimited' ? 20 : parseInt(questionCount);

    for (let i = 0; i < count; i++) {
      generated.push(createSingleQuestion());
    }

    setQuizQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setQuizHistory([]);
    setWrongQueue([]);
    setIsAnswerSubmitted(false);
    setSessionTotalAnswered(0);
    setShowCelebration(false);
    if (timeLimit !== 'none') {
      setTimer(parseInt(timeLimit));
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
    setTotalTimeSpent(0);
    setActiveTab('quiz');
  };

  const handleOptionSelect = (option) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);

    const currentQ = quizQuestions[currentIndex];
    const correct = option === currentQ.correctAnswer;

    setIsCorrect(correct);
    setTimerActive(false);

    let newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);

    if (correct) {
      setScore(prev => prev + 1);
      setSessionTotalAnswered(prev => prev + 1);
      setQuizHistory(prev => [...prev, { ...currentQ, userAnswer: option, isCorrect: true }]);

      // Lightning fast auto-advance on correct answers (180ms)
      setTimeout(() => {
        proceedToNextQuestion(true);
      }, 180);
    } else {
      setIsAnswerSubmitted(true);
      setWrongQueue(prev => [...prev, { ...currentQ, attempts: currentQ.attempts + 1 }]);
      setSessionTotalAnswered(prev => prev + 1);
      setQuizHistory(prev => [...prev, { ...currentQ, userAnswer: option, isCorrect: false }]);
    }
  };

  const proceedToNextQuestion = (wasAutoAdvanced = false) => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (timeLimit !== 'none') {
      setTimer(parseInt(timeLimit));
      setTimerActive(true);
    }

    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else if (wrongQueue.length > 0) {
      // Re-prompt wrong questions
      const retryBatch = [...wrongQueue];
      setQuizQuestions(retryBatch);
      setWrongQueue([]);
      setCurrentIndex(0);
    } else {
      if (questionCount === 'unlimited') {
        const nextBatch = [createSingleQuestion(), createSingleQuestion(), createSingleQuestion(), createSingleQuestion(), createSingleQuestion()];
        setQuizQuestions(nextBatch);
        setCurrentIndex(0);
      } else {
        setShowCelebration(true);
        setActiveTab('results');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden pb-24 sm:pb-0">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Navigation (Desktop & Tablet) */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
          <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-2 sm:p-2.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center text-white group-hover:scale-105 transition transform">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
              MathMaster<span className="text-indigo-500">.</span>Ultimate
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Tables, Squares & Cubes Up To 30</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('study')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${activeTab === 'study' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Zone</span>
          </button>
          <button 
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${activeTab === 'practice' || activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Zap className="w-4 h-4" />
            <span>MCQ Practice</span>
          </button>
        </nav>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-8 z-10">
        
        {/* ================= HOME VIEW ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/50 border border-indigo-500/30 p-6 sm:p-12 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] sm:text-xs font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider mb-4 sm:mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mobile Optimized • Lightning MCQ Engine</span>
                </span>
                <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Conquer Tables, Squares & Cubes Up To <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">30</span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-base mt-3 sm:mt-4 leading-relaxed">
                  Train with lightning-fast multiple-choice questions. Correct answers auto-advance instantly. Incorrect answers are queued for guaranteed mastery.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button 
                    onClick={() => setActiveTab('practice')}
                    className="w-full sm:w-auto px-6 py-3.5 sm:px-7 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2.5 transform active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Start MCQ Challenge</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('study')}
                    className="w-full sm:w-auto px-6 py-3.5 sm:px-7 sm:py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center space-x-2.5 backdrop-blur-md active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Browse Study Zone</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div 
                onClick={() => { setStudySubTab('tables'); setActiveTab('study'); }}
                className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-7 transition duration-300 cursor-pointer shadow-xl backdrop-blur-md"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl sm:text-2xl mb-4 sm:mb-5 group-hover:scale-110 transition shadow-inner">
                  #
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition">Tables (2 to 30)</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Complete multiplication tables up to 30 with dedicated speed drills and instant MCQ testing.
                </p>
                <div className="mt-4 sm:mt-5 flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                  <span>Explore Tables</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                </div>
              </div>

              <div 
                onClick={() => { setStudySubTab('squares'); setActiveTab('study'); }}
                className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/50 rounded-3xl p-6 sm:p-7 transition duration-300 cursor-pointer shadow-xl backdrop-blur-md"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-lg sm:text-xl mb-4 sm:mb-5 group-hover:scale-110 transition shadow-inner">
                  x²
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition">Squares (1 to 30)</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  Master squaring numbers instantly in vertical sequence to save crucial seconds in mental math.
                </p>
                <div className="mt-4 sm:mt-5 flex items-center space-x-2 text-purple-400 text-xs font-semibold">
                  <span>Explore Squares</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                </div>
              </div>

              <div 
                onClick={() => { setStudySubTab('cubes'); setActiveTab('study'); }}
                className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-7 transition duration-300 cursor-pointer shadow-xl backdrop-blur-md"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg sm:text-xl mb-4 sm:mb-5 group-hover:scale-110 transition shadow-inner">
                  x³
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition">Cubes (1 to 30)</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                  High-yield cubic values up to 30 in clean vertical lists with randomized speed challenges.
                </p>
                <div className="mt-4 sm:mt-5 flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                  <span>Explore Cubes</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STUDY VIEW ================= */}
        {activeTab === 'study' && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            {/* Sub-navigation tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 sm:p-5 rounded-3xl border border-slate-800/80 backdrop-blur-md shadow-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">Study Section (Up to 30)</h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Vertical reference lists and direct MCQ launcher.</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
                <button
                  onClick={() => setStudySubTab('tables')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition ${studySubTab === 'tables' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Tables
                </button>
                <button
                  onClick={() => setStudySubTab('squares')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition ${studySubTab === 'squares' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Squares
                </button>
                <button
                  onClick={() => setStudySubTab('cubes')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition ${studySubTab === 'cubes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Cubes
                </button>
              </div>
            </div>

            {/* TABLES STUDY VIEW */}
            {studySubTab === 'tables' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {studyData.map(item => (
                  <div key={item.number} className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 hover:border-indigo-500/50 transition shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                      <span className="text-sm sm:text-base font-black text-indigo-400">Table of {item.number}</span>
                      <button 
                        onClick={() => {
                          setPracticeType('table');
                          setSelectedTargetNumber(item.number.toString());
                          setQuestionCount('20');
                          startPractice();
                        }}
                        className="text-[11px] sm:text-xs bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 border border-indigo-500/30"
                      >
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <span>Practice MCQ</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {item.table.map(t => (
                        <div key={t.multiplier} className="flex justify-between items-center text-xs sm:text-sm px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 transition border border-slate-900">
                          <span className="text-slate-400 font-medium">{item.number} × {t.multiplier}</span>
                          <span className="font-bold text-white font-mono">= {t.product}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SQUARES STUDY VIEW (VERTICALLY ARRANGED AS REQUESTED) */}
            {studySubTab === 'squares' && (
              <div className="max-w-2xl mx-auto bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Squares Reference (1 to 30)</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Vertical lookup for square numbers.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setPracticeType('square');
                      setSelectedTargetNumber('all');
                      setQuestionCount('20');
                      startPractice();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Practice Squares MCQ</span>
                  </button>
                </div>
                {/* Vertical Column List */}
                <div className="flex flex-col space-y-2.5">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                    <div key={num} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 transition">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-black flex items-center justify-center text-xs">{num}</span>
                        <span className="text-sm font-semibold text-slate-300 font-mono">{num}²</span>
                      </div>
                      <span className="text-base font-black text-white font-mono">{num * num}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUBES STUDY VIEW (VERTICALLY ARRANGED AS REQUESTED) */}
            {studySubTab === 'cubes' && (
              <div className="max-w-2xl mx-auto bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Cubes Reference (1 to 30)</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Vertical lookup for cubic numbers.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setPracticeType('cube');
                      setSelectedTargetNumber('all');
                      setQuestionCount('20');
                      startPractice();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Practice Cubes MCQ</span>
                  </button>
                </div>
                {/* Vertical Column List */}
                <div className="flex flex-col space-y-2.5">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                    <div key={num} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-xs">{num}</span>
                        <span className="text-sm font-semibold text-slate-300 font-mono">{num}³</span>
                      </div>
                      <span className="text-base font-black text-white font-mono">{num * num * num}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PRACTICE CONFIG VIEW ================= */}
        {activeTab === 'practice' && (
          <div className="max-w-xl mx-auto bg-slate-900/95 border border-slate-800/80 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Zap className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">MCQ Practice Configurator</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Instant auto-advance on correct answers. Wrong answers require reading the correct answer and tapping Next.</p>
            </div>

            <div className="space-y-5">
              {/* Practice Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Select Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'table', label: 'Tables', icon: '#' },
                    { id: 'square', label: 'Squares', icon: 'x²' },
                    { id: 'cube', label: 'Cubes', icon: 'x³' },
                    { id: 'mixed', label: 'Mixed', icon: '⚡' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setPracticeType(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${practiceType === item.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
                    >
                      <span className="text-base font-black mb-1.5 text-indigo-400">{item.icon}</span>
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Target Number</label>
                <select
                  value={selectedTargetNumber}
                  onChange={(e) => setSelectedTargetNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-3 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 transition shadow-inner"
                >
                  <option value="all">All Numbers (2 to 30 Random)</option>
                  {Array.from({ length: 29 }, (_, i) => i + 2).map(num => (
                    <option key={num} value={num}>
                      {practiceType === 'table' ? `Table of ${num}` : practiceType === 'square' ? `Square of ${num} (${num}²)` : practiceType === 'cube' ? `Cube of ${num} (${num}³)` : `Number ${num}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Count & Unlimited Option */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: '20', label: '20 Qs' },
                    { id: '50', label: '50 Qs' },
                    { id: '100', label: '100 Qs' },
                    { id: 'unlimited', label: '♾️ Infinite' }
                  ].map(cnt => (
                    <button
                      key={cnt.id}
                      onClick={() => setQuestionCount(cnt.id)}
                      className={`py-3 rounded-2xl border text-[11px] font-bold transition ${questionCount === cnt.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
                    >
                      {cnt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Option */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Timer Per Question</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: 'none', label: 'Untimed' },
                    { id: '5', label: '5s' },
                    { id: '10', label: '10s' },
                    { id: '15', label: '15s' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTimeLimit(t.id)}
                      className={`py-3 rounded-2xl border text-[11px] font-bold transition ${timeLimit === t.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startPractice}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2.5 mt-4 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Lightning MCQ Quiz</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ACTIVE MCQ QUIZ VIEW ================= */}
        {activeTab === 'quiz' && quizQuestions.length > 0 && (
          <div className="max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
            {/* Top Stats Bar */}
            <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-slate-800 text-[11px] sm:text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                  {questionCount === 'unlimited' ? `#${sessionTotalAnswered + 1}` : `${currentIndex + 1}/${quizQuestions.length}`}
                </span>
                {wrongQueue.length > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center space-x-1 animate-pulse border border-amber-500/20">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{wrongQueue.length} repeating</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{streak}</span>
                </span>
                {timeLimit !== 'none' && (
                  <span className={`px-3 py-1 rounded-xl font-mono font-bold border ${timer <= 3 ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    ⏱️ {timer}s
                  </span>
                )}
              </div>
            </div>

            {/* Question Display Card */}
            <div className="text-center py-6 sm:py-8 bg-slate-950/60 rounded-3xl border border-slate-800/80 shadow-inner mb-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20">
                {quizQuestions[currentIndex].type.toUpperCase()} • {quizQuestions[currentIndex].hint}
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight font-mono">
                {quizQuestions[currentIndex].questionText}
              </h2>
            </div>

            {/* MCQ Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizQuestions[currentIndex].options.map((option, idx) => {
                let btnStyle = "bg-slate-950/80 border-slate-800 text-white hover:border-indigo-500 hover:bg-slate-900 shadow-md";
                
                if (isAnswerSubmitted) {
                  if (option === quizQuestions[currentIndex].correctAnswer) {
                    btnStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-500/40";
                  } else if (option === selectedOption) {
                    btnStyle = "bg-rose-950/90 border-rose-500 text-rose-300 shadow-xl shadow-rose-500/25";
                  } else {
                    btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-40";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-xl sm:text-2xl font-black transition flex items-center justify-between active:scale-95 ${btnStyle}`}
                  >
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Opt {String.fromCharCode(65 + idx)}</span>
                    <span className="font-mono">{option}</span>
                    <span className="w-4"></span>
                  </button>
                );
              })}
            </div>

            {/* Error Feedback & Next Button (Only shown when user makes a mistake) */}
            {isAnswerSubmitted && (
              <div className="mt-6 p-5 rounded-3xl bg-rose-950/40 border border-rose-500/40 flex flex-col items-center space-y-4 animate-fade-in backdrop-blur-md">
                <div className="flex items-center space-x-2.5 text-rose-300 text-center">
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">Incorrect! Correct answer is <span className="text-emerald-400 font-black text-lg underline ml-1 font-mono">{quizQuestions[currentIndex].correctAnswer}</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => proceedToNextQuestion(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= RESULTS VIEW ================= */}
        {activeTab === 'results' && (
          <div className="max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center backdrop-blur-xl animate-fade-in space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-2xl border border-amber-500/30 animate-bounce">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Session Completed!</h2>
              <p className="text-xs text-slate-400 mt-1">Fantastic job pushing your calculation speed.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
                <span className="text-[11px] text-slate-400 block font-medium">Score</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 block font-mono">{score}/{quizHistory.length}</span>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
                <span className="text-[11px] text-slate-400 block font-medium">Streak</span>
                <span className="text-xl sm:text-2xl font-black text-orange-400 mt-1 block font-mono">🔥 {maxStreak}</span>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
                <span className="text-[11px] text-slate-400 block font-medium">Time</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block font-mono">⏱️ {totalTimeSpent}s</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                onClick={() => setActiveTab('practice')}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
              <button
                onClick={() => setActiveTab('study')}
                className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center space-x-2 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Study Reference</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-6 py-3 flex items-center justify-around shadow-2xl">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('study')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'study' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Study</span>
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center space-y-1 transition ${activeTab === 'practice' || activeTab === 'quiz' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold">Practice</span>
        </button>
      </div>

    </div>
  );
}