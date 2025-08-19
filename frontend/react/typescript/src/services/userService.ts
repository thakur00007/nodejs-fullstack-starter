// import axios from "axios";
import type { ApiResponse, User, UserLogin, UserSignup } from "../types/";
import ApiError from "../util/ApiError";
import { setValue, getValue } from "../util/localStorage";

export class UserService {
  url: string;
  accessToken: string | null;
  constructor() {
    this.url = `${import.meta.env.VITE_API_HOST_URL}${
      import.meta.env.VITE_API_DEFAULT_PATH
    }/user`;
    this.accessToken = getValue("access-token");
  }

  async userSignup(userDetails: UserSignup) {
    try {
      const response = await fetch(this.url + "/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userDetails }),
      });

      const responseData: ApiResponse<{ user: User }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async userLogin(credentials: UserLogin) {
    try {
      const response = await fetch(this.url + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: credentials }),
      });

      const responseData: ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }
      responseData.data.accessToken &&
        setValue("access-token", responseData.data.accessToken);
      responseData.data.refreshToken &&
        setValue("refresh-token", responseData.data.refreshToken);

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async getCurrentUser() {
    try {
      // const token = localStorage.getItem('auth-token');
      if (!this.accessToken) {
        throw new Error("No token found");
      }
      const response = await fetch(this.url + "/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.accessToken,
        },
      });
      const responseData: ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async logout() {
    try {
      if (!this.accessToken) {
        throw new Error("No token found");
      }
      const response = await fetch(this.url + "/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.accessToken,
        },
      });
      const responseData: ApiResponse<unknown> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  // async changePassword(data) {
  //   try {
  //     if (!this.token) {
  //       throw new Error("No token found");
  //     }

  //     const response = await fetch(this.url + "/changepassword", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + this.token,
  //       },
  //       body: JSON.stringify({ data }),
  //     });

  //     const responseData = await response.json();
  //     if (!response.ok) {
  //       throw new Error(responseData.message);
  //     }

  //     return responseData;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async updateProfile(data) {
  //   try {
  //     if (!this.token) {
  //       throw new Error("No token found");
  //     }

  //     const response = await fetch(this.url + "/updateprofile", {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + this.token,
  //       },
  //       body: JSON.stringify({ data }),
  //     });

  //     const responseData = await response.json();
  //     if (!response.ok) {
  //       throw new Error(responseData.message);
  //     }

  //     return responseData;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
export default UserService;
