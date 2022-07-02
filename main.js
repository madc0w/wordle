let gameContainer,
	unusedLettersContainer,
	gameResultContainer,
	resultTextContainer,
	word,
	isGameOver,
	clockContainer,
	wordSpaceSizeContainer,
	statsContainer,
	wordPossibilitiesContainer,
	clockTimerId,
	clock,
	possibilities = [];
const uniqueDict = [],
	guesses = [''],
	guessPossibilities = [];

const sounds = {
	win: new Audio('sounds/win.mp3'),
	lose: new Audio('sounds/lose.mp3'),
	enter: new Audio('sounds/enter.mp3'),
	notAWord: new Audio('sounds/bad-word.mp3'),
};

function onLoad() {
	gameContainer = document.getElementById('game-container');
	unusedLettersContainer = document.getElementById('unused-letters');
	gameResultContainer = document.getElementById('game-result');
	resultTextContainer = document.getElementById('result-text');
	clockContainer = document.getElementById('clock');
	statsContainer = document.getElementById('stats');
	wordPossibilitiesContainer = document.getElementById('word-possibilities');
	wordSpaceSizeContainer = document.getElementById('word-space-size');

	for (const dictWord of dict) {
		if (!uniqueDict.includes(dictWord)) {
			uniqueDict.push(dictWord);
		}
	}
	wordSpaceSizeContainer.innerHTML = `${uniqueDict.length} possibilities`;

	word = uniqueDict[Math.floor(Math.random() * uniqueDict.length)];
	// word = uniqueDict[0];
	// console.log(word);

	document.addEventListener('keyup', keyup);
	document.addEventListener('click', (e) => {
		// console.log(e);
		let isModalInPath;
		for (const el of e.path) {
			if (el.className && el.classList.contains('modal')) {
				isModalInPath = true;
				break;
			}
		}
		if (!e.target.classList.contains('modal-button') && !isModalInPath) {
			closeModals();
		}
	});
	keyup({ key: '' });
}

