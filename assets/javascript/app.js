document.addEventListener('DOMContentLoaded', () => {
	let questionBank = [];
	let answerBoxArray = [];
	let answerBankDOM = [];
	let answeredCount = 0;
	let currentCorrectAnswer = null; //Globally defined for click listener
	let inputAccepted = true;
	let gameOn = false;
	let intSet;
	let informationLine = document.getElementById('informationLine');
	let timer = document.getElementById('timer');
	let prizeList;
	let timerInterval;

	function questionPrototype (question, correctAnswer, answerBank) {
		this.question = question;
		this.used = false;
		this.correctAnswer = correctAnswer;
		this.answerBank = answerBank;
	}

	const remainingQuestions = () => {
		const questionArray = questionBank.filter((question) => {
			return question.used == false;
		});
		return questionArray;

	}

	const randomQuestion = () => {
		let remaining = remainingQuestions();
		// console.log(remainingQuestions);
		const index = Math.floor(Math.random() * remaining.length);
		//Mark the randomly chosen index as used in the questionBank
		if (remaining.length > 0) {
			questionBank.map((x,i) => {
				if (x.question == remaining[index].question) {
					x.used = true;
				}
			});
		} 
		currentCorrectAnswer = remaining[index].correctAnswer;
		return remaining[index];
	}

	const startTimer = () => {
		let timeValue = 30;
		timer.innerHTML = timeValue;
		timerInterval = setInterval( () => {
			timeValue--;
			timer.innerHTML = timeValue;
			if (timeValue < 1) {
				clearInterval(timerInterval);
				loseCondition(false);
			}
		}, 1000);
	}

	const winCondition = () => {
		informationLine.innerHTML = 'You win!';
		inputAccepted = false;
	}

	const loseCondition = (incorrectGuess) => {
		inputAccepted = false; gameOn = false;
		incorrectGuess 
			? informationLine.innerHTML = 'You guessed incorrectly! Press enter to restart.'
			: informationLine.innerHTML = 'You ran out of time. Press enter to restart.';
	}

	const populateText = (questionObject) => {
		let answerBank = questionObject.answerBank;
		answerBank.push(questionObject.correctAnswer);
		answerBankDOM = [].slice.call(document.querySelectorAll('#answerBank .answer'));
		if (answerBank && answerBank.length == answerBankDOM.length) {
			document.getElementById('questionBlock').innerHTML = questionObject.question;
			inputAccepted = false;
			let answerIndex = 0;

			const writeEachAnswer = () => {
				if (answerBank.length > 0) {
					const index = Math.floor(Math.random() * answerBank.length);
					const answerText = answerBank.splice(index, 1);
					answerBankDOM[answerIndex].innerHTML = answerText;
					answerBankDOM[answerIndex].setAttribute('data-answer', answerText);
					answerIndex++;
					if (answerBank.length < 1) {
						console.log('Cleared')
						clearInterval(intSet);
						inputAccepted = true;
						startTimer();
					}
				} 
			}

			//Start the interval delay
			intSet = setInterval(writeEachAnswer, 1500);
			
		} else if (answerBank && answerBank.length > 0) { 
			//Error handling if the question bank has a mismatch with answerbox length
			console.log(new Error("Answer mismatch in bank, substituting with new question"));
			populateText(randomQuestion());
		}
	}

	const addCorrectGuess = () => {
		answerBoxArray.map((x) => {
			if (evaluateAnswerSelected(x)) x.classList.add('correctGuess');
		});
	}

	const evaluateAnswerSelected = (target) => {
		return target.querySelector('.answer').dataset.answer == currentCorrectAnswer;
	}

	const clickListener = (event) => {
		let thisEvent = event;
		if (inputAccepted){
			const evaluateGuess = evaluateAnswerSelected(event.currentTarget) ? true : false;
			event.currentTarget.classList.add('waitingForAnswer');
			setTimeout(addCorrectGuess, 1000);
			
			if (evaluateGuess) {
					// event.currentTarget.classList.add('correctGuess');
					answeredCount++;
					clearInterval(timerInterval)
					setTimeout(gameHandler, 2000);
			}
			else {
				loseCondition(true);
				
			}
			
		}
	}	

	const gameHandler = () => {
		prizeList.map((x) => x.classList.remove('currentLevel'));
		prizeList[answeredCount].classList.add('currentLevel');
		timer.innerHTML = '--';
		console.log('Score', answeredCount);
		const remaining = remainingQuestions();
		const winningNumber = 15 - 1;
		if (remaining.length > 0 && answeredCount <= winningNumber) {
			answerBoxArray.map((x) => x.classList.remove('correctGuess', 'waitingForAnswer'));
			answerBankDOM.map((x) => x.innerHTML = '');
			populateText(randomQuestion());
		} else if (answeredCount >= winningNumber) winCondition();
		else console.log(new Error("Question bank ran out of questions :/"));

	}

	const init = () => {
		informationLine.innerHTML = "Game has started. You have 30 seconds to guess each question."
		gameOn = true;
		answeredCount = 0;
		questionBank = [
			new questionPrototype ('The era of the "Five Good Emperors" spanned the period from 96 to 180 AD. Who was the first of the "Five Good Emperors"?',
									"Nerva",
									["Julius Caesar", "Trajan", "Caligula"]),
			new questionPrototype ("How many U.S. states border the Gulf of Mexico?",
									"Five",
									["Six", "One", "Four"]),
			new questionPrototype ("Which country has highest tractors per capita ratio?",
									"Iceland",
									["Canada", "Japan", "The United States"]),
			new questionPrototype ("Who averaged one patent for every three weeks of his life?",
									"Thomas Edison",
									["Nikola Tesla", "Ben Franklin", "George S. Patton"]),
			new questionPrototype ('What is the minimum  number of musicians a band must have to be considered a "big band"?',
									"Ten",
									["Two", "Seven", 'Five']),
			new questionPrototype ("Which is the densest of the four rocky planets?",
									"Earth",
									["Venus", "Mercury", 'Mars']),
			new questionPrototype ("What was the first planet to be discovered using the telescope, in 1781?",
									"Uranus",
									["Earth", "Pluto", 'Jupiter']),
		];

		
		gameHandler();
	}

	answerBoxArray = [].slice.call(document.querySelectorAll('#answerBank .answerBox'));
	answerBoxArray.map((x) => x.addEventListener('click', clickListener));
	prizeList = [].slice.call(document.querySelectorAll('#prizeList li')).reverse();

	document.addEventListener('keypress', (event) => {
			if (event.key == 'Enter' && !gameOn) init();
	});

	
});