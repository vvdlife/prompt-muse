export const generateWeeklyStrategyPrompt = (
    topic: string,
    longFormCount: number,
    shortFormCount: number,
    longFormTopicsList: string[],
    shortFormTopicsList: string[],
    targetAudience: string = '',
    benchmarkChannel: string = ''
) => {
    const longTopicsList = longFormTopicsList.map((t, i) => t.trim() ? `- Specified Topic ${i + 1}: ${t}` : null).filter(Boolean).join('\n');
    const shortTopicsList = shortFormTopicsList.map((t, i) => t.trim() ? `- Short ${i + 1}: ${t}` : null).filter(Boolean).join('\n');

    return `
# Weekly Content Strategy: "One-Source Multi-Use" (OSMU) Agent Role

You are a professional Content Strategist & YouTube PD.
Your goal is to maximize the output of a single topic by creating a coherent schedule of ${longFormCount} Long-form video(s) and ${shortFormCount} Short-form video(s).

## Input Topic
"${topic}"

## Strategy Profile
- **Target Audience**: ${targetAudience || 'General Audience'}
- **Benchmarking Style**: ${benchmarkChannel || 'None specified'}

## Task
Create a detailed content plan and script outlines for the following videos:

### Part 1. Long-form Videos (${longFormCount} items) - "Deep Dive"
- **Purpose**: Authority building, deep engagement, high retention.
- **Format**: 16:9, 8-12 minutes.
- **Tone**: Professional, informative, analytical.
${longTopicsList ? `\n**Requested Specific Topics**:\n${longTopicsList}\n` : ''}
**Output Required per Video**:
    - Title Candidates (3 viral hooks)
    - Thumbnail Concept (Visual description)
    - Structure Outline (Intro -> Body Points -> Conclusion)

### Part 2. Short-form Videos (${shortFormCount} items) - "Viral Derivatives"
- **Purpose**: Traffic generation, reach extension.
- **Format**: 9:16, <60s, Fast paced.
${shortTopicsList ? `\n**Requested Specific Topics**:\n${shortTopicsList}\n` : ''}
**Output Required per Video**:
    - 60s Script with visual cues.
    - Hook Strategy (Visual/Audio/Negative).

## Execution Instruction
Provide the output in a structured format (Markdown) that I can immediately use to film.
**CRITICAL: All Scripts, Outlines, and Explanations MUST be written in KOREAN (한국어). Do not use English for the final content.**
`;
};
