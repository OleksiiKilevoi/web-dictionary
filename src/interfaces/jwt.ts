export enum TokenType {
  ACCESS,
  REFRESH,
}

export interface JwtData {
  id: string;
  type: TokenType;
}
