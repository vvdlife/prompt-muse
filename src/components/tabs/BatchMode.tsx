import React, { useState } from 'react';
import { Copy, Check, Sparkles, Settings2 } from 'lucide-react';
import { generateWeeklyStrategyPrompt } from '../../generators/prompts/batch';
import '../../App.css';

// v2.6 Pipeline Integration
interface BatchModeProps {
    initialTopic?: string;
    onTopicChange?: (topic: string) => void;
}

export const BatchMode: React.FC<BatchModeProps> = ({ initialTopic = '', onTopicChange }) => {
    const [topic, setTopic] = useState(initialTopic);

    // v14.0 Fine-grained Batch Controls
    const [longFormCount, setLongFormCount] = useState(1);
    const [shortFormCount, setShortFormCount] = useState(3);
    const [longFormTopics, setLongFormTopics] = useState('');
    const [shortFormTopicsList, setShortFormTopicsList] = useState<string[]>(Array(3).fill(''));
    const [showConfig, setShowConfig] = useState(false);

    // Resize topics list when count changes
    React.useEffect(() => {
        setShortFormTopicsList(prev => {
            const currentLength = prev.length;
            if (currentLength === shortFormCount) return prev;
            if (currentLength < shortFormCount) {
                return [...prev, ...Array(shortFormCount - currentLength).fill('')];
            } else {
                return prev.slice(0, shortFormCount);
            }
        });
    }, [shortFormCount]);

    // Sync local topic with parent
    const handleTopicChange = (val: string) => {
        setTopic(val);
        if (onTopicChange) onTopicChange(val);
    };
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        const prompt = generateWeeklyStrategyPrompt(
            topic,
            longFormCount,
            shortFormCount,
            longFormTopics,
            shortFormTopicsList
        );
        setResult(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
            <h3 className="text-gradient flex-row mb-md" style={{ fontSize: '1.5rem' }}>
                <Sparkles color="var(--color-secondary)" /> 주간 기획 매니저 (Weekly Batch)
            </h3>
            <p className="text-muted mb-lg">
                하나의 주제로 <strong>롱폼 {longFormCount}개 + 쇼츠 {shortFormCount}개</strong>의 기획안을 한 번에 생성합니다. (OSMU 전략)
            </p>

            <div className="flex-col gap-md">
                <div>
                    <label className="label-text">이번 주 메인 주제 (Main Topic)</label>
                    <input
                        className="input-primary text-lg"
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        placeholder="예: 아이폰 16 언박싱 및 리뷰"
                    />
                </div>

                {/* Configuration Toggle */}
                <div className="panel-sub p-0 overflow-hidden">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex-between w-full p-4 text-muted hover:bg-white/5 transition-colors"
                        style={{ background: 'transparent', border: 'none' }}
                    >
                        <span className="flex-row gap-xs"><Settings2 size={16} /> 상세 설정 (수량 및 개별 주제)</span>
                        <span className="text-xs">{showConfig ? '접기' : '펼치기'}</span>
                    </button>

                    {showConfig && (
                        <div className="p-6 bg-black/20 flex-col gap-md">
                            {/* Long Form Config */}
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label-text text-xs">롱폼 개수</label>
                                    <input
                                        className="input-primary"
                                        type="number" min="0" max="10"
                                        value={longFormCount}
                                        onChange={(e) => setLongFormCount(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="label-text text-xs">롱폼 지정 주제 (줄바꿈으로 구분, 선택사항)</label>
                                    <textarea
                                        className="textarea-primary"
                                        value={longFormTopics}
                                        onChange={(e) => setLongFormTopics(e.target.value)}
                                        placeholder="예: 아이폰 16 카메라 테스트&#13;&#10;아이폰 16 vs 15 비교"
                                        style={{ height: '60px', minHeight: '60px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #333' }} />

                            {/* Short Form Config */}
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label-text text-xs">쇼츠 개수</label>
                                    <input
                                        className="input-primary"
                                        type="number" min="0" max="20"
                                        value={shortFormCount}
                                        onChange={(e) => setShortFormCount(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="label-text text-xs">쇼츠 개별 주제 ({shortFormCount}개)</label>
                                    <div className="flex-col gap-xs" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {shortFormTopicsList.map((t, i) => (
                                            <input
                                                key={i}
                                                className="input-primary text-sm"
                                                type="text"
                                                value={t}
                                                onChange={(e) => {
                                                    const newList = [...shortFormTopicsList];
                                                    newList[i] = e.target.value;
                                                    setShortFormTopicsList(newList);
                                                }}
                                                placeholder={`쇼츠 #${i + 1} 주제 입력...`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!topic}
                    className="btn-accent text-lg mt-xs"
                    style={{
                        opacity: topic ? 1 : 0.5,
                        cursor: topic ? 'pointer' : 'not-allowed'
                    }}
                >
                    🚀 주간 콘텐츠 기획안 생성 ({longFormCount} Long + {shortFormCount} Shorts)
                </button>

                {result && (
                    <div className="mt-lg fade-in">
                        <div className="flex-between mb-sm text-muted">
                            <span>생성된 기획 프롬프트 (ChatGPT/Gemini에 붙여넣기)</span>
                            <button onClick={handleCopy} className="btn-icon" style={{ color: copied ? 'var(--color-primary)' : 'white' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨!' : '복사하기'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={result}
                            className="textarea-primary"
                            style={{
                                height: '400px',
                                background: 'rgba(0,0,0,0.3)',
                                fontFamily: 'monospace',
                                lineHeight: '1.5'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
