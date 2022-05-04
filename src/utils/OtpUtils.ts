export const generateProdOtp = (): string => {
  const result = [];
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 4; i += 1) {
    result.push(characters.charAt(Math.floor(Math.random()
                * charactersLength)));
  }
  return result.join('');
};

export const generateDevOtp = (): string => '1111';
