for (let n = 1; n <= 170; n++) {
	console.log(n, factorial(n));
}

function factorial(n) {
	if (n == 1) {
		return 1;
	}
	return n * factorial(n - 1);
}
