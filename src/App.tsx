import { useState } from 'react';
import { Header } from './components/Header';
import { StoryboardMode } from './components/tabs/StoryboardMode';
import { AssetMode } from './components/tabs/AssetMode';
import { BatchMode } from './components/tabs/BatchMode';
import { Terminal, Video, Image as ImageIcon, Sparkles, Layers, LayoutTemplate } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [activeTab, setActiveTab] = useState<'chatgpt' | 'gemini' | 'midjourney' | 'thumbnail' | 'veo3' | 'batch'>('chatgpt');

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Header />

      <main>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {[
            { id: 'chatgpt', label: 'ChatGPT (콘티)', icon: <Terminal size={18} /> },
            { id: 'gemini', label: 'Gemini (콘티)', icon: <Sparkles size={18} /> },
            { id: 'thumbnail', label: 'Thumbnail (썸네일)', icon: <LayoutTemplate size={18} /> }, // v13.0 New Tab
            { id: 'midjourney', label: 'Midjourney (Art)', icon: <ImageIcon size={18} /> },
            { id: 'veo3', label: 'Veo3 (영상)', icon: <Video size={18} /> },
            { id: 'batch', label: 'Weekly Batch (기획)', icon: <Layers size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                activeTab === tab.id ? 'active-tab' : ''
              )}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '1rem',
                borderRadius: '12px',
                border: activeTab === tab.id
                  ? (tab.id === 'thumbnail' ? '1px solid var(--color-accent)' : tab.id === 'midjourney' ? '1px solid var(--color-primary)' : tab.id === 'veo3' ? '1px solid var(--color-secondary)' : '1px solid #fff')
                  : '1px solid rgba(255,255,255,0.05)',
                backgroundColor: activeTab === tab.id
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.3)',
                color: activeTab === tab.id ? 'white' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {activeTab === 'chatgpt' && <StoryboardMode platform="chatgpt" />}
          {activeTab === 'gemini' && <StoryboardMode platform="gemini" />}
          {activeTab === 'thumbnail' && <AssetMode platform="midjourney" fixedAssetType="thumbnail" />} {/* v13.0 Dedicated Thumbnail Tab */}
          {activeTab === 'midjourney' && <AssetMode platform="midjourney" fixedAssetType="default" />} {/* v13.0 Art Only */}
          {activeTab === 'veo3' && <AssetMode platform="veo3" />}
          {activeTab === 'batch' && <BatchMode />}
        </div>

      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--color-border)', fontSize: '0.8rem' }}>
        <p>PromptMuse v2.0 • Purpose-Driven Prompt Engineering</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
