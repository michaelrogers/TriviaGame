document.addEventListener('DOMContentLoaded', () => {
	let questionBank = [];
	let answerBoxArray = [];
	let answerBankDOM = [];
	let answeredCount = 0;
	let currentCorrectAnswer = null; //Globally defined for click listener
	let inputAccepted = true; let gameOn = false;
	let intSet;
	let informationLine = document.getElementById('informationLine');
	let timer = document.getElementById('timer');
	let prizeList;
	let timerInterval;
	let audioArray = [];
	let stage;	

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
		playAudio(13)
		playAudio(12, true);
		timer.innerHTML = timeValue;
		timerInterval = setInterval(() => {
			timeValue--;
			timer.innerHTML = timeValue;
			if (timeValue < 1) {
				clearInterval(timerInterval);
				resetAudio(12);
				loseCondition(false);
			}
		}, 1000);
	}

	const winCondition = () => {
		resetAudio();
		playAudio(9, false);
		clearInterval(timerInterval);
		informationLine.innerHTML = "You've won $1 million! Press enter to play again.";
		inputAccepted = false; gameOn = false;
	}


	const loseCondition = (incorrectGuess) => {
		resetAudio();
		playAudio(6, false);
		playAudio(11, true);
		clearInterval(timerInterval);
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
		resetAudio(12); //Stop clock audio
		if (inputAccepted){
			inputAccepted = false;
			const evaluateGuess = evaluateAnswerSelected(event.currentTarget) ? true : false;
			event.currentTarget.classList.add('waitingForAnswer');
			playAudio(10); //Guess audio
			setTimeout(addCorrectGuess, audioArray[10].duration * 1000 * 0.9);
			if (evaluateGuess) { //CorrectGuess
					answeredCount++;
					clearInterval(timerInterval);
					//Sound to play for correct answer; 3 different stages
					setTimeout(() => {
						let audioIndex;
						if (answeredCount < 6) {
							audioIndex = 1;
						} else if (answeredCount < 11) {
							audioIndex = 3;
						}
						else audioIndex = 5;
						playAudio(audioIndex);
						setTimeout(gameHandler, audioArray[audioIndex].duration * 1000 * 0.7);
					}, audioArray[10].duration * 1000 * 0.9);
			}
			else {
				clearInterval(timerInterval);
				setTimeout(() => {
					loseCondition(true); //IncorrectGuess
				}, audioArray[10].duration * 1000 * 0.9);
				
				
			}
			
		}
	}	

	const gameHandler = () => {
		prizeList.map((x) => x.classList.remove('currentLevel'));
		if (answeredCount > 0) prizeList[answeredCount-1].classList.add('currentLevel');
		//Switch to handle the transitioning of audio between stages
		switch (answeredCount) {
			case 0:
				resetAudio();
				playAudio()			
				playAudio(0, true);
				break;
			case 5:
				resetAudio(0);
				playAudio(7);
				playAudio(2, true);
				break;
			case 10:
				resetAudio(2);
				playAudio(7);
				playAudio(4, true);
				break;
			default:
				break;
		}
			
		timer.innerHTML = '--';
		const remaining = remainingQuestions();
		const winningNumber = 15;
		if (remaining.length > 0 && answeredCount < winningNumber) {
			answerBoxArray.map((x) => x.classList.remove('correctGuess', 'waitingForAnswer'));
			answerBankDOM.map((x) => x.innerHTML = '');
			populateText(randomQuestion());
		} else if (answeredCount >= winningNumber) winCondition();
		else console.log(new Error("Question bank ran out of questions :/"));

	}


	const resetAudio = (audioIndex = null) => {
		if (audioIndex == null) {
			audioArray.map((x) => {
				x.pause();
				x.currentTime = 0;
			});
		} else {
			audioArray[audioIndex].pause();
			audioArray[audioIndex].currentTime = 0;
		}	
	}

	const playAudio = (audioIndex, loop = false) => {
		if (audioArray[audioIndex]) {
			thisAudio = audioArray[audioIndex];
			thisAudio.volume = 0.3;
			if (loop) thisAudio.loop = true;
			thisAudio.play();
		}	
	}

	const init = () => {
		
		informationLine.innerHTML = "The game has started. You have 30 seconds to guess each question."
		gameOn = true; stage = 1;
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
			new questionPrototype ("What Great Lake state has more shoreline than the entire U.S. Atlantic seaboard?",
									"Michigan",
									["Wisconsin", "Illinois", 'Ohio']),
			new questionPrototype ('What is the smallest of the four Galilean moons of Jupiter?',
									'Europa',
									['Io', 'Ganymede', 'Callisto']),
			new questionPrototype ('What is the longest mountain range on the surface of the earth (above sea level)?',
									'Andes',
									['Himalayas', 'Rocky Mountains', 'Mid-Atlantic Ridge']),
			new questionPrototype ('If you add the numbers on the opposite sides of a dice together what will you always get?',
									'7',
									['8', '6', '9']),
			new questionPrototype ('On which continent did falconry originate?',
									'Asia',
									['Europe', 'Africa', 'North America']),
			new questionPrototype ('Who plays Max Rockatansky in the film Mad Max: Fury Road?',
									'Tom Hardy',
									['Mel Gibson', 'Kevin Costner', 'Max Weinberg']),
			new questionPrototype ('Where would you find the Sea of Tranquility? ',
									'The Moon',
									['The Caribbean', 'The Mediterranean', 'Japan']),
			new questionPrototype ('How many valves does a trumpet have?',
									'Three',
									['Four', 'Five', 'Six']),
			new questionPrototype ('Which Shakespeare play features Shylock?',
									'The Merchant of Venice',
									['Othello', 'A Study in Scarlet', 'Macbeth']),
			new questionPrototype ("Who was Henry VIll's first wife?",
									'Catherine of Aragon',
									['Anne Boleyn', 'Elizabeth of York', 'Margaret Tudor']),
			new questionPrototype ("What does the musical term 'piano' mean?",
									'To play softly',
									['To alternate pitch', 'To play loudly', 'A note played forcefully']),
			new questionPrototype ("In Texas it's illegal to swear in front of a what?",
									'A corpse',
									['A minister', 'A hospital patient', 'A stop sign']),
			new questionPrototype ('What was the first space station to be launched into space?',
									'Salyut 1',
									['Internation Space Station', 'Skylab', 'Mir']),
		];
		
		gameHandler();

	}

	//Execute on DOM content loaded
	answerBoxArray = [].slice.call(document.querySelectorAll('#answerBank .answerBox'));
	answerBoxArray.map((x) => x.addEventListener('click', clickListener));
	prizeList = [].slice.call(document.querySelectorAll('#prizeList li')).reverse();

	document.addEventListener('keypress', (event) => {
			if (event.key == 'Enter' && !gameOn) init();
	});

	//Audio sounds
		audioArray = [
			new Audio('https://static.mezgrman.de/downloads/wwm/stufe_1.mp3'),  //0 - Level1
			new Audio('https://static.mezgrman.de/downloads/wwm/richtig_stufe_1.mp3'), //1 - Level1 correct
			new Audio('https://static.mezgrman.de/downloads/wwm/stufe_2.mp3'), //2 - Level2
			new Audio('https://static.mezgrman.de/downloads/wwm/richtig_stufe_2.mp3'), //3 - Level 2 correct
			new Audio('https://static.mezgrman.de/downloads/wwm/stufe_3.mp3'), //4 - Level 3
			new Audio('https://static.mezgrman.de/downloads/wwm/richtig_stufe_3.mp3'), //5 - Level 3 correct
			new Audio('https://static.mezgrman.de/downloads/wwm/falsch_kein_gewinn.mp3'), //6 - Wrong answer
			new Audio('https://static.mezgrman.de/downloads/wwm/wechsel_nach_stufe_2.mp3'), //7 - Level 1-2 transition
			new Audio('https://static.mezgrman.de/downloads/wwm/wechsel_nach_stufe_3.mp3'), //8 - Level 2-3 transition
			new Audio('https://static.mezgrman.de/downloads/wwm/richtig_millionenfrage.mp3'), //9 - Win Game
			new Audio('https://static.mezgrman.de/downloads/wwm/eingeloggt_start.mp3'), // 10 - Answer selected
			new Audio('https://static.mezgrman.de/downloads/wwm/auswahlrunde_loesung.mp3'), //11 - Waiting
			new Audio('https://static.mezgrman.de/downloads/wwm/telefonjoker_loop.mp3#t=0,2]'), //12 - Clock Tick
			new Audio('https://static.mezgrman.de/downloads/wwm/telefonjoker_start.mp3'), //13 - Clock start
		];

		playAudio(11, true); //Play default waiting music on page load

});