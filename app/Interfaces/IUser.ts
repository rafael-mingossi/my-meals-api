export namespace IUser {
  export namespace DTOs {
    export interface Login {
      email: string
      password: string
      rememberMe?: boolean
    }

    export interface Store {
      username: string
      email: string
      password: string
      full_name?: string
    }

    export interface ForgotPassword {
      email: string
    }

    export interface EditPassword {
      currentPassword: string
      newPassword: string
    }
  }
}
