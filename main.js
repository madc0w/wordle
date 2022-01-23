let gameContainer,
	unusedLettersContainer,
	gameResultContainer,
	resultTextContainer,
	word,
	isGameOver,
	clockContainer,
	statsContainer,
	clockTimerId,
	clock;
const uniqueDict = [],
	guesses = [''];

function onLoad() {
	gameContainer = document.getElementById('game-container');
	unusedLettersContainer = document.getElementById('unused-letters');
	gameResultContainer = document.getElementById('game-result');
	resultTextContainer = document.getElementById('result-text');
	clockContainer = document.getElementById('clock');
	statsContainer = document.getElementById('stats');

	for (const dictWord of dict) {
		if (!uniqueDict.includes(dictWord)) {
			uniqueDict.push(dictWord);
		}
	}

	word = uniqueDict[Math.floor(Math.random() * uniqueDict.length)];
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
			}

			const isWin = currGuess.toLowerCase() == word;
			if (isWin || guesses.length >= 6) {
				clearInterval(clockTimerId);
				resultTextContainer.innerHTML = isWin
					? 'You win!'
					: `You lose.<br/>Why didn't you try <span id="answer-word">${word}</span>?`;
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
				}
				const numGames = parseInt(localStorage.numGames || 0) + 1;
				localStorage.numGames = numGames;
				localStorage.numWins = JSON.stringify(numWins);
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
			if (guess.toLowerCase() == word && e.key == 'Enter') {
				isGameOver = true;
				clearInterval(clockTimerId);
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

function clearStats() {
	delete localStorage.times;
	delete localStorage.numGames;
	delete localStorage.numWins;
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
		let minTime = 1e12;
		let meanTime = 0;
		for (const time of times) {
			meanTime += time / times.length;
			minTime = Math.min(minTime, time);
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
		let numGames = 0;
		html += '<table id="game-stats">';
		for (let i = 1; i <= 6; i++) {
			const width = factor * (numWins[i] || 0);
			html += '<tr>';
			html += `<td>${i}</td>`;
			if (numWins[i]) {
				html += `<td><div class="num-wins-bar" style="width: ${width}px;">${numWins[i]}</div></td>`;
				sum += i * numWins[i];
				numGames += numWins[i];
			}
			html += '</tr>';
		}
		html += '</table>';
		html += '<div id="mean-num-guesses-container">';
		html += `Mean guesses: <span id="mean-num-guesses">${(
			sum / numGames
		).toFixed(1)}</span>`;
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
	let secs = Math.round(t % 60);
	if (secs < 10) {
		secs = '0' + secs;
	}
	return `${Math.floor(t / 60)}:${secs}`;
}
