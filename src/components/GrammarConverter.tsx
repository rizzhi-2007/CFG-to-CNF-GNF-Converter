import { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { parseGrammar } from '@/lib/grammarParser';
import { convertToCNF, ConversionStep } from '@/lib/cnfConverter';
import { convertToGNF } from '@/lib/gnfConverter';
import { StepCard } from './StepCard';
import { GrammarDisplay } from './GrammarDisplay';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, BookOpen, Play, Sparkles, Zap, ArrowRight, GraduationCap } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { ThemeToggle } from './ThemeToggle';
import { LearnSection } from './LearnSection';

const SAMPLE_GRAMMARS = [
  { name: 'Simple', grammar: `S -> AB | a\nA -> aA | eps\nB -> bB | b` },
  { name: 'Unit & ε', grammar: `S -> ABA\nA -> aA | eps\nB -> bB | A` },
  { name: 'Arithmetic', grammar: `E -> E+T | T\nT -> T*F | F\nF -> (E) | a` },
];

export function GrammarConverter() {
  const [input, setInput] = useState('');
  const [cnfSteps, setCnfSteps] = useState<ConversionStep[] | null>(null);
  const [gnfSteps, setGnfSteps] = useState<ConversionStep[] | null>(null);
  const [showCnfSteps, setShowCnfSteps] = useState(true);
  const [showGnfSteps, setShowGnfSteps] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'cnf' | 'gnf' | null>(null);

  const handleConvert = useCallback((type: 'cnf' | 'gnf') => {
    setErrors([]);
    const { grammar, errors: parseErrors } = parseGrammar(input);

    if (parseErrors.length > 0) {
      setErrors(parseErrors.map(e => `Line ${e.line}: ${e.message}`));
      toast.error('Invalid grammar format');
      return;
    }

    if (!grammar) return;

    try {
      if (type === 'cnf') {
        const result = convertToCNF(grammar);
        setCnfSteps(result.steps);
        setActiveTab('cnf');
        toast.success('CNF conversion complete!');
      } else {
        const result = convertToGNF(grammar);
        setGnfSteps(result.steps);
        setActiveTab('gnf');
        toast.success('GNF conversion complete!');
      }
    } catch (err) {
      toast.error('Conversion error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [input]);

  const loadSample = (grammar: string) => {
    setInput(grammar);
    setCnfSteps(null);
    setGnfSteps(null);
    setErrors([]);
    setActiveTab(null);
    toast.info('Sample grammar loaded');
  };

  const renderSteps = (steps: ConversionStep[], type: 'cnf' | 'gnf', show: boolean, toggle: () => void) => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          {type === 'cnf' ? 'Chomsky Normal Form' : 'Greibach Normal Form'}
        </h2>
        <Button variant="outline" size="sm" onClick={toggle} className="rounded-full border-border/50 text-xs">
          {show ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
          {show ? 'Hide' : 'Show'} Steps
        </Button>
      </div>

      {/* Final result */}
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 result-glow">
        <div className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Final {type.toUpperCase()}
        </div>
        <GrammarDisplay grammarText={steps[steps.length - 1].grammar} />
      </div>

      {show && (
        <div className="space-y-0">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} total={steps.length} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      <HeroSection />

      <div className="container max-w-3xl mx-auto px-4 -mt-10 pb-20 space-y-6 relative z-10">
        {/* Input */}
        <div className="glass-card rounded-2xl p-6 space-y-4 card-shine">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
              </div>
              Grammar Input
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {SAMPLE_GRAMMARS.map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSample(s.grammar)}
                  className="rounded-full text-xs h-7 px-3 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder={`Enter your CFG (one rule per line):\nS -> AB | a\nA -> aA | eps\nB -> bB | b`}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm bg-muted/30 border-border/30 focus:border-primary/40 rounded-xl resize-none"
          />

          {errors.length > 0 && (
            <div className="rounded-xl bg-destructive/8 border border-destructive/15 p-3.5 space-y-0.5">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive">{e}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2.5">
            <Button
              onClick={() => handleConvert('cnf')}
              className="flex-1 h-11 rounded-xl text-sm font-semibold btn-glow shadow-md shadow-primary/15 transition-all"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Convert to CNF
            </Button>
            <Button
              onClick={() => handleConvert('gnf')}
              className="flex-1 h-11 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 btn-glow shadow-md shadow-accent/15 transition-all"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Convert to GNF
            </Button>
          </div>
        </div>

        {/* Results */}
        {cnfSteps && (activeTab === 'cnf' || activeTab === null) && (
          <div className="animate-slide-up">
            {renderSteps(cnfSteps, 'cnf', showCnfSteps, () => setShowCnfSteps(v => !v))}
          </div>
        )}

        {gnfSteps && (activeTab === 'gnf' || activeTab === null) && (
          <div className="animate-slide-up">
            {renderSteps(gnfSteps, 'gnf', showGnfSteps, () => setShowGnfSteps(v => !v))}
          </div>
        )}

        {cnfSteps && gnfSteps && (
          <div className="flex justify-center gap-2">
            <Button
              variant={activeTab === 'cnf' ? 'default' : 'outline'}
              onClick={() => setActiveTab('cnf')}
              className="rounded-full px-5 text-sm"
              size="sm"
            >
              View CNF
            </Button>
            <Button
              variant={activeTab === 'gnf' ? 'default' : 'outline'}
              onClick={() => setActiveTab('gnf')}
              className="rounded-full px-5 text-sm"
              size="sm"
            >
              View GNF
            </Button>
          </div>
        )}

        <LearnSection />

      </div>
    </div>
  );
}
