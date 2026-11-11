import React, { createContext, useContext, useState, useEffect } from 'react';

const FeaturesContext = createContext({
  features: [],
  featureMap: {},
  configMap: {},
  loading: true,
  isFeatureEnabled: () => false,
  getFeatureConfig: () => ({}),
  trackFeatureEvent: () => {},
  refreshFeatures: () => {},
});

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState([]);
  const [featureMap, setFeatureMap] = useState({});
  const [configMap, setConfigMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.success && json.data) {
        setFeatures(json.data.features || []);
        setFeatureMap(json.data.featureMap || {});
        setConfigMap(json.data.configMap || {});
      }
    } catch (err) {
      console.warn('Could not load commerce feature flags, failing open for defaults.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const isFeatureEnabled = (key) => {
    if (!key) return false;
    return !!featureMap[key];
  };

  const getFeatureConfig = (key) => {
    return configMap[key] || {};
  };

  const trackFeatureEvent = async (eventType, featureKey, metadata = {}) => {
    try {
      await fetch('/api/features/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          featureKey,
          metadata,
          sessionId: localStorage.getItem('illure_session_id') || undefined,
        }),
      });
    } catch {
      // non-blocking
    }
  };

  return (
    <FeaturesContext.Provider
      value={{
        features,
        featureMap,
        configMap,
        loading,
        isFeatureEnabled,
        getFeatureConfig,
        trackFeatureEvent,
        refreshFeatures: fetchFeatures,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
