import { Grammar, Production, cloneGrammar, grammarToString, isVariable, isTerminal } from './grammarParser';

export interface ConversionStep {
  title: string;
  description: string;
  grammar: string;
  changes: string[];
}

export function convertToCNF(input: Grammar): { steps: ConversionStep[]; result: Grammar } {
  const steps: ConversionStep[] = [];
  let g = cloneGrammar(input);

  steps.push({
    title: 'Original Grammar',
    description: 'The input Context-Free Grammar before any transformations.',
    grammar: grammarToString(g),
    changes: [],
  });

  g = addNewStart(g, steps);
  g = removeEpsilonProductions(g, steps);
  g = removeUnitProductions(g, steps);
  g = removeUselessSymbols(g, steps);

  // Check if already in CNF before doing work
  const alreadyCNF = g.productions.every(p =>
    (p.body.length === 1 && isTerminal(p.body[0])) ||
    (p.body.length === 2 && isVariable(p.body[0]) && isVariable(p.body[1])) ||
    (p.body.length === 1 && p.body[0] === 'ε' && p.head === g.startSymbol)
  );

  if (alreadyCNF) {
    steps.push({
      title: 'Convert to Chomsky Normal Form',
      description: 'Grammar is already in CNF. No further transformations needed.',
      grammar: grammarToString(g),
      changes: ['Grammar already in proper CNF form.'],
    });
  } else {
    g = convertToProperCNF(g, steps);
  }

  return { steps, result: g };
}

function addNewStart(g: Grammar, steps: ConversionStep[]): Grammar {
  const startOnRHS = g.productions.some(p => p.body.includes(g.startSymbol));
  if (!startOnRHS) return g;

  const newStart = g.startSymbol + '0';
  g.variables.add(newStart);
  g.productions.unshift({ head: newStart, body: [g.startSymbol] });
  g.startSymbol = newStart;

  steps.push({
    title: 'Add New Start Symbol',
    description: `Start symbol appears on RHS. Added ${newStart} → ${g.productions[0].body.join('')}.`,
    grammar: grammarToString(g),
    changes: [`Added: ${newStart} → ${g.productions[0].body.join('')}`],
  });

  return g;
}

function removeEpsilonProductions(g: Grammar, steps: ConversionStep[]): Grammar {
  const nullable = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of g.productions) {
      if (!nullable.has(p.head) && p.body.every(s => s === 'ε' || nullable.has(s))) {
        nullable.add(p.head);
        changed = true;
      }
    }
  }

  if (nullable.size === 0) return g;

  const changes: string[] = [`Nullable: {${[...nullable].join(', ')}}`];

  const newProductions: Production[] = [];
  for (const p of g.productions) {
    if (p.body.length === 1 && p.body[0] === 'ε') continue;

    const combinations = generateCombinations(p.body, nullable);
    for (const combo of combinations) {
      if (combo.length === 0) continue;
      if (!newProductions.some(np => np.head === p.head && np.body.join('') === combo.join(''))) {
        newProductions.push({ head: p.head, body: combo });
      }
    }
  }

  if (nullable.has(g.startSymbol)) {
    if (!newProductions.some(np => np.head === g.startSymbol && np.body.length === 1 && np.body[0] === 'ε')) {
      newProductions.push({ head: g.startSymbol, body: ['ε'] });
      changes.push(`Start is nullable, keeping ${g.startSymbol} → ε`);
    }
  }

  g.productions = newProductions;

  steps.push({
    title: 'Remove ε-Productions',
    description: 'Remove ε-productions by generating all combinations without nullable variables.',
    grammar: grammarToString(g),
    changes,
  });

  return g;
}

function generateCombinations(body: string[], nullable: Set<string>): string[][] {
  if (body.length === 0) return [[]];

  const first = body[0];
  const rest = body.slice(1);
  const restCombos = generateCombinations(rest, nullable);

  const results: string[][] = [];
  for (const combo of restCombos) {
    results.push([first, ...combo]);
    if (nullable.has(first)) {
      results.push([...combo]);
    }
  }
  return results;
}

