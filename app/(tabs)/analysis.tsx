import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChartBar as BarChart3, TrendingUp, Clock, Target, Brain, Eye, Shield, Download, Share2, Filter, Import as SortAsc, Dessert as SortDesc, ChevronDown, ChevronUp, Star, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Copy, Zap, MessageSquare, Sparkles } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAnalysis } from '@/contexts/AnalysisContext';

const { width: screenWidth } = Dimensions.get('window');

interface AIEngineResult {
  id: string;
  engineName: string;
  engineIcon: React.ReactNode;
  engineColor: string;
  rawOutput: string;
  performanceMetrics: {
    accuracy: number; // 0-100%
    analysisDepth: number; // 1-5 scale
    clarity: number; // 1-5 scale
    responseTime: number; // seconds
    biasDetection: 'None' | 'Low' | 'Medium' | 'High';
  };
  keyFindings: string[];
  timestamp: Date;
  calculationBreakdown: {
    accuracyFactors: string[];
    depthFactors: string[];
    clarityFactors: string[];
  };
}

interface ComparisonData {
  sessionId: string;
  originalPrompt: string;
  engines: AIEngineResult[];
  overallInsights: {
    consensus: string;
    divergence: string[];
    reliability: number;
  };
  createdAt: Date;
}

type SortMetric = 'accuracy' | 'analysisDepth' | 'clarity' | 'responseTime' | 'engineName';
type SortDirection = 'asc' | 'desc';

