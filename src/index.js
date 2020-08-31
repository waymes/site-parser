
const ExcelParser = require('./ExcelParser');
const WebsiteResolver = require('./WebsiteResolver');
const logger = require('./logger');
const config = require('../config.json');

const websiteIndex = process.argv[2];
const website = config.websites[websiteIndex];
if (!website) {
  logger.error('please add this website to config')
  process.exit(1);
}

const parser = new ExcelParser(website);
const resolver = new WebsiteResolver(website);

parser.readFile().then((parsedData) => {
  if (!parsedData[0]) return;
  
  const rows = parsedData[0].data.slice(1);
  const startFetching = Date.now();
  resolver.resolve(rows).then((responses) => {
    const execMs = Date.now() - startFetching;
    logger.info(`fetched in: ${Math.floor(execMs / 1000)}s.`);
    const returnData = [
      {
        name: parsedData[0].name,
        data: [parsedData[0].data[0]].concat(responses)
      }
    ];
    parser.writeFile(returnData).then(() => {
      logger.info('done!');
    });
  });
});

