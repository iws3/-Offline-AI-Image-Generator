"use client"

import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Image as ImageIcon, Trash2, Download, Sliders, Gem } from 'lucide-react';

// Define the API URL
const API_URL = 'http://localhost:8000';

// Define a type for the settings state
interface GenerationSettings {
  steps: number;
  guidance: number;
  width: number;
  height: number;
}

// Define a type for the gallery image object
interface GalleryImage {
  filename: string;
  url: string;
}

export default function ImageStudio() {
  // State with TypeScript types
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    steps: 30,
    guidance: 7.5,
    width: 512,
    height: 512
  });
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');

  useEffect(() => {
    fetchGallery();
  }, []);

  // Simulate loading progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          const increment = prev < 50 ? 3 : prev < 80 ? 1.5 : 0.5;
          return Math.min(prev + increment, 95);
        });
      }, 200);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/gallery`);
      const data = await res.json();
      setGallery(data.images || []);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setGeneratedImage(null);
    setLoadingProgress(0);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidance,
          width: settings.width,
          height: settings.height
        })
      });

      const data = await res.json();
      if (data.success) {
        setLoadingProgress(100);
        setTimeout(() => {
          setGeneratedImage(`${API_URL}${data.image_url}`);
          fetchGallery();
        }, 300);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      alert('Failed to generate image. Make sure the backend is running.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const deleteImage = async (filename: string) => {
    try {
      await fetch(`${API_URL}/delete/${filename}`, { method: 'DELETE' });
      fetchGallery();
      if (generatedImage && generatedImage.includes(filename)) {
        setGeneratedImage(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">GIXIO</h1>
                <p className="text-xs text-slate-500">Professional image generation</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Create
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Gallery
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'generate' ? (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Describe your vision
                </label>
                <textarea
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset with golden light..."
                  className="w-full h-36 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none text-slate-800 placeholder-slate-400 bg-white"
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      generateImage();
                    }
                  }}
                />
                <p className="text-xs text-slate-400 mt-2">Press Ctrl+Enter to generate</p>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2"
              >
                <Sliders className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} advanced options
              </button>

              {showAdvanced && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Exclude from image
                    </label>
                    <input
                      value={negativePrompt}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-sm bg-white"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700">Quality</label>
                        <span className="text-sm text-indigo-600 font-medium">{settings.steps} steps</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={settings.steps}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, steps: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700">Creativity</label>
                        <span className="text-sm text-indigo-600 font-medium">{settings.guidance}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={settings.guidance}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, guidance: parseFloat(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-700 text-white py-4 cursor-pointer rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating your image...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </span>
                )}
              </button>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white">
                <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border-2 border-slate-200/50">
                  {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                       <div className="w-full max-w-md space-y-6">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200" />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={2 * Math.PI * 56}
                              strokeDashoffset={(2 * Math.PI * 56) * (1 - loadingProgress / 100)}
                              className="text-indigo-500 transition-all duration-300 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-indigo-600">{Math.round(loadingProgress)}%</div>
                              <div className="text-xs text-slate-500 mt-1">Generating</div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
                              style={{ width: `${loadingProgress}%` }}
                            />
                          </div>
                          <p className="text-center text-sm text-slate-600 mt-4 font-medium">Creating your masterpiece...</p>
                        </div>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={generatedImage}
                        alt="Generated artwork"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        {/* FIX 1: Added opening <a> tag here */}
                        <a
                          href={generatedImage}
                          download
                          className="p-3 bg-white rounded-xl shadow-xl hover:bg-slate-50 transition-colors"
                        >
                          <Download className="w-5 h-5 text-slate-700" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <p className="text-slate-600 font-medium">Your creation will appear here</p>
                        <p className="text-slate-400 text-sm mt-1">Start by describing what you want to see</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Collection</h2>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((img) => (
                  <div
                    key={img.filename}
                    className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-200/50 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={`${API_URL}${img.url}`}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => {
                          setGeneratedImage(`${API_URL}${img.url}`);
                          setActiveTab('generate');
                        }}
                        className="flex-1 p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      {/* FIX 2: Added opening <a> tag here */}
                      <a
                        href={`${API_URL}${img.url}`}
                        download
                        className="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-700" />
                      </a>
                      <button
                        onClick={() => deleteImage(img.filename)}
                        className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <ImageIcon className="w-12 h-12 text-indigo-400" />
                </div>
                <p className="text-slate-600 font-medium text-lg">No creations yet</p>
                <p className="text-slate-400 mt-2">Generate your first image to get started</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Start Creating
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}