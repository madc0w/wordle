let gameContainer,
	unusedLettersContainer,
	word,
	guesses = [''];

function onLoad() {
	gameContainer = document.getElementById('game-container');
	unusedLettersContainer = document.getElementById('unused-letters');

	word = dict[Math.floor(Math.random() * dict.length)];

	document.addEventListener('keyup', keyup);
	keyup({ key: ' ' });
}

function keyup(e) {
	// console.log(e);
	const currGuess = guesses[guesses.length - 1];
	let isNotAWord;
	if (['Backspace', 'Delete'].includes(e.key) && currGuess.length > 0) {
		guesses[guesses.length - 1] = currGuess.substring(0, currGuess.length - 1);
	} else if (e.key == 'Enter') {
		if (dict.includes(currGuess.toLocaleLowerCase())) {
			if (guesses.length < 6) {
				guesses.push('');
			}

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
	} else if (e.key.match(/^[a-z]$/i) && currGuess.length < 5) {
		guesses[guesses.length - 1] += e.key.toUpperCase();
	}

	{
		let html = '';
		let guessNum = 0;
		for (const guess of guesses) {
			html += `<div class="guess ${
				isNotAWord && guessNum == guesses.length - 1 ? 'not-a-word' : ''
			}">`;
			let i = 0;
			for (const ch of guess) {
				let className = '';
				if (guessNum < guesses.length - 1 || guessNum == 5) {
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
			guessNum++;
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
