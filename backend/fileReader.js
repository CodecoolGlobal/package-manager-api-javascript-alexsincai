const { readFile, writeFile } = require("fs/promises");

module.exports = {
    read: async (filePath) => {
        try {
            return await readFile(filePath);
        } catch (error) {
            console.error(`File reading error: ${error.message}`);
        }
    },
    write: async (filePath, data) => {
        try {
            await writeFile(filePath, JSON.stringify(data, null, 4));
            return "DONE";
        } catch (error) {
            console.error(`File reading error: ${error.message}`);
        }
    },
};
