document.getElementById("toggleTheme")
  .addEventListener("click", themeHandler);

var siteTheme = document.getElementById('site-theme');

function themeHandler() {
  // Change the value of href attribute
  // to change the css sheet.  
  var light = '/public/stylesheets/flatly.css';
  var dark = '/public/stylesheets/darkly.css'
  if (siteTheme.getAttribute('href') == light) {
    themeSwitcher(siteTheme, dark);
  } else {
    themeSwitcher(siteTheme, light);
  }
}

function themeSwitcher(element, stylesheet) {
  element.setAttribute('href', stylesheet);
  localStorage.setItem('site-theme', stylesheet);
  let test = localStorage.getItem('site-theme')
  console.log(`test=${test}`)
}