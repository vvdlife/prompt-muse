import { useState } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { generateAllPrompts, PromptResult } from './generators';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<PromptResult[]>([]);

  const handleGenerate = async (concept: string, style: string) => {
    setIsGenerating(true);

    // Simulate API delay for better UX ("Wow" factor)
    setTimeout(() => {
      const generated = generateAllPrompts(concept, style);
      setResults(generated);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Header />
      <main>
        <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />

        {results.length > 0 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <PromptOutput results={results} />
          </div>
        )}
      </main>

      {/* Footer / Credits */}
      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--color-border)', fontSize: '0.8rem' }}>
        <p>PromptMuse v1.0 • Powered by Advanced Prompt Engineering</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
