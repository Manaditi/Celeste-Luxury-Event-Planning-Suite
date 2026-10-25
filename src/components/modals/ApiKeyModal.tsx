import React, { useState, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import { ApiKeyStorage, checkServerHealth } from '../../services/api';
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen } = useEventContext();

  const [apiKey, setApiKey] = useState('');
  const [serverStatus, setServerStatus] = useState<{ status: string; hasApiKey: boolean }>({
    status: 'checking',
    hasApiKey: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      setApiKey(ApiKeyStorage.get());
      runHealthCheck();
    }
  }, [isApiKeyModalOpen]);

  if (!isApiKeyModalOpen) return null;

  const runHealthCheck = async () => {
    setIsChecking(true);
    const health = await checkServerHealth();
    setServerStatus(health);
    setIsChecking(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    ApiKeyStorage.set(apiKey);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      runHealthCheck();
    }, 1000);
  };

  const handleClear = () => {
    ApiKeyStorage.clear();
    setApiKey('');
    runHealthCheck();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#B4863A]/40 w-full max-w-md rounded-sm shadow-luxury-lg p-6 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#B4863A]" />
            <h3 className="font-serif text-lg font-semibold text-charcoal-900">
              GenAI Engine Configuration
            </h3>
          </div>
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="text-charcoal-400 hover:text-charcoal-700 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Server Proxy Status Card */}
        <div className="mt-4 p-3.5 bg-[#FAF8F5] border border-stone-200/80 rounded flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-4 h-4 text-[#B4863A]" />
            <div>
              <div className="font-semibold text-charcoal-900">Server Proxy (/api/events/*)</div>
              <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">
                Model: <span className="text-[#946A29]">gemini-3.8-flash</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {serverStatus.status === 'healthy' ? (
              <span className="flex items-center space-x-1 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Online</span>
              </span>
            ) : serverStatus.status === 'checking' ? (
              <span className="text-charcoal-400 text-[11px]">Connecting...</span>
            ) : (
              <span className="text-stone-500 text-[11px]">Standalone Mode</span>
            )}
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
              Custom Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none"
            />
            <p className="text-[10px] text-charcoal-400 font-light mt-1">
              If left blank, Céleste uses the server environment key or high-fidelity offline synthesis.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-charcoal-500 hover:text-charcoal-800 underline"
            >
              Clear Key
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-charcoal-600 hover:text-charcoal-900"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-charcoal-900 hover:bg-[#2A2421] text-white text-xs font-medium uppercase tracking-wider rounded"
              >
                {saveSuccess ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
