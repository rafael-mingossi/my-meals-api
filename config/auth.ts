import { AuthConfig } from '@ioc:Adonis/Addons/Auth'
import Env from "@ioc:Adonis/Core/Env";

const authConfig: AuthConfig = {
  guard: 'jwt',
  guards: {
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'api_tokens',
        foreignKey: 'user_id',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/Profile'),
      },
    },
    jwt: {
      driver: "jwt",
      publicKey: Env.get('JWT_PUBLIC_KEY', '').replace(/\\n/g, '\n'),
      privateKey: Env.get('JWT_PRIVATE_KEY', '').replace(/\\n/g, '\n'),
      persistJwt: false,
      jwtDefaultExpire: '10m',
      refreshTokenDefaultExpire: '10d',
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'jwt_tokens',
        foreignKey: 'user_id'
      },
      provider: {
        driver: "lucid",
        identifierKey: "id",
        uids: ['email'],
        model: () => import('App/Models/Profile')
      }
    },
  },
}

export default authConfig
