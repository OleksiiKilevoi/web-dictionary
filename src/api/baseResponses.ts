export const errorResponse = (code: string, message: string) => (
  {
    status: 'ERROR',
    code,
    message,
  });

export const okResponse = (data?: object) => (
  {
    status: 'OK',
    code: 200,
    data,
  }
);
