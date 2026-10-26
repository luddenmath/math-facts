/* ============================================================
   LUDMATH — MATH FACTS PRACTICE
   Version 2.0.0

   Main sections:
   - Arithmetic
   - Algebra
   - Logic

   Session modes:
   - Timed: 30-second increments
   - Question Count: increments of 5
   - Infinite: no automatic ending

   Statistics:
   - Current streak
   - Best streak
   - Total correct
   - Total incorrect
   - Total attempted

   No images or external libraries required.
   Requires an element with id="app".
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const VERSION = "2.0.0";
  const app = document.getElementById("app");

  if (!app) {
    console.error('Math Facts requires an element with id="app".');
    return;
  }

  /* ==========================================================
     GLOBAL STATE
     ========================================================== */

  const stats = {
    currentStreak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalAttempted: 0
  };

  const state = {
    page: "home",
    section: "arithmetic",
    category: "all",
    mode: "infinite",
    duration: 60,
    questionLimit: 20,
    allowPositive: true,
    allowNegative: true,
    selectedOperations: new Set([
      "addition",
      "subtraction",
      "multiplication",
      "division"
    ]),
    selectedCategories: new Set(),
    question: null,
    sessionAttempted: 0,
    sessionCorrect: 0,
    secondsRemaining: 60,
    locked: false,
    running: false,
    timer: null,
    nextQuestionTimeout: null,
    feedback: ""
  };

  /* ==========================================================
     STYLES
     ========================================================== */

  const style = document.createElement("style");

  style.id = "ludmath-practice-styles";

  style.textContent = `
    #app {
      font-family: Arial, Helvetica, sans-serif;
      color: #172033;
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
    }

    #app *,
    #app *::before,
    #app *::after {
      box-sizing: border-box;
    }

    #app .lm-shell {
      width: min(100%, 1050px);
      margin: 0 auto;
      padding: 22px;
    }

    #app .lm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }

    #app .lm-brand {
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: .04em;
    }

    #app .lm-version {
      color: #738096;
      font-size: .8rem;
    }

    #app .lm-title {
      font-size: clamp(2rem, 5vw, 3.3rem);
      line-height: 1.1;
      margin: 0 0 12px;
      letter-spacing: -.04em;
    }

    #app .lm-subtitle {
      color: #68758b;
      line-height: 1.6;
      margin: 0 0 26px;
    }

    #app .lm-section-title {
      font-size: 1.35rem;
      margin: 26px 0 14px;
    }

    #app .lm-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    #app .lm-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    #app .lm-card {
      background: #fff;
      border: 2px solid #e1e7f0;
      border-radius: 22px;
      padding: 22px;
      min-width: 0;
    }

    #app .lm-choice {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      text-align: left;
      min-height: 135px;
      padding: 22px;
      border: 2px solid #dce4ef;
      border-radius: 24px;
      background: #fff;
      color: #172033;
      cursor: pointer;
      transition: border-color .15s, background .15s,
                  transform .15s;
    }

    #app .lm-choice:hover {
      border-color: #7188db;
      background: #f6f8ff;
      transform: translateY(-2px);
    }

    #app .lm-choice.selected {
      border-color: #5269c8;
      background: #eef1ff;
    }

    #app .lm-choice strong {
      font-size: 1.15rem;
      margin-bottom: 8px;
    }

    #app .lm-choice span {
      color: #69758a;
      line-height: 1.45;
      font-size: .92rem;
    }

    #app .lm-button {
      border: 0;
      border-radius: 18px;
      padding: 14px 20px;
      background: #5269c8;
      color: white;
      font-weight: 750;
      font-size: 1rem;
      cursor: pointer;
    }

    #app .lm-button:hover {
      background: #4055ae;
    }

    #app .lm-button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    #app .lm-button.secondary {
      background: #e9edf5;
      color: #253149;
    }

    #app .lm-button.secondary:hover {
      background: #dce3ef;
    }

    #app .lm-button.danger {
      background: #b93d50;
    }

    #app .lm-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }

    #app .lm-option-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    #app .lm-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px;
      border: 1px solid #dce4ef;
      border-radius: 14px;
      background: #fff;
      cursor: pointer;
      line-height: 1.4;
    }

    #app .lm-option:has(input:checked) {
      background: #eef1ff;
      border-color: #7188db;
    }

    #app .lm-option input {
      width: 18px;
      height: 18px;
      accent-color: #5269c8;
      flex-shrink: 0;
    }

    #app .lm-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
    }

    #app .lm-field label {
      font-weight: 750;
    }

    #app .lm-field select,
    #app .lm-field input {
      width: 100%;
      padding: 13px;
      border: 1px solid #cbd4e2;
      border-radius: 12px;
      background: white;
      color: #172033;
      font: inherit;
    }

    #app .lm-stat-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 9px;
    }

    #app .lm-stat {
      padding: 14px 8px;
      border-radius: 15px;
      background: #f0f3f9;
      text-align: center;
      min-width: 0;
    }

    #app .lm-stat-value {
      display: block;
      font-size: clamp(1.25rem, 3vw, 2rem);
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    #app .lm-stat-label {
      display: block;
      font-size: .76rem;
      color: #68758b;
      margin-top: 6px;
      line-height: 1.3;
    }

    #app .lm-practice {
      text-align: center;
    }

    #app .lm-progress {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      color: #68758b;
      margin-bottom: 18px;
    }

    #app .lm-clock {
      font-size: 1.25rem;
      font-weight: 800;
      color: #5269c8;
    }

    #app .lm-question {
      font-size: clamp(2.5rem, 9vw, 5rem);
      font-weight: 850;
      letter-spacing: -.035em;
      margin: 30px 0;
      overflow-wrap: anywhere;
    }

    #app .lm-answer-row {
      display: flex;
      justify-content: center;
      gap: 10px;
      max-width: 530px;
      margin: 0 auto;
    }

    #app .lm-answer {
      min-width: 0;
      width: 100%;
      padding: 16px;
      border: 2px solid #dce4ef;
      border-radius: 16px;
      font-size: 1.35rem;
      text-align: center;
    }

    #app .lm-feedback {
      min-height: 32px;
      margin: 18px 0;
      font-weight: 750;
    }

    #app .lm-feedback.correct {
      color: #16804a;
    }

    #app .lm-feedback.incorrect {
      color: #bf334b;
    }

    #app .lm-feedback.neutral {
      color: #68758b;
    }

    #app .lm-small {
      color: #68758b;
      font-size: .88rem;
      line-height: 1.5;
    }

    #app .lm-hidden {
      display: none !important;
    }

    #app .lm-result-number {
      font-size: clamp(2.5rem, 7vw, 4.5rem);
      font-weight: 850;
      margin: 15px 0;
    }

    #app .lm-bar {
      height: 9px;
      background: #e6eaf2;
      border-radius: 99px;
      overflow: hidden;
      margin-top: 10px;
    }

    #app .lm-bar-fill {
      height: 100%;
      background: #5269c8;
      width: 0;
      transition: width .2s;
    }

    @media (max-width: 620px) {
      #app .lm-shell {
        padding: 15px;
      }

      #app .lm-grid,
      #app .lm-grid-3 {
        grid-template-columns: 1fr;
      }

      #app .lm-choice {
        min-height: 100px;
      }

      #app .lm-stat-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      #app .lm-stat:last-child {
        grid-column: 1 / -1;
      }

      #app .lm-answer-row {
        flex-direction: column;
      }

      #app .lm-question {
        margin: 24px 0;
      }
    }
  `;

  if (!document.getElementById(style.id)) {
    document.head.appendChild(style);
  }

  /* ==========================================================
     CATEGORY DEFINITIONS
     ========================================================== */

  const arithmeticOperations = [
    { id: "addition", label: "Addition", symbol: "+" },
    { id: "subtraction", label: "Subtraction", symbol: "−" },
    { id: "multiplication", label: "Multiplication", symbol: "×" },
    { id: "division", label: "Division", symbol: "÷" }
  ];

  const categories = {
    arithmetic: [
      {
        id: "all",
        title: "All Arithmetic Practice",
        description: "Practice all four operations together."
      },
      {
        id: "basic",
        title: "Basic Arithmetic",
        description: "Build fluency with smaller numbers."
      },
      {
        id: "integers",
        title: "Integer Operations",
        description: "Practice calculations with positive and negative numbers."
      },
      {
        id: "order",
        title: "Order of Operations",
        description: "Evaluate expressions using operation precedence."
      }
    ],

    algebra: [
      {
        id: "oneStep",
        title: "One-Step Equations",
        description: "Solve equations with one operation."
      },
      {
        id: "twoStep",
        title: "Two-Step Equations",
        description: "Undo operations to isolate a variable."
      },
      {
        id: "variables",
        title: "Evaluate Expressions",
        description: "Substitute values into algebraic expressions."
      },
      {
        id: "distributive",
        title: "Distributive Property",
        description: "Expand expressions and solve related equations."
      }
    ],

    logic: [
      {
        id: "sequences",
        title: "Number Sequences",
        description: "Determine the next number in a pattern."
      },
      {
        id: "missing",
        title: "Missing Numbers",
        description: "Find the number that completes an equation."
      },
      {
        id: "reasoning",
        title: "Numerical Reasoning",
        description: "Use number relationships to find a solution."
      },
      {
        id: "patterns",
        title: "Pattern Rules",
        description: "Identify repeated arithmetic patterns."
      }
    ]
  };

  /* ==========================================================
     HELPERS
     ========================================================== */

  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const pick = array =>
    array[Math.floor(Math.random() * array.length)];

  const signedNumber = () => {
    const magnitude = randomInt(1, 12);

    if (state.allowPositive && state.allowNegative) {
      return Math.random() < 0.5 ? magnitude : -magnitude;
    }

    if (state.allowNegative) return -magnitude;

    return magnitude;
  };

  const signedInteger = (min = 1, max = 12) => {
    let n = randomInt(min, max);

    if (state.allowPositive && state.allowNegative) {
      return Math.random() < 0.5 ? n : -n;
    }

    if (state.allowNegative) return -n;

    return n;
  };

  const formatExpression = (a, b, symbol) => {
    const sign = b < 0 ? "−" : "+";
    return `${a} ${symbol} ${Math.abs(b)}`.replace(
      `${a} ${symbol} ${Math.abs(b)}`,
      `${a} ${symbol} ${Math.abs(b)}`
    );
  };

  function makeQuestion(prompt, answer, options = {}) {
    return {
      prompt: String(prompt),
      answer: Number(answer),
      explanation: options.explanation || "",
      category: state.category,
      ...options
    };
  }

  function operationQuestion(operations, min = 1, max = 12) {
    const operation = pick(operations);
    let a, b, answer, prompt;

    if (operation === "addition") {
      a = signedInteger(min, max);
      b = signedInteger(min, max);
      answer = a + b;
      prompt = `${a} + (${b})`;
    }

    if (operation === "subtraction") {
      a = signedInteger(min, max);
      b = signedInteger(min, max);
      answer = a - b;
      prompt = `${a} − (${b})`;
    }

    if (operation === "multiplication") {
      a = signedInteger(min, max);
      b = signedInteger(min, max);
      answer = a * b;
      prompt = `${a} × (${b})`;
    }

    if (operation === "division") {
      // Generate an integer quotient.
      b = signedInteger(min, max);
      a = signedInteger(min, max);

      if (b === 0) b = 1;

      answer = a;
      const dividend = a * b;
      prompt = `${dividend} ÷ (${b})`;
      answer = a;
    }

    return makeQuestion(prompt, answer);
  }

  /* ==========================================================
     ARITHMETIC QUESTION GENERATORS
     ========================================================== */

  function generateArithmetic() {
    const operations = [...state.selectedOperations];

    if (!operations.length) {
      throw new Error("Select at least one arithmetic operation.");
    }

    if (state.category === "basic") {
      const positiveOps = operations;
      return operationQuestion(positiveOps, 1, 10);
    }

    if (state.category === "integers") {
      return operationQuestion(operations, 1, 15);
    }

    if (state.category === "order") {
      const a = randomInt(2, 9);
      const b = randomInt(2, 9);
      const c = randomInt(1, 10);
      const op = pick(["+", "−", "×"]);
      let prompt, answer;

      if (op === "+") {
        prompt = `${a} + ${b} × ${c}`;
        answer = a + b * c;
      } else if (op === "−") {
        prompt = `${a + b} − ${b} × ${c}`;
        answer = a + b - b * c;
      } else {
        prompt = `${a} + ${b} × ${c}`;
        answer = a + b * c;
      }

      return makeQuestion(prompt, answer, {
        explanation: "Multiplication is evaluated before addition or subtraction."
      });
    }

    // "all" is the original Math Facts mode expanded to
    // support configurable operations and signed integers.
    return operationQuestion(operations, 1, 12);
  }

  /* ==========================================================
     ALGEBRA QUESTION GENERATORS
     ========================================================== */

  function generateAlgebra() {
    let x, a, b, c, prompt, answer;

    switch (state.category) {
      case "oneStep": {
        x = signedInteger(1, 12);
        a = randomInt(2, 10);

        const operation = pick(["+", "−", "×"]);

        if (operation === "+") {
          b = signedInteger(1, 12);
          prompt = `x + (${b}) = ${x + b}`;
        } else if (operation === "−") {
          b = signedInteger(1, 12);
          prompt = `x − (${b}) = ${x - b}`;
        } else {
          prompt = `${a}x = ${a * x}`;
        }

        answer = x;
        break;
      }

      case "twoStep": {
        a = randomInt(2, 9);
        x = signedInteger(1, 10);
        b = signedInteger(1, 12);
        c = a * x + b;

        prompt = `${a}x + (${b}) = ${c}`;
        answer = x;
        break;
      }

      case "variables": {
        a = randomInt(2, 9);
        b = signedInteger(1, 12);
        x = signedInteger(1, 10);

        prompt = `Evaluate ${a}x + (${b}) when x = ${x}`;
        answer = a * x + b;
        break;
      }

      case "distributive": {
        a = randomInt(2, 8);
        b = signedInteger(1, 10);
        x = signedInteger(1, 10);

        const cValue = a * (x + b);

        prompt = `${a}(x + (${b})) = ${cValue}`;
        answer = x;
        break;
      }

      default:
        return generateAlgebraFallback();
    }

    return makeQuestion(prompt, answer, {
      explanation: "Enter the value of x."
    });
  }

  function generateAlgebraFallback() {
    const x = signedInteger(1, 10);
    return makeQuestion(`x + 3 = ${x + 3}`, x);
  }

  /* ==========================================================
     LOGIC QUESTION GENERATORS
     ========================================================== */

  function generateLogic() {
    let prompt, answer, explanation;

    switch (state.category) {
      case "sequences": {
        const start = randomInt(1, 20);
        const step = randomInt(2, 9);
        const direction = Math.random() < 0.5 ? 1 : -1;

        const values = Array.from(
          { length: 4 },
          (_, i) => start + i * step * direction
        );

        answer = values[3] + step * direction;
        prompt = `${values.join(", ")}, ?`;
        explanation = `The pattern changes by ${step * direction} each time.`;
        break;
      }

      case "missing": {
        const a = randomInt(2, 20);
        const b = randomInt(2, 20);
        const operation = pick(["+", "−", "×"]);

        let result;

        if (operation === "+") {
          result = a + b;
          prompt = `${a} + ? = ${result}`;
          answer = b;
        } else if (operation === "−") {
          result = a - b;
          prompt = `${a} − ? = ${result}`;
          answer = b;
        } else {
          result = a * b;
          prompt = `${a} × ? = ${result}`;
          answer = b;
        }

        explanation = "Find the number that makes the equation true.";
        break;
      }

      case "reasoning": {
        const a = randomInt(2, 12);
        const b = randomInt(2, 12);
        const c = randomInt(2, 12);

        prompt = `If ${a} → ${a * 2}, and ${b} → ${b * 2}, what does ${c} → ?`;
        answer = c * 2;
        explanation = "Each number is multiplied by 2.";
        break;
      }

      case "patterns": {
        const start = randomInt(1, 12);
        const add = randomInt(2, 6);
        const multiply = randomInt(2, 3);

        const sequence = [
          start,
          start + add,
          (start + add) * multiply,
          (start + add) * multiply + add
        ];

        answer = sequence[3] * multiply;
        prompt = `${sequence.join(", ")}, ?`;
        explanation = `The pattern alternates +${add}, then ×${multiply}.`;
        break;
      }

      default:
        return makeQuestion("2, 4, 6, 8, ?", 10);
    }

    return makeQuestion(prompt, answer, { explanation });
  }

  /* ==========================================================
     QUESTION ROUTER
     ========================================================== */

  function generateQuestion() {
    switch (state.section) {
      case "arithmetic":
        return generateArithmetic();

      case "algebra":
        return generateAlgebra();

      case "logic":
        return generateLogic();

      default:
        return generateArithmetic();
    }
  }

  /* ==========================================================
     PAGE LAYOUT HELPERS
     ========================================================== */

  function shell(content) {
    app.innerHTML = `
      <div class="lm-shell">
        <header class="lm-header">
          <div class="lm-brand">LudMath Practice</div>
          <div class="lm-version">Version ${VERSION}</div>
        </header>
        ${content}
      </div>
    `;
  }

  function statsMarkup() {
    return `
      <div class="lm-stat-grid">
        <div class="lm-stat">
          <span class="lm-stat-value" id="lm-current-streak">
            ${stats.currentStreak}
          </span>
          <span class="lm-stat-label">Current Streak</span>
        </div>

        <div class="lm-stat">
          <span class="lm-stat-value" id="lm-best-streak">
            ${stats.bestStreak}
          </span>
          <span class="lm-stat-label">Best Streak</span>
        </div>

        <div class="lm-stat">
          <span class="lm-stat-value" id="lm-correct">
            ${stats.totalCorrect}
          </span>
          <span class="lm-stat-label">Total Correct</span>
        </div>

        <div class="lm-stat">
          <span class="lm-stat-value" id="lm-incorrect">
            ${stats.totalIncorrect}
          </span>
          <span class="lm-stat-label">Total Incorrect</span>
        </div>

        <div class="lm-stat">
          <span class="lm-stat-value" id="lm-attempted">
            ${stats.totalAttempted}
          </span>
          <span class="lm-stat-label">Total Attempted</span>
        </div>
      </div>
    `;
  }

  function bindClick(selector, callback) {
    const element = app.querySelector(selector);

    if (element) {
      element.addEventListener("click", callback);
    }
  }

  function button(label, action, className = "") {
    return `
      <button
        type="button"
        class="lm-button ${className}"
        data-action="${action}">
        ${label}
      </button>
    `;
  }

  /* ==========================================================
     HOME PAGE
     ========================================================== */

  function renderHome() {
    stopSession();
    state.page = "home";

    shell(`
      <h1 class="lm-title">Choose your challenge.</h1>
      <p class="lm-subtitle">
        Practice arithmetic, solve equations, or sharpen your logical
        reasoning. Your statistics are tracked across all sections.
      </p>

      <div class="lm-grid">
        <button class="lm-choice" data-section="arithmetic">
          <strong>Arithmetic</strong>
          <span>Addition, subtraction, multiplication, division,
          and more.</span>
        </button>

        <button class="lm-choice" data-section="algebra">
          <strong>Algebra</strong>
          <span>Equations, variables, expressions, and the
          distributive property.</span>
        </button>

        <button class="lm-choice" data-section="logic">
          <strong>Logic</strong>
          <span>Sequences, missing numbers, and numerical reasoning.</span>
        </button>

        <button class="lm-choice" data-section="stats">
          <strong>Practice Statistics</strong>
          <span>Review your current streak, personal best, and
          total answers.</span>
        </button>
      </div>

      <h2 class="lm-section-title">Your overall statistics</h2>
      ${statsMarkup()}
    `);

    app.querySelectorAll("[data-section]").forEach(element => {
      element.addEventListener("click", () => {
        const section = element.dataset.section;

        if (section === "stats") {
          renderStatistics();
        } else {
          state.section = section;
          renderCategories();
        }
      });
    });
  }

  /* ==========================================================
     CATEGORY SELECTION
     ========================================================== */

  function renderCategories() {
    stopSession();
    state.page = "categories";

    const list = categories[state.section] || [];

    const title = {
      arithmetic: "Arithmetic",
      algebra: "Algebra",
      logic: "Logic"
    }[state.section];

    shell(`
      <h1 class="lm-title">${title}</h1>
      <p class="lm-subtitle">
        Choose a practice category to configure your session.
      </p>

      <div class="lm-grid">
        ${list.map(item => `
          <button class="lm-choice" data-category="${item.id}">
            <strong>${item.title}</strong>
            <span>${item.description}</span>
          </button>
        `).join("")}
      </div>

      <div class="lm-actions">
        ${button("Back to Home", "home", "secondary")}
      </div>
    `);

    app.querySelectorAll("[data-category]").forEach(element => {
      element.addEventListener("click", () => {
        state.category = element.dataset.category;

        // Restore all four operations when entering a new
        // arithmetic category if none are selected.
        if (
          state.section === "arithmetic" &&
          state.selectedOperations.size === 0
        ) {
          state.selectedOperations = new Set(
            arithmeticOperations.map(op => op.id)
          );
        }

        renderConfiguration();
      });
    });

    bindClick('[data-action="home"]', renderHome);
  }

  /* ==========================================================
     CONFIGURATION PAGE
     ========================================================== */

  function renderConfiguration() {
    stopSession();
    state.page = "configuration";

    const isArithmetic = state.section === "arithmetic";

    const categoryName =
      (categories[state.section] || [])
        .find(item => item.id === state.category)?.title
      || "Practice";

    shell(`
      <h1 class="lm-title">${categoryName}</h1>
      <p class="lm-subtitle">
        Choose your practice settings.
      </p>

      ${isArithmetic ? `
        <div class="lm-card">
          <h2 class="lm-section-title" style="margin-top:0">
            Operations
          </h2>

          <div class="lm-option-grid">
            ${arithmeticOperations.map(op => `
              <label class="lm-option">
                <input
                  type="checkbox"
                  name="lm-operation"
                  value="${op.id}"
                  ${state.selectedOperations.has(op.id) ? "checked" : ""}>
                <span>${op.label} (${op.symbol})</span>
              </label>
            `).join("")}
          </div>

          <h2 class="lm-section-title">Number signs</h2>

          <div class="lm-option-grid">
            <label class="lm-option">
              <input
                type="checkbox"
                id="lm-positive"
                ${state.allowPositive ? "checked" : ""}>
              <span>Positive numbers</span>
            </label>

            <label class="lm-option">
              <input
                type="checkbox"
                id="lm-negative"
                ${state.allowNegative ? "checked" : ""}>
              <span>Negative numbers</span>
            </label>
          </div>

          <p class="lm-small">
            Select both to mix positive and negative operands.
            Division questions have integer answers.
          </p>
        </div>
      ` : `
        <div class="lm-card">
          <h2 class="lm-section-title" style="margin-top:0">
            Difficulty settings
          </h2>

          <p class="lm-small">
            ${state.section === "algebra"
              ? "Algebra questions use integer values. Enter the value of x or the requested numerical result."
              : "Logic questions have one numerical answer. Look for a pattern or relationship."}
          </p>

          <label class="lm-option">
            <input
              type="checkbox"
              id="lm-positive"
              ${state.allowPositive ? "checked" : ""}>
            <span>Allow positive values</span>
          </label>

          <label class="lm-option">
            <input
              type="checkbox"
              id="lm-negative"
              ${state.allowNegative ? "checked" : ""}>
            <span>Allow negative values where applicable</span>
          </label>
        </div>
      `}

      <h2 class="lm-section-title">Practice mode</h2>

      <div class="lm-grid-3">
        <button class="lm-choice ${state.mode === "timed" ? "selected" : ""}"
          data-mode="timed">
          <strong>Timed</strong>
          <span>Answer as many questions as you can before time runs out.</span>
        </button>

        <button class="lm-choice ${state.mode === "count" ? "selected" : ""}"
          data-mode="count">
          <strong>Question Count</strong>
          <span>Complete a set number of questions.</span>
        </button>

        <button class="lm-choice ${state.mode === "infinite" ? "selected" : ""}"
          data-mode="infinite">
          <strong>Infinite</strong>
          <span>Keep practicing until you choose to stop.</span>
        </button>
      </div>

      <div id="lm-timed-settings"
        class="lm-card ${state.mode === "timed" ? "" : "lm-hidden"}"
        style="margin-top:16px">
        <div class="lm-field">
          <label for="lm-duration">Session duration</label>
          <select id="lm-duration">
            ${Array.from({length: 40}, (_, i) => (i + 1) * 30)
              .map(seconds => `
                <option value="${seconds}"
                  ${seconds === state.duration ? "selected" : ""}>
                  ${seconds < 60
                    ? `${seconds} seconds`
                    : `${seconds / 60} minute${seconds === 60 ? "" : "s"}`}
                </option>
              `).join("")}
          </select>
        </div>
      </div>

      <div id="lm-count-settings"
        class="lm-card ${state.mode === "count" ? "" : "lm-hidden"}"
        style="margin-top:16px">
        <div class="lm-field">
          <label for="lm-question-limit">Number of questions</label>
          <select id="lm-question-limit">
            ${Array.from({length: 100}, (_, i) => (i + 1) * 5)
              .map(count => `
                <option value="${count}"
                  ${count === state.questionLimit ? "selected" : ""}>
                  ${count} questions
                </option>
              `).join("")}
          </select>
        </div>
      </div>

      <div id="lm-config-error"
        class="lm-feedback incorrect" role="alert"></div>

      <div class="lm-actions">
        ${button("Start Practice", "start")}
        ${button("Back", "categories", "secondary")}
        ${button("Home", "home", "secondary")}
      </div>
    `);

    app.querySelectorAll("[data-mode]").forEach(element => {
      element.addEventListener("click", () => {
        state.mode = element.dataset.mode;
        renderConfiguration();
      });
    });

    bindClick('[data-action="categories"]', renderCategories);
    bindClick('[data-action="home"]', renderHome);

    bindClick('[data-action="start"]', () => {
      if (isArithmetic) {
        state.selectedOperations = new Set(
          [...app.querySelectorAll('[name="lm-operation"]:checked')]
            .map(element => element.value)
        );

        if (state.selectedOperations.size === 0) {
          document.getElementById("lm-config-error").textContent =
            "Select at least one operation.";
          return;
        }
      }

      state.allowPositive =
        document.getElementById("lm-positive")?.checked ?? true;

      state.allowNegative =
        document.getElementById("lm-negative")?.checked ?? false;

      if (!state.allowPositive && !state.allowNegative) {
        document.getElementById("lm-config-error").textContent =
          "Select positive numbers, negative numbers, or both.";
        return;
      }

      if (state.mode === "timed") {
        state.duration = Number(
          document.getElementById("lm-duration").value
        );
      }

      if (state.mode === "count") {
        state.questionLimit = Number(
          document.getElementById("lm-question-limit").value
        );
      }

      startSession();
    });
  }

  /* ==========================================================
     SESSION MANAGEMENT
     ========================================================== */

  function stopSession() {
    if (state.timer !== null) {
      clearInterval(state.timer);
      state.timer = null;
    }

    if (state.nextQuestionTimeout !== null) {
      clearTimeout(state.nextQuestionTimeout);
      state.nextQuestionTimeout = null;
    }

    state.running = false;
    state.locked = true;
  }

  function startSession() {
    stopSession();

    state.page = "practice";
    state.running = true;
    state.locked = false;
    state.feedback = "";
    state.sessionAttempted = 0;
    state.sessionCorrect = 0;
    state.secondsRemaining = state.duration;

    try {
      state.question = generateQuestion();
    } catch (error) {
      state.running = false;
      renderConfiguration();

      const errorElement = document.getElementById("lm-config-error");

      if (errorElement) {
        errorElement.textContent = error.message;
      }

      return;
    }

    renderPractice();

    if (state.mode === "timed") {
      state.timer = setInterval(() => {
        if (!state.running) return;

        state.secondsRemaining--;

        const clock = document.getElementById("lm-clock");

        if (clock) {
          clock.textContent = formatTime(state.secondsRemaining);
        }

        if (state.secondsRemaining <= 0) {
          finishSession("Time is up!");
        }
      }, 1000);
    }
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  /* ==========================================================
     PRACTICE PAGE
     ========================================================== */

  function renderPractice() {
    if (!state.question) return;

    const modeLabel = {
      timed: "Timed Practice",
      count: "Question Count",
      infinite: "Infinite Practice"
    }[state.mode];

    let progressLabel = "";

    if (state.mode === "timed") {
      progressLabel = "Time remaining";
    } else if (state.mode === "count") {
      progressLabel =
        `Question ${state.sessionAttempted + 1} of ${state.questionLimit}`;
    } else {
      progressLabel = "No question limit";
    }

    shell(`
      <div class="lm-progress">
        <span>${modeLabel}</span>
        <span id="lm-clock" class="lm-clock">
          ${state.mode === "timed"
            ? formatTime(state.secondsRemaining)
            : progressLabel}
        </span>
      </div>

      <div class="lm-practice">
        <h1 class="lm-title" style="font-size:1.5rem">
          ${state.section === "arithmetic"
            ? "Arithmetic"
            : state.section === "algebra"
              ? "Algebra"
              : "Logic"}
        </h1>

        <div class="lm-question" id="lm-question"></div>

        <form id="lm-answer-form" class="lm-answer-row">
          <input
            id="lm-answer"
            class="lm-answer"
            type="number"
            step="any"
            inputmode="decimal"
            autocomplete="off"
            placeholder="Your answer"
            aria-label="Your answer"
            required>

          <button type="submit" id="lm-submit" class="lm-button">
            Check Answer
          </button>
        </form>

        <div id="lm-feedback" class="lm-feedback neutral"
          role="status" aria-live="polite"></div>

        <div class="lm-card" style="text-align:left">
          <h2 class="lm-section-title" style="margin-top:0">
            Your statistics
          </h2>
          ${statsMarkup()}
        </div>

        <div class="lm-actions" style="justify-content:center">
          ${button("End Practice", "end", "danger")}
          ${button("Change Mode", "categories", "secondary")}
          ${button("Home", "home", "secondary")}
        </div>
      </div>
    `);

    const questionElement = document.getElementById("lm-question");

    // Use textContent for generated questions rather than
    // interpreting question text as HTML.
    questionElement.textContent = state.question.prompt;

    document.getElementById("lm-answer-form").addEventListener(
      "submit",
      event => {
        event.preventDefault();
        checkAnswer();
      }
    );

    bindClick('[data-action="end"]', () => {
      finishSession("Practice ended.");
    });

    bindClick('[data-action="categories"]', renderCategories);
    bindClick('[data-action="home"]', renderHome);

    document.getElementById("lm-answer").focus();
  }

  /* ==========================================================
     ANSWER CHECKING
     ========================================================== */

  function checkAnswer() {
    if (!state.running || state.locked) return;

    const input = document.getElementById("lm-answer");
    const feedback = document.getElementById("lm-feedback");

    if (!input || !feedback) return;

    if (input.value.trim() === "") {
      feedback.textContent = "Enter an answer first.";
      feedback.className = "lm-feedback neutral";
      input.focus();
      return;
    }

    const userAnswer = Number(input.value);

    if (!Number.isFinite(userAnswer)) {
      feedback.textContent = "Enter a valid number.";
      feedback.className = "lm-feedback incorrect";
      input.focus();
      return;
    }

    // Each submitted answer is counted exactly once.
    state.locked = true;
    state.sessionAttempted++;

    stats.totalAttempted++;

    const isCorrect =
      Math.abs(userAnswer - state.question.answer) < 0.0000001;

    if (isCorrect) {
      stats.totalCorrect++;
      stats.currentStreak++;
      stats.bestStreak = Math.max(
        stats.bestStreak,
        stats.currentStreak
      );

      state.sessionCorrect++;

      feedback.textContent = "Correct!";
      feedback.className = "lm-feedback correct";
    } else {
      stats.totalIncorrect++;
      stats.currentStreak = 0;

      feedback.textContent =
        `Incorrect. The correct answer is ${state.question.answer}.`;

      feedback.className = "lm-feedback incorrect";
    }

    if (state.question.explanation) {
      const explanation = document.createElement("div");
      explanation.className = "lm-small";
      explanation.textContent = state.question.explanation;
      feedback.appendChild(explanation);
    }

    updateStatsDisplay();

    input.disabled = true;
    document.getElementById("lm-submit").disabled = true;

    if (
      state.mode === "count" &&
      state.sessionAttempted >= state.questionLimit
    ) {
      state.nextQuestionTimeout = setTimeout(() => {
        finishSession("Question set completed!");
      }, 900);

      return;
    }

    // Avoid starting another question after the timer expires.
    state.nextQuestionTimeout = setTimeout(() => {
      state.nextQuestionTimeout = null;

      if (!state.running) return;

      if (
        state.mode === "timed" &&
        state.secondsRemaining <= 0
      ) {
        finishSession("Time is up!");
        return;
      }

      state.locked = false;

      try {
        state.question = generateQuestion();
      } catch (error) {
        finishSession(error.message);
        return;
      }

      renderPractice();
    }, 800);
  }

  function updateStatsDisplay() {
    const values = {
      "lm-current-streak": stats.currentStreak,
      "lm-best-streak": stats.bestStreak,
      "lm-correct": stats.totalCorrect,
      "lm-incorrect": stats.totalIncorrect,
      "lm-attempted": stats.totalAttempted
    };

    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = value;
      }
    });
  }

  /* ==========================================================
     SESSION SUMMARY
     ========================================================== */

  function finishSession(message = "Session completed!") {
    if (!state.running && state.page !== "practice") return;

    stopSession();

    state.page = "summary";

    const attempted = state.sessionAttempted;
    const correct = state.sessionCorrect;
    const incorrect = attempted - correct;

    const accuracy = attempted
      ? Math.round((correct / attempted) * 100)
      : 0;

    shell(`
      <h1 class="lm-title">Session complete</h1>
      <p class="lm-subtitle">${message}</p>

      <div class="lm-card">
        <div class="lm-small">Accuracy</div>
        <div class="lm-result-number">${accuracy}%</div>

        <div class="lm-bar">
          <div class="lm-bar-fill" id="lm-accuracy-bar"></div>
        </div>

        <div class="lm-grid" style="margin-top:24px">
          <div class="lm-stat">
            <span class="lm-stat-value">${correct}</span>
            <span class="lm-stat-label">Correct this session</span>
          </div>

          <div class="lm-stat">
            <span class="lm-stat-value">${incorrect}</span>
            <span class="lm-stat-label">Incorrect this session</span>
          </div>
        </div>
      </div>

      <h2 class="lm-section-title">Overall statistics</h2>
      ${statsMarkup()}

      <div class="lm-actions">
        ${button("Practice Again", "again")}
        ${button("Choose Another Category", "categories", "secondary")}
        ${button("Home", "home", "secondary")}
      </div>
    `);

    const bar = document.getElementById("lm-accuracy-bar");

    if (bar) {
      bar.style.width = `${accuracy}%`;
    }

    bindClick('[data-action="again"]', renderConfiguration);
    bindClick('[data-action="categories"]', renderCategories);
    bindClick('[data-action="home"]', renderHome);
  }

  /* ==========================================================
     STATISTICS PAGE
     ========================================================== */

  function renderStatistics() {
    stopSession();
    state.page = "statistics";

    const accuracy = stats.totalAttempted
      ? Math.round(
          (stats.totalCorrect / stats.totalAttempted) * 100
        )
      : 0;

    shell(`
      <h1 class="lm-title">Practice Statistics</h1>
      <p class="lm-subtitle">
        Your totals include all completed answers across every category.
      </p>

      ${statsMarkup()}

      <div class="lm-card" style="margin-top:20px">
        <strong>Overall accuracy: ${accuracy}%</strong>

        <div class="lm-bar">
          <div class="lm-bar-fill" id="lm-accuracy-bar"></div>
        </div>
      </div>

      <div class="lm-actions">
        ${button("Back to Home", "home")}
      </div>
    `);

    const bar = document.getElementById("lm-accuracy-bar");

    if (bar) {
      bar.style.width = `${accuracy}%`;
    }

    bindClick('[data-action="home"]', renderHome);
  }

  /* ==========================================================
     INITIALIZE
     ========================================================== */

  renderHome();

  console.log(`LudMath Math Facts ${VERSION} initialized.`);
});

