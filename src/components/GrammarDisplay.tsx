import { isVariable, isTerminal } from '@/lib/grammarParser';

interface GrammarDisplayProps {
  grammarText: string;
  title?: string;
}

export function GrammarDisplay({ grammarText, title }: GrammarDisplayProps) {
  const lines = grammarText.split('\n').filter(l => l.trim());

  return (
    <div className="rounded-lg bg-muted/35 border border-border/30 p-3.5 font-mono text-xs">
      {title && <div className="mb-2 font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>}
      <div className="space-y-1">
        {lines.map((line, i) => (
          <GrammarLine key={i} line={line} />
        ))}
      </div>
    </div>
  );
}

function GrammarLine({ line }: { line: string }) {
  const match = line.match(/^([A-Z][A-Z0-9']*)\s*->\s*(.+)$/);
  if (!match) return <div>{line}</div>;

  const head = match[1];
  const bodyStr = match[2];
  const alternatives = bodyStr.split(' | ');

  return (
    <div className="flex items-start gap-1 py-0.5 hover:bg-muted/40 rounded px-2 -mx-2 transition-colors">
      <span className="grammar-variable">{head}</span>
      <span className="grammar-arrow mx-1">→</span>
      <span className="flex flex-wrap items-center gap-0">
        {alternatives.map((alt, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="grammar-arrow mx-1.5">|</span>}
            <BodyTokens body={alt.trim()} />
          </span>
        ))}
      </span>
    </div>
  );
}

function BodyTokens({ body }: { body: string }) {
  const tokens = tokenizeDisplay(body);
  return (
    <>
      {tokens.map((t, i) => {
        if (t === 'ε') return <span key={i} className="text-muted-foreground italic">ε</span>;
        if (isVariable(t)) return <span key={i} className="grammar-variable">{t}</span>;
        if (isTerminal(t)) return <span key={i} className="grammar-terminal">{t}</span>;
        return <span key={i}>{t}</span>;
      })}
    </>
  );
}

function tokenizeDisplay(body: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < body.length) {
    if (body[i] === ' ') { i++; continue; }
    if (body[i] === 'ε') { tokens.push('ε'); i++; continue; }
    if (body.substring(i, i + 3) === 'eps') { tokens.push('ε'); i += 3; continue; }
    if (body[i] >= 'A' && body[i] <= 'Z') {
      let token = body[i]; i++;
      while (i < body.length && (body[i] === "'")) {
        token += body[i]; i++;
      }
      tokens.push(token);
    } else {
      tokens.push(body[i]); i++;
    }
  }
  return tokens;
}
