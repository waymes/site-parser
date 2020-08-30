class Logger {
  info = (message) => {
    console.log(`[INFO]: ${message}`);
  }

  error = (message) => {
    console.log(`[ERROR]: ${message}`);
  }
}

module.exports = new Logger();
