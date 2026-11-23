import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Search,
  CheckCircle,
  MapPin,
  Cpu,
  Layers,
  ArrowRight,
  Loader2,
  Bot,
} from 'lucide-react';
import { AIDiscoveryResult, EquipmentRecommendation } from '../types/index.js';
import { api } from '../api/client.js';

interface AIProjectAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipmentForBooking: (equipmentId: string) => void;
  userDepartment?: string;
}

interface SamplePromptChip {
  id: string;
  icon: React.ElementType;
  label: string;
  query: string;
  category: string;
}

const SAMPLE_PROMPT_CHIPS: SamplePromptChip[] = [
  {
    id: 'drone-vision',
    icon: Sparkles,
    label: 'Deploy a real-time vision model on a drone',
    query: 'I need to train a vision model and deploy it on a drone before Friday',
    category: 'Edge AI / Jetson',
  },
  {
    id: 'pcb-signals',
    icon: Cpu,
    label: 'Debug I2C/SPI signals on a custom PCB',
    query: 'Debug high-frequency I2C and SPI digital signals on a custom PCB',
    category: 'Signals / Oscilloscope',
  },
  {
    id: '3d-mount',
    icon: Layers,
    label: 'Rapid-prototype a 3D printed robot mount',
    query: 'Rapid-prototype a high-strength 3D printed carbon-fiber robot motor mount',
    category: '3D Prototyping',
  },
  {
    id: 'llm-compute',
    icon: Bot,
    label: 'Fine-tune 70B parameter medical LLM on clinical EHRs',
    query: 'Fine-tuning 70B parameter medical LLM on clinical trial EHRs with high VRAM workstation',
    category: 'High-VRAM Compute',
  },
];

export const AIProjectAssistantModal: React.FC<AIProjectAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipmentForBooking,
  userDepartment,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (queryText?: string) => {
    const queryToUse = (queryText || prompt).trim();
    if (!queryToUse) return;

    if (queryText) setPrompt(queryText);
    setLoading(true);
    setError(null);

    try {
      const res = await api.discoverEquipment(queryToUse, userDepartment);
      setResult(res);
    } catch (err) {
      setError((err as Error).message || 'Failed to query AI advisor');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (eqId: string) => {
    onClose();
    onSelectEquipmentForBooking(eqId);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 id="ai-assistant-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>GenAI Project Assistant</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                  Intelligent Matching
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Describe your project requirements in plain English to get ranked campus equipment recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-4">
          <label htmlFor="ai-prompt-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Describe what you want to build or measure
          </label>
          <div className="relative">
            <textarea
              id="ai-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I need to train a vision model and deploy it on a drone before Friday..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pb-12 sm:pb-2.5 sm:pr-36 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-2.5 right-2.5 px-3 py-1.5 min-h-[36px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Equipment</span>
                </>
              )}
            </button>
          </div>

          {/* 1-Click Sample Prompt Chips */}
          <div className="mt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              1-Click Project Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PROMPT_CHIPS.map((chip) => {
                const ChipIcon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    onClick={() => handleSubmit(chip.query)}
                    disabled={loading}
                    className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all group flex items-start space-x-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 min-h-[44px]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                      <ChipIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          {chip.category}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors mt-0.5 leading-snug break-words">
                        {chip.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  AI Recommendations ({result.recommendations.length} matched)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Engine:{' '}
                <strong className={result.source === 'gemini' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}>
                  {result.source === 'gemini' ? (result.modelUsed || 'Gemini 2.5 Flash') : 'Deterministic Scheduler'}
                </strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {result.analysisSummary}
            </p>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                          {rec.matchScore}% Match
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rec.department}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rec.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {rec.equipmentName}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.labRoom}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                        {rec.matchReason}
                      </p>

                      {/* Highlighted Specs */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {rec.highlightedSpecs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 font-mono"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
                        💡 {rec.suggestedUsage}
                      </p>
                    </div>

                    {/* Book button */}
                    <div className="flex sm:flex-col items-stretch sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleBook(rec.equipmentId)}
                        className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all whitespace-nowrap"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
