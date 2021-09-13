document.getElementById('toggleTheme')
	.addEventListener('click', themeSwitcher);

function themeSwitcher() {
	const theme = document.getElementById('theme');
	// Change the value of href attribute
	// to change the css sheet.
	const light = '/public/stylesheets/flatly.css';
	const dark = '/public/stylesheets/darkly.css';
	if (theme.getAttribute('href') == light) {
		theme.setAttribute('href', dark);
		localStorage.setItem('site-theme', dark);
	}
	else {
		theme.setAttribute('href', light);
		localStorage.setItem('site-theme', light);
	}
}