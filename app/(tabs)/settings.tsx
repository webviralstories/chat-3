import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Crown, Bell, Shield, FileText, CircleHelp as HelpCircle, LogOut, ChevronRight, CircleCheck as CheckCircle, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { tier, limits, upgradeSubscription, cancelSubscription, isLoading } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleUpgrade = async () => {
    try {
      await upgradeSubscription();
      Alert.alert('Success', 'Welcome to Premium! Enjoy unlimited access to all features.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Premium subscription? You will lose access to premium features.',
      [
        { text: 'Keep Premium', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert('Cancelled', 'Your subscription has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription.');
            }
          }
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showChevron = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && <ChevronRight size={16} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <BlurView intensity={20} style={styles.profileCard}>
              <Image
                source={{ uri: user?.avatar }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.tierBadge}>
                  {tier === 'premium' ? (
                    <Crown size={12} color="#F59E0B" />
                  ) : (
                    <User size={12} color="#6B7280" />
                  )}
                  <Text style={[
                    styles.tierText,
                    tier === 'premium' ? styles.premiumText : styles.freeText
                  ]}>
                    {tier === 'premium' ? 'Premium User' : 'Free User'}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Subscription Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <BlurView intensity={20} style={styles.card}>
              {tier === 'free' ? (
                <View style={styles.upgradeContainer}>
                  <View style={styles.upgradeHeader}>
                    <Crown size={24} color="#F59E0B" />
                    <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                  </View>
                  <Text style={styles.upgradeDescription}>
                    Unlock unlimited AI engines, queries, and advanced features
                  </Text>
                  <View style={styles.featuresList}>
                    {[
                      'Unlimited AI engines',
                      'Unlimited daily queries',
                      'Export analysis results',
                      'Priority processing',
                      'Advanced analytics'
                    ].map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <CheckCircle size={16} color="#10B981" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity 
                    style={styles.upgradeButton} 
                    onPress={handleUpgrade}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#8B5CF6']}
                      style={styles.upgradeGradient}
                    >
                      <Crown size={20} color="white" />
                      <Text style={styles.upgradeButtonText}>
                        {isLoading ? 'Processing...' : 'Upgrade Now'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.premiumContainer}>
                  <View style={styles.premiumHeader}>
                    <Zap size={24} color="#10B981" />
                    <Text style={styles.premiumTitle}>Premium Active</Text>
                  </View>
                  <Text style={styles.premiumDescription}>
                    You have access to all premium features
                  </Text>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>
                      {isLoading ? 'Processing...' : 'Cancel Subscription'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </BlurView>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <BlurView intensity={20} style={styles.card}>
              <SettingItem
                icon={<Bell size={20} color="#6B7280" />}
                title="Notifications"
                subtitle="Get alerts for analysis results"
                rightElement={
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                    thumbColor={notifications ? '#FFFFFF' : '#F3F4F6'}
                  />
                }
                showChevron={false}
              />
              <SettingItem
                icon={<Shield size={20} color="#6B7280" />}
                title="Privacy Mode"
                subtitle="Enhanced data protection"
                rightElement={
                  <Switch
                    value={privacyMode}
                    onValueChange={setPrivacyMode}
                    trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                    thumbColor={privacyMode ? '#FFFFFF' : '#F3F4F6'}
                  />
                }
                showChevron={false}
              />
            </BlurView>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <BlurView intensity={20} style={styles.card}>
              <SettingItem
                icon={<FileText size={20} color="#6B7280" />}
                title="Terms of Service"
                onPress={() => Alert.alert('Terms of Service', 'Opening terms...')}
              />
              <SettingItem
                icon={<Shield size={20} color="#6B7280" />}
                title="Privacy Policy"
                onPress={() => Alert.alert('Privacy Policy', 'Opening privacy policy...')}
              />
              <SettingItem
                icon={<HelpCircle size={20} color="#6B7280" />}
                title="Help & Support"
                onPress={() => Alert.alert('Help & Support', 'Opening support...')}
              />
            </BlurView>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <BlurView intensity={20} style={styles.card}>
              <SettingItem
                icon={<LogOut size={20} color="#EF4444" />}
                title="Sign Out"
                onPress={handleSignOut}
                showChevron={false}
              />
            </BlurView>
          </View>
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  premiumText: {
    color: '#F59E0B',
  },
  freeText: {
    color: '#6B7280',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeContainer: {
    padding: 20,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  premiumContainer: {
    padding: 20,
    alignItems: 'center',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  premiumDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
});