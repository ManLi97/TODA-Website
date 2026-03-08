import React from 'react';
import FloatingNav from './components/ui/FloatingNav';
import Hero from './components/sections/Hero/Hero';
import PhoneApp from './components/sections/PhoneApp/PhoneApp';
import PainPoints from './components/sections/PainPoints/PainPoints';
import VideoSection from './components/sections/Video/Video';
import Testimonials from './components/sections/Testimonials/Testimonials';
import FAQ from './components/sections/FAQ/FAQ';
import Team from './components/sections/Team/Team';
import Footer from './components/sections/Footer/Footer';

function App() {
  return (
    <>
      <FloatingNav />
      <Hero />
      <PhoneApp />
      <PainPoints />
      <VideoSection />
      <Testimonials />
      <FAQ />
      <Team />
      <Footer />
    </>
  )
}

export default App;
