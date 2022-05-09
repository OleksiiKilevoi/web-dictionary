/* eslint-disable max-len */
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

  //   const rowArray = csv.toString().split('\r\n');
  //   const [[_, ...keys], ...values] = rowArray.map((row) => row.split(','));

//   const res = values.reduce((acc, [mainKey, ...value]) => (
//     { ...acc, [mainKey]: { ...keys.reduce((acc, key, i) => ({ ...acc, ...{ [key]: value[i] } }), {}) } }
//   ), {});
//   return res;
};
export default convert;
