```
import { useState } from 'react';
import { Header } from './components/Header';
import { StoryboardMode } from './components/tabs/StoryboardMode';
import { AssetMode } from './components/tabs/AssetMode';
import { BatchMode } from './components/tabs/BatchMode';
import { Terminal, Video, Image as ImageIcon, Sparkles, Layers, LayoutTemplate, ChevronRight, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

import { useProjectSession } from './hooks/useProjectSession';
import { Download, RefreshCw, Save } from 'lucide-react';

// Global Project Data Interface
export interface ProjectData {
  topic: string;
  genre: string;
  duration: string;
  script: string;
  mood: string;
}

function App() {
  // Step State: 1=Planning, 2=Script, 3=Video, 4=Packaging
  const [currentStep, setCurrentStep] = useState(1);

  // v3.0 Global Project State with Auto-Save
  const { projectData, setProjectData, clearSession, exportSession, lastSaved } = useProjectSession({
    topic: '',
    genre: '',
    duration: '',
    script: '',
    mood: ''
  });

  const steps = [
    { id: 1, title: '기획 센터 (Planning)', desc: '아이디어 & 주제 선정', component: BatchMode },
    { id: 2, title: '대본 연구소 (Script)', desc: '구성 & 훅 설계', component: StoryboardMode },
    { id: 3, title: '촬영 모니터 (Video)', desc: 'B-Roll & 소스 생성', component: AssetMode },
    { id: 4, title: '패키징 (Packaging)', desc: '썸네일 & 채널 아트', component: AssetMode }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const updateProjectData = (key: keyof ProjectData, value: string) => {
    setProjectData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <Header />

      {/* Session Controls (Top Right) */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 50 }}>
        <button
          onClick={clearSession}
          style={{ padding: '0.5rem', background: '#333', border: '1px solid #555', color: '#aaa', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
          title="초기화 (Reset)"
        >
          <RefreshCw size={14} /> 초기화
        </button>
        <button
          onClick={exportSession}
          style={{ padding: '0.5rem 1rem', background: '#222', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold' }}
          title="프로젝트 내보내기 (Export)"
        >
          <Download size={14} /> 프로젝트 저장 (.json)
        </button>
      </div>

      {/* Auto-Save Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.8rem', color: '#666', height: '1.2em' }}>
        {lastSaved ? `✅ 자동 저장됨: ${ lastSaved.toLocaleTimeString() } ` : '...'}
      </div>

      {/* Step Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', maxWidth: '800px', margin: '0 auto 3rem' }}>
        {/* Connector Line */}
        <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: '#333', zIndex: 0 }} />

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: isActive ? 'var(--color-primary)' : isCompleted ? '#444' : '#222',
                border: isActive ? '4px solid rgba(0,0,0,0.5)' : '2px solid #444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive || isCompleted ? 'white' : '#666',
                marginBottom: '0.8rem',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 20px var(--color-primary)' : 'none'
              }}>
                {isCompleted ? <CheckCircle2 size={24} /> : <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{step.id}</span>}
              </div>
              <span style={{
                color: isActive ? 'white' : '#888',
                fontWeight: isActive ? 700 : 400,
                fontSize: '0.9rem'
              }}>
                {step.title.split(' (')[0]}
              </span>
            </div>
          );
        })}
      </div>

      <main style={{ minHeight: '500px' }}>
        {/* Step 1: Planning (BatchMode) */}
        {currentStep === 1 && (
          <div className="fade-in">
            <BatchMode
              // @ts-ignore: Temporary pivot
              onTopicChange={(topic: string) => updateProjectData('topic', topic)}
              initialTopic={projectData.topic}
            />
          </div>
        )}

        {/* Step 2: Script (StoryboardMode) */}
        {currentStep === 2 && (
          <div className="fade-in">
            <StoryboardMode
              // @ts-ignore: Temporary pivot
              platform="gemini"
              initialTopic={projectData.topic}
              onScriptGenerate={(script: string) => updateProjectData('script', script)}
            />
          </div>
        )}

        {/* Step 3: Video (Veo3) */}
        {currentStep === 3 && (
          <div className="fade-in">
            <AssetMode
              platform="veo3"
              // @ts-ignore: Temporary pivot
              initialContext={projectData.script || projectData.topic}
            />
          </div>
        )}

        {/* Step 4: Packaging (Thumbnail/Art) */}
        {currentStep === 4 && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1rem', width: '100%', textAlign: 'center' }}>
                <h3>🎨 썸네일 & 채널 아트</h3>
                <p style={{ color: '#888' }}>마지막 포장은 클릭률(CTR)과 브랜딩의 핵심입니다.</p>
              </div>
            </div>
            <AssetMode
              platform="midjourney"
              fixedAssetType="thumbnail"
              // @ts-ignore: Temporary pivot
              initialTopic={projectData.topic}
            />
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '1.5rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid #333', display: 'flex', justifyContent: 'center', gap: '2rem', zIndex: 100
      }}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          style={{
            opacity: currentStep === 1 ? 0.3 : 1,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.8rem 2rem', background: 'transparent', color: 'white', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} /> 이전 단계 (Prev)
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === 4}
          style={{
            background: currentStep === 4 ? '#444' : 'var(--color-primary)',
            color: 'white', border: 'none', borderRadius: '30px',
            padding: '0.8rem 3rem', fontSize: '1.1rem', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: currentStep === 4 ? 'default' : 'pointer',
            boxShadow: currentStep === 4 ? 'none' : '0 0 20px rgba(var(--color-primary-rgb), 0.4)'
          }}
        >
          {currentStep === 4 ? '완료 (Finished)' : '다음 단계 (Next)'} <ChevronRight size={20} />
        </button>
      </div>

      <style>{`
  .fade -in { animation: fadeIn 0.4s ease- out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`}</style>
    </div>
  );
}

export default App;
