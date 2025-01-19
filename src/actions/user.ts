"use server";

import { db } from "@/server/db";
import { SignupSchema } from "@/validators/signup-validator";
import { hash } from "bcrypt"; 

export const signup = async (formData: FormData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate the form data using the SignupSchema
  const validate = SignupSchema.safeParse({ name, email, password });

  if (!validate.success) {
    return {
      success: false,
      errors: validate.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await db.user.findUnique({
      where: { email: validate.data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email is already registered.",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const hashedPassword = await hash(validate.data.password, 10);

    // Create a new user in the database
    const user = await db.user.create({
      data: {
        name: validate.data.name,
        email: validate.data.email,
        password: hashedPassword, 
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create user. Please try again later.",
    };
  }
};