function removeUnitProductions(g: Grammar, steps: ConversionStep[]): Grammar {
  const unitProductions = g.productions.filter(
    p => p.body.length === 1 && isVariable(p.body[0]) && p.body[0] !== p.head
  );

  if (unitProductions.length === 0) return g;

  const changes: string[] = unitProductions.map(p => `Unit: ${p.head} → ${p.body[0]}`);

  // Compute unit closure
  const unitClosure = new Map<string, Set<string>>();
  for (const v of g.variables) {
    const closure = new Set<string>([v]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of g.productions) {
        if (closure.has(p.head) && p.body.length === 1 && isVariable(p.body[0]) && !closure.has(p.body[0])) {
          closure.add(p.body[0]);
          changed = true;
        }
      }
    }
    unitClosure.set(v, closure);
  }

  const newProductions: Production[] = [];
  for (const v of g.variables) {
    const closure = unitClosure.get(v)!;
    for (const u of closure) {
      for (const p of g.productions) {
        if (p.head === u && !(p.body.length === 1 && isVariable(p.body[0]))) {
          if (!newProductions.some(np => np.head === v && np.body.join('') === p.body.join(''))) {
            newProductions.push({ head: v, body: [...p.body] });
          }
        }
      }
    }
  }

  g.productions = newProductions;

  steps.push({
    title: 'Remove Unit Productions',
    description: 'Replace unit productions (A → B) with their transitive non-unit results.',
    grammar: grammarToString(g),
    changes,
  });

  return g;
}

function removeUselessSymbols(g: Grammar, steps: ConversionStep[]): Grammar {
  // Find generating
  const generating = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of g.productions) {
      if (!generating.has(p.head) && p.body.every(s => isTerminal(s) || s === 'ε' || generating.has(s))) {
        generating.add(p.head);
        changed = true;
      }
    }
  }

  const nonGenerating = [...g.variables].filter(v => !generating.has(v));

  let newProductions = g.productions.filter(
    p => generating.has(p.head) && p.body.every(s => isTerminal(s) || s === 'ε' || generating.has(s))
  );

  // Find reachable
  const reachable = new Set<string>([g.startSymbol]);
  changed = true;
  while (changed) {
    changed = false;
    for (const p of newProductions) {
      if (reachable.has(p.head)) {
        for (const s of p.body) {
          if (isVariable(s) && !reachable.has(s)) {
            reachable.add(s);
            changed = true;
          }
        }
      }
    }
  }

  const unreachable = [...g.variables].filter(v => generating.has(v) && !reachable.has(v));

  if (nonGenerating.length === 0 && unreachable.length === 0) return g;

  newProductions = newProductions.filter(p => reachable.has(p.head));
  g.variables = new Set([...g.variables].filter(v => generating.has(v) && reachable.has(v)));

  const newTerminals = new Set<string>();
  for (const p of newProductions) {
    for (const s of p.body) {
      if (isTerminal(s) && s !== 'ε') newTerminals.add(s);
    }
  }
  g.terminals = newTerminals;
  g.productions = newProductions;

  const changes: string[] = [];
  if (nonGenerating.length > 0) changes.push(`Non-generating: {${nonGenerating.join(', ')}}`);
  if (unreachable.length > 0) changes.push(`Unreachable: {${unreachable.join(', ')}}`);

  steps.push({
    title: 'Remove Useless Symbols',
    description: 'Remove non-generating and unreachable symbols.',
    grammar: grammarToString(g),
    changes,
  });

  return g;
}

