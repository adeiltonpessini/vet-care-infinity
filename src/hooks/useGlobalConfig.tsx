import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalConfig {
  id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  font: string;
  logo_url?: string;
  favicon_url?: string;
  layout_mode: 'light' | 'dark' | 'auto';
  app_title: string;
  app_slogan: string;
  updated_by?: string;
}

interface GlobalConfigContextType {
  config: GlobalConfig | null;
  loading: boolean;
  updateConfig: (updates: Partial<GlobalConfig>) => Promise<void>;
  reloadConfig: () => Promise<void>;
}

const defaultConfig: GlobalConfig = {
  id: '',
  primary_color: '#1A73E8',
  secondary_color: '#6366f1',
  background_color: '#ffffff',
  font: 'Inter',
  layout_mode: 'light',
  app_title: 'InfinityVet',
  app_slogan: 'Gestão Veterinária Inteligente'
};

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

export function GlobalConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('global_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading global config:', error);
        setConfig(defaultConfig);
        return;
      }

      if (data) {
        setConfig(data);
        applyTheme(data);
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading global config:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (config: GlobalConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for dynamic theming
    root.style.setProperty('--primary-hue', config.primary_color);
    root.style.setProperty('--secondary-hue', config.secondary_color);
    root.style.setProperty('--background-hue', config.background_color);
    
    // Apply font family
    if (config.font) {
      root.style.setProperty('--font-family', config.font);
    }

    // Update document title
    document.title = config.app_title;

    // Update favicon if provided
    if (config.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.favicon_url;
      }
    }
  };

  const updateConfig = async (updates: Partial<GlobalConfig>) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('global_config')
        .update(updates)
        .eq('id', config.id);

      if (error) throw error;

      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      applyTheme(newConfig);
    } catch (error) {
      console.error('Error updating global config:', error);
      throw error;
    }
  };

  const reloadConfig = async () => {
    setLoading(true);
    await loadConfig();
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <GlobalConfigContext.Provider 
      value={{ 
        config, 
        loading, 
        updateConfig, 
        reloadConfig 
      }}
    >
      {children}
    </GlobalConfigContext.Provider>
  );
}

export function useGlobalConfig() {
  const context = useContext(GlobalConfigContext);
  if (context === undefined) {
    throw new Error('useGlobalConfig must be used within a GlobalConfigProvider');
  }
  return context;
}