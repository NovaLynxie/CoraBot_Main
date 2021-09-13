document.getElementById('toggleTheme')
	.addEventListener('click', themeHandler);

const siteTheme = document.getElementById('site-theme');

function themeHandler() {
	// Change the value of href attribute
	// to change the css sheet.
	const light = '/public/stylesheets/flatly.css';
	const dark = '/public/stylesheets/darkly.css';
	if (siteTheme.getAttribute('href') == light) {
		themeSwitcher(siteTheme, dark);
	}
	else {
		themeSwitcher(siteTheme, light);
	}
}

function themeSwitcher(element, stylesheet) {
	element.setAttribute('href', stylesheet);
	localStorage.setItem('site-theme', stylesheet);
	const test = localStorage.getItem('site-theme');
	console.log(`test=${test}`);
}