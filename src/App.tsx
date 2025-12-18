import { useState } from 'react';
import { Header } from './components/Header';
import { StoryboardMode } from './components/tabs/StoryboardMode';
import { AssetMode } from './components/tabs/AssetMode';
import { BatchMode } from './components/tabs/BatchMode';
import { ChevronRight, ChevronLeft, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useProjectSession, type ProjectData } from './hooks/useProjectSession';

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
    <div className="container">
      <Header />

      {/* Session Controls (Top Right) */}
      <div className="session-controls">
        <button
          onClick={clearSession}
          className="btn-control btn-control-reset"
          title="초기화 (Reset)"
        >
          <RefreshCw size={14} /> 초기화
        </button>
        <button
          onClick={exportSession}
          className="btn-control btn-control-export"
          title="프로젝트 내보내기 (Export)"
        >
          <Download size={14} /> 프로젝트 저장
        </button>
      </div>

      {/* Auto-Save Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.8rem', color: '#666', height: '1.2em' }}>
        {lastSaved ? `✅ 자동 저장됨: ${lastSaved.toLocaleTimeString()} ` : '...'}
      </div>

      {/* Step Progress Bar */}
      <div className="step-indicator-container">
        {/* Connector Line */}
        <div className="step-line-bg" />

        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {isCompleted ? <CheckCircle2 size={24} /> : step.id}
              </div>
              <span className="step-label">
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
              fixedAssetType="default"
              initialContext={projectData.script || projectData.topic}
            />
          </div>
        )}

        {/* Step 4: Packaging (Thumbnail/Art) */}
        {currentStep === 4 && (
          <div className="fade-in">
            <div className="flex-center mb-lg">
              <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', textAlign: 'center', borderColor: 'var(--color-accent)' }}>
                <h3 className="text-accent mb-sm">🎨 썸네일 & 채널 아트</h3>
                <p className="text-muted">마지막 포장은 클릭률(CTR)과 브랜딩의 핵심입니다.</p>
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
      <div className="nav-footer">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="nav-btn nav-btn-prev"
        >
          <ChevronLeft size={20} /> 이전
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === 4}
          className="nav-btn nav-btn-next"
        >
          {currentStep === 4 ? '완료' : '다음'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default App;
