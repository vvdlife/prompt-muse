import type { ReferenceData } from '../core';

export const generateStoryboardPrompt = (
  platform: 'chatgpt' | 'gemini',
  model: string, // v2.6 Model Specificity
  topic: string,
  genre: string,
  duration: string,
  structure: string = 'viral_hook', // v2.5 Narrative Architect
  hookStrategy: string = '',       // v2.5 Narrative Architect
  customInstruction: string = '',  // v2.7 User Override
  refData: ReferenceData | null = null,
  _language: 'ko' | 'en' = 'ko'
): string => {
  // v2.5 EXPERT PD MODE: NARRATIVE ARCHITECT
  const role = 'You are a legendary YouTube Content Strategist & Screenwriter (Retention Specialist).';

  let structureGuide = '';
  switch (structure) {
    case 'viral_hook':
      structureGuide = `
**Frame**: "The Viral Hook" (Focus: High CTR & Retention)
1. **0:00-0:05 [The Hook]**: Immediate visual/audio shock or question. No "Hello" intro.
2. **0:05-0:30 [The Promise]**: What will they get? Why stick around?
3. **Body**: 3 Fast-paced points.
4. **Twist/Payoff**: Provide value but challenge expectations.
5. **CTA**: Quick exit.`;
      break;
    case 'storytelling':
      structureGuide = `
**Frame**: "The Story Arc" (Focus: Immersion & Empathy)
1. **Inciting Incident**: The normal world is disrupted.
2. **Rising Action**: Struggles and conflicts.
3. **Climax**: The peak interaction/realization.
4. **Resolution**: The new normal.`;
      break;
    case 'educational':
      structureGuide = `
**Frame**: "Problem-Agitation-Solution" (Focus: Authority & Value)
1. **Problem**: Identify a specific pain point.
2. **Agitation**: Make them feel the pain (Emotional connection).
3. **Solution**: Your unique insight/method.
4. **Proof**: Why it works.`;
      break;
    default:
      structureGuide = `Standard YouTube Structure (Intro -> Body -> Conclusion)`;
  }

  let hookGuide = '';
  if (hookStrategy) {
    hookGuide = `\n**CRITICAL STRATEGY - OPENING HOOK**: Use the "${hookStrategy}" technique.
        - If "Negative Hook": Start with a warning or mistake ("Stop doing this...").
        - If "Visual Spectacle": Start with the most impressive shot, no talking.
        - If "Curiosity Gap": Show the result first, then ask "How?";`;
  }

  let context = `
  - **Core Topic**: ${topic}
  - **Genre/Style**: ${genre}
  - **Target Duration**: ${duration}
  - **Narrative Structure**: ${structure}
  ${hookGuide}
  `;

  // v4.0 URL Reference Injection
  if (refData && refData.url) {
    context += `
  - **Reference Benchmark**:
    - Title: ${refData.title}
    - Key Insight: ${refData.description}
    `;
  }

  const task = `
    Design a masterclass-level video script and storyboard.
    Your goal is to ensure the viewer does NOT click away in the first 30 seconds (Retention).
    Follow the **[${structure}]** framework strictly.
    
    ${customInstruction ? `**USER SPECIAL REQUEST (PRIORITY):** ${customInstruction}` : ''}
    `;

  const constraints = `
    1. **Language Requirement**: Output MUST be in **KOREAN (한국어)**.
    2. **Format**: Markdown Table.
    3. **Columns**: [Timecode] | [Visual Scene (Camera/Action)] | [Audio/Script (Korean)] | [Screen Text/Overlay] | [Retention Note]
    4. **Retention Note Column**: Explain WHY this scene keeps them watching (e.g., "Open Loop", "Pattern Interrupt").
    5. **Visuals**: Be extremely specific (e.g., "Slow zoom in on eyes," "Split screen with data").
    6. **Pacing**: Fast cuts for "Viral Hook", emotional pauses for "Storytelling".
    `;

  return `
# ${platform === 'gemini' ? 'Gemini' : 'ChatGPT'} - Narrative Architect Mode
**Target Model**: ${model}
${role}

## Mission
${task}

## Blueprint (Context & Strategy)
${structureGuide}
${context}

## Execution Rules
${constraints}

## Output Format
Master Table (Korean)
`;
};
