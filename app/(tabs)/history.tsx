import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Calendar, Download, Share, Trash2, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Crown, Filter } from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface AnalysisRecord {
  id: string;
  text: string;
  timestamp: Date;
  overallResult: 'truthful' | 'deceptive' | 'uncertain';
  confidence: number;
  engineCount: number;
}

export default function HistoryScreen() {
  const { tier, limits } = useSubscription();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'truthful' | 'deceptive' | 'uncertain'>('all');

  // Mock history data
  const historyData: AnalysisRecord[] = [
    {
      id: '1',
      text: 'I was definitely at home all evening and never left the house.',
      timestamp: new Date('2024-01-15T19:30:00'),
      overallResult: 'deceptive',
      confidence: 78,
      engineCount: 2,
    },
    {
      id: '2',
      text: 'The meeting went well and everyone was satisfied with the proposal.',
      timestamp: new Date('2024-01-15T14:20:00'),
      overallResult: 'truthful',
      confidence: 92,
      engineCount: 2,
    },
    {
      id: '3',
      text: 'I think the project will be completed on time, but there might be some delays.',
      timestamp: new Date('2024-01-14T16:45:00'),
      overallResult: 'uncertain',
      confidence: 65,
      engineCount: 2,
    },
    {
      id: '4',
      text: 'The financial reports show consistent growth over the past quarter.',
      timestamp: new Date('2024-01-14T10:15:00'),
      overallResult: 'truthful',
      confidence: 89,
      engineCount: 2,
    },
  ];

  const filteredHistory = historyData.filter(record => 
    selectedFilter === 'all' || record.overallResult === selectedFilter
  );

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = (record: AnalysisRecord) => {
    if (!limits.exportResults) {
      Alert.alert(
        'Premium Feature',
        'Export functionality is available with Premium subscription.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Export Options',
      'Choose export format:',
      [
        { text: 'PDF', onPress: () => console.log('Export as PDF') },
        { text: 'JSON', onPress: () => console.log('Export as JSON') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShare = (record: AnalysisRecord) => {
    Alert.alert(
      'Share Chat Analysis',
      'Share this chat analysis result?',
      [
        { text: 'Share Link', onPress: () => console.log('Share link') },
        { text: 'Copy Text', onPress: () => console.log('Copy to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDelete = (record: AnalysisRecord) => {
    Alert.alert(
      'Delete Chat Analysis',
      'Are you sure you want to delete this chat analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete', record.id) },
      ]
    );
  };

  const filters = [
    { id: 'all', label: 'All', color: '#6B7280' },
    { id: 'truthful', label: 'Truthful', color: '#10B981' },
    { id: 'deceptive', label: 'Deceptive', color: '#EF4444' },
    { id: 'uncertain', label: 'Uncertain', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chat Analysis History</Text>
          <Text style={styles.subtitle}>
            View and manage your past chat analysis results
          </Text>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterContainer}>
            <Filter size={16} color="#6B7280" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {filters.map(filter => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && { backgroundColor: filter.color + '20' }
                  ]}
                  onPress={() => setSelectedFilter(filter.id as any)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter.id && { color: filter.color }
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Chat Analysis Found</Text>
              <Text style={styles.emptyText}>
                {selectedFilter === 'all' 
                  ? 'Start analyzing chat messages to build your history'
                  : `No ${selectedFilter} results found`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map((record) => (
                <BlurView key={record.id} intensity={20} style={styles.historyCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.resultInfo}>
                      <View style={[styles.resultBadge, { backgroundColor: getResultColor(record.overallResult) + '20' }]}>
                        {getResultIcon(record.overallResult)}
                        <Text style={[styles.resultText, { color: getResultColor(record.overallResult) }]}>
                          {record.overallResult.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.confidenceText}>{record.confidence}% confidence</Text>
                    </View>
                    <Text style={styles.timestamp}>{formatDate(record.timestamp)}</Text>
                  </View>

                  <Text style={styles.analysisText} numberOfLines={3}>
                    {record.text}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.engineInfo}>
                      <Text style={styles.engineCount}>
                        {record.engineCount} AI engines used
                      </Text>
                      {tier === 'free' && (
                        <View style={styles.freeTag}>
                          <Text style={styles.freeTagText}>Free</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleShare(record)}
                      >
                        <Share size={16} color="#6B7280" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, !limits.exportResults && styles.disabledAction]}
                        onPress={() => handleExport(record)}
                      >
                        <Download size={16} color={limits.exportResults ? "#6B7280" : "#D1D5DB"} />
                        {!limits.exportResults && (
                          <Crown size={12} color="#F59E0B" style={styles.premiumIcon} />
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(record)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              ))}
            </View>
          )}

          {tier === 'free' && filteredHistory.length > 0 && (
            <View style={styles.upgradePrompt}>
              <Crown size={24} color="#F59E0B" />
              <Text style={styles.upgradeTitle}>Unlock Full Chat History</Text>
              <Text style={styles.upgradeText}>
                Free accounts show recent results only. Upgrade to Premium for unlimited chat analysis history and export features.
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
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  historyList: {
    padding: 24,
    paddingTop: 0,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  analysisText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engineCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  freeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
  },
  freeTagText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#92400E',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  disabledAction: {
    opacity: 0.5,
  },
  premiumIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
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