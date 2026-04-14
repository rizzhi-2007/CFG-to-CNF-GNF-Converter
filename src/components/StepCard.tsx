import { ConversionStep } from '@/lib/cnfConverter';
import { GrammarDisplay } from './GrammarDisplay';
import { Badge } from '@/components/ui/badge';

interface StepCardProps {
  step: ConversionStep;
  index: number;
  total: number;
}

export function StepCard({ step, index, total }: StepCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="glass-card rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-primary/15 card-shine">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/8 border border-primary/15 font-bold text-primary text-xs">
            {index + 1}
          </div>
          <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
          {isFirst && <Badge variant="secondary" className="text-[10px] rounded-full h-5 px-2">Input</Badge>}
          {isLast && <Badge className="text-[10px] bg-primary text-primary-foreground rounded-full h-5 px-2">Final</Badge>}
        </div>

        <p className="text-xs text-muted-foreground mb-3 leading-relaxed pl-9">{step.description}</p>

        <div className="pl-9">
          <GrammarDisplay grammarText={step.grammar} />
        </div>

        {step.changes.length > 0 && (
          <div className="mt-3 space-y-1 pl-9">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Changes</div>
            {step.changes.map((change, i) => (
              <div key={i} className="text-[11px] font-mono step-highlight">
                {change}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLast && (
        <div className="flex justify-center py-1">
          <div className="h-5 w-px bg-gradient-to-b from-primary/25 to-transparent" />
        </div>
      )}
    </div>
  );
}
