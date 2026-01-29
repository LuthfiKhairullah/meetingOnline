import { NextResponse } from "next/server";

type ApiResponse<T = any> = {
  message: string;
  data?: T;
};

export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function successLoginResponse<T>(
  message: string,
  token?: string,
  data?: T,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      token,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 400,
  errors?: any
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

export function authUserResponse(user: any) {
  return {
    fullname: user.fullname,
    username: user.username,
    email: user.email,
  };
}
