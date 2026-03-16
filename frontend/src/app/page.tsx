import {
  fetchAffirmations,
  fetchBrainTips,
  fetchConditions,
  fetchQuotes,
} from '@/lib/api';
import Loader from '@/components/Loader';
import Nav from '@/components/Nav';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Hero from '@/components/Hero';
import PartnershipBanner from '@/components/PartnershipBanner';
import About from '@/components/About';
import Conditions from '@/components/Conditions';
import Services from '@/components/Services';
import MoodQuiz from '@/components/MoodQuiz';
import BrainTips from '@/components/BrainTips';
import Affirmations from '@/components/Affirmations';
import Quotes from '@/components/Quotes';
import SafeSpace from '@/components/SafeSpace';
import JoinSection from '@/components/JoinSection';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const FALLBACK = {
  affirmations: ['I am worthy of healing and growth.', 'Every step forward counts.'],
  conditions: [{ name: 'Anxiety', fact: 'Anxiety is treatable.', treatment: 'Therapy and lifestyle.', signs: ['Worry', 'Restlessness'], treatments: ['Therapy', 'Breathing'], color: '#5BB89A' }],
  brainTips: [{ title: 'Box Breathing', description: 'Inhale 4s, hold 4s, exhale 4s.', category: 'Breathing', icon: '🫁' }],
  quotes: [{ quote_text: 'Healing is not linear.', author: 'Unknown' }],
};

export default async function HomePage() {
  let affirmations: string[];
  let conditions: { name: string; fact: string; treatment: string; signs: string[]; treatments: string[]; color: string }[];
  let brainTips: { title: string; description: string; category: string; icon: string }[];
  let quotes: { quote_text: string; author: string }[];
  try {
    const [a, c, b, q] = await Promise.all([
      fetchAffirmations(),
      fetchConditions(),
      fetchBrainTips(),
      fetchQuotes(),
    ]);
    affirmations = a;
    conditions = c;
    brainTips = b;
    quotes = q;
  } catch {
    affirmations = FALLBACK.affirmations;
    conditions = FALLBACK.conditions;
    brainTips = FALLBACK.brainTips;
    quotes = FALLBACK.quotes;
  }

  return (
    <>
      <Loader />
      <div className="cursor" id="cursor" />
      <div className="cursor-follower" id="cursorFollower" />
      <Nav />
      <main>
        <DisclaimerBanner />
        <Hero affirmations={affirmations} />
        <PartnershipBanner />
        <About />
        <Conditions conditions={conditions} />
        <Services />
        <MoodQuiz />
        <BrainTips brainTips={brainTips} />
        <Affirmations affirmations={affirmations} />
        <Quotes quotes={quotes} />
        <SafeSpace />
        <JoinSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
