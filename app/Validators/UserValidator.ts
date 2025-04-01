import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const LoginSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email()]),
  password: schema.string(),
  rememberMe: schema.boolean.optional(),
})

export const StoreUserSchema = schema.create({
  username: schema.string({ trim: true }, [rules.unique({ table: 'profiles', column: 'username' })]),
  email: schema.string({ trim: true }, [
    rules.email(),
    rules.unique({ table: 'profiles', column: 'email' }),
  ]),
  password: schema.string({}, [rules.minLength(6)]),
  full_name: schema.string.optional(),
})

export const ForgotPasswordSchema = schema.create({
  email: schema.string({ trim: true }, [rules.email()]),
})

export const EditPasswordSchema = schema.create({
  currentPassword: schema.string(),
  newPassword: schema.string({}, [rules.minLength(6)]),
})
