# CFG to CNF & GNF Converter

## Project Overview

This project is a web-based educational tool designed to help understand how a Context-Free Grammar (CFG) can be systematically converted into:

- Chomsky Normal Form (CNF)
- Greibach Normal Form (GNF)

The application performs these transformations step-by-step, showing all intermediate stages. This makes it especially useful for learning concepts in Theory of Computation.

---

## Objectives

- To simplify complex grammar transformations
- To visualize each step involved in converting CFG → CNF and CFG → GNF
- To provide an interactive learning experience
- To eliminate manual errors during conversion

---

## Features

- Input any Context-Free Grammar
- Step-by-step conversion to Chomsky Normal Form (CNF)
- Step-by-step conversion to Greibach Normal Form (GNF)
- Displays intermediate grammars clearly
- Modern and responsive UI
- Clean and readable output format
- Error handling for invalid grammar input

---

## Supported Transformations

### CFG to CNF Conversion Steps

1. Removal of Null (ε) productions
2. Removal of Unit productions
3. Removal of Useless symbols
4. Conversion into proper CNF rules:
   - A → BC
   - A → a

---

### CFG to GNF Conversion Steps

1. Elimination of left recursion
2. Conversion into rules of form:
   - A → aα
     (where `a` is a terminal and `α` is a string of variables)

---

## Tech Stack

- Frontend: React + TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- UI Components: ShadCN UI
- Testing: Vitest / Playwright

---

## Input Format

Enter grammar rules in this format:

```
S -> AB | a
A -> aA | ε
B -> bB | b
```

### Rules:

- Use `->` for production
- Use `|` for alternatives
- Use `ε` for empty string

---

## UI Highlights

- Glassmorphism / modern design
- Smooth animations
- Clean layout for better readability
- Responsive across devices

---

## Educational Value

This project helps students:

- Understand formal grammar transformations
- Practice compiler design concepts
- Visualize theoretical steps practically

---

## Author

Riddhi Tanwar

---

## License

# This project is for educational purposes.

---
