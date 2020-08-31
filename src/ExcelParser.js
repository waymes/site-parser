const path = require('path');
const fs = require('fs');
const xlsx = require('node-xlsx');
const logger = require('./logger');

class ExcelParser {
  constructor(website) {
    this.website = website;
    this.file = path.resolve(__dirname, '../files', website.fileName);
  }

  readFile() {
    logger.info('reading file...');
    return new Promise((resolve, reject) => {
      fs.readFile(this.file, (err, buffer) => {
        if (err) {
          logger.error(`Error parsing "${this.website.fileName}", does file exist?`);
          reject(err);
        }
        const parsedData = xlsx.parse(buffer);
        resolve(parsedData);
      });
    });
  }

  writeFile(data) {
    logger.info('writing to file...');
    const buffer = xlsx.build(data);
    return new Promise(resolve => {
      fs.writeFile(this.file, buffer, (err) => {
        if (err) {
          logger.error('Error changing excel file')
        } else {
          resolve();
        }
      });
    })
  }
}

module.exports = ExcelParser;
