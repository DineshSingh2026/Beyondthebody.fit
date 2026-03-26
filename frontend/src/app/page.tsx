import { AFFIRMATIONS, BRAIN_TIPS, CONDITIONS, QUOTES } from '@/lib/home-data';
import Loader from '@/components/Loader';
import Nav from '@/components/Nav';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Conditions from '@/components/Conditions';
import Services from '@/components/Services';
import PartnershipBanner from '@/components/PartnershipBanner';
import BrainTips from '@/components/BrainTips';
import Quotes from '@/components/Quotes';
import Affirmations from '@/components/Affirmations';
import SafeSpace from '@/components/SafeSpace';
import JoinSection from '@/components/JoinSection';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WelcomeGateway from '@/components/WelcomeGateway';

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
      <WelcomeGateway />
      <main>
        <DisclaimerBanner />
        <Hero affirmations={affirmations} />
        <About />
        <PartnershipBanner />
        <Conditions conditions={conditions} />
        <Services />
        <BrainTips brainTips={brainTips} hideBreathing />
        <Quotes quotes={quotes} />
        <Affirmations affirmations={affirmations} />
        <SafeSpace />
        <JoinSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
