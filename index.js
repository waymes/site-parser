const path = require('path');
const fs = require('fs');
const xlsx = require('node-xlsx');
const htmlParser = require('node-html-parser');
const fetch = require('isomorphic-unfetch');

const excelFile = process.argv[2];
const filePath = path.resolve(__dirname, 'files', excelFile);
const domainLink = 'https://masterwatt.ru';

fs.readFile(filePath, (err, buffer) => {
  if (err) {
    printError(`Errors parsing ${excelFile}, does file exist?`);
  }
  const parsedData = xlsx.parse(buffer);
  if (!parsedData[0]) {
    return;
  }
  const rows = parsedData[0].data;
  Promise.all(rows.slice(1).map(fetchProduct))
    .then(responses => {
      const returnData = [
        {
          name: parsedData[0].name,
          data: [rows[0]].concat(responses)
        }
      ];
      const buffer = xlsx.build(returnData);
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          printError('Error changing excel file')
        }
        console.log('Successfully added links!')
      });
    });
});

const fetchProduct = (product) => {
  const id = product[0];
  return new Promise((resolve, reject) => {
    fetch(`${domainLink}/search/index.php?q=${id}`)
      .then(res => res.text())
      .then(html => {
        const element = htmlParser.parse(html).querySelector('.b-catalog-list__text a');
        let link = element.getAttribute('href')
        if (link.charAt(0) === '/') {
          link = domainLink + link;
        }
        resolve([id, link]);
      })
      .catch(() => printError('Error loading website'));
  });
}

const printError = (error) => {
  const separators = Array(error.length).fill('=').join('');
  console.log(separators);
  console.log(error);
  console.log(separators)
}