export default function AnalysisScreen() {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [sortMetric, setSortMetric] = useState<SortMetric>('accuracy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCalculations, setShowCalculations] = useState<Set<string>>(new Set());
  const { tier } = useSubscription();
  const { currentSession } = useAnalysis();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock data generation
  useEffect(() => {
    generateMockComparisonData();
  }, []);

  const generateMockComparisonData = () => {
    const engines: AIEngineResult[] = [
      {
        id: 'gpt4',
        engineName: 'GPT-4 Turbo',
        engineIcon: <Brain size={20} color="#10B981" />,
        engineColor: '#10B981',
        rawOutput: `Based on my comprehensive analysis of the provided chat message, I can identify several linguistic and contextual patterns that inform my assessment. The communication style demonstrates consistent narrative flow with coherent temporal sequencing. The language patterns show natural conversational markers including appropriate emotional resonance and contextual awareness.

Key observations include:
- Consistent use of first-person narrative without deflection
- Natural speech patterns with appropriate hesitation markers
- Contextual details that align with expected behavioral patterns
- Absence of common deceptive linguistic indicators such as distancing language or excessive qualifiers

The overall assessment suggests a high probability of truthful communication based on established linguistic analysis frameworks and behavioral pattern recognition. The confidence level is supported by multiple convergent indicators across different analytical dimensions.`,
        performanceMetrics: {
          accuracy: 92,
          analysisDepth: 5,
          clarity: 4,
          responseTime: 2.3,
          biasDetection: 'Low'
        },
        keyFindings: [
          'Consistent narrative flow detected',
          'Natural conversational markers present',
          'No significant deceptive indicators found',
          'High contextual coherence'
        ],
        timestamp: new Date(),
        calculationBreakdown: {
          accuracyFactors: [
            'Linguistic pattern consistency (+25 points)',
            'Contextual coherence validation (+20 points)',
            'Absence of deception markers (+25 points)',
            'Temporal sequence alignment (+22 points)'
          ],
          depthFactors: [
            'Multi-dimensional analysis framework',
            'Cross-referenced behavioral patterns',
            'Comprehensive linguistic evaluation',
            'Contextual validation protocols'
          ],
          clarityFactors: [
            'Clear analytical structure',
            'Well-defined assessment criteria',
            'Logical conclusion flow',
            'Minor technical complexity'
          ]
        }
      },
      {
        id: 'claude',
        engineName: 'Claude 3 Opus',
        engineIcon: <Target size={20} color="#8B5CF6" />,
        engineColor: '#8B5CF6',
        rawOutput: `I've conducted a thorough examination of the chat message using advanced natural language processing techniques and contextual analysis frameworks. My assessment focuses on multiple dimensions of communication authenticity.

The analysis reveals several positive indicators for truthfulness:

1. Linguistic Authenticity: The message demonstrates natural speech patterns consistent with genuine communication. There's an absence of hedging language or excessive qualifiers that often indicate deception.

2. Contextual Consistency: The narrative elements align logically and maintain internal coherence throughout the communication.

3. Emotional Congruence: The emotional tone matches the content appropriately, suggesting authentic expression rather than manufactured sentiment.

4. Structural Integrity: The message follows expected conversational patterns without unusual deflections or topic avoidance.

However, I note some areas of uncertainty that prevent absolute certainty in the assessment. The analysis would benefit from additional contextual information to achieve higher confidence levels.`,
        performanceMetrics: {
          accuracy: 88,
          analysisDepth: 5,
          clarity: 5,
          responseTime: 1.8,
          biasDetection: 'None'
        },
        keyFindings: [
          'Natural speech patterns confirmed',
          'Emotional congruence validated',
          'Structural integrity maintained',
          'Some uncertainty factors present'
        ],
        timestamp: new Date(),
        calculationBreakdown: {
          accuracyFactors: [
            'Natural language processing (+22 points)',
            'Contextual consistency check (+20 points)',
            'Emotional congruence analysis (+23 points)',
            'Structural pattern validation (+23 points)'
          ],
          depthFactors: [
            'Multi-layered analytical approach',
            'Advanced NLP techniques applied',
            'Comprehensive framework utilization',
            'Cross-dimensional validation'
          ],
          clarityFactors: [
            'Excellent structural organization',
            'Clear analytical progression',
            'Well-articulated conclusions',
            'Accessible technical language'
          ]
        }
      },
      {
        id: 'grok',
        engineName: 'Grok AI',
        engineIcon: <MessageSquare size={20} color="#1DA1F2" />,
        engineColor: '#1DA1F2',
        rawOutput: `Alright, let me break this down for you with some real-time conversational analysis. I'm looking at this chat message through the lens of authentic human communication patterns, and here's what I'm seeing:

The good stuff:
- This reads like genuine human conversation, not some rehearsed script
- The flow feels natural, like someone actually talking rather than carefully crafting deception
- Emotional markers are hitting the right notes - not overdone, not absent
- The details have that organic quality you get with real experiences

The interesting bits:
- There are some micro-patterns that could go either way
- The confidence level in certain statements varies in a way that's actually pretty human
- Some linguistic choices that are worth noting but not necessarily red flags

Bottom line: This is leaning heavily toward authentic communication. The conversational DNA looks legitimate, and while no analysis is 100% perfect, the indicators are pointing in a positive direction. The real-time processing shows consistency across multiple analytical passes.`,
        performanceMetrics: {
          accuracy: 85,
          analysisDepth: 4,
          clarity: 5,
          responseTime: 1.2,
          biasDetection: 'Low'
        },
        keyFindings: [
          'Authentic conversational DNA detected',
          'Natural emotional markers present',
          'Organic detail quality confirmed',
          'Real-time consistency validated'
        ],
        timestamp: new Date(),
        calculationBreakdown: {
          accuracyFactors: [
            'Conversational authenticity (+21 points)',
            'Emotional marker validation (+20 points)',
            'Organic detail assessment (+22 points)',
            'Real-time consistency (+22 points)'
          ],
          depthFactors: [
            'Real-time analytical processing',
            'Conversational pattern recognition',
            'Multi-pass validation system',
            'Human communication modeling'
          ],
          clarityFactors: [
            'Excellent conversational tone',
            'Clear breakdown structure',
            'Accessible explanations',
            'Engaging presentation style'
          ]
        }
      },
      {
        id: 'gemini',
        engineName: 'Gemini Pro',
        engineIcon: <Eye size={20} color="#F59E0B" />,
        engineColor: '#F59E0B',
        rawOutput: `My multimodal analysis approach has processed the chat message across several analytical dimensions, incorporating both textual analysis and contextual understanding frameworks.

Analysis Summary:
The message demonstrates several characteristics consistent with authentic communication. The linguistic structure follows expected patterns for genuine dialogue, with appropriate complexity and natural variation in sentence construction.

Detailed Findings:
• Semantic coherence: High consistency across semantic fields
• Syntactic patterns: Natural variation without artificial construction
• Pragmatic markers: Appropriate contextual usage
• Discourse structure: Logical flow with expected conversational elements

Risk Assessment:
While the overall assessment trends toward authenticity, there are some elements that warrant consideration. The confidence interval reflects the inherent uncertainty in linguistic analysis when working with limited contextual information.

The analysis benefits from Google's extensive language model training, providing robust pattern recognition capabilities across diverse communication styles and contexts.`,
        performanceMetrics: {
          accuracy: 90,
          analysisDepth: 4,
          clarity: 3,
          responseTime: 2.1,
          biasDetection: 'Medium'
        },
        keyFindings: [
          'High semantic coherence detected',
          'Natural syntactic variation confirmed',
          'Appropriate pragmatic markers',
          'Some uncertainty elements noted'
        ],
        timestamp: new Date(),
        calculationBreakdown: {
          accuracyFactors: [
            'Semantic coherence analysis (+23 points)',
            'Syntactic pattern evaluation (+22 points)',
            'Pragmatic marker assessment (+22 points)',
            'Discourse structure validation (+23 points)'
          ],
          depthFactors: [
            'Multimodal analytical approach',
            'Comprehensive linguistic framework',
            'Cross-dimensional evaluation',
            'Contextual understanding integration'
          ],
          clarityFactors: [
            'Technical terminology usage',
            'Structured analytical format',
            'Some complexity in presentation',
            'Academic writing style'
          ]
        }
      },
      {
        id: 'gpt35',
        engineName: 'GPT-3.5 Turbo',
        engineIcon: <Sparkles size={20} color="#06B6D4" />,
        engineColor: '#06B6D4',
        rawOutput: `I have analyzed the chat message for indicators of truthfulness and deception using established linguistic analysis techniques.

The analysis shows positive indicators for truthful communication:
- The message structure follows natural conversational patterns
- Language use appears consistent and coherent
- No obvious signs of deceptive language markers
- Appropriate level of detail for the context

Areas of consideration:
- Some elements could benefit from additional verification
- The analysis is based on linguistic patterns rather than factual verification
- Confidence level reflects the limitations of text-based analysis

Overall assessment suggests the communication is likely truthful based on available linguistic evidence. The analysis framework provides a systematic approach to evaluating communication authenticity while acknowledging inherent limitations in text-only analysis.`,
        performanceMetrics: {
          accuracy: 82,
          analysisDepth: 3,
          clarity: 4,
          responseTime: 0.9,
          biasDetection: 'Low'
        },
        keyFindings: [
          'Natural conversational patterns',
          'Consistent language usage',
          'No obvious deception markers',
          'Appropriate contextual detail'
        ],
        timestamp: new Date(),
        calculationBreakdown: {
          accuracyFactors: [
            'Conversational pattern analysis (+20 points)',
            'Language consistency check (+21 points)',
            'Deception marker screening (+20 points)',
            'Contextual appropriateness (+21 points)'
          ],
          depthFactors: [
            'Standard linguistic analysis',
            'Established evaluation techniques',
            'Systematic assessment approach'
          ],
          clarityFactors: [
            'Clear structure and organization',
            'Straightforward language use',
            'Logical progression of ideas',
            'Accessible presentation'
          ]
        }
      }
    ];

    const mockData: ComparisonData = {
      sessionId: 'comparison-' + Date.now(),
      originalPrompt: "I was definitely at home all evening and never left the house. We watched movies and ordered takeout around 8 PM.",
      engines,
      overallInsights: {
        consensus: 'All engines indicate high probability of truthful communication with strong linguistic authenticity markers.',
        divergence: [
          'Confidence levels vary from 82% to 92%',
          'Bias detection ranges from None to Medium',
          'Analysis depth approaches differ between engines'
        ],
        reliability: 89
      },
      createdAt: new Date()
    };

    setComparisonData(mockData);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const getSortedEngines = () => {
    if (!comparisonData) return [];
    
    return [...comparisonData.engines].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortMetric) {
        case 'accuracy':
          aValue = a.performanceMetrics.accuracy;
          bValue = b.performanceMetrics.accuracy;
          break;
        case 'analysisDepth':
          aValue = a.performanceMetrics.analysisDepth;
          bValue = b.performanceMetrics.analysisDepth;
          break;
        case 'clarity':
          aValue = a.performanceMetrics.clarity;
          bValue = b.performanceMetrics.clarity;
          break;
        case 'responseTime':
          aValue = a.performanceMetrics.responseTime;
          bValue = b.performanceMetrics.responseTime;
          break;
        case 'engineName':
          aValue = a.engineName;
          bValue = b.engineName;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const toggleSort = (metric: SortMetric) => {
    if (sortMetric === metric) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMetric(metric);
      setSortDirection('desc');
    }
  };

  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCalculations = (engineId: string) => {
    const newCalculations = new Set(showCalculations);
    if (newCalculations.has(engineId)) {
      newCalculations.delete(engineId);
    } else {
      newCalculations.add(engineId);
    }
    setShowCalculations(newCalculations);
  };

  const getBiasColor = (level: string) => {
    switch (level) {
      case 'None': return '#10B981';
      case 'Low': return '#F59E0B';
      case 'Medium': return '#EF4444';
      case 'High': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getDepthStars = (depth: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < depth ? "#F59E0B" : "#D1D5DB"}
        fill={i < depth ? "#F59E0B" : "transparent"}
      />
    ));
  };

  const getClarityStars = (clarity: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < clarity ? "#3B82F6" : "#D1D5DB"}
        fill={i < clarity ? "#3B82F6" : "transparent"}
      />
    ));
  };

  const exportData = async () => {
    if (tier === 'free') {
      Alert.alert('Premium Feature', 'Export functionality is available with Premium subscription.');
      return;
    }
    
    if (!comparisonData) return;
    
    const exportText = `AI Engine Comparison Analysis
Generated: ${comparisonData.createdAt.toLocaleString()}

Original Prompt: ${comparisonData.originalPrompt}

${comparisonData.engines.map(engine => `
${engine.engineName}:
- Accuracy: ${engine.performanceMetrics.accuracy}%
- Analysis Depth: ${engine.performanceMetrics.analysisDepth}/5
- Clarity: ${engine.performanceMetrics.clarity}/5
- Response Time: ${engine.performanceMetrics.responseTime}s
- Bias Detection: ${engine.performanceMetrics.biasDetection}

Key Findings:
${engine.keyFindings.map(finding => `• ${finding}`).join('\n')}

Raw Output:
${engine.rawOutput}
`).join('\n---\n')}

Overall Insights:
Consensus: ${comparisonData.overallInsights.consensus}
Reliability: ${comparisonData.overallInsights.reliability}%`;

    try {
      await Share.share({
        message: exportText,
        title: 'AI Engine Comparison Analysis'
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export analysis data.');
    }
  };

  const ComparisonMatrix = () => {
    if (!comparisonData) return null;
    
    const metrics = ['accuracy', 'analysisDepth', 'clarity', 'responseTime'];
    const engines = getSortedEngines();
    
    return (
      <BlurView intensity={20} style={styles.matrixContainer}>
        <Text style={styles.matrixTitle}>Performance Comparison Matrix</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.matrix}>
            {/* Header */}
            <View style={styles.matrixRow}>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Engine</Text>
              </View>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Accuracy</Text>
              </View>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Depth</Text>
              </View>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Clarity</Text>
              </View>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Time (s)</Text>
              </View>
              <View style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>Bias</Text>
              </View>
            </View>
            
            {/* Data Rows */}
            {engines.map(engine => (
              <View key={engine.id} style={styles.matrixRow}>
                <View style={styles.matrixCell}>
                  <View style={styles.engineNameCell}>
                    {engine.engineIcon}
                    <Text style={styles.matrixCellText}>{engine.engineName}</Text>
                  </View>
                </View>
                <View style={styles.matrixCell}>
                  <Text style={[styles.matrixCellText, { color: engine.engineColor }]}>
                    {engine.performanceMetrics.accuracy}%
                  </Text>
                </View>
                <View style={styles.matrixCell}>
                  <View style={styles.starsContainer}>
                    {getDepthStars(engine.performanceMetrics.analysisDepth)}
                  </View>
                </View>
                <View style={styles.matrixCell}>
                  <View style={styles.starsContainer}>
                    {getClarityStars(engine.performanceMetrics.clarity)}
                  </View>
                </View>
                <View style={styles.matrixCell}>
                  <Text style={styles.matrixCellText}>
                    {engine.performanceMetrics.responseTime}
                  </Text>
                </View>
                <View style={styles.matrixCell}>
                  <View style={[
                    styles.biasBadge,
                    { backgroundColor: getBiasColor(engine.performanceMetrics.biasDetection) + '20' }
                  ]}>
                    <Text style={[
                      styles.biasText,
                      { color: getBiasColor(engine.performanceMetrics.biasDetection) }
                    ]}>
                      {engine.performanceMetrics.biasDetection}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </BlurView>
    );
  };

  const EngineCard = ({ engine }: { engine: AIEngineResult }) => {
    const isExpanded = expandedSections.has(engine.id);
    const showCalc = showCalculations.has(engine.id);
    
    return (
      <BlurView intensity={20} style={styles.engineCard}>
        {/* Header */}
        <View style={styles.engineHeader}>
          <View style={styles.engineInfo}>
            <View style={[styles.engineIconContainer, { backgroundColor: engine.engineColor + '20' }]}>
              {engine.engineIcon}
            </View>
            <View>
              <Text style={styles.engineName}>{engine.engineName}</Text>
              <Text style={styles.engineTimestamp}>
                {engine.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpanded(engine.id)}
          >
            {isExpanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Target size={16} color={engine.engineColor} />
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={[styles.metricValue, { color: engine.engineColor }]}>
              {engine.performanceMetrics.accuracy}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Brain size={16} color="#F59E0B" />
            <Text style={styles.metricLabel}>Depth</Text>
            <View style={styles.starsContainer}>
              {getDepthStars(engine.performanceMetrics.analysisDepth)}
            </View>
          </View>
          
          <View style={styles.metricItem}>
            <Eye size={16} color="#3B82F6" />
            <Text style={styles.metricLabel}>Clarity</Text>
            <View style={styles.starsContainer}>
              {getClarityStars(engine.performanceMetrics.clarity)}
            </View>
          </View>
          
          <View style={styles.metricItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.metricLabel}>Time</Text>
            <Text style={styles.metricValue}>
              {engine.performanceMetrics.responseTime}s
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Shield size={16} color={getBiasColor(engine.performanceMetrics.biasDetection)} />
            <Text style={styles.metricLabel}>Bias</Text>
            <View style={[
              styles.biasBadge,
              { backgroundColor: getBiasColor(engine.performanceMetrics.biasDetection) + '20' }
            ]}>
              <Text style={[
                styles.biasText,
                { color: getBiasColor(engine.performanceMetrics.biasDetection) }
              ]}>
                {engine.performanceMetrics.biasDetection}
              </Text>
            </View>
          </View>
        </View>

        {/* Key Findings */}
        <View style={styles.findingsSection}>
          <Text style={styles.sectionTitle}>Key Findings</Text>
          {engine.keyFindings.map((finding, index) => (
            <View key={index} style={styles.findingItem}>
              <CheckCircle size={12} color="#10B981" />
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
        </View>

        {/* Calculation Breakdown */}
        <TouchableOpacity
          style={styles.calculationToggle}
          onPress={() => toggleCalculations(engine.id)}
        >
          <BarChart3 size={16} color="#6B7280" />
          <Text style={styles.calculationToggleText}>
            {showCalc ? 'Hide' : 'Show'} Calculation Breakdown
          </Text>
          {showCalc ? (
            <ChevronUp size={16} color="#6B7280" />
          ) : (
            <ChevronDown size={16} color="#6B7280" />
          )}
        </TouchableOpacity>

        {showCalc && (
          <View style={styles.calculationBreakdown}>
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Accuracy Factors</Text>
              {engine.calculationBreakdown.accuracyFactors.map((factor, index) => (
                <Text key={index} style={styles.breakdownItem}>• {factor}</Text>
              ))}
            </View>
            
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Depth Factors</Text>
              {engine.calculationBreakdown.depthFactors.map((factor, index) => (
                <Text key={index} style={styles.breakdownItem}>• {factor}</Text>
              ))}
            </View>
            
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Clarity Factors</Text>
              {engine.calculationBreakdown.clarityFactors.map((factor, index) => (
                <Text key={index} style={styles.breakdownItem}>• {factor}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Raw Output */}
        {isExpanded && (
          <View style={styles.rawOutputSection}>
            <View style={styles.rawOutputHeader}>
              <Text style={styles.sectionTitle}>Raw AI Output</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  // Copy to clipboard functionality would go here
                  Alert.alert('Copied', 'Raw output copied to clipboard');
                }}
              >
                <Copy size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.rawOutputContainer}>
              <Text style={styles.rawOutputText}>{engine.rawOutput}</Text>
            </View>
          </View>
        )}
      </BlurView>
    );
  };

  if (!comparisonData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F8FAFC', '#EFF6FF']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Zap size={48} color="#3B82F6" />
            <Text style={styles.loadingText}>Loading Analysis...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#EFF6FF']} style={styles.gradient}>
        <Animated.ScrollView 
          style={[styles.scrollView, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Engine Analysis</Text>
            <Text style={styles.subtitle}>
              Comprehensive comparison of {comparisonData.engines.length} AI engines
            </Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={exportData}>
                <Download size={16} color="#6B7280" />
                <Text style={styles.actionButtonText}>Export</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Share.share({ message: comparisonData.originalPrompt })}
              >
                <Share2 size={16} color="#6B7280" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Original Prompt */}
          <BlurView intensity={20} style={styles.promptContainer}>
            <Text style={styles.promptLabel}>Analyzed Message</Text>
            <Text style={styles.promptText}>{comparisonData.originalPrompt}</Text>
          </BlurView>

          {/* Overall Insights */}
          <BlurView intensity={20} style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Overall Insights</Text>
            <View style={styles.insightItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.insightText}>{comparisonData.overallInsights.consensus}</Text>
            </View>
            
            <Text style={styles.divergenceTitle}>Key Divergences:</Text>
            {comparisonData.overallInsights.divergence.map((item, index) => (
              <View key={index} style={styles.divergenceItem}>
                <AlertTriangle size={12} color="#F59E0B" />
                <Text style={styles.divergenceText}>{item}</Text>
              </View>
            ))}
            
            <View style={styles.reliabilityContainer}>
              <Text style={styles.reliabilityLabel}>Overall Reliability</Text>
              <Text style={styles.reliabilityValue}>
                {comparisonData.overallInsights.reliability}%
              </Text>
            </View>
          </BlurView>

          {/* Sorting Controls */}
          <BlurView intensity={20} style={styles.sortingContainer}>
            <Text style={styles.sortingTitle}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortingButtons}>
                {[
                  { key: 'accuracy', label: 'Accuracy', icon: <Target size={14} color="#6B7280" /> },
                  { key: 'analysisDepth', label: 'Depth', icon: <Brain size={14} color="#6B7280" /> },
                  { key: 'clarity', label: 'Clarity', icon: <Eye size={14} color="#6B7280" /> },
                  { key: 'responseTime', label: 'Speed', icon: <Clock size={14} color="#6B7280" /> },
                  { key: 'engineName', label: 'Name', icon: <Filter size={14} color="#6B7280" /> },
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortButton,
                      sortMetric === option.key && styles.sortButtonActive
                    ]}
                    onPress={() => toggleSort(option.key as SortMetric)}
                  >
                    {option.icon}
                    <Text style={[
                      styles.sortButtonText,
                      sortMetric === option.key && styles.sortButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                    {sortMetric === option.key && (
                      sortDirection === 'asc' ? 
                        <SortAsc size={12} color="white" /> : 
                        <SortDesc size={12} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </BlurView>

          {/* Comparison Matrix */}
          <ComparisonMatrix />

          {/* Engine Results */}
          <View style={styles.enginesContainer}>
            <Text style={styles.enginesTitle}>Detailed Engine Results</Text>
            {getSortedEngines().map(engine => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </View>

          {tier === 'free' && (
            <View style={styles.upgradePrompt}>
              <TrendingUp size={24} color="#F59E0B" />
              <Text style={styles.upgradeTitle}>Unlock Advanced Analytics</Text>
              <Text style={styles.upgradeText}>
                Upgrade to Premium for detailed performance charts, export features, and unlimited comparisons
              </Text>
            </View>
          )}
        </Animated.ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
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
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  promptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  promptLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 24,
  },
  insightsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  divergenceTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 8,
    marginBottom: 8,
  },
  divergenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  divergenceText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
  },
  reliabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reliabilityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  reliabilityValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  sortingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sortingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  sortingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
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
  matrixContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  matrixTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  matrix: {
    minWidth: screenWidth - 48,
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  matrixHeaderCell: {
    width: 100,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  matrixHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    textAlign: 'center',
  },
  matrixCell: {
    width: 100,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixCellText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  biasBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  biasText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  enginesContainer: {
    padding: 24,
    paddingTop: 0,
  },
  enginesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  engineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  engineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  engineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  engineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  engineTimestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  expandButton: {
    padding: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  findingsSection: {
    marginBottom: 16,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  findingText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  calculationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  calculationToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  calculationBreakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  breakdownSection: {
    gap: 4,
  },
  breakdownTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#374151',
  },
  breakdownItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  rawOutputSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rawOutputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  rawOutputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  rawOutputText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  upgradePrompt: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    marginTop: 8,
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