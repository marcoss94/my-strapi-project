"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerUserService } from "@/lib/strapi";
import { FormState, SignupFormSchema } from "@/validations/auth";
import z from "zod";

const cookieConfig = {
  maxAge: 60 * 60 * 24 * 7, // 30 days
  path: "/",
  httpOnly: true,
  domain:
    process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
  secure: process.env.NODE_ENV === "production",
};

export async function registerUserAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const fields = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedFields = SignupFormSchema.safeParse(fields);
  if (!validatedFields.success) {
    const flattenedErrors = z.flattenError(validatedFields.error);
    return {
      success: false,
      message: "Invalid fields. Please check your input.",
      strapiErrors: null,
      zodErrors: flattenedErrors.fieldErrors,
      data: fields,
    };
  }

  const response = await registerUserService(validatedFields.data);
  console.log(response);
  if (!response || response.error) {
    return {
      success: false,
      message: "Failed to register user",
      strapiErrors: response.error,
      zodErrors: null,
      data: fields,
    };
  }
  const cookieStore = await cookies();
  cookieStore.set("jwt", response.jwt, cookieConfig);

  redirect("/dashboard");
}
