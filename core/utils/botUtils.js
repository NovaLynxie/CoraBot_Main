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
  days = (hours > 1) ? hours / 24 : 1;
  weeks = days  / 7;
  months = days / 30.417;
  years = months / 12;
  duration = { seconds, minutes, hours, days, weeks, months };
  return duration;
};

module.exports = { calcAccAge, calcDuration };