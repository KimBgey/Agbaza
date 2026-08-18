import { useEffect } from 'react'
import './landing.css'
import Header from './Header'
import Hero from './Hero'
import ProblemTicker from './ProblemTicker'
import SolutionPreview from './SolutionPreview'
import Features from './Features'
import PWASection from './PWASection'
import ComparisonTable from './ComparisonTable'
import Testimonials from './Testimonials'
import FinalCTA from './FinalCTA'
import ContactFooter from './ContactFooter'

export default function LandingPage() {
  // The mobile app shell pins html/body to a fixed 100% height (single
  // screen + internal scroll). The landing page is a long natural-scroll
  // document, so lift that constraint only while it's mounted.
  useEffect(() => {
    document.documentElement.classList.add('lp-active')
    document.body.classList.add('lp-active')
    return () => {
      document.documentElement.classList.remove('lp-active')
      document.body.classList.remove('lp-active')
    }
  }, [])

  return (
    <div className="lp">
      <Header />
      <Hero />
      <ProblemTicker />
      <SolutionPreview />
      <Features />
      <PWASection />
      <ComparisonTable />
      <Testimonials />
      <FinalCTA />
      <ContactFooter />
    </div>
  )
}
