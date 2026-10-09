import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useTodayTasks } from './hooks/useTodayTasks';
import { useUpcomingEvents } from './hooks/useUpcomingEvents';
import { useWellbeing } from './hooks/useWellbeing';
import { useRecentJournal } from './hooks/useRecentJournal';
import { summaryLine } from './utils/homeUtils';
import HomeHeader from './components/HomeHeader';
import AskAthena from './components/AskAthena';
import QuickActions from './components/QuickActions';
import TodayTasksCard from './components/TodayTasksCard';
import UpcomingEventsCard from './components/UpcomingEventsCard';
import WellbeingCard from './components/WellbeingCard';
import RecentJournalCard from './components/RecentJournalCard';
import MoodCheckInDialog from './components/MoodCheckInDialog';
import { AthenaSuggestsCard, FocusAreasCard } from './components/ComingSoonCards';

// Home dashboard: greeting, Ask Athena, shortcuts, and today's tasks, events,
// wellbeing and journal from the user's own data.
const Home = () => {
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const tasks = useTodayTasks();
  const events = useUpcomingEvents();
  const wellbeing = useWellbeing();
  const journal = useRecentJournal();
  const [checkInOpen, setCheckInOpen] = useState(false);

  // Sidebar "Mood Check-In" links here with { openMoodCheckIn: true }.
  useEffect(() => {
    if (location.state?.openMoodCheckIn) {
      setCheckInOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-10 pt-2 sm:px-6 lg:px-9">
      <HomeHeader firstName={user?.firstName || 'there'} summary={summaryLine(tasks)} />
      <AskAthena />
      <QuickActions onCheckMood={() => setCheckInOpen(true)} />

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-[1.12fr_1fr_0.92fr]">
        <TodayTasksCard {...tasks} onToggle={tasks.toggle} />
        <UpcomingEventsCard {...events} />
        <WellbeingCard {...wellbeing} onCheckIn={() => setCheckInOpen(true)} />
        <AthenaSuggestsCard />
        <RecentJournalCard {...journal} />
        <FocusAreasCard />
      </div>

      <MoodCheckInDialog open={checkInOpen} onClose={() => setCheckInOpen(false)} onSave={wellbeing.checkIn} />
    </div>
  );
};

export default Home;
