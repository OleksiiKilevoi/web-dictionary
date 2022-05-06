const convert = (csv: Buffer): {
  [key: string]: {
    [key: string]: string;
  };
} => {
  const rowArray = csv.toString().split('\r\n');
  const array = rowArray.map((row) => row.split(','));

  const result: {[key: string]: {[key: string]: string}} = {};
  for (let i = 1; i < array.length; i += 1) {
    result[array[i][0]] = {};
    for (let j = 1; j < array[i].length; j += 1) {
      result[array[i][0]][array[0][j]] = array[i][j];
    }
  }
  return result;
};
export default convert;
