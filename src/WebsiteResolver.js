const htmlParser = require('node-html-parser');
const fetch = require('isomorphic-unfetch');
const logger = require('./logger');
const config = require('../config.json');

class WebsiteResolver {
  constructor(website) {
    this.website = website;
  }

  resolve(rows) {
    const chunks = this.createChunks(rows);
    logger.info(`got ${chunks.length} chunks.`)
    return this.processChunks(chunks);
  }

  createChunks = (rows) => {
    const requestsInParallel = config.numberOfRequestsInParallel;
    const chunks = [];
    let numberOfChunks = rows.length / requestsInParallel;
    if (numberOfChunks % 1 !== 0) {
      numberOfChunks = Math.floor(numberOfChunks) + 1;
    }
    for (let i = 0; i < numberOfChunks; i++) {
      const currentId = i * requestsInParallel;
      chunks[i] = rows.slice(currentId, currentId + requestsInParallel);
    }
    return chunks;
  }

  processChunks(chunks, currentId = 0, previousResponses = []) {
    if (!chunks[currentId]) return Promise.resolve([]);
  
    const currentChunk = chunks[currentId];
    const hasNextChunk = !!chunks[currentId + 1];
  
    logger.info(`fetching ${currentId + 1} chunk...`)
    return Promise.all(currentChunk.map(this.fetchProduct)).then((responses) => {
      if (hasNextChunk) {
        return this.processChunks(chunks, currentId + 1, previousResponses.concat(responses));
      }
      return previousResponses.concat(responses);
    });
  }

  fetchProduct = (product) => {
    const id = product[0];
    return new Promise((resolve) => {
      this.fetchHTML(`${this.website.searchUrl}${id}`)
        .then(html => {
          const linkElement = htmlParser.parse(html).querySelector(this.website.linkSelector);
          const link = this.getLinkFromElement(linkElement, 'href', this.website.searchUrl);
          if (!link) {
            throw new Error();
          }
          this.fetchHTML(link)
            .then(html => {
              const imageElement = htmlParser.parse(html).querySelector('.swiper-slide a img');
              const imageLink = this.getLinkFromElement(imageElement, 'src', link);
              resolve([id, link, imageLink]);
            })
            .catch(() => resolve([id, link]))
        })
        .catch(() => {
          logger.error('Error loading website');
          resolve([id, ''])
        });
    });
  }

  fetchHTML(link) {
    return fetch(link).then(res => res.text());
  }

  getLinkFromElement(element, attr, fullLink) {
    if (!element) return '';
    let link = element.getAttribute(attr);
    if (link && link.trim().charAt(0) === '/') {
      const url = new URL(fullLink);
      link = url.origin + link.trim();
    }
    return link;
  }
}

module.exports = WebsiteResolver;
