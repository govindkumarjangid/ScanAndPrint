import React from 'react'
import Hero from '../components/Home/Hero'
import OriginStoryTeaser from '../components/Home/OriginStoryTeaser'
import AudienceGrid from '../components/Home/AudienceGrid'
import FeatureHighlightsSnippet from '../components/Home/FeatureHighlightsSnippet'
import CtaBanner from '../components/Home/CtaBanner'
import IntersectionLazyView from '../components/common/IntersectionLazyView'

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Immediate Hero Section */}
      <Hero />

      {/* Scroll-Driven Lazy Loaded Sections */}
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
