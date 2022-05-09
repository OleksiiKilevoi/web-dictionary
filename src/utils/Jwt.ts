import jwt from 'jsonwebtoken';

import { JwtData, TokenType } from '../interfaces/jwt';

class Jwt {
  private readonly jwt: typeof jwt;
  private readonly secret: string;

  public constructor() {
    this.jwt = jwt;
    this.secret = process.env.ACCESS_TOKEN_SECRET;
  }

  public createAccessToken = (id: number) => (
    this.jwt.sign({ type: TokenType.ACCESS, id }, this.secret, { expiresIn: '4h' }));

  public verifyAccessToken = (token: string) => {
    const decoded = this.jwt.verify(token, this.secret) as JwtData;

    if (decoded.type === TokenType.ACCESS) return decoded;

    throw new Error('wrong token type');
  };

  public createRefreshToken = (id: number) => (
    this.jwt.sign({ id, type: TokenType.REFRESH }, this.secret, { expiresIn: '30d' }));

  public verifyRefreshToken = (token: string) => {
    const decoded = this.jwt.verify(token, this.secret) as JwtData;

    if (decoded.type === TokenType.REFRESH) return decoded;

    throw new Error('wrong token type');
  };
}

export default Jwt;
