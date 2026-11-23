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

const SAMPLE_PROMPTS = [
  'I need to train a vision model and deploy it on a drone before Friday',
  'Fine-tuning 70B parameter medical LLM on clinical trial EHRs',
  'High-speed carbon-fiber 3D print for racecar suspension bracket',
  'High-frequency RF signal analysis & CAN serial bus debugging',
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
    >
      <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 id="ai-assistant-title" className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <span>GenAI Project Assistant</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Intelligent Matching
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Describe your project requirements in plain English to get ranked campus equipment recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-4">
          <label htmlFor="ai-prompt-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Describe what you want to build or measure
          </label>
          <div className="relative">
            <textarea
              id="ai-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I need to train a vision model and deploy it on a drone before Friday..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-3 right-3 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Quick Suggestion Pills */}
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-slate-500 mr-2">Try examples:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(sample)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg transition-colors border border-slate-200"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  AI Recommendations ({result.recommendations.length} matched)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                Engine:{' '}
                <strong className={result.source === 'gemini' ? 'text-teal-700' : 'text-slate-800'}>
                  {result.source === 'gemini' ? (result.modelUsed || 'Gemini 2.5 Flash') : 'Deterministic Scheduler'}
                </strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {result.analysisSummary}
            </p>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800">
                          {rec.matchScore}% Match
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {rec.department}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {rec.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-teal-700 transition-colors">
                        {rec.equipmentName}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.labRoom}</span>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                        {rec.matchReason}
                      </p>

                      {/* Highlighted Specs */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {rec.highlightedSpecs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60 font-mono"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 italic">
                        💡 {rec.suggestedUsage}
                      </p>
                    </div>

                    {/* Book button */}
                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => handleBook(rec.equipmentId)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all whitespace-nowrap"
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
