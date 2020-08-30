
const ExcelParser = require('./ExcelParser');
const WebsiteResolver = require('./WebsiteResolver');
const utils = require('./utils');
const config = require('../config.json');

const websiteIndex = process.argv[2];
const website = config.websites[websiteIndex];
if (!website) {
  utils.printError('please add this website to config')
  process.exit(1);
}

const parser = new ExcelParser(website);
const resolver = new WebsiteResolver(website);

utils.printInfo('reading file...');
parser.readFile().then((parsedData) => {
  if (!parsedData[0]) return;
  
  const rows = parsedData[0].data.slice(1);
  resolver.resolve(rows).then((responses) => {
    const returnData = [
      {
        name: parsedData[0].name,
        data: [parsedData[0].data[0]].concat(responses)
      }
    ];
    parser.writeFile(returnData).then(() => {
      utils.printInfo('done!');
    });
  });
});

