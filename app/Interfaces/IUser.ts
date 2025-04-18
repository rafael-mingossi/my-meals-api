import BaseInterface from "App/Shared/Interfaces/BaseInterface";
import Profile from "App/Models/Profile";

export namespace IUser {
  export interface Repository extends BaseInterface<typeof Profile>, Helpers { }

  export interface Helpers { }

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

    export type Edit = {
      full_name?: string
      gender?: string
      username?: string
      email?: string
      avatar_url?: string
      height?: number
      weight?: number
      cal_goal?: number
      protein_goal?: number
      carbs_goal?: number
      fat_goal?: number
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
