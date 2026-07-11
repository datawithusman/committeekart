/*
 * Authentication server actions.
 * These handle signup, login, and logout on the server side.
 * Uses Supabase Auth with email and password.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Standard error messages in Roman Urdu for user friendliness. */
const ERROR_MESSAGES = {
  invalid_credentials: "Email ya password ghalat hai.",
  email_taken: "Yeh email pehle se registered hai. Login karein.",
  weak_password: "Password kam az kam 6 characters ka hona chahiye.",
  default: "Kuch masla ho gaya. Dobara koshish karein.",
};

/**
 * Convert Supabase auth error codes into user friendly messages.
 */
function getErrorMessage(errorCode: string | undefined): string {
  switch (errorCode) {
    case "invalid_credentials":
      return ERROR_MESSAGES.invalid_credentials;
    case "email_taken":
      return ERROR_MESSAGES.email_taken;
    case "weak_password":
      return ERROR_MESSAGES.weak_password;
    default:
      return ERROR_MESSAGES.default;
  }
}

/**
 * Signup action: creates a new user account.
 * Also creates a profile row automatically via database trigger.
 */
export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(getErrorMessage(error.code))}`);
  }

  // If email confirmation is enabled, user needs to verify.
  // If disabled (common in dev), they are logged in immediately.
  if (data.user && !data.session) {
    redirect("/login?message=" + encodeURIComponent("Account bana! Ab login karein."));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Login action: authenticates an existing user.
 * Honors the "redirect" query param so deep links work after login.
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getErrorMessage(error.code))}`);
  }

  revalidatePath("/", "layout");
  // Only allow internal redirects (prevent open redirect attacks).
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  redirect(safeRedirect);
}

/**
 * Logout action: signs out the current user.
 */
export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
