import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatAnalysisResult {
  id: string;
  engineId: string;
  engineName: string;
  engineIcon: ReactNode;
  engineColor: string;
  confidence: number;
  result: 'truthful' | 'deceptive' | 'uncertain';
  analysis: string;
  responseTime: number;
  tokenCount: number;
  estimatedCost: number;
}

export interface ChatAnalysisSession {
  id: string;
  originalText: string;
  selectedEngines: string[];
  results: ChatAnalysisResult[];
  overallResult: 'truthful' | 'deceptive' | 'uncertain';
  overallConfidence: number;
  createdAt: Date;
  processingTime: number;
}

interface AnalysisContextType {
  currentSession: ChatAnalysisSession | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  startAnalysis: (text: string, selectedEngines: string[], availableEngines: any[]) => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<ChatAnalysisSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const generateAnalysis = (result: string, confidence: number, engineName: string): string => {
    const analyses = {
      truthful: [
        `${engineName} detected consistent conversational patterns suggesting truthfulness with high confidence.`,
        `Chat analysis shows no significant deceptive markers. Communication patterns indicate genuine dialogue.`,
        `${engineName} found the conversational structure demonstrates authenticity and directness typical of truthful chat responses.`,
        `Analysis reveals coherent messaging patterns and linguistic consistency indicating honest communication.`,
        `${engineName} identified authentic conversational flow with no contradictory elements detected.`
      ],
      deceptive: [
        `${engineName} identified multiple deceptive conversational patterns and inconsistencies in the chat message.`,
        `Chat analysis reveals evasive language structures and stress indicators commonly associated with deceptive communication.`,
        `${engineName} detected contradictory elements and unusual phrasing patterns that suggest potential dishonesty in conversation.`,
        `Analysis shows linguistic markers typical of deceptive communication including hedging and deflection.`,
        `${engineName} found inconsistent messaging patterns and potential misdirection tactics in the conversation.`
      ],
      uncertain: [
        `${engineName} found mixed conversational signals that require additional context for definitive assessment.`,
        `Chat analysis shows some inconsistencies but insufficient evidence for conclusive determination.`,
        `${engineName} suggests the conversation contains ambiguous elements that could benefit from further investigation.`,
        `Analysis reveals conflicting indicators requiring more comprehensive evaluation for accurate assessment.`,
        `${engineName} detected neutral patterns with both truthful and potentially deceptive elements present.`
      ]
    };

    // Special handling for Grok AI
    if (engineName === 'Grok AI') {
      const grokAnalyses = {
        truthful: [
          `Grok AI's real-time chat analysis indicates authentic communication patterns with conversational context validation.`,
          `Real-time conversational assessment shows consistent truthful markers throughout the chat interaction.`,
          `Grok AI found the chat flow and contextual alignment suggest genuine, unfiltered conversational communication.`,
          `Live analysis confirms authentic dialogue patterns with no deceptive conversational tactics detected.`,
          `Grok AI's contextual evaluation shows genuine communication style consistent with truthful interaction.`
        ],
        deceptive: [
          `Grok AI's real-time chat analysis detected conversational inconsistencies and potential misdirection tactics.`,
          `Conversational pattern analysis reveals evasive chat structures commonly used to obscure truth in dialogue.`,
          `Grok AI identified contextual misalignments and linguistic markers suggesting deliberate deception in conversation.`,
          `Real-time evaluation shows manipulative conversational patterns and strategic information withholding.`,
          `Grok AI detected conversational red flags including deflection and inconsistent narrative elements.`
        ],
        uncertain: [
          `Grok AI's conversational analysis shows mixed authenticity signals requiring deeper contextual chat evaluation.`,
          `Real-time chat assessment indicates ambiguous conversational patterns that need additional verification.`,
          `Grok AI suggests the chat contains conversational elements that could benefit from real-time fact-checking.`,
          `Live analysis reveals neutral conversational indicators with conflicting authenticity signals.`,
          `Grok AI found conversational ambiguity that requires additional context for definitive truth assessment.`
        ]
      };
      return grokAnalyses[result as keyof typeof grokAnalyses][Math.floor(Math.random() * 5)];
    }
    
    return analyses[result as keyof typeof analyses][Math.floor(Math.random() * 5)];
  };

