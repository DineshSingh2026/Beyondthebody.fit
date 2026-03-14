import {
  fetchAffirmations,
  fetchBrainTips,
  fetchConditions,
  fetchQuotes,
} from '@/lib/api';
import Loader from '@/components/Loader';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import PartnershipBanner from '@/components/PartnershipBanner';
import About from '@/components/About';
import Conditions from '@/components/Conditions';
import Services from '@/components/Services';
import BrainTips from '@/components/BrainTips';
import Affirmations from '@/components/Affirmations';
import Quotes from '@/components/Quotes';
import JoinSection from '@/components/JoinSection';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default async function HomePage() {
  const [affirmations, conditions, brainTips, quotes] = await Promise.all([
    fetchAffirmations(),
    fetchConditions(),
    fetchBrainTips(),
    fetchQuotes(),
  ]);

  return (
    <>
      <Loader />
      <div className="cursor" id="cursor" />
      <div className="cursor-follower" id="cursorFollower" />
      <Nav />
      <main>
        <Hero affirmations={affirmations} />
        <PartnershipBanner />
        <About />
        <Conditions conditions={conditions} />
        <Services />
        <BrainTips brainTips={brainTips} />
        <Affirmations affirmations={affirmations} />
        <Quotes quotes={quotes} />
        <JoinSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
