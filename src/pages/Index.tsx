import { useState, useCallback } from 'react'; 
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ListScreen } from '@/components/screens/ListScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { PrayerTimesScreen } from '@/components/screens/PrayerTimesScreen';
import { QiblaCompassScreen } from '@/components/screens/QiblaCompassScreen';
import { AddDhikrModal } from '@/components/modals/AddDhikrModal';
import { AddDuaModal } from '@/components/modals/AddDuaModal';
import { useDhikrStore } from '@/hooks/useDhikrStore';
import { useAudio } from '@/hooks/useAudio';
import { useToast } from '@/hooks/use-toast';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useNotifications } from '@/hooks/useNotifications';

type Tab = 'home' | 'list' | 'settings' | 'prayer' | 'qibla';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [addDhikrOpen, setAddDhikrOpen] = useState(false);
  const [addDuaOpen, setAddDuaOpen] = useState(false);
  const { toast } = useToast();
  const { playClickSound, vibrate } = useAudio();

  const {
    state,
    getActiveCount,
    getActiveTarget,
    getActiveName,
    increment,
    resetCounter,
    saveCount,
    setActiveDhikr,
    addDhikr,
    deleteDhikr,
    addDua,
    deleteDua,
    updateSettings,
    factoryReset,
    getTodayDhikr,
    addDhikrToDay,
    deleteDhikrFromDay,
    incrementDayDhikr,
    resetDayDhikr,
    setDayNumberOffset,
    setActiveDailyDhikrItem,
    getActiveDailyDhikrItem,
    isDailyDhikrMode,
    getTodayDateString,
  } = useDhikrStore();

  // Get today's dhikr to check if user has done dhikr
  const todayDhikr = getTodayDhikr();
  const hasDoneDhikrToday = todayDhikr ? todayDhikr.dhikrs.some(d => d.count > 0) : false;
  
  // Get active daily dhikr item for home screen
  const activeDailyDhikrItem = getActiveDailyDhikrItem();
  const isInDailyMode = isDailyDhikrMode();

  // Prayer times for salat reminders and details
  const prayerTimesState = usePrayerTimes({
    enabled: state.settings.azanEnabled,
    sound: state.settings.azanSound,
    vibrate: state.settings.azanVibrate,
    prayerNotifications: state.settings.prayerNotifications,
    prayerMethod: state.settings.prayerMethod,
    customAzanUrl: state.settings.customAzanUrl,
    selectedCountry: state.settings.selectedCountry,
    useAutoLocation: state.settings.useAutoLocation,
  });

  const prayerTimes = prayerTimesState.times;

  // Initialize notifications
  useNotifications({
    dhikrReminderEnabled: state.settings.dhikrReminderEnabled,
    salatReminderEnabled: state.settings.salatReminderEnabled,
    prayerTimes,
    hasDoneDhikrToday,
    vibrate: state.settings.vibrate,
  });

  // Unified increment handler - works with daily dhikr mode or old system
  const handleIncrement = useCallback(() => {
    const todayStr = getTodayDateString();
    
    if (isInDailyMode && activeDailyDhikrItem) {
      // Daily dhikr mode - increment today's active dhikr
      incrementDayDhikr(todayStr, activeDailyDhikrItem.id);
      
      const newCount = activeDailyDhikrItem.count + 1;
      const target = activeDailyDhikrItem.target;
      
      if (state.settings.vibrate) {
        if (newCount > 0 && newCount % target === 0) {
          vibrate([50, 50, 50], state.settings.vibrateIntensity);
        } else {
          vibrate(30, state.settings.vibrateIntensity);
        }
      }
    } else {
      // Old system mode
      increment();
      
      const newCount = getActiveCount() + 1;
      const target = getActiveTarget();
      
      if (state.settings.vibrate) {
        if (newCount > 0 && newCount % target === 0) {
          vibrate([50, 50, 50], state.settings.vibrateIntensity);
        } else {
          vibrate(30, state.settings.vibrateIntensity);
        }
      }
    }
    
    if (state.settings.sound) {
      playClickSound();
    }
  }, [isInDailyMode, activeDailyDhikrItem, incrementDayDhikr, increment, getActiveCount, getActiveTarget, state.settings, vibrate, playClickSound, getTodayDateString]);

  // Unified reset handler
  const handleReset = useCallback(() => {
    const todayStr = getTodayDateString();
    
    if (isInDailyMode && activeDailyDhikrItem) {
      resetDayDhikr(todayStr, activeDailyDhikrItem.id);
      toast({
        title: "Counter Reset",
        description: `${activeDailyDhikrItem.title} has been reset to 0`,
      });
    } else {
      resetCounter();
      toast({
        title: "Counter Reset",
        description: `${getActiveName()} has been reset to 0`,
      });
    }
  }, [isInDailyMode, activeDailyDhikrItem, resetDayDhikr, resetCounter, getActiveName, toast, getTodayDateString]);

  const handleSave = useCallback(() => {
    saveCount();
    const name = isInDailyMode && activeDailyDhikrItem ? activeDailyDhikrItem.title : getActiveName();
    toast({
      title: "Count Saved",
      description: `Progress saved for ${name}`,
    });
  }, [saveCount, isInDailyMode, activeDailyDhikrItem, getActiveName, toast]);

  const handleAddDhikr = useCallback((title: string, target: number) => {
    addDhikr({ title, target });
    setActiveTab('home');
    toast({
      title: "Dhikr Added",
      description: `${title} has been added to your list`,
    });
  }, [addDhikr, toast]);

  const handleAddDua = useCallback((arabic: string, desc: string) => {
    addDua({ arabic, desc });
    toast({
      title: "Dua Added",
      description: "Your dua has been saved",
    });
  }, [addDua, toast]);

  const handleDeleteDhikr = useCallback((id: string) => {
    deleteDhikr(id);
    toast({
      title: "Dhikr Deleted",
      description: "Dhikr has been removed",
    });
  }, [deleteDhikr, toast]);

  const handleDeleteDua = useCallback((id: string) => {
    deleteDua(id);
    toast({
      title: "Dua Deleted",
      description: "Dua has been removed",
    });
  }, [deleteDua, toast]);

  const handleFactoryReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      factoryReset();
      setActiveTab('home');
      toast({
        title: "Data Reset",
        description: "All data has been cleared",
      });
    }
  }, [factoryReset, toast]);

  // Handle selecting old system dhikr (clears daily mode)
  const handleSelectDhikr = useCallback((id: string | null) => {
    setActiveDailyDhikrItem(null); // Clear daily mode
    setActiveDhikr(id === '' ? null : id);
  }, [setActiveDhikr, setActiveDailyDhikrItem]);

  // Handle selecting a dhikr from today's daily card
  const handleSelectDailyDhikr = useCallback((dhikrId: string) => {
    setActiveDailyDhikrItem(dhikrId);
    setActiveTab('home');
    toast({
      title: "Dhikr Selected",
      description: "Now counting on Home screen",
    });
  }, [setActiveDailyDhikrItem, toast]);

  // Get display values based on mode
  const displayCount = isInDailyMode && activeDailyDhikrItem ? activeDailyDhikrItem.count : getActiveCount();
  const displayTarget = isInDailyMode && activeDailyDhikrItem ? activeDailyDhikrItem.target : getActiveTarget();
  const displayName = isInDailyMode && activeDailyDhikrItem ? activeDailyDhikrItem.title : getActiveName();

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      <Header />

      <div className="w-full max-w-md landscape:max-w-2xl h-full pt-20 landscape:pt-12 pb-24 landscape:pb-18 relative flex flex-col transition-all duration-300">
        {activeTab === 'home' && (
          <HomeScreen
            count={displayCount}
            target={displayTarget}
            name={displayName}
            vibrateEnabled={state.settings.vibrate}
            soundEnabled={state.settings.sound}
            todayDhikr={getTodayDhikr()}
            activeDailyDhikrItem={activeDailyDhikrItem}
            isInDailyMode={isInDailyMode}
            onIncrement={handleIncrement}
            onReset={handleReset}
            onSave={handleSave}
            onToggleVibrate={() => updateSettings({ vibrate: !state.settings.vibrate })}
            onToggleSound={() => updateSettings({ sound: !state.settings.sound })}
            onSelectDailyDhikr={handleSelectDailyDhikr}
          />
        )}

        {activeTab === 'list' && (
          <ListScreen
            dhikrs={state.dhikrs}
            duas={state.duas}
            dailyDhikrs={state.dailyDhikrs}
            activeDhikrId={state.activeDhikrId}
            activeDailyDhikrId={state.dailyDhikrSettings.activeDailyDhikrId}
            onSelectDhikr={handleSelectDhikr}
            onSelectDailyDhikr={handleSelectDailyDhikr}
            onDeleteDhikr={handleDeleteDhikr}
            onDeleteDua={handleDeleteDua}
            onOpenAddDhikr={() => setAddDhikrOpen(true)}
            onOpenAddDua={() => setAddDuaOpen(true)}
            onGoHome={() => setActiveTab('home')}
            onAddDhikrToDay={addDhikrToDay}
            onDeleteDhikrFromDay={deleteDhikrFromDay}
            onIncrementDayDhikr={incrementDayDhikr}
            onResetDayDhikr={resetDayDhikr}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            vibrateEnabled={state.settings.vibrate}
            vibrateIntensity={state.settings.vibrateIntensity}
            soundEnabled={state.settings.sound}
            reminderEnabled={state.settings.reminderNotification}
            darkMode={state.settings.darkMode}
            dayNumberOffset={state.dailyDhikrSettings.dayNumberOffset || 0}
            dhikrReminderEnabled={state.settings.dhikrReminderEnabled}
            salatReminderEnabled={state.settings.salatReminderEnabled}
            onToggleVibrate={(checked) => updateSettings({ vibrate: checked })}
            onVibrateIntensityChange={(intensity) => updateSettings({ vibrateIntensity: intensity })}
            onToggleSound={(checked) => updateSettings({ sound: checked })}
            onToggleReminder={(checked) => updateSettings({ reminderNotification: checked })}
            onToggleDarkMode={(checked) => updateSettings({ darkMode: checked })}
            onSetDayNumberOffset={setDayNumberOffset}
            onToggleDhikrReminder={(checked) => updateSettings({ dhikrReminderEnabled: checked })}
            onToggleSalatReminder={(checked) => updateSettings({ salatReminderEnabled: checked })}
            onFactoryReset={handleFactoryReset}
          />
        )}

        {activeTab === 'prayer' && (
          <PrayerTimesScreen
            prayerNotifications={state.settings.prayerNotifications}
            azanEnabled={state.settings.azanEnabled}
            azanSound={state.settings.azanSound}
            azanVibrate={state.settings.azanVibrate}
            prayerMethod={state.settings.prayerMethod}
            customAzanUrl={state.settings.customAzanUrl}
            selectedCountry={state.settings.selectedCountry}
            useAutoLocation={state.settings.useAutoLocation}
            times={prayerTimesState.times}
            loading={prayerTimesState.loading}
            error={prayerTimesState.error}
            location={prayerTimesState.location}
            date={prayerTimesState.date}
            hijriDate={prayerTimesState.hijriDate}
            nextPrayer={prayerTimesState.nextPrayer}
            timeToNext={prayerTimesState.timeToNext}
            refresh={prayerTimesState.refresh}
            forceRefresh={prayerTimesState.forceRefresh}
            isLocationLocked={prayerTimesState.isLocationLocked}
            getTimeUntilUnlock={prayerTimesState.getTimeUntilUnlock}
            onTogglePrayerNotifications={(checked) => updateSettings({ prayerNotifications: checked })}
            onToggleAzan={(checked) => updateSettings({ azanEnabled: checked })}
            onToggleAzanSound={(checked) => updateSettings({ azanSound: checked })}
            onToggleAzanVibrate={(checked) => updateSettings({ azanVibrate: checked })}
            onChangePrayerMethod={(method) => updateSettings({ prayerMethod: method })}
            onChangeCustomAzanUrl={(url) => updateSettings({ customAzanUrl: url })}
            onChangeSelectedCountry={(country) => updateSettings({ selectedCountry: country })}
            onToggleAutoLocation={(checked) => updateSettings({ useAutoLocation: checked })}
          />
        )}

        {activeTab === 'qibla' && (
          <QiblaCompassScreen />
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <AddDhikrModal
        isOpen={addDhikrOpen}
        onClose={() => setAddDhikrOpen(false)}
        onSave={handleAddDhikr}
      />

      <AddDuaModal
        isOpen={addDuaOpen}
        onClose={() => setAddDuaOpen(false)}
        onSave={handleAddDua}
      />
    </div>
  );
};

export default Index;