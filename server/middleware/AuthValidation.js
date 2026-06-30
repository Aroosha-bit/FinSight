import Joi from "joi";

const registerValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

const logInValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

const forgotPasswordValidation = (
  req,
  res,
  next
) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
  });

  const { error } =
    schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Bad Request",
      error,
    });
  }

  next();
};

const resetPasswordValidation = (
  req,
  res,
  next
) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .required(),
  });

  const { error } =
    schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Bad Request",
      error,
    });
  }

  next();
};

const updateProfileValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).allow("").optional(),
    currency: Joi.string().allow("").optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Bad Request",
      error,
    });
  }

  next();
};

export { registerValidation, logInValidation, forgotPasswordValidation, resetPasswordValidation, updateProfileValidation };