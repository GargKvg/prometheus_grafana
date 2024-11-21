function getRandomValue(array) {
  const randomElement = array[Math.floor(Math.random() * array.length)];
  return randomElement;
}

function doSomeHeavyTask() {
  const ms = getRandomValue([100, 150, 200, 300, 500, 600, 1000, 1400, 2500]);
  const shouldThrowError = getRandomValue([1, 2, 3, 4, 5, 6, 7, 8]) === 8;

  return new Promise((resolve, reject) => {
    if (shouldThrowError) {
      const randomError = getRandomValue([
        "DB Payment Failure",
        "DB Server is Down",
        "Access Denied",
        "Not Found Error",
      ]);
      reject(new Error(randomError));
    } else {
      setTimeout(() => resolve(ms), ms);
    }
  });
}

module.exports = { doSomeHeavyTask };
