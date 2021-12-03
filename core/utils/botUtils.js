function calcAccAge(date) {
  const sysDate = new Date();
  const accDate = new Date(date);
  const diff = sysDate - accDate;
  const seconds = Math.floor(diff / 1000),
    minutes = Math.floor(seconds / 60),
    hours   = Math.floor(minutes / 60),
    days    = Math.floor(hours / 24),
    months  = Math.floor(days / 30),
    years   = Math.floor(days / 365);
  const lt1 = (num) => num > 1;  
  const res = (lt1(years)) ? `${years} years` : '' || (lt1(months)) ? `${months} months` : '' || (lt1(days)) ? `${days} days` : '' || (lt1(hours)) ? `${hours} hrs` : '' || (lt1(minutes)) ? `${minutes} mins` : 'less than a minute';
  return res;
};
function calcDuration(msecs) {
  let seconds, minutes, hours, days, weeks, months, years, duration;
  seconds = msecs / 1000;
  minutes = seconds / 60;
  hours = minutes / 60;
  days = hours / 24;
  weeks = days / 7;
  months = days / 30.417;
  years = months / 12;
  duration = { seconds, minutes, hours, days, weeks, months };
  return duration;
};
function getDuration(input) {
  /*
  let minutes, hrs, days, duration, array = input.split(' ');
  days = array[0] ? array[0].replace('d','') : 0; days = parseInt(days);
  hours = array[0] ? array[0].replace('d','') : 0; hours = parseInt(hours);
  minutes = array[0] ? array[0].replace('d','') : 0; minutes = parseInt(minutes);
  seconds = input.substr(input.indexOf('d', -1))
  duration = { minutes, hours, days };
  return duration;
  */
};

module.exports = { calcAccAge, calcDuration, getDuration };