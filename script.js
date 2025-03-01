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
const { question, answer } = generateQuestion();

// Display the question and an input for the user to answer
document.getElementById('app').innerHTML = `
  <p>Solve: ${question}</p>
  <input type="number" id="user-answer" placeholder="Your answer" />
  <button onclick="checkAnswer()">Check</button>
  <p id="result"></p>
`;

// Function to check the user's answer
function checkAnswer() {
  const userAnswer = parseFloat(document.getElementById('user-answer').value);
  const resultElement = document.getElementById('result');

  if (userAnswer === answer) {
    resultElement.innerHTML = 'Correct!';
    resultElement.style.color = 'green';
  } else {
    resultElement.innerHTML = `Incorrect. The correct answer is ${answer}.`;
    resultElement.style.color = 'red';
  }
}
