import { AFFIRMATIONS, BRAIN_TIPS, CONDITIONS, QUOTES } from '@/lib/home-data';
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

export default function HomePage() {
  const affirmations = AFFIRMATIONS;
  const conditions = CONDITIONS;
  const brainTips = BRAIN_TIPS;
  const quotes = QUOTES;

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
