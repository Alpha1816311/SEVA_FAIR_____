/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Download, 
  Globe, 
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Vercel Deployment
                </span>
                <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 100% Free & Ready to Ship
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Deploy SevaFair to Vercel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Readiness Checklist Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-emerald-900 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Everything is Pre-Configured for Vercel
          </div>
          <p className="leading-relaxed text-emerald-800">
            This project includes <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">.npmrc</code> and <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">vercel.json</code> configured to prevent peer dependency conflicts during build.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-white/80 px-2 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span> .npmrc legacy-peer-deps
            </div>
            <div className="bg-white/80 px-2 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span> vercel.json SPA rewrites
            </div>
            <div className="bg-white/80 px-2 py-1.5 rounded border border-emerald-200 flex items-center gap-1.5 text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span> Clean Vite 8 build
            </div>
          </div>
        </div>

        {/* Instant Fix Callout for Vercel ERESOLVE */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            Did your Vercel build show "npm error ERESOLVE"? Here is the 10-second fix:
          </div>
          <p className="text-amber-800 leading-relaxed">
            On your Vercel project dashboard, go to <strong>Settings</strong> &rarr; <strong>Build & Development Settings</strong> &rarr; enable <strong>Install Command</strong> override and set it to:
          </p>
          <div className="relative bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] flex items-center justify-between">
            <span>npm install --legacy-peer-deps</span>
            <button
              onClick={() => copyToClipboard('npm install --legacy-peer-deps', 99)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] px-2 py-0.5 rounded"
            >
              {copiedIndex === 99 ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-amber-700">
            Then go to the <strong>Deployments</strong> tab, click the three dots on the failed deployment, and click <strong>Redeploy</strong>!
          </p>
        </div>

        {/* Method 1: Connect your GitHub Repo (Recommended - 1 Click) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              Method 1: 1-Click Import on Vercel Dashboard (Fastest)
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
            <ol className="space-y-2.5 list-decimal pl-4">
              <li>
                Open the official Vercel Import page:
                <div className="mt-1.5">
                  <a 
                    href="https://vercel.com/new" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
                  >
                    <span>Open vercel.com/new</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>
              </li>
              <li>
                Sign in with your GitHub account, then find and click <strong className="text-slate-900 font-semibold">Import</strong> on your repository.
              </li>
              <li>
                Vercel automatically detects the framework:
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1 text-slate-600 mt-1">
                  <div><strong>Framework:</strong> Vite (Auto-detected)</div>
                  <div><strong>Build Command:</strong> <span className="text-emerald-600">npm run build</span></div>
                  <div><strong>Output Directory:</strong> <span className="text-emerald-600">dist</span></div>
                </div>
              </li>
              <li>
                Click <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Deploy</strong>. Your site will be live worldwide in ~30 seconds with a free <code className="font-mono text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">.vercel.app</code> domain and auto-updating HTTPS!
              </li>
            </ol>
          </div>
        </div>

        {/* Method 2: Vercel CLI (For Terminal / Command Line) */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">2</span>
            Method 2: Deploy via Vercel CLI (Single Command)
          </h3>
          <p className="text-xs text-slate-600">
            If you have the code downloaded on your computer or want to deploy directly from terminal:
          </p>

          <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
            <pre className="text-emerald-400"># Run Vercel CLI directly (no install needed):
npx vercel

# Or deploy directly to production:
npx vercel --prod</pre>
            <button
              onClick={() => copyToClipboard('npx vercel --prod', 1)}
              className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors"
            >
              {copiedIndex === 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 1 ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Vercel CLI prompts for confirmation on the first run, creates the project link, and returns your live URL immediately.
          </p>
        </div>

        {/* Method 3: Download Clean Zip Package */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">3</span>
            Download Complete Source Code Package
          </h3>
          <p className="text-xs text-slate-600">
            Download the complete, self-contained project package bundled with all source files, pre-configured with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800 text-[11px]">vercel.json</code>, Vite, and Tailwind CSS:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex-1">
              <div className="font-semibold text-slate-900 text-xs">SevaFair_latest.zip</div>
              <div className="text-[11px] text-slate-500">Includes React 19, Tailwind CSS, cooperative allocation engine, and Vercel routing rules</div>
            </div>
            <a
              href={`${currentOrigin}/SevaFair_latest.zip`}
              download="SevaFair_latest.zip"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Package
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for production hosting on Vercel, Netlify, or Cloudflare Pages</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
