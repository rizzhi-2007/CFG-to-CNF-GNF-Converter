export interface Production {
  head: string;
  body: string[];
}

export interface Grammar {
  variables: Set<string>;
  terminals: Set<string>;
  productions: Production[];
  startSymbol: string;
}

export interface ParseError {
  line: number;
  message: string;
}

export function parseGrammar(input: string): { grammar?: Grammar; errors: ParseError[] } {
  const errors: ParseError[] = [];
  const lines = input.trim().split('\n').filter(l => l.trim());

  if (lines.length === 0) {
    return { errors: [{ line: 0, message: 'Empty grammar input' }] };
  }

  const productions: Production[] = [];
  const variables = new Set<string>();
  const allSymbols = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^([A-Z][A-Z0-9']*)\s*->\s*(.+)$/);
    if (!match) {
      errors.push({ line: i + 1, message: `Invalid production format: "${line}". Expected: A -> α | β` });
      continue;
    }

    const head = match[1];
    variables.add(head);
    const bodies = match[2].split('|').map(b => b.trim());

    for (const body of bodies) {
      if (!body) {
        errors.push({ line: i + 1, message: `Empty production body in "${line}"` });
        continue;
      }
      const symbols = tokenize(body);
      symbols.forEach(s => allSymbols.add(s));
      productions.push({ head, body: symbols });
    }
  }

  if (errors.length > 0) return { errors };

  const terminals = new Set<string>();
  for (const s of allSymbols) {
    if (!variables.has(s)) {
      terminals.add(s);
    }
  }

  const startSymbol = productions[0]?.head || 'S';

  return {
    grammar: { variables, terminals, productions, startSymbol },
    errors: [],
  };
}

export function tokenize(body: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < body.length) {
    if (body[i] === ' ') { i++; continue; }
    if (body[i] === 'ε') {
      tokens.push('ε');
      i += 1;
      continue;
    }
    if (body.substring(i, i + 7) === 'epsilon') {
      tokens.push('ε');
      i += 7;
      continue;
    }
    if (body.substring(i, i + 3) === 'eps') {
      tokens.push('ε');
      i += 3;
      continue;
    }
    if (body[i] >= 'A' && body[i] <= 'Z') {
      let token = body[i];
      i++;
      while (i < body.length && body[i] === "'") {
        token += body[i];
        i++;
      }
      tokens.push(token);
    } else {
      tokens.push(body[i]);
      i++;
    }
  }
  return tokens;
}

export function grammarToString(g: Grammar): string {
  const grouped = new Map<string, string[][]>();
  for (const p of g.productions) {
    if (!grouped.has(p.head)) grouped.set(p.head, []);
    grouped.get(p.head)!.push(p.body);
  }

  const lines: string[] = [];
  // Start symbol first
  if (grouped.has(g.startSymbol)) {
    lines.push(`${g.startSymbol} -> ${grouped.get(g.startSymbol)!.map(b => b.join('')).join(' | ')}`);
  }
  for (const [head, bodies] of grouped) {
    if (head === g.startSymbol) continue;
    lines.push(`${head} -> ${bodies.map(b => b.join('')).join(' | ')}`);
  }
  return lines.join('\n');
}

export function cloneGrammar(g: Grammar): Grammar {
  return {
    variables: new Set(g.variables),
    terminals: new Set(g.terminals),
    productions: g.productions.map(p => ({ head: p.head, body: [...p.body] })),
    startSymbol: g.startSymbol,
  };
}

export function isVariable(s: string): boolean {
  return /^[A-Z][A-Z0-9']*$/.test(s);
}

export function isTerminal(s: string): boolean {
  return s !== 'ε' && !isVariable(s);
}
