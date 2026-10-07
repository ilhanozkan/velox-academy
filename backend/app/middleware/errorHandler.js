const {
  ValidationError,
  NotFoundError,
  UniqueViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
  CheckViolationError,
  DataError,
} = require("objection");
const multer = require("multer");

const { HttpError } = require("../utils/httpError");

const FIELD_LABELS = {
  username: "Kullanıcı adı",
  email: "E-posta",
  password: "Parola",
  full_name: "Ad soyad",
  name: "Ad",
  id: "Kimlik",
  slug: "Kısa ad",
  image_file_path: "Görsel",
  level: "Seviye",
  estimated_minutes: "Süre",
  content: "İçerik",
  position: "Sıra",
  role: "Rol",
  status: "Durum",
};

// Turkish versions of the Ajv messages users can actually trigger.
const describeRule = ({ keyword, params = {} }) => {
  switch (keyword) {
    case "required":
      return "zorunludur";
    case "minLength":
      return `en az ${params.limit} karakter olmalıdır`;
    case "maxLength":
      return `en fazla ${params.limit} karakter olabilir`;
    case "pattern":
      return "geçerli bir biçimde değil";
    case "enum":
      return `şunlardan biri olmalıdır: ${params.allowedValues?.join(", ")}`;
    case "minimum":
      return `en az ${params.limit} olmalıdır`;
    case "type":
      return "geçersiz türde";
    default:
      return "geçersiz";
  }
};

const validationDetails = (error) =>
  Object.fromEntries(
    Object.entries(error.data || {}).map(([field, problems]) => {
      const key = problems[0]?.keyword === "required"
        ? problems[0].params?.missingProperty || field
        : field;
      return [key, `${FIELD_LABELS[key] || key} ${describeRule(problems[0] || {})}`];
    })
  );

const toResponse = (error) => {
  if (error instanceof HttpError)
    return { status: error.status, body: { error: error.message, details: error.details } };

  if (error instanceof ValidationError) {
    const details = validationDetails(error);
    return {
      status: 400,
      body: { error: Object.values(details)[0] || "Geçersiz veri", details },
    };
  }

  if (error instanceof NotFoundError)
    return { status: 404, body: { error: "Kayıt bulunamadı" } };

  if (error instanceof UniqueViolationError) {
    const fields = error.columns?.join(", ");
    return {
      status: 409,
      body: { error: "Bu kayıt zaten mevcut", details: fields ? { fields } : undefined },
    };
  }

  if (error instanceof ForeignKeyViolationError)
    return { status: 409, body: { error: "İlişkili kayıt bulunamadı veya kayıt kullanımda" } };

  if (
    error instanceof NotNullViolationError ||
    error instanceof CheckViolationError ||
    error instanceof DataError
  )
    return { status: 400, body: { error: "Geçersiz veri" } };

  if (error instanceof multer.MulterError)
    return {
      status: error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
      body: {
        error:
          error.code === "LIMIT_FILE_SIZE"
            ? "Dosya boyutu sınırı aşıldı"
            : "Dosya yüklenemedi",
      },
    };

  // express.json() parse errors
  if (error.type === "entity.parse.failed")
    return { status: 400, body: { error: "İstek gövdesi geçerli bir JSON değil" } };
  if (error.type === "entity.too.large")
    return { status: 413, body: { error: "İstek gövdesi çok büyük" } };

  return null;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const response = toResponse(error);

  if (!response) {
    console.error(`${req.method} ${req.originalUrl}`, error);
    return res.status(500).json({ error: "Sunucu hatası" });
  }

  if (response.status >= 500) console.error(error);
  res.status(response.status).json(response.body);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "İstenen kaynak bulunamadı" });
};

module.exports = { errorHandler, notFoundHandler };
