import { useEffect, useState } from 'react';
import { ScreenType } from './types/phonics';
import { HomeScreen } from './components/home/HomeScreen';
import { LetsPlayScreen } from './components/play/LetsPlayScreen';
import { ListenTalkScreen } from './components/play/ListenTalkScreen';
import { LetterSelectScreen } from './components/letter/LetterSelectScreen';
import { LetterDetailScreen } from './components/letter/LetterDetailScreen';
import { OxfordSoundsScreen } from './components/sounds/OxfordSoundsScreen';
import { SoundTrainScreen } from './components/train/SoundTrainScreen';
import { BubblePopScreen } from './components/game/BubblePopScreen';
import { FeedMiloScreen } from './components/game/FeedMiloScreen';
import { CurriculumMapScreen } from './components/curriculum/CurriculumMapScreen';
import { SoundPageScreen } from './components/curriculum/SoundPageScreen';
import { ParentGateModal } from './components/common/ParentGateModal';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeaserModal } from './components/common/TeaserModal';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedLetterId, setSelectedLetterId] = useState<string>('m');
  const [selectedGpcId, setSelectedGpcId] = useState<string>('gpc.s');
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isParentDashboardOpen, setIsParentDashboardOpen] = useState(false);
  const [teaser, setTeaser] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentScreen]);

  const handleStartPlay = () => {
    setCurrentScreen('lets-play');
  };

  const handleOpenListenTalk = () => {
    setCurrentScreen('listen-talk');
  };

  const handleOpenSoundTrain = () => {
    setCurrentScreen('sound-train');
  };

  const handleOpenBubblePop = () => {
    setCurrentScreen('bubble-pop');
  };

  const handleOpenFeedMilo = () => {
    setCurrentScreen('feed-milo');
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

  const handleOpenCurriculumMap = () => {
    setIsParentDashboardOpen(false);
    setCurrentScreen('curriculum-map');
  };

  const handleOpenSound = (gpcId: string) => {
    setSelectedGpcId(gpcId);
    setCurrentScreen('sound-page');
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
      {/* Screen Routing */}
      {currentScreen === 'home' && (
        <HomeScreen
          onStartPlay={handleStartPlay}
          onOpenListenTalk={handleOpenListenTalk}
          onOpenSoundTrain={handleOpenSoundTrain}
          onOpenBubblePop={handleOpenBubblePop}
          onOpenFeedMilo={handleOpenFeedMilo}
          onOpenLetters={handleOpenLetters}
          onOpenOxfordSounds={handleOpenOxfordSounds}
          onOpenParentGate={handleOpenParentGate}
          onTeaserClick={handleShowTeaser}
        />
      )}

      {currentScreen === 'bubble-pop' && (
        <BubblePopScreen
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === 'feed-milo' && (
        <FeedMiloScreen
          onGoHome={handleGoHome}
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

      {currentScreen === 'listen-talk' && (
        <ListenTalkScreen onGoHome={handleGoHome} />
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

      {currentScreen === 'curriculum-map' && (
        <CurriculumMapScreen onBack={handleGoHome} onOpenSound={handleOpenSound} />
      )}

      {currentScreen === 'sound-page' && (
        <SoundPageScreen gpcId={selectedGpcId} onBack={() => setCurrentScreen('curriculum-map')} />
      )}

      {/* Parent Gate Modal */}
      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onUnlock={handleParentGateUnlocked}
      />

      {/* Parent Dashboard Modal */}
      {isParentDashboardOpen && (
        <ParentDashboard
          onClose={() => setIsParentDashboardOpen(false)}
          onOpenCurriculumMap={handleOpenCurriculumMap}
        />
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
