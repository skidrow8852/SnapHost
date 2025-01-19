"use server";

import { db } from "@/server/db";
import { SigninSchema } from "@/validators/signin-validator";
import { SignupSchema } from "@/validators/signup-validator";
import { compare, hash } from "bcrypt";
import { signIn } from "next-auth/react";

export const signup = async (formData: FormData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate form data using schema
  const validate = SignupSchema.safeParse({ name,email, password });

  if (!validate.success) {
    return {
      success: false,
      errors: validate.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if the email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validate.data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email is already registered.",
      };
    }

    // Hash the password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const hashedPassword = await hash(validate.data.password, 10);

    // Create a new user in the database
    const user = await db.user.create({
      data: {
        name: validate.data.name,
        email: validate.data.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
      },
    });

    // Sign in the user immediately using credentials
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: validate.data.email,
      password, 
    });

    if (!signInResult?.ok) {
      return {
        success: false,
        message: "Failed to create a session. Please sign in manually.",
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error during signup:", error);
    return {
      success: false,
      message: "Failed to sign up. Please try again later.",
    };
  }
};



export const signin = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate the form data using the SigninSchema
  const validate = SigninSchema.safeParse({ email, password });

  if (!validate.success) {
    return {
      success: false,
      errors: validate.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if the user exists in the database
    const existingUser = await db.user.findUnique({
      where: { email: validate.data.email },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const isPasswordValid = await compare(
      validate.data.password,
      existingUser.password as string || ""
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Sign in the user immediately using credentials
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: validate.data.email,
      password, 
    });

    if (!signInResult?.ok) {
      return {
        success: false,
        message: "Failed to create a session.",
      };
    }

    return {
      success: true,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      message: "Failed to sign in. Please try again later.",
    };
  }
};