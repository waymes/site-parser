const path = require('path');
const fs = require('fs');
const xlsx = require('node-xlsx');
const utils = require('./utils');

class ExcelParser {
  constructor(website) {
    this.website = website;
    this.file = path.resolve(__dirname, '../files', website.excel);
  }

  readFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.file, (err, buffer) => {
        if (err) {
          utils.printError(`Error parsing "${this.website.excel}", does file exist?`);
          reject(err);
        }
        const parsedData = xlsx.parse(buffer);
        resolve(parsedData);
      });
    });
  }

  writeFile(data) {
    const buffer = xlsx.build(data);
    utils.printInfo('writing to file...');
    return new Promise(resolve => {
      fs.writeFile(this.file, buffer, (err) => {
        if (err) {
          utils.printError('Error changing excel file')
        } else {
          resolve();
        }
      });
    })
  }
}

module.exports = ExcelParser;
