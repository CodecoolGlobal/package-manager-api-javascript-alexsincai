const { readFile } = require('fs/promises');

module.exports = async () => {
	try {
		return await readFile(filePath);
	} catch (error) {
		console.error(`File reading error: ${error.message}`);
	}
}
