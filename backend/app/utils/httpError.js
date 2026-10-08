/**
 * An error with an HTTP status code. Anything thrown from a route handler is
 * turned into a JSON response by middleware/errorHandler.js; HttpError
 * messages are shown to the user, other errors become a generic 500.
 */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message = "Geçersiz istek", details) =>
  new HttpError(400, message, details);
const unauthorized = (message = "Oturum açmanız gerekiyor") =>
  new HttpError(401, message);
const forbidden = (message = "Bu işlem için yetkiniz yok") =>
  new HttpError(403, message);
const notFound = (message = "Kayıt bulunamadı") => new HttpError(404, message);
const conflict = (message, details) => new HttpError(409, message, details);
const serviceUnavailable = (message) => new HttpError(503, message);

/** Wraps an async route handler so rejected promises reach the error handler. */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/** Returns only the listed keys of an object that are not undefined. */
const pick = (source, keys) =>
  Object.fromEntries(
    keys
      .filter((key) => source?.[key] !== undefined)
      .map((key) => [key, source[key]])
  );

module.exports = {
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serviceUnavailable,
  asyncHandler,
  pick,
};

/**
 * Wraps every static method of a controller class with asyncHandler, so route
 * files can keep referencing `Controller.method` directly.
 */
const wrapController = (Controller) =>
  Object.fromEntries(
    Object.getOwnPropertyNames(Controller)
      .filter((name) => typeof Controller[name] === "function")
      .map((name) => [name, asyncHandler(Controller[name].bind(Controller))])
  );

module.exports.wrapController = wrapController;
