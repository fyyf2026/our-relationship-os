import AIRelationshipCoach from "../components/AIRelationshipCoach.jsx";
import ConflictCenter from "../components/ConflictCenter.jsx";
import FutureVision from "../components/FutureVision.jsx";
import GratitudeWall from "../components/GratitudeWall.jsx";
import HeroSection from "../components/HeroSection.jsx";
import ImportantDates from "../components/ImportantDates.jsx";
import OurFootprints from "../components/OurFootprints.jsx";
import SharedNotes from "../components/SharedNotes.jsx";
import WishBox from "../components/WishBox.jsx";

export default function HomePage() {
  return (
    <main className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:px-8">
      <HeroSection />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)] lg:items-start">
        <div className="grid min-w-0 gap-6">
          <ImportantDates />
          <OurFootprints />
          <SharedNotes />
          <ConflictCenter />
          <FutureVision />
          <GratitudeWall />
        </div>

        <aside className="grid min-w-0 gap-6 lg:sticky lg:top-28">
          <AIRelationshipCoach />
          <WishBox />
        </aside>
      </div>
    </main>
  );
}
