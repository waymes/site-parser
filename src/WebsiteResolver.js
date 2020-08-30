const htmlParser = require('node-html-parser');
const fetch = require('isomorphic-unfetch');
const utils = require('./utils');

class WebsiteResolver {
  constructor(website) {
    this.website = website;
  }

  resolve(rows) {
    const chunks = this.createChunks(rows);
    utils.printInfo(`got ${chunks.length} chunks...`)
    return new Promise((resolve, reject) => {
      this.processChunks(chunks)
        .then(resolve)
        .catch(error => reject(error));
    });
  }

  createChunks = (rows) => {
    const MAX_AMOUNT_IN_CHUNK = 50;
    const chunks = [];
    let numberOfChunks = rows.length / MAX_AMOUNT_IN_CHUNK;
    if (numberOfChunks % 1 !== 0) {
      numberOfChunks = Math.floor(numberOfChunks) + 1;
    }
    for (let i = 0; i < numberOfChunks; i++) {
      const currentId = i * MAX_AMOUNT_IN_CHUNK;
      chunks[i] = rows.slice(currentId, currentId + MAX_AMOUNT_IN_CHUNK);
    }
    return chunks;
  }

  processChunks(chunks, currentId = 0, previousResponses = []) {
    if (!chunks[currentId]) return Promise.resolve([]);
  
    const currentChunk = chunks[currentId];
    const hasNextChunk = !!chunks[currentId + 1];
  
    utils.printInfo(`fetching ${currentId + 1} chunk...`)
    return Promise.all(currentChunk.map(this.fetchProduct)).then((responses) => {
      if (hasNextChunk) {
        return this.processChunks(chunks, currentId + 1, previousResponses.concat(responses));
      }
      return previousResponses.concat(responses);
    });
  }

  fetchProduct = (product) => {
    const id = product[0];
    return new Promise((resolve, reject) => {
      fetch(`${this.website}/search/index.php?q=${id}`)
        .then(res => res.text())
        .then(html => {
          const element = htmlParser.parse(html).querySelector('.b-catalog-list__text a');
          let link = element.getAttribute('href')
          if (link.charAt(0) === '/') {
            link = this.website + link;
          }
          resolve([id, link]);
        })
        .catch(() => {
          utils.printError('Error loading website');
          resolve([id, ''])
        });
    });
  }
}

module.exports = WebsiteResolver;
