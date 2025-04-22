import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const StoreUserSchema = schema.create({
  full_name: schema.string.optional({ escape: true, trim: true }, [
    rules.minLength(4),
    rules.maxLength(80),
  ]),
  username: schema.string({ escape: true, trim: true }, [
    rules.requiredIfNotExists('username'),
    rules.unique({ table: 'profiles', column: 'username', whereNot: { is_deleted: true } }),
  ]),
  email: schema.string({ escape: true, trim: true }, [
    rules.email(),
    rules.requiredIfNotExists('email'),
    rules.unique({ table: 'profiles', column: 'email', whereNot: { is_deleted: true } }),
  ]),
  password: schema.string({ escape: true, trim: true }, [rules.minLength(4)]),
})

export const EditUserSchema = schema.create({
  full_name: schema.string.optional({ escape: true, trim: true }, [
    rules.minLength(4),
    rules.maxLength(80),
  ]),
  gender: schema.string.optional({ escape: true, trim: true }),
  height: schema.number.optional(),
  weight: schema.number.optional(),
  cal_goal: schema.number.optional(),
  protein_goal: schema.number.optional(),
  carbs_goal: schema.number.optional(),
  fat_goal: schema.number.optional(),
  avatar_url: schema.string.optional({ escape: true, trim: true }),
  username: schema.string.optional({ escape: true, trim: true }, [
    rules.unique({ table: 'profiles', column: 'username', whereNot: { is_deleted: true } }),
  ]),
  email: schema.string.optional({ escape: true, trim: true }, [
    rules.email(),
    rules.unique({ table: 'profiles', column: 'email', whereNot: { is_deleted: true } }),
  ]),
  // dob: schema.string.optional({ escape: true, trim: true }),
})

export const LoginSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email()]),
  password: schema.string({ trim: true }),
  rememberMe: schema.boolean.optional(),
})

export const ForgotPasswordSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email()]),
})

export const EditPasswordSchema = schema.create({
  currentPassword: schema.string({ trim: true }),
  newPassword: schema.string({ trim: true }, [rules.minLength(8)]),
})

export const UpdateNotificationTokenSchema = schema.create({
  token: schema.string(),
})
