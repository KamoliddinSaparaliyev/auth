class HttpException extends Error {
  statusCode: number;

  constructor(statusCode: number, public readonly message: string | any) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default HttpException;