function convertToProperCNF(g: Grammar, steps: ConversionStep[]): Grammar {
  const changes: string[] = [];

  // Step 1: Replace terminals in bodies of length >= 2, reusing variables for same terminal
  const terminalMap = new Map<string, string>();
  const newProductions: Production[] = [];
  let terminalVarCount = 1;

  for (const p of g.productions) {
    if (p.body.length === 1) {
      newProductions.push(p);
      continue;
    }

    const newBody: string[] = [];
    for (const s of p.body) {
      if (isTerminal(s)) {
        if (!terminalMap.has(s)) {
          let varName: string;
          do {
            varName = `T${terminalVarCount++}`;
          } while (g.variables.has(varName));
          terminalMap.set(s, varName);
          g.variables.add(varName);
          newProductions.push({ head: varName, body: [s] });
          changes.push(`${varName} → ${s}`);
        }
        newBody.push(terminalMap.get(s)!);
      } else {
        newBody.push(s);
      }
    }
    newProductions.push({ head: p.head, body: newBody });
  }

  // Step 2: Break long productions into binary, reusing intermediates where possible
  const binaryMap = new Map<string, string>(); // "A B" -> variable name
  let nextVar = 1;
  const finalProductions: Production[] = [];

  for (const p of newProductions) {
    if (p.body.length <= 2) {
      finalProductions.push(p);
      continue;
    }

    let current = p.head;
    const symbols = p.body;
    for (let i = 0; i < symbols.length - 2; i++) {
      const remaining = symbols.slice(i + 1).join(' ');
      let newVar: string;
      if (binaryMap.has(remaining)) {
        newVar = binaryMap.get(remaining)!;
        finalProductions.push({ head: current, body: [symbols[i], newVar] });
      } else {
        do {
          newVar = `X${nextVar++}`;
        } while (g.variables.has(newVar));
        g.variables.add(newVar);
        binaryMap.set(remaining, newVar);
        finalProductions.push({ head: current, body: [symbols[i], newVar] });
        changes.push(`${current} → ${symbols[i]}${newVar}`);
      }
      current = newVar;
    }
    finalProductions.push({
      head: current,
      body: [symbols[symbols.length - 2], symbols[symbols.length - 1]],
    });
  }

  g.productions = finalProductions;

  // Step 3: Minimize — merge variables with identical production sets
  minimizeGrammar(g, changes);

  steps.push({
    title: 'Convert to Chomsky Normal Form',
    description: 'Replace terminals in longer productions, break into binary, merge equivalent variables. Final: A → BC or A → a.',
    grammar: grammarToString(g),
    changes: changes.length > 0 ? changes : ['Grammar already in proper CNF form.'],
  });

  return g;
}

function minimizeGrammar(g: Grammar, changes: string[]) {
  // Merge variables with identical production sets
  let minimized = true;
  while (minimized) {
    minimized = false;
    const sigMap = new Map<string, string>();
    for (const v of g.variables) {
      const prods = g.productions
        .filter(p => p.head === v)
        .map(p => p.body.join(' '))
        .sort()
        .join('|');
      sigMap.set(v, prods);
    }

    const seen = new Map<string, string>();
    const mergeMap = new Map<string, string>();
    const orderedVars = [g.startSymbol, ...[...g.variables].filter(v => v !== g.startSymbol)];
    for (const v of orderedVars) {
      const sig = sigMap.get(v)!;
      if (sig === '') continue;
      if (seen.has(sig)) {
        mergeMap.set(v, seen.get(sig)!);
      } else {
        seen.set(sig, v);
      }
    }

    if (mergeMap.size > 0) {
      minimized = true;
      for (const [dup, canonical] of mergeMap) {
        changes.push(`Merged ${dup} into ${canonical}`);
        for (const p of g.productions) {
          p.body = p.body.map(s => s === dup ? canonical : s);
        }
        g.productions = g.productions.filter(p => p.head !== dup);
        g.variables.delete(dup);
      }
      // Deduplicate
      const unique: Production[] = [];
      for (const p of g.productions) {
        if (!unique.some(u => u.head === p.head && u.body.join('') === p.body.join(''))) {
          unique.push(p);
        }
      }
      g.productions = unique;
    }
  }

  // Remove unreachable
  const reachable = new Set<string>([g.startSymbol]);
  let reachChanged = true;
  while (reachChanged) {
    reachChanged = false;
    for (const p of g.productions) {
      if (reachable.has(p.head)) {
        for (const s of p.body) {
          if (isVariable(s) && !reachable.has(s)) {
            reachable.add(s);
            reachChanged = true;
          }
        }
      }
    }
  }
  const unreachableVars = [...g.variables].filter(v => !reachable.has(v));
  for (const v of unreachableVars) {
    g.variables.delete(v);
    g.productions = g.productions.filter(p => p.head !== v);
    changes.push(`Removed unreachable ${v}`);
  }

  // Final dedup
  const unique: Production[] = [];
  for (const p of g.productions) {
    if (!unique.some(u => u.head === p.head && u.body.join('') === p.body.join(''))) {
      unique.push(p);
    }
  }
  g.productions = unique;
}

export { minimizeGrammar };
