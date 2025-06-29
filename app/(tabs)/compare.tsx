import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Share,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Send, Brain, Target, Zap, Shield, Clock, Copy, Download, Filter, Star, ChevronDown, ChevronUp, Share2, ChartBar as BarChart3, Sparkles, Eye, MessageSquare, Bot } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAnalysis } from '@/contexts/AnalysisContext';

interface AIResponse {
  id: string;
  modelName: string;
  modelVersion: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
  response: string;
  timestamp: Date;
  responseTime: number;
  rating?: number;
  flagged?: boolean;
  // Analysis metrics
  accuracy: number;
  depth: number;
  clarity: number;
  overallScore: number;
  biasDetection: number;
  // Search results
  searchResults: {
    query: string;
    findings: string[];
    sources: number;
    reliability: number;
  };
  // AI Engine Response
  aiResponse: {
    summary: string;
    reasoning: string;
    confidenceExplanation: string;
    keyIndicators: string[];
  };
}

interface ComparisonSession {
  id: string;
  prompt: string;
  responses: AIResponse[];
  createdAt: Date;
}

export default function CompareScreen() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState<ComparisonSession | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [expandedAIResponses, setExpandedAIResponses] = useState<Set<string>>(new Set());
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(['gpt4', 'claude', 'grok']));
  const [sortBy, setSortBy] = useState<'responseTime' | 'accuracy' | 'overallScore' | 'rating'>('overallScore');
  const [showFilters, setShowFilters] = useState(false);
  const { tier, limits } = useSubscription();
  const { currentSession: analysisSession } = useAnalysis();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load analysis session if available
  useEffect(() => {
    if (analysisSession && !currentSession) {
      const mappedSession = mapAnalysisToComparison(analysisSession);
      setCurrentSession(mappedSession);
      setPrompt(analysisSession.originalText);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [analysisSession]);

  const availableModels = [
    { 
      id: 'gpt4', 
      name: 'GPT-4 Turbo', 
      version: 'gpt-4-turbo-preview',
      icon: <Brain size={20} color="#10B981" />,
      color: '#10B981'
    },
    { 
      id: 'claude', 
      name: 'Claude 3 Opus', 
      version: 'claude-3-opus-20240229',
      icon: <Target size={20} color="#8B5CF6" />,
      color: '#8B5CF6'
    },
    { 
      id: 'grok', 
      name: 'Grok AI', 
      version: 'grok-1.5-vision-preview',
      icon: <MessageSquare size={20} color="#1DA1F2" />,
      color: '#1DA1F2'
    },
    { 
      id: 'gemini', 
      name: 'Gemini Pro', 
      version: 'gemini-pro-1.5',
      icon: <Eye size={20} color="#F59E0B" />,
      color: '#F59E0B'
    },
    { 
      id: 'gpt35', 
      name: 'GPT-3.5 Turbo', 
      version: 'gpt-3.5-turbo-0125',
      icon: <Sparkles size={20} color="#06B6D4" />,
      color: '#06B6D4'
    },
  ];

  const mapAnalysisToComparison = (session: any): ComparisonSession => {
    const responses: AIResponse[] = session.results.map((result: any) => {
      const model = availableModels.find(m => m.id === result.engineId) || availableModels[0];
      
      return {
        id: result.id,
        modelName: result.engineName,
        modelVersion: model.version,
        icon: result.engineIcon,
        color: result.engineColor,
        prompt: session.originalText,
        response: generateMockResponse(result.engineName, session.originalText),
        timestamp: session.createdAt,
        responseTime: result.responseTime,
        // Analysis metrics - rounded to whole numbers
        accuracy: Math.round(Math.min(95, result.confidence + Math.random() * 10 - 5)),
        depth: Math.round(Math.random() * 20 + 75),
        clarity: Math.round(Math.random() * 15 + 80),
        overallScore: Math.round(result.confidence),
        biasDetection: Math.round(Math.random() * 30 + 70),
        // Search results
        searchResults: generateSearchResults(session.originalText, result.engineName),
        // AI Engine Response
        aiResponse: generateAIResponse(result.result, result.confidence, result.engineName, result.analysis),
      };
    });

    return {
      id: session.id,
      prompt: session.originalText,
      responses,
      createdAt: session.createdAt,
    };
  };

  const generateSearchResults = (prompt: string, engineName: string) => {
    const queries = [
      `"${prompt.substring(0, 30)}..." fact check`,
      `verification of statement about ${prompt.split(' ').slice(0, 3).join(' ')}`,
      `truth analysis ${prompt.split(' ').slice(-3).join(' ')}`,
    ];

    const findings = [
      'Multiple sources confirm similar statements',
      'Cross-referenced with verified databases',
      'Pattern analysis shows consistency with known facts',
      'Linguistic markers align with truthful communication',
      'No contradictory evidence found in reliable sources',
    ];

    return {
      query: queries[Math.floor(Math.random() * queries.length)],
      findings: findings.slice(0, Math.floor(Math.random() * 3) + 2),
      sources: Math.floor(Math.random() * 15) + 5,
      reliability: Math.floor(Math.random() * 20) + 75,
    };
  };

  const generateAIResponse = (result: string, confidence: number, engineName: string, analysis: string) => {
    const summaries = {
      truthful: `${engineName} assessment: The chat message appears to be truthful based on linguistic analysis.`,
      deceptive: `${engineName} assessment: The chat message shows indicators of potential deception.`,
      uncertain: `${engineName} assessment: The chat message contains mixed signals requiring further analysis.`,
    };

    const reasonings = {
      truthful: `The analysis reveals consistent linguistic patterns, coherent narrative structure, and authentic conversational markers. The communication style demonstrates directness and lacks common deceptive indicators such as hedging, deflection, or contradictory statements.`,
      deceptive: `The evaluation identifies several concerning patterns including evasive language, inconsistent details, and stress indicators commonly associated with deceptive communication. The message structure shows potential manipulation tactics and information withholding.`,
      uncertain: `The assessment finds conflicting indicators that prevent a definitive conclusion. While some elements suggest authenticity, other factors raise questions that would benefit from additional context or verification methods.`,
    };

    const confidenceExplanations = {
      high: `High confidence level (${confidence}%) is based on strong consensus across multiple analytical frameworks and clear linguistic markers.`,
      medium: `Moderate confidence level (${confidence}%) reflects some ambiguity in the analysis, with mixed signals requiring careful interpretation.`,
      low: `Lower confidence level (${confidence}%) indicates significant uncertainty due to conflicting indicators and limited contextual information.`,
    };

    const keyIndicators = {
      truthful: [
        'Consistent narrative flow and logical progression',
        'Natural language patterns without forced constructions',
        'Appropriate emotional tone matching content',
        'Absence of common deceptive linguistic markers',
      ],
      deceptive: [
        'Evasive language and deflection tactics detected',
        'Inconsistencies in narrative details',
        'Stress indicators in communication patterns',
        'Potential manipulation or misdirection elements',
      ],
      uncertain: [
        'Mixed authenticity signals requiring verification',
        'Ambiguous contextual elements present',
        'Conflicting linguistic pattern indicators',
        'Additional information needed for clarity',
      ],
    };

    const confidenceLevel = confidence > 85 ? 'high' : confidence > 70 ? 'medium' : 'low';

    return {
      summary: summaries[result as keyof typeof summaries],
      reasoning: reasonings[result as keyof typeof reasonings],
      confidenceExplanation: confidenceExplanations[confidenceLevel as keyof typeof confidenceExplanations],
      keyIndicators: keyIndicators[result as keyof typeof keyIndicators],
    };
  };

  const generateResponses = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt to compare');
      return;
    }

    setIsGenerating(true);
    const sessionId = Date.now().toString();
    const responses: AIResponse[] = [];

    const modelsToUse = availableModels.filter(model => selectedModels.has(model.id));
    const limitedModels = tier === 'free' ? modelsToUse.slice(0, 2) : modelsToUse;

    for (const model of limitedModels) {
      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const mockResponse = generateMockResponse(model.name, prompt);
      
      // Generate analysis metrics - rounded to whole numbers
      const accuracy = Math.round(Math.random() * 20 + 75);
      const depth = Math.round(Math.random() * 25 + 70);
      const clarity = Math.round(Math.random() * 15 + 80);
      const overallScore = Math.round((accuracy + depth + clarity) / 3);
      const biasDetection = Math.round(Math.random() * 30 + 65);

      responses.push({
        id: `${sessionId}-${model.id}`,
        modelName: model.name,
        modelVersion: model.version,
        icon: model.icon,
        color: model.color,
        prompt,
        response: mockResponse,
        timestamp: new Date(),
        responseTime,
        accuracy,
        depth,
        clarity,
        overallScore,
        biasDetection,
        searchResults: generateSearchResults(prompt, model.name),
        aiResponse: generateAIResponse(
          overallScore > 80 ? 'truthful' : overallScore < 65 ? 'deceptive' : 'uncertain',
          overallScore,
          model.name,
          'Generated analysis'
        ),
      });
    }

    const session: ComparisonSession = {
      id: sessionId,
      prompt,
      responses,
      createdAt: new Date(),
    };

    setCurrentSession(session);
    setIsGenerating(false);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const generateMockResponse = (modelName: string, prompt: string): string => {
    const responses = {
      'GPT-4 Turbo': `Based on the chat message "${prompt}", I can provide a comprehensive analysis. This response demonstrates GPT-4's advanced reasoning capabilities and nuanced understanding of complex conversational topics. The model excels at providing detailed, contextually aware responses that consider multiple perspectives and potential implications in chat communications.`,
      'Claude 3 Opus': `Regarding the chat message "${prompt}", I'd like to offer a thoughtful perspective. Claude 3 is designed to be helpful, harmless, and honest in chat analysis responses. This particular query allows me to showcase my ability to engage with complex conversational topics while maintaining ethical considerations and providing balanced viewpoints on chat communications.`,
      'Grok AI': `For the chat message "${prompt}", I can leverage real-time conversational analysis capabilities. Grok AI combines contextual understanding with live chat processing to deliver comprehensive responses that are both informative and practical for real-world chat communication analysis.`,
      'Gemini Pro': `In response to the chat message "${prompt}", I can utilize Google's advanced multimodal AI capabilities to provide insights. Gemini Pro combines conversational understanding with powerful reasoning to deliver comprehensive chat analysis that is both informative and practical for communication assessment.`,
      'GPT-3.5 Turbo': `For the chat message "${prompt}", I can provide a solid response drawing from my training data. While not as advanced as GPT-4, I offer reliable performance for most chat analysis tasks with faster response times and consistent results, making me suitable for many practical chat communication applications.`,
    };
    
    return responses[modelName as keyof typeof responses] || 'This is a sample response from the AI model for chat analysis.';
  };

  const toggleExpanded = (responseId: string) => {
    const newExpanded = new Set(expandedResponses);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedResponses(newExpanded);
  };

  const toggleAIResponseExpanded = (responseId: string) => {
    const newExpanded = new Set(expandedAIResponses);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedAIResponses(newExpanded);
  };

  const copyResponse = async (response: AIResponse) => {
    const fullResponse = `${response.modelName} Analysis:

AI Response:
${response.aiResponse.summary}

Reasoning: ${response.aiResponse.reasoning}

Confidence: ${response.aiResponse.confidenceExplanation}

Key Indicators:
${response.aiResponse.keyIndicators.map(indicator => `• ${indicator}`).join('\n')}

Search Analysis:
Query: ${response.searchResults.query}
Findings: ${response.searchResults.findings.join(', ')}
Sources: ${response.searchResults.sources}
Reliability: ${response.searchResults.reliability}%

Detailed Response:
${response.response}

Metrics:
• Accuracy: ${response.accuracy}%
• Depth: ${response.depth}%
• Clarity: ${response.clarity}%
• Overall Score: ${response.overallScore}%
• Bias Detection: ${response.biasDetection}%
• Response Time: ${response.responseTime}ms`;

    await Clipboard.setStringAsync(fullResponse);
    Alert.alert('Copied', 'Complete analysis copied to clipboard');
  };

  const rateResponse = (responseId: string, rating: number) => {
    if (!currentSession) return;
    
    const updatedResponses = currentSession.responses.map(r => 
      r.id === responseId ? { ...r, rating } : r
    );
    
    setCurrentSession({
      ...currentSession,
      responses: updatedResponses
    });
  };

  const flagResponse = (responseId: string) => {
    if (!currentSession) return;
    
    const updatedResponses = currentSession.responses.map(r => 
      r.id === responseId ? { ...r, flagged: !r.flagged } : r
    );
    
    setCurrentSession({
      ...currentSession,
      responses: updatedResponses
    });
  };

  const shareComparison = async () => {
    if (!currentSession) return;
    
    const shareText = `AI Model Comparison - Chat Analysis\n\nPrompt: ${currentSession.prompt}\n\n${
      currentSession.responses.map(r => 
        `${r.modelName}: ${r.aiResponse.summary}\nOverall Score: ${r.overallScore}%\n`
      ).join('\n')
    }`;
    
    try {
      await Share.share({
        message: shareText,
        title: 'AI Model Comparison - Chat Analysis',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share comparison');
    }
  };

  const exportComparison = () => {
    if (!currentSession) return;
    
    if (tier === 'free') {
      Alert.alert('Premium Feature', 'Export functionality is available with Premium subscription.');
      return;
    }
    
    Alert.alert('Export', 'Comparison exported successfully');
  };

  const getSortedResponses = () => {
    if (!currentSession) return [];
    
    return [...currentSession.responses].sort((a, b) => {
      switch (sortBy) {
        case 'responseTime':
          return a.responseTime - b.responseTime;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'overallScore':
          return b.overallScore - a.overallScore;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  };

  const ModelSelector = () => (
    <View style={styles.modelSelector}>
      <Text style={styles.selectorTitle}>Select AI Models</Text>
      <View style={styles.modelGrid}>
        {availableModels.map(model => (
          <TouchableOpacity
            key={model.id}
            style={[
              styles.modelChip,
              selectedModels.has(model.id) && { backgroundColor: model.color + '20', borderColor: model.color }
            ]}
            onPress={() => {
              const newSelected = new Set(selectedModels);
              if (newSelected.has(model.id)) {
                if (newSelected.size > 1) {
                  newSelected.delete(model.id);
                }
              } else {
                if (tier === 'free' && newSelected.size >= 2) {
                  Alert.alert('Upgrade Required', 'Free tier allows up to 2 models. Upgrade to Premium for unlimited models.');
                  return;
                }
                newSelected.add(model.id);
              }
              setSelectedModels(newSelected);
            }}
          >
            {model.icon}
            <Text style={[
              styles.modelChipText,
              selectedModels.has(model.id) && { color: model.color }
            ]}>
              {model.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const FilterControls = () => (
    <BlurView intensity={20} style={styles.filterControls}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'overallScore', label: 'Score', icon: <Star size={14} color="#6B7280" /> },
            { key: 'accuracy', label: 'Accuracy', icon: <Target size={14} color="#6B7280" /> },
            { key: 'responseTime', label: 'Speed', icon: <Clock size={14} color="#6B7280" /> },
            { key: 'rating', label: 'Rating', icon: <Star size={14} color="#6B7280" /> },
          ].map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              {option.icon}
              <Text style={[
                styles.sortButtonText,
                sortBy === option.key && styles.sortButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BlurView>
  );

  const ResponseCard = ({ response }: { response: AIResponse }) => {
    const isExpanded = expandedResponses.has(response.id);
    const isAIResponseExpanded = expandedAIResponses.has(response.id);
    const shouldTruncate = response.response.length > 200;
    const displayText = isExpanded || !shouldTruncate 
      ? response.response 
      : response.response.substring(0, 200) + '...';

    return (
      <BlurView intensity={20} style={styles.responseCard}>
        <View style={styles.responseHeader}>
          <View style={styles.modelInfo}>
            <View style={[styles.modelIcon, { backgroundColor: response.color + '20' }]}>
              {response.icon}
            </View>
            <View>
              <Text style={styles.modelName}>{response.modelName}</Text>
              <Text style={styles.modelVersion}>{response.modelVersion}</Text>
            </View>
          </View>
          <View style={styles.responseActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => copyResponse(response)}
            >
              <Copy size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, response.flagged && styles.flaggedButton]}
              onPress={() => flagResponse(response.id)}
            >
              <Shield size={16} color={response.flagged ? "#EF4444" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Engine Response Section */}
        <View style={styles.aiResponseSection}>
          <View style={styles.aiResponseHeader}>
            <Bot size={16} color="#8B5CF6" />
            <Text style={styles.aiResponseTitle}>AI Engine Response</Text>
            <TouchableOpacity
              style={styles.expandToggle}
              onPress={() => toggleAIResponseExpanded(response.id)}
            >
              {isAIResponseExpanded ? (
                <ChevronUp size={16} color="#6B7280" />
              ) : (
                <ChevronDown size={16} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.aiResponseSummary}>{response.aiResponse.summary}</Text>
          
          {isAIResponseExpanded && (
            <View style={styles.aiResponseExpanded}>
              <View style={styles.aiResponseItem}>
                <Text style={styles.aiResponseLabel}>Detailed Reasoning:</Text>
                <Text style={styles.aiResponseText}>{response.aiResponse.reasoning}</Text>
              </View>
              
              <View style={styles.aiResponseItem}>
                <Text style={styles.aiResponseLabel}>Confidence Explanation:</Text>
                <Text style={styles.aiResponseText}>{response.aiResponse.confidenceExplanation}</Text>
              </View>
              
              <View style={styles.aiResponseItem}>
                <Text style={styles.aiResponseLabel}>Key Indicators:</Text>
                {response.aiResponse.keyIndicators.map((indicator, index) => (
                  <Text key={index} style={styles.aiResponseBullet}>• {indicator}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Search Analysis Results */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search Analysis Results</Text>
          <View style={styles.searchItem}>
            <Text style={styles.searchLabel}>Query:</Text>
            <Text style={styles.searchText}>{response.searchResults.query}</Text>
          </View>
          <View style={styles.searchItem}>
            <Text style={styles.searchLabel}>Key Findings:</Text>
            {response.searchResults.findings.map((finding, index) => (
              <Text key={index} style={styles.searchFinding}>• {finding}</Text>
            ))}
          </View>
          <View style={styles.searchMetrics}>
            <View style={styles.searchMetric}>
              <Text style={styles.searchMetricLabel}>Sources:</Text>
              <Text style={styles.searchMetricValue}>{response.searchResults.sources}</Text>
            </View>
            <View style={styles.searchMetric}>
              <Text style={styles.searchMetricLabel}>Reliability:</Text>
              <Text style={styles.searchMetricValue}>{response.searchResults.reliability}%</Text>
            </View>
          </View>
        </View>

        {/* Detailed Analysis Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Detailed Analysis Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Target size={16} color="#3B82F6" />
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>
              <Text style={styles.metricValue}>{response.accuracy}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${response.accuracy}%`, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Brain size={16} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Depth</Text>
              </View>
              <Text style={styles.metricValue}>{response.depth}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${response.depth}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Eye size={16} color="#10B981" />
                <Text style={styles.metricLabel}>Clarity</Text>
              </View>
              <Text style={styles.metricValue}>{response.clarity}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${response.clarity}%`, backgroundColor: '#10B981' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.metricLabel}>Overall Score</Text>
              </View>
              <Text style={[styles.metricValue, styles.overallScore]}>{response.overallScore}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${response.overallScore}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Shield size={16} color="#EF4444" />
                <Text style={styles.metricLabel}>Bias Detection</Text>
              </View>
              <Text style={styles.metricValue}>{response.biasDetection}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${response.biasDetection}%`, backgroundColor: '#EF4444' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Clock size={16} color="#06B6D4" />
                <Text style={styles.metricLabel}>Response Time</Text>
              </View>
              <Text style={styles.metricValue}>{response.responseTime}ms</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${Math.min(100, response.responseTime / 50)}%`, backgroundColor: '#06B6D4' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Technical Analysis */}
        <View style={styles.technicalSection}>
          <Text style={styles.sectionTitle}>Technical Analysis</Text>
          <Text style={styles.responseText}>{displayText}</Text>

          {shouldTruncate && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpanded(response.id)}
            >
              {isExpanded ? (
                <ChevronUp size={16} color="#6B7280" />
              ) : (
                <ChevronDown size={16} color="#6B7280" />
              )}
              <Text style={styles.expandText}>
                {isExpanded ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Rate this response:</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => rateResponse(response.id, star)}
              >
                <Star
                  size={16}
                  color={star <= (response.rating || 0) ? "#F59E0B" : "#D1D5DB"}
                  fill={star <= (response.rating || 0) ? "#F59E0B" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BlurView>
    );
  };

  // Show empty state if no analysis session exists
  if (!analysisSession && !currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F8FAFC', '#EFF6FF']}
          style={styles.gradient}
        >
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <BarChart3 size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Analysis to Compare</Text>
              <Text style={styles.emptyStateText}>
                Start by analyzing a chat message in the Analyze tab to see detailed AI model comparisons here.
              </Text>
              <View style={styles.emptyStateSteps}>
                <View style={styles.emptyStateStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Go to the Analyze tab</Text>
                </View>
                <View style={styles.emptyStateStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Enter a chat message to analyze</Text>
                </View>
                <View style={styles.emptyStateStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>View detailed comparisons here</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Model Comparison</Text>
            <Text style={styles.subtitle}>
              Compare chat analysis responses from multiple AI models side-by-side
            </Text>
          </View>

          {!analysisSession && (
            <View style={styles.inputSection}>
              <ModelSelector />
              
              <Text style={styles.inputLabel}>Enter your chat message</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="Enter a chat message to compare across different AI models..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  maxLength={tier === 'free' ? 500 : 2000}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.charCount}>
                    {prompt.length}/{tier === 'free' ? 500 : 2000}
                  </Text>
                  <Text style={styles.modelCount}>
                    {selectedModels.size} models selected
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.generateButton, (!prompt.trim() || isGenerating) && styles.buttonDisabled]}
                onPress={generateResponses}
                disabled={!prompt.trim() || isGenerating}
              >
                <LinearGradient
                  colors={prompt.trim() && !isGenerating ? ['#3B82F6', '#8B5CF6'] : ['#9CA3AF', '#6B7280']}
                  style={styles.buttonGradient}
                >
                  {isGenerating ? (
                    <BarChart3 size={20} color="white" />
                  ) : (
                    <Send size={20} color="white" />
                  )}
                  <Text style={styles.buttonText}>
                    {isGenerating ? 'Generating Responses...' : 'Compare Models'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {currentSession && (
            <Animated.View style={[styles.resultsSection, { opacity: fadeAnim }]}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Comparison Results</Text>
                <View style={styles.resultsActions}>
                  <TouchableOpacity
                    style={styles.filterToggle}
                    onPress={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareComparison}
                  >
                    <Share2 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.exportButton, tier === 'free' && styles.disabledButton]}
                    onPress={exportComparison}
                  >
                    <Download size={16} color={tier === 'free' ? "#D1D5DB" : "#6B7280"} />
                  </TouchableOpacity>
                </View>
              </View>

              {showFilters && <FilterControls />}

              <View style={styles.responsesList}>
                {getSortedResponses().map((response, index) => (
                  <ResponseCard key={response.id} response={response} />
                ))}
              </View>

              {tier === 'free' && (
                <View style={styles.upgradePrompt}>
                  <BarChart3 size={24} color="#F59E0B" />
                  <Text style={styles.upgradeTitle}>Unlock Advanced Comparisons</Text>
                  <Text style={styles.upgradeText}>
                    Upgrade to Premium for unlimited models, export features, and advanced analytics
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateSteps: {
    alignSelf: 'stretch',
    gap: 16,
  },
  emptyStateStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  inputSection: {
    padding: 24,
  },
  modelSelector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modelChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  textInput: {
    minHeight: 100,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 24,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  modelCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  resultsSection: {
    padding: 24,
    paddingTop: 0,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  disabledButton: {
    opacity: 0.5,
  },
  filterControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterRow: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  responsesList: {
    gap: 16,
  },
  responseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modelIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modelVersion: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  responseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  flaggedButton: {
    backgroundColor: '#FEF2F2',
  },
  aiResponseSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiResponseTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    flex: 1,
  },
  expandToggle: {
    padding: 4,
  },
  aiResponseSummary: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    lineHeight: 20,
  },
  aiResponseExpanded: {
    marginTop: 12,
    gap: 12,
  },
  aiResponseItem: {
    gap: 4,
  },
  aiResponseLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  aiResponseText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  aiResponseBullet: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
    marginLeft: 8,
  },
  searchSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  searchItem: {
    marginBottom: 8,
  },
  searchLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 2,
  },
  searchText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    fontStyle: 'italic',
  },
  searchFinding: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    lineHeight: 18,
  },
  searchMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  searchMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchMetricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  searchMetricValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  metricsSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  overallScore: {
    color: '#F59E0B',
  },
  metricBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 2,
  },
  technicalSection: {
    marginBottom: 16,
  },
  responseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ratingLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  upgradePrompt: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});