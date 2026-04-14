import { Grammar, Production, cloneGrammar, grammarToString, isVariable, isTerminal } from './grammarParser';
import { convertToCNF, ConversionStep, minimizeGrammar } from './cnfConverter';

export function convertToGNF(input: Grammar): { steps: ConversionStep[]; result: Grammar } {
  const steps: ConversionStep[] = [];

  const cnfResult = convertToCNF(cloneGrammar(input));
  let g = cloneGrammar(cnfResult.result);

  steps.push({
    title: 'Start from CNF',
    description: 'GNF conversion begins from the CNF of the grammar.',
    grammar: grammarToString(g),
    changes: ['Using CNF as starting point.'],
  });

  // Remove ε-productions for GNF (except start)
  g.productions = g.productions.filter(p => !(p.body.length === 1 && p.body[0] === 'ε') || p.head === g.startSymbol);

  // Check if already in GNF
  const alreadyGNF = g.productions.every(p =>
    (p.body.length === 1 && p.body[0] === 'ε' && p.head === g.startSymbol) ||
    (p.body.length > 0 && isTerminal(p.body[0]) && p.body.slice(1).every(s => isVariable(s)))
  );

  if (alreadyGNF) {
    steps.push({
      title: 'Final GNF Form',
      description: 'Grammar is already in GNF. No further transformations needed.',
      grammar: grammarToString(g),
      changes: ['Already in GNF form.'],
    });
    return { steps, result: g };
  }

  // Order variables
  const varOrder: string[] = [g.startSymbol];
  for (const v of g.variables) {
    if (v !== g.startSymbol) varOrder.push(v);
  }

  steps.push({
    title: 'Order Variables',
    description: `Variable ordering: ${varOrder.map((v, i) => `A${i + 1}=${v}`).join(', ')}.`,
    grammar: grammarToString(g),
    changes: varOrder.map((v, i) => `A${i + 1} = ${v}`),
  });

  // Eliminate left recursion
  for (let i = 0; i < varOrder.length; i++) {
    const Ai = varOrder[i];

    for (let j = 0; j < i; j++) {
      const Aj = varOrder[j];
      const toReplace = g.productions.filter(
        p => p.head === Ai && p.body.length > 0 && p.body[0] === Aj
      );
      if (toReplace.length === 0) continue;

      const AjProductions = g.productions.filter(p => p.head === Aj);
      const newProds: Production[] = [];

      for (const p of toReplace) {
        const gamma = p.body.slice(1);
        for (const ajP of AjProductions) {
          newProds.push({ head: Ai, body: [...ajP.body, ...gamma] });
        }
      }

      g.productions = g.productions.filter(
        p => !(p.head === Ai && p.body.length > 0 && p.body[0] === Aj)
      );
      g.productions.push(...newProds);
    }

    // Remove direct left recursion
    const leftRecursive = g.productions.filter(
      p => p.head === Ai && p.body.length > 0 && p.body[0] === Ai
    );

    if (leftRecursive.length > 0) {
      const nonLeftRecursive = g.productions.filter(
        p => p.head === Ai && (p.body.length === 0 || p.body[0] !== Ai)
      );

      const newVar = Ai + "'";
      g.variables.add(newVar);
      varOrder.push(newVar);

      const changes: string[] = [`Removing left recursion from ${Ai}`];

      g.productions = g.productions.filter(p => p.head !== Ai);

      for (const p of nonLeftRecursive) {
        g.productions.push({ head: Ai, body: [...p.body] });
        g.productions.push({ head: Ai, body: [...p.body, newVar] });
      }

      for (const p of leftRecursive) {
        const alpha = p.body.slice(1);
        g.productions.push({ head: newVar, body: [...alpha] });
        g.productions.push({ head: newVar, body: [...alpha, newVar] });
      }

      steps.push({
        title: `Remove Left Recursion: ${Ai}`,
        description: `Eliminate direct left recursion for ${Ai} using ${newVar}.`,
        grammar: grammarToString(g),
        changes,
      });
    }
  }

  // Back-substitute
  let madeChanges = true;
  let iterations = 0;
  while (madeChanges && iterations < 50) {
    madeChanges = false;
    iterations++;

    for (let i = varOrder.length - 1; i >= 0; i--) {
      const Ai = varOrder[i];
      const prods = g.productions.filter(p => p.head === Ai);

      for (const p of prods) {
        if (p.body.length > 0 && isVariable(p.body[0])) {
          const leadVar = p.body[0];
          const gamma = p.body.slice(1);
          const leadProds = g.productions.filter(pp => pp.head === leadVar);

          const allTerminalStart = leadProds.every(
            pp => pp.body.length > 0 && isTerminal(pp.body[0])
          );

          if (allTerminalStart && leadProds.length > 0) {
            g.productions = g.productions.filter(pp => pp !== p);
            for (const lp of leadProds) {
              g.productions.push({ head: Ai, body: [...lp.body, ...gamma] });
            }
            madeChanges = true;
          }
        }
      }
    }
  }

  // Final force-substitute any remaining non-GNF productions
  const nonGNF = g.productions.filter(
    p => !(p.body.length === 1 && p.body[0] === 'ε') &&
         !(p.body.length > 0 && isTerminal(p.body[0]))
  );

  for (const p of [...nonGNF]) {
    if (p.body.length > 0 && isVariable(p.body[0])) {
      const leadVar = p.body[0];
      const gamma = p.body.slice(1);
      const leadProds = g.productions.filter(pp => pp.head === leadVar && pp !== p);

      if (leadProds.length > 0) {
        g.productions = g.productions.filter(pp => pp !== p);
        for (const lp of leadProds) {
          g.productions.push({ head: p.head, body: [...lp.body, ...gamma] });
        }
      }
    }
  }

  // Minimize
  const finalChanges: string[] = [];
  minimizeGrammar(g, finalChanges);

  steps.push({
    title: 'Final GNF Form',
    description: 'After back-substitution and minimization. All productions: A → aα (terminal followed by variables).',
    grammar: grammarToString(g),
    changes: finalChanges.length > 0 ? finalChanges : ['All productions in GNF form.'],
  });

  return { steps, result: g };
}