  const calculateCost = (engineId: string, tokenCount: number): number => {
    const pricing: Record<string, number> = {
      gpt4: 0.03,
      claude: 0.015,
      grok: 0.02,
      gemini: 0.001,
      gpt35: 0.002,
      palm: 0.01,
    };
    
    return (tokenCount / 1000) * (pricing[engineId] || 0.01);
  };

  const determineOverallResult = (results: ChatAnalysisResult[]): { result: 'truthful' | 'deceptive' | 'uncertain', confidence: number } => {
    if (results.length === 0) return { result: 'uncertain', confidence: 0 };

    const truthfulCount = results.filter(r => r.result === 'truthful').length;
    const deceptiveCount = results.filter(r => r.result === 'deceptive').length;
    const uncertainCount = results.filter(r => r.result === 'uncertain').length;

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    // Determine overall result based on majority
    if (truthfulCount > deceptiveCount && truthfulCount > uncertainCount) {
      return { result: 'truthful', confidence: Math.round(avgConfidence) };
    } else if (deceptiveCount > truthfulCount && deceptiveCount > uncertainCount) {
      return { result: 'deceptive', confidence: Math.round(avgConfidence) };
    } else {
      return { result: 'uncertain', confidence: Math.round(avgConfidence) };
    }
  };

  const startAnalysis = async (text: string, selectedEngineIds: string[], availableEngines: any[]): Promise<void> => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      const sessionId = Date.now().toString();
      const startTime = Date.now();
      const results: ChatAnalysisResult[] = [];

      // Filter to get selected engines data
      const selectedEngines = availableEngines.filter(engine => selectedEngineIds.includes(engine.id));

      // Process each selected engine
      for (const engine of selectedEngines) {
        const engineStartTime = Date.now();
        
        // Simulate API call with realistic delay
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
        
        const engineEndTime = Date.now();
        const responseTime = engineEndTime - engineStartTime;
        
        // Generate realistic analysis results
        const confidence = Math.random() * 35 + 65; // 65-100%
        let resultType: 'truthful' | 'deceptive' | 'uncertain';
        
        // Add some logic based on text characteristics
        const textLength = text.length;
        const hasQuestionMarks = (text.match(/\?/g) || []).length;
        const hasExclamations = (text.match(/!/g) || []).length;
        const hasNegations = /\b(not|never|no|don't|won't|can't|shouldn't)\b/gi.test(text);
        
        // Influence result based on text characteristics
        let confidenceModifier = 0;
        if (textLength < 50) confidenceModifier -= 5; // Short texts are harder to analyze
        if (hasQuestionMarks > 2) confidenceModifier -= 3; // Many questions might indicate evasion
        if (hasExclamations > 1) confidenceModifier += 2; // Emphasis might indicate truth
        if (hasNegations) confidenceModifier -= 2; // Negations can indicate deception
        
        const finalConfidence = Math.max(60, Math.min(95, confidence + confidenceModifier));
        
        if (finalConfidence > 85) {
          resultType = Math.random() > 0.3 ? 'truthful' : 'deceptive';
        } else if (finalConfidence < 70) {
          resultType = Math.random() > 0.4 ? 'deceptive' : 'uncertain';
        } else {
          resultType = Math.random() > 0.5 ? 'uncertain' : (Math.random() > 0.5 ? 'truthful' : 'deceptive');
        }
        
        const tokenCount = Math.floor(text.length / 3.5); // Rough token estimation
        const estimatedCost = calculateCost(engine.id, tokenCount);
        
        results.push({
          id: `${sessionId}-${engine.id}`,
          engineId: engine.id,
          engineName: engine.name,
          engineIcon: engine.icon,
          engineColor: engine.color,
          confidence: Math.round(finalConfidence),
          result: resultType,
          analysis: generateAnalysis(resultType, finalConfidence, engine.name),
          responseTime,
          tokenCount,
          estimatedCost,
        });
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      const overall = determineOverallResult(results);

      const session: ChatAnalysisSession = {
        id: sessionId,
        originalText: text,
        selectedEngines: selectedEngineIds,
        results,
        overallResult: overall.result,
        overallConfidence: overall.confidence,
        createdAt: new Date(),
        processingTime,
      };

      setCurrentSession(session);
      
    } catch (error) {
      setAnalysisError('Failed to analyze chat message. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
    setAnalysisError(null);
  };

  const clearError = () => {
    setAnalysisError(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentSession,
        isAnalyzing,
        analysisError,
        startAnalysis,
        clearSession,
        clearError,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}