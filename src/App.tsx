import { useEffect, useState } from 'react';
import { ExploreSection } from './components/ExploreSection';
import { HeroSection } from './components/HeroSection';
import { HubSection } from './components/HubSection';
import { Navbar } from './components/Navbar';
import { ShowcaseAndInfo } from './components/ShowcaseAndInfo';
import { HUB_TABS, type HubTabKey } from './data/twendeData';

const VALID_TAB_KEYS = new Set<string>(HUB_TABS.map((t) => t.key));

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<HubTabKey>('matchday');
  const [isDark, setIsDark] = useState(false);

  // Sync light/dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Sync hash routing (#matchday, #events, #rentals, #tours, #creatives, #partners, #join)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (VALID_TAB_KEYS.has(hash)) {
        setActiveTab(hash as HubTabKey);
        const el = document.getElementById('more');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectHubTab = (tab: HubTabKey, scrollToHub = true) => {
    setActiveTab(tab);
    try {
      window.history.replaceState(null, '', `#${tab}`);
    } catch {
      // Ignore restricted history state
    }
    if (scrollToHub) {
      const el = document.getElementById('more');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111714] dark:bg-[#0D1210] dark:text-[#EEF3F0]">
      <Navbar onNavigateHub={(tab) => handleSelectHubTab(tab, true)} />

      <main className="flex-1">
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickJump={(tab) => {
            if (tab) {
              handleSelectHubTab(tab, true);
            }
          }}
        />

        <ExploreSection
          searchQuery={searchQuery}
          onResetSearch={() => setSearchQuery('')}
          onSelectHubTab={(tab) => handleSelectHubTab(tab, true)}
        />

        <HubSection
          activeTab={activeTab}
          onTabChange={(tab) => handleSelectHubTab(tab, false)}
        />

        <ShowcaseAndInfo
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onNavigateHub={(tab) => handleSelectHubTab(tab, true)}
        />
      </main>
    </div>
  );
}
