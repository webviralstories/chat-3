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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Send, Zap, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Crown, Brain, Target, Sparkles, Eye, MessageSquare } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { router } from 'expo-router';

interface AvailableEngine {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isPremium?: boolean;
}

export default function AnalyzeScreen() {
  const [text, setText] = useState('');
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set(['gpt4', 'claude']));
  const { tier, limits, usageToday, upgradeSubscription, isLoading } = useSubscription();
  const { currentSession, isAnalyzing, analysisError, startAnalysis, clearError } = useAnalysis();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const availableEngines: AvailableEngine[] = [
    { 
      id: 'gpt4', 
      name: 'GPT-4 Turbo', 
      description: 'Most advanced reasoning and analysis',
      icon: <Brain size={20} color="#10B981" />,
      color: '#10B981'
    },
    { 
      id: 'claude', 
      name: 'Claude 3 Opus', 
      description: 'Superior contextual understanding',
      icon: <Target size={20} color="#8B5CF6" />,
      color: '#8B5CF6'
    },
    { 
      id: 'grok', 
      name: 'Grok AI', 
      description: 'Real-time analysis with conversational insights',
      icon: <MessageSquare size={20} color="#1DA1F2" />,
      color: '#1DA1F2',
      isPremium: true
    },
    { 
      id: 'gemini', 
      name: 'Gemini Pro', 
      description: 'Google\'s multimodal AI',
      icon: <Eye size={20} color="#F59E0B" />,
      color: '#F59E0B',
      isPremium: true
    },
    { 
      id: 'gpt35', 
      name: 'GPT-3.5 Turbo', 
      description: 'Fast and reliable analysis',
      icon: <Sparkles size={20} color="#06B6D4" />,
      color: '#06B6D4'
    },
    { 
      id: 'palm', 
      name: 'PaLM 2', 
      description: 'Advanced language understanding',
      icon: <Zap size={20} color="#EF4444" />,
      color: '#EF4444',
      isPremium: true
    },
  ];

  // Clear error when component mounts or text changes
  useEffect(() => {
    if (analysisError) {
      clearError();
    }
  }, [text]);

  // Navigate to compare page when analysis is complete
  useEffect(() => {
    if (currentSession && !isAnalyzing) {
      // Small delay to show completion state
      setTimeout(() => {
        router.push('/(tabs)/compare');
      }, 1000);
    }
  }, [currentSession, isAnalyzing]);

  const getMaxEngines = () => {
    return limits.aiEngines === -1 ? availableEngines.length : limits.aiEngines;
  };

  const canAnalyze = () => {
    if (limits.dailyQueries !== -1 && usageToday.queries >= limits.dailyQueries) {
      return false;
    }
    return text.trim().length > 0 && selectedEngines.size > 0;
  };

  const handleUpgrade = async () => {
    try {
      await upgradeSubscription();
      Alert.alert('Success', 'Welcome to Premium! You now have unlimited access to all AI engines and features.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
    }
  };

  const toggleEngine = (engineId: string) => {
    const engine = availableEngines.find(e => e.id === engineId);
    
    if (engine?.isPremium && tier === 'free') {
      Alert.alert(
        'Premium Feature',
        `${engine.name} is available with Premium subscription. Upgrade to access all AI engines.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const newSelected = new Set(selectedEngines);
    
    if (newSelected.has(engineId)) {
      if (newSelected.size > 1) { // Keep at least one selected
        newSelected.delete(engineId);
      } else {
        Alert.alert('Selection Required', 'Please select at least one AI engine for analysis.');
        return;
      }
    } else {
      if (newSelected.size >= getMaxEngines()) {
        Alert.alert(
          'Engine Limit Reached',
          tier === 'free' 
            ? `Free tier allows up to ${getMaxEngines()} engines. Upgrade to Premium for unlimited access.`
            : `Maximum ${getMaxEngines()} engines can be selected.`
        );
        return;
      }
      newSelected.add(engineId);
    }
    
    setSelectedEngines(newSelected);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze()) {
      if (limits.dailyQueries !== -1 && usageToday.queries >= limits.dailyQueries) {
        Alert.alert('Daily Limit Reached', 'Upgrade to Premium for unlimited queries');
      } else if (selectedEngines.size === 0) {
        Alert.alert('No Engines Selected', 'Please select at least one AI engine for analysis.');
      } else if (!text.trim()) {
        Alert.alert('No Text Entered', 'Please enter a chat message to analyze.');
      }
      return;
    }

    try {
      await startAnalysis(text, Array.from(selectedEngines), availableEngines);
    } catch (error) {
      Alert.alert('Analysis Failed', 'Failed to analyze chat message. Please try again.');
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'truthful': return '#10B981';
      case 'deceptive': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'truthful': return <CheckCircle size={16} color="#10B981" />;
      case 'deceptive': return <AlertTriangle size={16} color="#EF4444" />;
      default: return <AlertTriangle size={16} color="#F59E0B" />;
    }
  };

  const UpgradeButton = () => {
    if (tier === 'premium') return null;
    
    return (
      <View style={styles.upgradeButtonContainer}>
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#F59E0B', '#F97316']}
            style={styles.upgradeGradient}
          >
            <Crown size={18} color="white" />
            <View style={styles.upgradeTextContainer}>
              <Text style={styles.upgradeButtonText}>
                {isLoading ? 'Upgrading...' : 'Upgrade to Premium'}
              </Text>
              <Text style={styles.upgradeFeatureText}>
                Unlimited • All AI Engines • Export
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const EngineSelector = () => (
    <View style={styles.engineSelector}>
      <Text style={styles.selectorTitle}>Select AI Engines</Text>
      <Text style={styles.selectorSubtitle}>
        Choose up to {getMaxEngines() === -1 ? 'unlimited' : getMaxEngines()} engines for chat analysis
      </Text>
      
      <View style={styles.engineGrid}>
        {availableEngines.map(engine => {
          const isSelected = selectedEngines.has(engine.id);
          const isDisabled = engine.isPremium && tier === 'free';
          
          return (
            <TouchableOpacity
              key={engine.id}
              style={[
                styles.engineCard,
                isSelected && { backgroundColor: engine.color + '15', borderColor: engine.color },
                isDisabled && styles.engineCardDisabled
              ]}
              onPress={() => toggleEngine(engine.id)}
              disabled={isDisabled}
            >
              <View style={styles.engineCardHeader}>
                <View style={[styles.engineIcon, { backgroundColor: engine.color + '20' }]}>
                  {engine.icon}
                </View>
                {engine.isPremium && tier === 'free' && (
                  <Crown size={14} color="#F59E0B" />
                )}
              </View>
              
              <Text style={[
                styles.engineName,
                isSelected && { color: engine.color },
                isDisabled && styles.engineNameDisabled
              ]}>
                {engine.name}
              </Text>
              
              <Text style={[
                styles.engineDescription,
                isDisabled && styles.engineDescriptionDisabled
              ]}>
                {engine.description}
              </Text>
              
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: engine.color }]}>
                  <CheckCircle size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>
          {selectedEngines.size} of {getMaxEngines() === -1 ? availableEngines.length : getMaxEngines()} engines selected
        </Text>
        {tier === 'free' && (
          <View style={styles.upgradeHint}>
            <Crown size={12} color="#F59E0B" />
            <Text style={styles.upgradeHintText}>Upgrade for all engines</Text>
          </View>
        )}
      </View>
    </View>
  );

  const AnalysisProgress = () => {
    if (!isAnalyzing) return null;

    return (
      <BlurView intensity={20} style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Zap size={24} color="#3B82F6" />
          <Text style={styles.progressTitle}>Analyzing Chat Message</Text>
        </View>
        <Text style={styles.progressText}>
          Processing with {selectedEngines.size} AI engine{selectedEngines.size !== 1 ? 's' : ''}...
        </Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: '70%' }]} />
        </View>
        <Text style={styles.progressNote}>
          This may take a few moments for comprehensive analysis
        </Text>
      </BlurView>
    );
  };

  const AnalysisComplete = () => {
    if (!currentSession || isAnalyzing) return null;

    return (
      <BlurView intensity={20} style={styles.completeContainer}>
        <View style={styles.completeHeader}>
          <View style={[styles.resultBadge, { backgroundColor: getResultColor(currentSession.overallResult) + '20' }]}>
            {getResultIcon(currentSession.overallResult)}
            <Text style={[styles.resultText, { color: getResultColor(currentSession.overallResult) }]}>
              {currentSession.overallResult.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.completeConfidence}>
            {currentSession.overallConfidence}% confidence
          </Text>
        </View>
        <Text style={styles.completeText}>
          Analysis complete! Redirecting to detailed results...
        </Text>
      </BlurView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Chat Lie Detector</Text>
            <Text style={styles.subtitle}>
              Powerful AI truth detection through advanced multi-engine conversation analysis
            </Text>
            
            <UpgradeButton />
            
            {tier === 'free' && (
              <View style={styles.limitBadge}>
                <Text style={styles.limitText}>
                  {usageToday.queries}/{limits.dailyQueries} queries today
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputSection}>
            <EngineSelector />
            
            <Text style={styles.inputLabel}>Enter chat message to analyze</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Paste or type the chat message, conversation, or statement you want to analyze for truthfulness..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                maxLength={tier === 'free' ? 500 : 2000}
                editable={!isAnalyzing}
              />
              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>
                  {text.length}/{tier === 'free' ? 500 : 2000}
                </Text>
                {tier === 'free' && (
                  <View style={styles.premiumHint}>
                    <Crown size={12} color="#F59E0B" />
                    <Text style={styles.premiumText}>2000 chars in Premium</Text>
                  </View>
                )}
              </View>
            </View>

            {analysisError && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{analysisError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.analyzeButton, (!canAnalyze() || isAnalyzing) && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={!canAnalyze() || isAnalyzing}
            >
              <LinearGradient
                colors={canAnalyze() && !isAnalyzing ? ['#3B82F6', '#8B5CF6'] : ['#9CA3AF', '#6B7280']}
                style={styles.buttonGradient}
              >
                {isAnalyzing ? (
                  <Zap size={20} color="white" />
                ) : (
                  <Send size={20} color="white" />
                )}
                <Text style={styles.buttonText}>
                  {isAnalyzing ? `Analyzing with ${selectedEngines.size} engines...` : 'Analyze Chat'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <AnalysisProgress />
            <AnalysisComplete />
          </View>

          {tier === 'free' && !isAnalyzing && !currentSession && (
            <View style={styles.upgradePrompt}>
              <Crown size={24} color="#F59E0B" />
              <Text style={styles.upgradeTitle}>Unlock All AI Engines</Text>
              <Text style={styles.upgradeText}>
                Upgrade to Premium for access to all {availableEngines.length} AI engines, unlimited queries, and advanced chat analysis features
              </Text>
            </View>
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
  upgradeButtonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  upgradeTextContainer: {
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 2,
  },
  upgradeFeatureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  limitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
  },
  limitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
  },
  inputSection: {
    padding: 24,
  },
  engineSelector: {
    marginBottom: 32,
  },
  selectorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectorSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  engineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  engineCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  engineCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  engineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  engineIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  engineNameDisabled: {
    color: '#9CA3AF',
  },
  engineDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  engineDescriptionDisabled: {
    color: '#D1D5DB',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  selectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  upgradeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
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
    marginBottom: 16,
  },
  textInput: {
    minHeight: 120,
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
  premiumHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    flex: 1,
  },
  analyzeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  completeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  completeConfidence: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  completeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
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