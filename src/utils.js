exports.printInfo = (message) => {
  console.log(`[INFO]: ${message}`);
}

exports.printError = (message) => {
  const errorMessage = `[ERROR]: ${message}`;
  console.log(errorMessage);
}