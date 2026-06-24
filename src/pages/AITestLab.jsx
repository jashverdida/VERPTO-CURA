import React, { useState, useRef, useEffect } from 'react';
import {
  BeakerIcon,
  PaperAirplaneIcon,
  BoltIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

// ─── Model & Prompt ───────────────────────────────────────────────────────────

const GPT_MODEL = 'gpt-5-mini';

const SYSTEM_PROMPT = `You are CURA's emergency escalation AI for multi-agency incident coordination in the Philippines.
Analyze inter-agency chat logs to detect escalation risk. Output compact JSON under 2KB.
Fields: risk_level (LOW|MEDIUM|HIGH|CRITICAL), probability (0-1), triggers[], recommended_actions[] (max 3), auto_dispatch (bool), affected_agencies[].
Classify CRITICAL if: fire breach + structure at risk + residential proximity. HIGH if: multiple injuries or spreading hazmat.`;

// ─── Severity display config ──────────────────────────────────────────────────

const SEVERITY = {
  LOW: {
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
    text: 'text-emerald-400', badge: 'bg-emerald-500', pulse: false,
  },
  MEDIUM: {
    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30',
    text: 'text-yellow-400', badge: 'bg-yellow-500', pulse: false,
  },
  HIGH: {
    bg: 'bg-orange-500/10', border: 'border-orange-500/30',
    text: 'text-orange-400', badge: 'bg-orange-500', pulse: false,
  },
  CRITICAL: {
    bg: 'bg-red-500/10', border: 'border-red-600/40',
    text: 'text-red-400', badge: 'bg-red-600', pulse: true,
  },
};

// ─── Pre-loaded VECO fire scenario ────────────────────────────────────────────

const FIRE_SCENARIO = [
  { id: 1, role: 'station',  sender: 'VECO Substation B', text: 'Command, transformer fire at Unit 3. Currently contained. Requesting guidance.', time: '09:31' },
  { id: 2, role: 'command',  sender: 'Command Center',    text: 'Copy. What is your current manpower and suppression status?', time: '09:32' },
  { id: 3, role: 'station',  sender: 'VECO Substation B', text: '4 personnel on-site. Active suppression engaged. Fire is stable for now.', time: '09:33' },
  { id: 4, role: 'command',  sender: 'Command Center',    text: 'BFP Lahug on standby. Maintain comms every 5 minutes. Over.', time: '09:34' },
  { id: 5, role: 'station',  sender: 'VECO Substation B', text: 'Update: Fire has breached secondary containment at Unit 3-B. Suppression team pulling back. Requesting IMMEDIATE backup.', time: '09:41' },
  { id: 6, role: 'station',  sender: 'VECO Substation B', text: 'HIGH RISK. Residential area within 50 meters. 2 personnel with minor burns. Fire is spreading to Unit 4. We need backup NOW.', time: '09:44' },
];

// ─── OpenAI API call ──────────────────────────────────────────────────────────

async function callGPT(messages) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set in your .env file. Restart the dev server after adding it.');

  const compressed = messages
    .slice(-8)
    .map(m => `[${m.time}] ${m.sender}: ${m.text.slice(0, 120)}`)
    .join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GPT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Analyze this incident comms log:\n\n${compressed}` },
      ],
      max_completion_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
  return JSON.parse(data.choices[0].message.content);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AITestLab() {
  const [messages,    setMessages]    = useState([]);
  const [inputText,   setInputText]   = useState('');
  const [senderRole,  setSenderRole]  = useState('station');
  const [senderName,  setSenderName]  = useState('VECO Substation B');
  const [analysis,    setAnalysis]    = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error,       setError]       = useState(null);
  const [callCount,   setCallCount]   = useState(0);

  const messagesEndRef = useRef(null);
  const analyzeTimer   = useRef(null);
  const hasKey         = !!import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function scheduleAnalysis(msgs) {
    if (msgs.length === 0) return;
    clearTimeout(analyzeTimer.current);
    analyzeTimer.current = setTimeout(async () => {
      setIsAnalyzing(true);
      setError(null);
      try {
        const result = await callGPT(msgs);
        setAnalysis(result);
        setCallCount(n => n + 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);
  }

  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;
    const msg = {
      id:     Date.now(),
      role:   senderRole,
      sender: senderName || (senderRole === 'command' ? 'Command Center' : 'Station'),
      text,
      time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => {
      const next = [...prev, msg];
      scheduleAnalysis(next);
      return next;
    });
    setInputText('');
  }

  function loadFireScenario() {
    setMessages(FIRE_SCENARIO);
    setAnalysis(null);
    setError(null);
    scheduleAnalysis(FIRE_SCENARIO);
  }

  function clearAll() {
    clearTimeout(analyzeTimer.current);
    setMessages([]);
    setAnalysis(null);
    setError(null);
    setCallCount(0);
  }

  const severity = analysis?.risk_level ? (SEVERITY[analysis.risk_level] ?? SEVERITY.LOW) : null;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center">
            <BeakerIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white">AI Escalation Test Lab</h1>
              <span className="px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full text-xs font-black text-yellow-400 tracking-widest">
                DEV TOOL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Type messages and watch GPT-5-mini analyze escalation severity in real time
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {callCount > 0 && (
            <span className="text-xs text-slate-600 font-mono tabular-nums">
              {callCount} API call{callCount !== 1 ? 's' : ''}
            </span>
          )}
          {!hasKey && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400">VITE_OPENAI_API_KEY not set</span>
            </div>
          )}
          {hasKey && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-400">API key loaded</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT: Chat Thread ──────────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col border-r border-slate-800 min-h-0">

          {/* Toolbar */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Incident Comms Thread
              {messages.length > 0 && (
                <span className="ml-2 text-slate-700 normal-case tracking-normal font-normal">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </span>
              )}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadFireScenario}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <BoltIcon className="w-3.5 h-3.5" />
                <span>Load Fire Scenario</span>
              </button>
              <button
                onClick={clearAll}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                  <BeakerIcon className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-500 font-semibold text-sm">No messages yet</p>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Type a message below or click <span className="text-amber-500">Load Fire Scenario</span> to see a real escalation example
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isCommand = msg.role === 'command';
              return (
                <div key={msg.id} className={`flex ${isCommand ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-xs ${isCommand ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${
                      isCommand ? 'bg-emerald-700' : 'bg-slate-700'
                    }`}>
                      {isCommand
                        ? <BuildingOfficeIcon className="w-3.5 h-3.5 text-white/80" />
                        : <UserCircleIcon className="w-3.5 h-3.5 text-white/80" />
                      }
                    </div>
                    <div>
                      <p className={`text-xs text-slate-600 mb-1 ${isCommand ? 'text-right' : ''}`}>
                        {msg.sender}
                      </p>
                      <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isCommand
                          ? 'bg-emerald-700 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-xs text-slate-700 mt-1 font-mono ${isCommand ? 'text-right' : ''}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-slate-800 bg-slate-900 space-y-3">
            {/* Sender toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold flex-shrink-0">Sending as:</span>
              <button
                onClick={() => { setSenderRole('station'); setSenderName('VECO Substation B'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  senderRole === 'station'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Station
              </button>
              <button
                onClick={() => { setSenderRole('command'); setSenderName('Command Center'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  senderRole === 'command'
                    ? 'bg-emerald-700 border-emerald-600 text-white'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                Command Center
              </button>
            </div>

            {/* Text area + send */}
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/50 transition-colors">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="Type a message..."
                  rows={2}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  inputText.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-700">
              Enter to send · Shift+Enter for new line · AI analysis runs after each message
            </p>
          </div>
        </div>

        {/* ── RIGHT: AI Analysis Panel ────────────────────────────────────── */}
        <div className="w-1/2 flex flex-col bg-slate-950 min-h-0">

          {/* Panel header */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BoltIcon className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                GPT-5-mini Live Analysis
              </span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center space-x-1.5">
                <ArrowPathIcon className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                <span className="text-xs text-slate-400">Analyzing...</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">

            {/* Missing key warning */}
            {!hasKey && (
              <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300 mb-1">API Key Not Configured</p>
                    <p className="text-xs text-red-400/80 leading-relaxed">
                      Add{' '}
                      <code className="bg-red-900/40 px-1 py-0.5 rounded font-mono">
                        VITE_OPENAI_API_KEY=your_key
                      </code>{' '}
                      to your <code className="bg-red-900/40 px-1 py-0.5 rounded font-mono">.env</code> file, then restart the dev server with <code className="bg-red-900/40 px-1 py-0.5 rounded font-mono">npm run dev</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API error */}
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300 mb-1">API Error</p>
                    <p className="text-xs text-red-400/80 font-mono break-all leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!analysis && !isAnalyzing && !error && (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-800/60 rounded-xl flex items-center justify-center mb-3">
                  <BoltIcon className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-500 font-semibold text-sm">Waiting for messages</p>
                <p className="text-slate-600 text-xs mt-1">
                  Analysis appears here automatically after each message
                </p>
              </div>
            )}

            {/* Skeleton while loading first result */}
            {isAnalyzing && !analysis && (
              <div className="space-y-3 animate-pulse">
                <div className="h-28 bg-slate-800/60 rounded-xl" />
                <div className="h-16 bg-slate-800/40 rounded-xl" />
                <div className="h-20 bg-slate-800/40 rounded-xl" />
              </div>
            )}

            {/* ── Analysis results ── */}
            {analysis && severity && (
              <>
                {/* Risk level + probability */}
                <div className={`p-4 rounded-xl border ${severity.bg} ${severity.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-black text-white ${severity.badge} ${severity.pulse ? 'animate-pulse' : ''}`}>
                      {analysis.risk_level}
                    </span>
                  </div>

                  {/* Probability bar */}
                  <div className="mb-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Escalation Probability</span>
                      <span className={`text-sm font-black tabular-nums ${severity.text}`}>
                        {Math.round((analysis.probability ?? 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${severity.badge}`}
                        style={{ width: `${Math.round((analysis.probability ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Auto-dispatch line */}
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-800/50">
                    {analysis.auto_dispatch
                      ? <CheckCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                      : <InformationCircleIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    }
                    <span className={`text-xs font-bold ${analysis.auto_dispatch ? 'text-red-400' : 'text-slate-500'}`}>
                      {analysis.auto_dispatch ? 'AUTO-DISPATCH TRIGGERED' : 'No auto-dispatch required'}
                    </span>
                  </div>
                </div>

                {/* Triggers */}
                {analysis.triggers?.length > 0 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Escalation Triggers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.triggers.map((trigger, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended actions */}
                {analysis.recommended_actions?.length > 0 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Recommended Actions
                    </p>
                    <div className="space-y-2.5">
                      {analysis.recommended_actions.map((action, i) => (
                        <div key={i} className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 bg-slate-800 border border-slate-700 rounded-full text-xs font-black text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-300 leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affected agencies */}
                {analysis.affected_agencies?.length > 0 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Affected Agencies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.affected_agencies.map((agency, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-semibold"
                        >
                          {agency}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-400 transition-colors select-none">
                    View raw JSON response
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 overflow-x-auto font-mono leading-relaxed">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
