import { GraduationCap } from 'lucide-react';

export function LearnSection() {
  return (
    <div className="glass-card rounded-2xl p-6 card-shine">
      <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
          <GraduationCap className="h-3.5 w-3.5 text-accent" />
        </div>
        Learn Mode
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-4 hover:border-primary/20 transition-colors">
          <h3 className="font-semibold text-xs mb-1.5 text-primary flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-primary" />
            What is CNF?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Chomsky Normal Form</strong> — every production is either{' '}
            <code className="grammar-variable text-[10px]">A</code> →{' '}
            <code className="grammar-variable text-[10px]">BC</code> or{' '}
            <code className="grammar-variable text-[10px]">A</code> →{' '}
            <code className="grammar-terminal text-[10px]">a</code>. Essential for CYK parsing.
          </p>
        </div>
        <div className="rounded-xl bg-accent/[0.04] border border-accent/10 p-4 hover:border-accent/20 transition-colors">
          <h3 className="font-semibold text-xs mb-1.5 text-accent flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-accent" />
            What is GNF?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Greibach Normal Form</strong> — every production starts with a terminal:{' '}
            <code className="grammar-variable text-[10px]">A</code> →{' '}
            <code className="grammar-terminal text-[10px]">a</code>α. Useful for pushdown automata construction.
          </p>
        </div>
      </div>
    </div>
  );
}
