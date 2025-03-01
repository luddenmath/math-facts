// Initialize score
let score = 0;

// Function to generate random math questions
const generateQuestion = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*', '/'];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let question, answer;
  switch (operator) {
    case '+':
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
    case '-':
      question = `${num1} - ${num2}`;
      answer = num1 - num2;
      break;
    case '*':
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
      break;
    case '/':
      question = `${num1 * num2} ÷ ${num1}`;
      answer = num2;
      break;
  }
  return { question, answer };
};

// Get the generated question and answer
let { question, answer } = generateQuestion();

// Function to display the current question and score
const updateUI = () => {
  document.getElementById('app').innerHTML = `
    <h1>Math Facts Practice</h1>
    <p>Solve: ${question}</p>
    <input type="number" id="user-answer" placeholder="Your answer" />
    <button onclick="checkAnswer()">Check</button>
    <p id="result"></p>
    <p>Score: <span id="score">${score}</span></p>
  `;
};

// Function to check the user's answer
function checkAnswer() {
  const userAnswer = parseFloat(document.getElementById('user-answer').value);
  const resultElement = document.getElementById('result');
  const scoreElement = document.getElementById('score');

  // Check if the user's answer is correct
  if (userAnswer === answer) {
    resultElement.innerHTML = 'Correct! Well done!';
    resultElement.style.color = 'green';
    score++; // Increase the score for a correct answer
  } else {
    resultElement.innerHTML = `Incorrect. The correct answer is ${answer}. Try again!`;
    resultElement.style.color = 'red';
  }

  // Update the score on the page
  scoreElement.innerText = score;

  // Generate a new question
  const { question: newQuestion, answer: newAnswer } = generateQuestion();
  question = newQuestion;
  answer = newAnswer;

  // Update the UI with the new question without overwriting the score or result
  setTimeout(updateUI, 500); // Slight delay to show result before updating
}

// Initially display the first question
updateUI();
