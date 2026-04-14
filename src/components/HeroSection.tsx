import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="gradient-bg py-20 px-4">
      <div className="container max-w-3xl mx-auto text-center relative z-10">
        <div className="floating-orb w-56 h-56 bg-primary/15 -top-10 left-5" />
        <div className="floating-orb w-36 h-36 bg-accent/15 bottom-0 right-10" style={{ animationDelay: '4s' }} />

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-[1.1]" style={{ color: 'hsl(0 0% 100%)' }}>
          CFG
          <span className="inline-flex items-center mx-3 opacity-60"><ArrowRight className="h-8 w-8 md:h-12 md:w-12" /></span>
          <span className="bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            CNF & GNF
          </span>
        </h1>

        <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'hsl(230 15% 65%)' }}>
          Convert Context-Free Grammars to Chomsky & Greibach Normal Forms, step-by-step
        </p>
      </div>
    </div>
  );
}
