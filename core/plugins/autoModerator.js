const logger = require('../utils/winstonLogger.js');
let status = 0;

module.exports = async (message, client) => {
	const guild = message.guild;
	const { autoMod } = await client.settings.guild.get(guild);
	if (!autoMod || Object.keys(autoMod).length <= 1) {
		if (status !== -1) {
			logger.error('Missing or undefined settings object returned!');
			logger.error('Module service \'AutoModerator\' stopped with errors!');
			logger.warn('Is the settings not yet setup or misconfigured?');
			status = -1;
		};
	};
	if (autoMod.enableAutoMod === false) return;
	const { chListMode, channelsList, urlBlacklist, mediaTrackers } = autoMod;
	const { removeGifs, removeImgs, removeVids, removeURLs } = mediaTrackers;
	const channel = guild.channels.cache.get(message.channel.id);
	const user = message.author;
	logger.verbose(`user=${user.name}(#${user.discriminator})`);
	logger.verbose(`channelID=${channel.id} (${typeof channel.id});`);
	logger.verbose(`channels=${channelsList} (${typeof channelsList})`);
	logger.verbose(`channelsListMode=${chListMode} (${typeof chListMode})`);
	logger.verbose(`mediaTrackers={removeGifs=${typeof removeGifs}, removeImgs=${typeof removeImgs}, removeVids=${typeof removeVids}, removeURLs=${typeof removeURLs}}`);
	let channelSearcher;
	if (!chListMode || chListMode === undefined || chListMode === null) {
		logger.error('Severe Error! channelsListMode was not defined!');
		logger.warn('AutoModerator will fail if this is not set correctly!');
		return;
	};
	if (chListMode == 'whitelist') {
		logger.debug('using channels list as whitelist');
		const index = channelsList.indexOf(channel.id);
		logger.debug(`channelsList index=${index}`);
		channelSearcher = channelsList.indexOf(channel.id) <= 0;
	};
	if (chListMode == 'blacklist') {
		logger.debug('using channels list as blacklist');
		const index = channelsList.indexOf(channel.id);
		logger.debug(`index=${index}`);
		channelSearcher = channelsList.indexOf(channel.id) >= -1;
	};
	if (channelSearcher) {
		logger.debug(`Searching messages in channel #${channel.name} (<#${channel.id}>)`);
		if (message.author.bot) return logger.debug('bot.message_ignore()');
		if (message.attachments.size > 0) {
			logger.debug(`gifChecker resolved as ${removeGifs === 'yes' && message.attachments.every(attachedIsGif)}`);
			if (removeGifs === 'yes' && message.attachments.every(attachedIsGif)) {
				logger.debug('Detected file type \'gif\' in attachments! Removing now.');
				logger.info(`Caught ${user.username}#${user.discriminator} posting gifs in ${channel.name}! Removing offending message.`);
				message.delete();
				message.reply('you cannot post gifs here! Please use another channel.');
				return;
			};
			logger.debug(`imageChecker resolved as ${removeImgs === 'yes' && message.attachments.every(attachedIsImage)}`);
			if (removeImgs === 'yes' && message.attachments.every(attachedIsImage)) {
				logger.debug('Detected file type \'image\' in attachments! Removing now.');
				logger.info(`Caught ${user.username}#${user.discriminator} posting gifs in ${channel.name}! Removing offending message.`);
				message.delete();
				message.reply('you cannot post videos here! Please use another channel.');
				return;
			};
			logger.debug(`videoChecker resolved as ${removeVids && message.attachments.every(attachedIsVideo)}`);
			if (removeVids && message.attachments.every(attachedIsVideo)) {
				logger.info(`Caught ${user.username}#${user.discriminator} posting gifs in ${channel.name}! Removing offending message.`);
				logger.debug('Detected file type \'video\' in attachments! Removing now.');
				message.delete();
				message.reply('you cannot post videos here! Please use another channel.');
			};
		} else {
			logger.debug('Message contained no media. Ignoring.');
		};
		logger.debug(`urlChecker resolved as ${removeURLs === 'yes' && message.content.startsWith('https://')}`);
		if (removeURLs === 'yes' && message.content.startsWith('https://')) {
			logger.debug(`urlBlacklist ${urlBlacklist} (${typeof urlBlacklist})`);
			logger.debug('Detected https_url, searching content');
			urlBlacklist.forEach(url => {
				logger.debug(`Scanning for blacklisted ${url} in message content.`);
				logger.debug(`message.content -> ${message.content}`);
				logger.debug(`urlBlacklistCheck -> result=${message.content.indexOf(url)}`);
				if (message.content.indexOf(url) != -1) {
					logger.debug('Detected url link in message! Removing now.');
					logger.info(`Caught ${user.name} posting blacklisted links in ${channel.name}! Removing offending message.`);
					message.delete();
					message.reply('that link is blacklisted here! Please use another channel.');
					return false;
				};
			});
		};
	};
	logger.debug(`channelSearcher resolved as ${channelSearcher}`);
	function attachedIsGif(msgAttach) {
		const url = msgAttach.url;
		logger.debug('Scanning for extension gif in url.');
		return url.indexOf('gif', url.length - 'gif'.length) !== -1;
	};
	function attachedIsImage(msgAttach) {
		const url = msgAttach.url;
		logger.verbose(`msgAttach.url=${url}`);
		const fileType = ['jpeg', 'png', 'webp', 'jpg'];
		let res;
		fileType.every(ext => {
			logger.verbose(typeof ext);
			logger.debug(`Scanning for extension ${ext} in url.`);
			if (url.indexOf(ext, url.length - ext.length) !== -1) {
				logger.debug(`Found extension type ${ext} in url!`);
				return false, res = url.indexOf(ext, url.length - ext.length) !== -1;
			};
		});
		return res;
	};
	function attachedIsVideo(msgAttach) {
		const url = msgAttach.url;
		const fileType = ['mp4', 'm4v', 'webm', 'mov', 'flv', 'avi'];
		let res;
		fileType.every(ext => {
			logger.debug(`Scanning for extension '.${ext}' in url.`);
			if (url.indexOf(ext, url.length - ext.length) !== -1) {
				logger.debug(`Found extension type ${ext} in url!`);
				return false, res = url.indexOf(ext, url.length - ext.length) !== -1;
			};
		});
		return res;
	};
};