import Hero from '../../components/home/Hero';
import OriginStoryTeaser from "../../components/home/OriginStoryTeaser";
import AudienceGrid from '../../components/home/AudienceGrid';
import FeatureHighlightsSnippet from '../../components/home/FeatureHighlightsSnippet';
import CtaBanner from '../../components/home/CtaBanner';
import IntersectionLazyView from '../../components/common/IntersectionLazyView';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      <Hero />

      <IntersectionLazyView placeholderHeight="250px">
        <OriginStoryTeaser />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="400px">
        <AudienceGrid />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="350px">
        <FeatureHighlightsSnippet />
      </IntersectionLazyView>

      <IntersectionLazyView placeholderHeight="200px">
        <CtaBanner />
      </IntersectionLazyView>
    </div>
  )
}