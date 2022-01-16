let gameContainer,
	unusedLettersContainer,
	gameResultContainer,
	resultTextContainer,
	word,
	isGameOver;
const uniqueDict = [],
	guesses = [''];

function onLoad() {
	gameContainer = document.getElementById('game-container');
	unusedLettersContainer = document.getElementById('unused-letters');
	gameResultContainer = document.getElementById('game-result');
	resultTextContainer = document.getElementById('result-text');

	for (const dictWord of dict) {
		if (!uniqueDict.includes(dictWord)) {
			uniqueDict.push(dictWord);
		}
	}

	word = uniqueDict[Math.floor(Math.random() * uniqueDict.length)];
	// console.log(word);

	document.addEventListener('keyup', keyup);
	keyup({ key: '' });
}

function keyup(e) {
	const currGuess = guesses[guesses.length - 1];
	let isNotAWord;
	if (
		['Backspace', 'Delete'].includes(e.key) &&
		currGuess.length > 0 &&
		!isGameOver
	) {
		guesses[guesses.length - 1] = currGuess.substring(0, currGuess.length - 1);
	} else if (e.key == 'Enter') {
		if (uniqueDict.includes(currGuess.toLowerCase())) {
			if (guesses.length >= 6) {
				isGameOver = true;
			}

			if (currGuess.toLowerCase() == word || guesses.length >= 6) {
				resultTextContainer.innerHTML =
					currGuess.toLowerCase() == word
						? 'You win!'
						: `You lose.<br/>Why didn't you try <b>${word}</b>?`;
				gameResultContainer.classList.remove('hidden');
			}

			guesses.push('');

			let unusedLetters = '';
			for (
				let ch = 'a';
				ch <= 'z';
				ch = String.fromCharCode(ch.charCodeAt() + 1)
			) {
				unusedLetters += ch;
			}
			let guessNum = 0;
			for (const guess of guesses) {
				if (guessNum < guesses.length - 1) {
					for (const ch of guess) {
						unusedLetters = unusedLetters.replaceAll(ch.toLowerCase(), '');
					}
				}
				guessNum++;
			}
			let html = '';
			for (const ch of unusedLetters.toUpperCase()) {
				html += `<div class="guess-letter">${ch}</div>`;
			}
			unusedLettersContainer.innerHTML = html;
		} else {
			isNotAWord = true;
		}
	} else if (e.key.match(/^[a-z]$/i) && currGuess.length < 5 && !isGameOver) {
		guesses[guesses.length - 1] += e.key.toUpperCase();
	}

	{
		let html = '';
		for (let guessNum = 0; guessNum < Math.min(guesses.length, 6); guessNum++) {
			const guess = guesses[guessNum];
			if (guess.toLowerCase() == word) {
				isGameOver = true;
			}
			html += `<div class="guess ${
				isNotAWord && guessNum == guesses.length - 1 ? 'not-a-word' : ''
			}">`;
			let i = 0;
			for (const ch of guess) {
				let className = '';
				if (guessNum < guesses.length - 1) {
					if (word[i] == ch.toLowerCase()) {
						className = 'pos-match';
					} else if (word.includes(ch.toLowerCase())) {
						className = 'match';
					} else {
						className = 'no-match';
					}
				}
				html += `<div class="guess-letter ${className}">${ch}</div>`;
				i++;
			}
			for (let j = 0; j < 5 - guess.length; j++) {
				html += `<div class="guess-letter"> &nbsp;</div>`;
			}
			html += '</div>';
		}
		for (let i = 0; i < 6 - guesses.length; i++) {
			html += `<div class="guess">`;
			for (let j = 0; j < 5; j++) {
				html += `<div class="guess-letter"> &nbsp;</div>`;
			}
			html += '</div>';
		}
		gameContainer.innerHTML = html;
	}
}
