import React from 'react'
import Hero from '../components/Home/Hero'
import OriginStoryTeaser from '../components/Home/OriginStoryTeaser'
import AudienceGrid from '../components/Home/AudienceGrid'
import FeatureHighlightsSnippet from '../components/Home/FeatureHighlightsSnippet'
import CtaBanner from '../components/Home/CtaBanner'

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      <Hero />
      <OriginStoryTeaser />
      <AudienceGrid />
      <FeatureHighlightsSnippet />
      <CtaBanner />
    </div>
  )
}
