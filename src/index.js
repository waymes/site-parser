
const ExcelParser = require('./ExcelParser');
const WebsiteResolver = require('./WebsiteResolver');
const utils = require('./utils');

const excelFile = process.argv[2];
const website = 'https://masterwatt.ru';

const parser = new ExcelParser(excelFile);
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

