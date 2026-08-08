import Hero from '../../components/home/Hero';
import DashboardPreview from '../../components/home/DashboardPreview';
import AudienceGrid from '../../components/home/AudienceGrid';
import Testimonials from '../../components/home/Testimonials';
import FeatureHighlightsSnippet from '../../components/home/FeatureHighlightsSnippet';
import FaqSection from '../../components/home/FaqSection';
import CtaBanner from '../../components/home/CtaBanner';
import IntersectionLazyView from '../../components/common/IntersectionLazyView';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      <Hero />

      <IntersectionLazyView placeholderHeight="450px">
        <DashboardPreview />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="400px">
        <AudienceGrid />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="420px">
        <Testimonials />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="350px">
        <FeatureHighlightsSnippet />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="400px">
        <FaqSection />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="200px">
        <CtaBanner />
      </IntersectionLazyView>
    </div>
  )
}