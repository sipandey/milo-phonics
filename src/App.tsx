import { useState } from 'react';
import { ScreenType } from './types/phonics';
import { HomeScreen } from './components/home/HomeScreen';
import { LetsPlayScreen } from './components/play/LetsPlayScreen';
import { LetterSelectScreen } from './components/letter/LetterSelectScreen';
import { LetterDetailScreen } from './components/letter/LetterDetailScreen';
import { OxfordSoundsScreen } from './components/sounds/OxfordSoundsScreen';
import { SoundTrainScreen } from './components/train/SoundTrainScreen';
import { ParentGateModal } from './components/common/ParentGateModal';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeaserModal } from './components/common/TeaserModal';
import { FloatingBubblesBackground } from './components/common/ParticleEffects';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedLetterId, setSelectedLetterId] = useState<string>('m');
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);
  const [teaser, setTeaser] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleStartPlay = () => {
    setCurrentScreen('lets-play');
  };

  const handleOpenSoundTrain = () => {
    setCurrentScreen('sound-train');
  };

  const handleOpenLetters = () => {
    setCurrentScreen('letters');
  };

  const handleOpenOxfordSounds = () => {
    setCurrentScreen('oxford-sounds');
  };

  const handleSelectLetter = (letterId: string) => {
    setSelectedLetterId(letterId);
    setCurrentScreen('letter-detail');
  };

  const handleGoHome = () => {
    setCurrentScreen('home');
  };

  const handleOpenParentGate = () => {
    setIsParentGateOpen(true);
  };

  const handleParentGateUnlocked = () => {
    setIsParentGateOpen(false);
    setIsParentDashboardOpen(true);
  };

  const handleShowTeaser = (title: string, message: string) => {
    setTeaser({
      isOpen: true,
      title,
      message,
    });
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-yellow-50/70 overflow-x-hidden font-fun">
      {/* Gentle Floating Ambient Background */}
      <FloatingBubblesBackground />

      {/* Screen Routing */}
      {currentScreen === 'home' && (
        <HomeScreen
          onStartPlay={handleStartPlay}
          onOpenSoundTrain={handleOpenSoundTrain}
          onOpenLetters={handleOpenLetters}
          onOpenOxfordSounds={handleOpenOxfordSounds}
          onOpenParentGate={handleOpenParentGate}
          onTeaserClick={handleShowTeaser}
        />
      )}

      {currentScreen === 'sound-train' && (
        <SoundTrainScreen
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === 'lets-play' && (
        <LetsPlayScreen
          onGoHome={handleGoHome}
          onExploreLetter={handleSelectLetter}
          onOpenSoundTrain={handleOpenSoundTrain}
        />
      )}

      {currentScreen === 'letters' && (
        <LetterSelectScreen
          onSelectLetter={handleSelectLetter}
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === 'letter-detail' && (
        <LetterDetailScreen
          letterId={selectedLetterId}
          onBack={handleOpenLetters}
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === 'oxford-sounds' && (
        <OxfordSoundsScreen
          onGoHome={handleGoHome}
        />
      )}

      {/* Parent Gate Modal */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onUnlock={handleParentGateUnlocked}
      />

      {/* Parent Dashboard Modal */}
      {isParentDashboardOpen && (
        <ParentDashboard onClose={() => setIsParentDashboardOpen(false)} />
      )}

      {/* Teaser Modal for upcoming Safari & Stories */}
      <TeaserModal
        isOpen={teaser.isOpen}
        title={teaser.title}
        message={teaser.message}
        onClose={() => setTeaser({ isOpen: false, title: '', message: '' })}
      />
    </div>
  );
}

export default App;
