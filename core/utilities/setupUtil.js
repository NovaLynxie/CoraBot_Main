const fs = require('fs');
const { stripIndents } = require('common-tags');
const { mkdir, writeFile } = fs;
const prompt = require('prompt');

console.log('Welcome to the Quick Setup Utility!');
console.log('This setup utility will help you configure your bot credentials and basic setup.');
console.log('Please follow the prompts to start setting up the bot.');
console.log('------------------------------------------------------');
const schema = {
	properties: {
		credStore: {
			description: 'Credential Storage',
			message: 'Store credentials in DotEnv or TOML?',
			validator: /e[nv]*|t[oml]?/,
			warning: 'Please choose env or toml to store credentials.',
			default: 'toml',
		},
		botToken: {
			description: 'Discord Bot Token',
			warning: 'Discord bot token is required for code to function.',
			type: 'string',
			hidden: true,
			replace: '*',
			required: true,
		},
		botPrefix: {
			description: 'Set bot\'s unique prefix (optional)',
			message: 'No prefix was provided. Falling back to default prefix \'z!\'.',
			default: 'z!',
		},
		clientSecret: {
			description: 'Discord Client Secret',
			warning: 'This is required for OAuth code grants! Dashboard won\'t function correctly!',
			hidden: true,
			replace: '*',
			required: false,
		},
		sessionSecret: {
			description: 'Dashboard Session Secret',
			message: 'No session secret was set Using \'CoraBot\' as secret.',
			type: 'string',
			default: 'CoraBot',
		},
		cheweyApiKey : {
			description: 'Enter valid cheweybot api token (press enter to skip)',
			message: 'No valid token provided! Some modules will not function correctly.',
			type: 'string',
			hidden: true,
			replace: '*',
			default: '',
		},
		yiffyApiToken : {
			description: 'Enter valid yiffy api token (press enter to skip)',
			message: 'No valid token provided! Some modules will not function correctly.',
			type: 'string',
			hidden: true,
			replace: '*',
			default: '',
		},
		youtubeApiToken : {
			description: 'Enter valid youtube api token (press enter to skip)',
			message: 'No valid token provided! Some modules will not function correctly.',
			type: 'string',
			hidden: true,
			replace: '*',
			default: '',
		},
	},
};

prompt.start();

const dataDir = './data', settingsDir = './settings';
const authCfgPath = `${settingsDir}/auth.toml`, dirEnvPath = './.env', mainCfgPath = `${settingsDir}/main.toml`;

function generateDirectory(targetDir) {
	mkdir(targetDir, { recursive: true }, (err) => {
		if (err) {
			if (err.code === 'EEXIST') {
				return console.warn('Directory already exists!');
			}
			else {
				console.error(`${err.code} ${err.message}`);
			}
		}
	});
}
function settingsWriter(path, data) {
	writeFile(path, data, (err) => {
		console.info(`Writing config data to ${path}...`);
		if (err) {
			console.error(`Failed to write to file at ${path}!`);
			console.error(err); console.debug(err.stack);
		}
		else {
			console.info(`Saved config to ${path}.`);
		}
	});
}
function promptError(err) {
	if (err.message.indexOf('canceled') > -1) {
		return console.warn('\nSetup has been cancelled!');
	}
	else {
		console.error('Something went wrong during setup process!');
		console.error(err);
		console.debug(err.stack);
	}
}

generateDirectory(dataDir); generateDirectory(settingsDir);

const authCfgTemplate = fs.readFileSync('./core/assets/text/authConfigTemplate.txt', 'utf-8');
const mainCfgTemplate = fs.readFileSync('./core/assets/text/mainConfigTemplate.txt', 'utf-8');

prompt.get(schema, function(err, result) {
	console.log('\n------------------------------------------------------');
	if (err) return promptError(err);
	let authCfgData = authCfgTemplate, mainCfgData = mainCfgTemplate;
	console.log('Generating auth config from template...');
	console.log('Generating main config from template...');
	const authCfgRegex = [
		'<DISCORDTOKEN>', '<CLIENTSECRET>', '<SESSIONSECRET>', '<YIFFYAPIKEY>', '<CHEWEYAPITOKEN>', '<YOUTUBEAPIKEY>',
	];
	const mainCfgRegex = [
		'<PREFIX>', '<DOTENV>',
	];
	console.log('Preparing auth configuration.');
	authCfgRegex.forEach(regex => {
		let value;
		switch (regex) {
		case '<DISCORDTOKEN>':
			value = (!result.botToken || !result.botToken === '') ? 'NOT_SET' : result.botToken;
			break;
		case '<CLIENTSECRET>':
			value = (!result.clientSecret || !result.clientSecret === '') ? 'NOT_SET' : result.clientSecret;
			break;
		case '<SESSIONSECRET>':
			value = (!result.sessionSecret || !result.sessionSecret === '') ? 'NOT_SET' : result.sessionSecret;
			break;
		case '<CHEWEYAPITOKEN>':
			value = (!result.cheweyApiKey || !result.cheweyApiKey === '') ? 'NOT_SET' : result.cheweyApiKey;
			break;
		case '<YIFFYAPIKEY>':
			value = (!result.yiffyApiKey || !result.yiffyApiKey === '') ? 'NOT_SET' : result.yiffyApiKey;
			break;
		case '<YOUTUBEAPIKEY>':
			value = (!result.youtubeApiKey || !result.youtubeApiKey === '') ? 'NOT_SET' : result.youtubeApiKey;
			break;
		default:
			console.warn('missing.item.error');
		}
		authCfgData = authCfgData.replace(regex, value);
	});
	console.log('Auth configuration ready!');
	console.log('Preparing main configuration.');
	mainCfgRegex.forEach(regex => {
		let value;
		switch (regex) {
		case '<PREFIX>':
			value = (result.botPrefix) ? result.botPrefix : 'z?';
			break;
		case '<DOTENV>':
			value = (result.credStore.match(/e[nv]/gi)) ? true : false;
			break;
		default:
			console.warn('missing.item.error');
		}
		mainCfgData = mainCfgData.replace(regex, value);
	});
	console.log('Main configuration ready!');
	if (result.credStore.match(/e[nv]/gi)) {
		const botEnvData = stripIndents`# lynxbot process environment variables
    discordToken=${result.botToken}
    clientSecret=${result.clientSecret}
    sessionSecret=${result.sessionSecret}
    cheweyApiToken=${result.cheweyApiKey}
    yiffyApiKey=${result.yiffyApiToken}
    youtubeApiKey=${result.youtubeApiToken}`;
		settingsWriter(dirEnvPath, botEnvData);
	}
	else
	if (result.credStore.match(/t[oml]/gi)) {
		settingsWriter(authCfgPath, authCfgData);
	};
	settingsWriter(mainCfgPath, mainCfgData);
  console.log('\n------------------------------------------------------');
});