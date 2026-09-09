import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Send, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Bot
} from 'lucide-react';
import api from '../services/api';

export default function MentorPage() {
  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('doc_dq_manual');
  const [messages, setMessages] = useState([
    {
      sender: 'mentor',
      text: "Hello Officer Sharma. I am your MoSPI Official Statistics RAG Mentor. I answer questions strictly from the official uploaded materials (e.g., Data_Quality_Manual.pdf, Page 27). What concept would you like to review?",
      isGrounded: true,
      citations: [
        {
          documentTitle: 'Data_Quality_Manual.pdf',
          pageNumber: 27,
          sectionHeading: 'Section 4.2 Missing Value Treatment',
          chunkExcerpt: 'Mandatory hot-deck donor matching within stratum.'
        }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    async function loadMaterials() {
      try {
        const docs = await api.getMentorMaterials();
        if (docs && docs.length > 0) {
          setMaterials(docs);
        }
      } catch (e) {
        console.error('Failed to load mentor materials:', e);
      }
    }
    loadMaterials();
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userQ = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const res = await api.askMentor(userQ, selectedDoc);
      setMessages(prev => [
        ...prev,
        {
          sender: 'mentor',
          text: res.answer,
          isGrounded: res.isGrounded,
          citations: res.citations || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'mentor',
          text: "An error occurred while querying the grounded knowledge base.",
          isGrounded: false,
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What is the mandatory procedure for missing price quotes?",
    "Why is cold-deck imputation discouraged during inflation?",
    "What are the IQR boundary rules for price validation?",
    "How to bake a chocolate cake?" // Out of scope test query
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-sky-400">
              MoSPI Scoped RAG AI Mentor
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Grounded Official Statistics AI Mentor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Answers strictly from authorized statistical manuals with exact page citations. Refuses out-of-scope queries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Hallucination Guardrail Active</span>
          </span>
        </div>
      </div>

      {/* Scope Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Active Learning Material Scope:</span>
          <span className="font-bold text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Data_Quality_Manual.pdf (Page 1-60)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <span>Retriever:</span>
          <span className="font-semibold text-emerald-400">Deterministic Keyword / Chunk Matcher</span>
        </div>
      </div>

      {/* Chat Transcript Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 min-h-[420px] max-h-[550px] overflow-y-auto flex flex-col">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {m.sender === 'user' ? 'You (Officer Sharma)' : 'MoSPI AI Mentor'}
              </span>
            </div>

            <div 
              className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-3 ${
                m.sender === 'user' 
                  ? 'bg-sky-600 text-white rounded-br-none shadow-md shadow-sky-600/20' 
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Citations Box for Mentor responses */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <span className="font-bold text-sky-400 block uppercase tracking-wider text-[10px]">
                    Verified Source Citation
                  </span>
                  {m.citations.map((cite, cIdx) => (
                    <div key={cIdx} className="p-2 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between text-slate-300 font-semibold">
                        <span>Document: <strong className="text-white">{cite.documentTitle}</strong></span>
                        <span className="text-sky-400 font-mono">Page {cite.pageNumber}</span>
                      </div>
                      <span className="text-slate-400 block text-[10px]">Section: {cite.sectionHeading}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Out of scope notice */}
              {!m.isGrounded && m.sender === 'mentor' && (
                <div className="pt-1.5 text-[10px] text-amber-400 flex items-center space-x-1 font-semibold">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Strict Guardrail: Mentor refuses non-curriculum queries.</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-sky-400 animate-pulse p-3 bg-slate-950/40 rounded-xl border border-slate-800 w-fit">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Retrieving verified chunks from Data_Quality_Manual.pdf (Page 27)...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Try Sample Inquiries (Including Out-of-Scope Test):
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setQuery(p)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white text-xs transition text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about Missing Value Treatment or Data Quality Manual (Page 27)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-sky-600/20 disabled:opacity-40"
        >
          <span>Ask Mentor</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
