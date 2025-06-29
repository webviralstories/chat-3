import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'premium';

interface SubscriptionLimits {
  aiEngines: number;
  dailyQueries: number;
  exportResults: boolean;
  priorityProcessing: boolean;
  advancedAnalytics: boolean;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  usageToday: {
    queries: number;
    engines: string[];
  };
  upgradeSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  canUpgrade: boolean;
}

const subscriptionLimits: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    aiEngines: 2,
    dailyQueries: 5, // Reduced from 10 to 5
    exportResults: false,
    priorityProcessing: false,
    advancedAnalytics: false,
  },
  premium: {
    aiEngines: -1, // unlimited
    dailyQueries: -1, // unlimited
    exportResults: true,
    priorityProcessing: true,
    advancedAnalytics: true,
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [usageToday, setUsageToday] = useState({
    queries: 0,
    engines: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const upgradeSubscription = async () => {
    setIsLoading(true);
    try {
      // In a real app, integrate with RevenueCat here
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTier('premium');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      // In a real app, integrate with RevenueCat here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTier('free');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider 
      value={{
        tier,
        limits: subscriptionLimits[tier],
        usageToday,
        upgradeSubscription,
        cancelSubscription,
        isLoading,
        canUpgrade: tier === 'free',
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}