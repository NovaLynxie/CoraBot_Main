function draw() {
	const ctx = document.getElementById('<%= guild.name.split(\' \').join(\'\').replace(`\'`, ``) %>').getContext('2d');
	ctx.font = '30px Arial';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'white';
	ctx.fillText('<%= guild.name.split(\' \').map(v => v[0]).join(\'\') %>', 40, 50);
}
draw();