function keyup(e) {
	if (isGameOver) {
		return;
	}
	const currGuess = guesses[guesses.length - 1];
	let isNotAWord;
	if (
		['Backspace', 'Delete'].includes(e.key) &&
		currGuess.length > 0 &&
		!isGameOver
	) {
		guesses[guesses.length - 1] = currGuess.substring(0, currGuess.length - 1);
	} else if (e.key == 'Escape') {
		closeModals();
	} else if (e.key == 'Enter') {
		if (uniqueDict.includes(currGuess.toLowerCase())) {
			if (guesses.length == 1) {
				clock = 0;
				function setClock() {
					clockContainer.innerHTML = formatTime(clock);
					clock += 0.01;
				}
				clockTimerId = setInterval(setClock, 10);
				setClock();
			}

			if (guesses.length >= 6) {
				isGameOver = true;
			} else {
				sounds.enter.play();
			}

			const isWin = currGuess.toLowerCase() == word;
			if (isWin || isGameOver) {
				clearInterval(clockTimerId);
				if (isWin) {
					sounds.win.play();
					resultTextContainer.innerHTML = 'You win!';
				} else {
					sounds.lose.play();
					resultTextContainer.innerHTML = `You lose.<br/>Why didn't you try <span id="answer-word">${word}</span>?`;
				}
				gameResultContainer.classList.remove('hidden');
				const numWins = localStorage.numWins
					? JSON.parse(localStorage.numWins)
					: {};
				if (isWin) {
					if (!numWins[guesses.length]) {
						numWins[guesses.length] = 0;
					}
					numWins[guesses.length]++;
					const times = localStorage.times
						? JSON.parse(localStorage.times)
						: [];
					times.push(Math.floor(clock));
					localStorage.times = JSON.stringify(times);
				} else {
					const numLosses = localStorage.numLosses
						? JSON.parse(localStorage.numLosses)
						: 0;
					localStorage.numLosses = numLosses + 1;
				}
				const numGames = parseInt(localStorage.numGames || 0) + 1;
				localStorage.numGames = numGames;
				localStorage.numWins = JSON.stringify(numWins);
			} else {
				possibilities = uniqueDict.filter((w) => {
					for (const guess of guesses) {
						if (!guessMatchesWord(guess, w)) {
							return false;
						}
					}
					return true;
				});
				const n = possibilities.length;
				possibilities.sort();
				guessPossibilities.push(possibilities);
				// console.log(numPossibilities);
				wordSpaceSizeContainer.innerHTML = `${n} ${
					n == 1 ? 'possibility' : 'possibilities'
				}`;
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
				const isVowel = 'AEIOUY'.includes(ch);
				html += `<div class="guess-letter ${
					isVowel ? 'vowel' : ''
				}">${ch}</div>`;
			}
			unusedLettersContainer.innerHTML = html;
		} else {
			isNotAWord = true;
			sounds.notAWord.play();
		}
	} else if (e.key.match(/^[a-z]$/i) && currGuess.length < 5 && !isGameOver) {
		guesses[guesses.length - 1] += e.key.toUpperCase();
	}

	{
		let html = '';
		for (let guessNum = 0; guessNum < Math.min(guesses.length, 6); guessNum++) {
			const guess = guesses[guessNum];
			if (guess.toLowerCase() == word && e.key == 'Enter') {
				isGameOver = true;
				clearInterval(clockTimerId);
			}
			const isLastGuess = guessNum == guesses.length - 1;
			html += `<div class="guess ${
				isNotAWord && isLastGuess ? 'not-a-word' : ''
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
				} else if (isLetterRuledOut(ch, i)) {
					className = 'ruled-out';
				}
				// console.log(ch);
				html += `<div class="guess-letter ${className}">${ch}</div>`;
				i++;
			}
			for (let j = 0; j < 5 - guess.length; j++) {
				html += `<div class="guess-letter"> &nbsp;</div>`;
			}
			if (guessPossibilities[guessNum]) {
				const _isGameOver =
					(currGuess.toLowerCase() == word && e.key == 'Enter') || isGameOver;
				const onClick = _isGameOver
					? `showGuessPossibilities(${guessNum})`
					: '';
				html += `<div class="guess-letter num-possibilities ${
					_isGameOver ? 'game-over button modal-button' : ''
				}" onClick="${onClick}" >${guessPossibilities[guessNum].length}</div>`;
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

function clearStats() {
	delete localStorage.times;
	delete localStorage.numGames;
	delete localStorage.numWins;
	delete localStorage.numLosses;
	showStats();
}

function showStats() {
	const times = localStorage.times ? JSON.parse(localStorage.times) : [];
	const numWins = localStorage.numWins ? JSON.parse(localStorage.numWins) : {};
	const numGames = localStorage.numGames
		? JSON.parse(localStorage.numGames)
		: 0;
	let html = '';
	if (numGames > 0) {
		let minTime;
		let meanTime = 0;
		for (const time of times) {
			meanTime += time / times.length;
			minTime = Math.min(minTime || 1e12, time);
		}
		html += '<div id="times">';
		html += '<div class="row">';
		html += `<div class="label">Best time:</div><div class="time-value">${formatTime(
			minTime
		)}</div>`;
		html += '</div>';
		html += '<div class="row">';
		html += `<div class="label">Avg. time:</div><div class="time-value">${formatTime(
			meanTime
		)}</div>`;
		html += '</div>';
		html += '</div>';

		let max = 0;
		for (const i in numWins) {
			max = Math.max(max, numWins[i]);
		}
		const factor = 260 / max;

		let sum = 0;
		let num = 0;
		html += '<table id="game-stats">';
		for (let i = 1; i <= 6; i++) {
			const width = factor * (numWins[i] || 0);
			html += '<tr>';
			html += `<td>${i}</td>`;
			if (numWins[i]) {
				html += `<td><div class="num-wins-bar" style="width: ${width}px;">${numWins[i]}</div></td>`;
				sum += i * numWins[i];
				num += numWins[i];
			}
			html += '</tr>';
		}
		const numLosses = JSON.parse(localStorage.numLosses || 0);
		const _numGames = num + numLosses;
		html += '</table>';
		html += '<div id="other-stats-container">';
		html += `<div>Mean guesses: <span id="mean-num-guesses">${
			num ? (sum / num).toFixed(2) : '-'
		}</span></div>`;
		html += `<div>Games played: <span id="mean-num-guesses">${_numGames}</span></div>`;
		html += `<div>Win ratio: <span id="mean-num-guesses">${
			_numGames ? ((100 * num) / _numGames).toFixed(1) : '-'
		}%</span></div>`;
		html += '</div>';
	} else {
		html =
			'<div id="no-stats">Nothing to see here.<br/>Maybe try playing first?</div>';
	}

	statsContainer.innerHTML = html;
	showModal('stats-modal');
}

function showModal(id) {
	closeModals();
	const modal = document.getElementById(id);
	modal.classList.remove('hidden');
}

function closeModals() {
	const modals = document.getElementsByClassName('modal');
	for (const modal of modals) {
		modal.classList.add('hidden');
	}
}

function formatTime(t) {
	if (t != null) {
		t = Math.ceil(t);
		let secs = t % 60;
		if (secs < 10) {
			secs = '0' + secs;
		}
		return `${Math.floor(t / 60)}:${secs}`;
	}
	return '-';
}

function guessMatchesWord(guess, dictWord) {
	let regex = '';
	const charMatches = [];
	const noCharMatches = [];
	let i = 0;
	for (const ch of guess) {
		const lcChar = ch.toLowerCase();
		if (word[i++] == lcChar) {
			regex += lcChar;
		} else if (word.includes(lcChar)) {
			regex += `[^${lcChar}]`;
			charMatches.push(lcChar);
		} else {
			regex += '.';
			noCharMatches.push(lcChar);
		}
	}
	const r = new RegExp(regex);
	if (dictWord.match(r)) {
		for (const c of charMatches) {
			if (!dictWord.includes(c)) {
				return false;
			}
		}
		for (const c of noCharMatches) {
			if (dictWord.includes(c)) {
				return false;
			}
		}
		return true;
	}
}

function showGuessPossibilities(guessNum) {
	let html = '';
	for (const possibility of guessPossibilities[guessNum]) {
		html += `<div>${possibility}</div>`;
	}
	wordPossibilitiesContainer.innerHTML = html;
	showModal('possibilities');
}

function isLetterRuledOut(letter, pos) {
	letter = letter.toLowerCase();
	// console.log('letter', letter);
	for (let i = 0; i < guesses.length - 1; i++) {
		const guess = guesses[i].toLowerCase();
		// console.log('guess', guess);
		if (guess.includes(letter) && !word.includes(letter)) {
			// console.log(true);
			return true;
		} else if (guess[pos] == word[pos] && word[pos] != letter) {
			return true;
		} else if (
			letter == guess[pos] &&
			word.includes(guess[pos]) &&
			word[pos] != letter
		) {
			return true;
		}
	}
}
