import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://dorjfmsahrfoaulbkxyp.supabase.co";
const supabaseKey = "sb_publishable_mQaPt-405KegoLM4AUyb6g_dSGQsp-f"; // anon key only

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ================= SIGN UP ================= */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    showToast(error.message);
    return;
  }

  // ✅ Force logout immediately after signup
  await supabase.auth.signOut();

  showToast("Signup successful! Please login.", "success");

  // Redirect to login page
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

/* ================= LOGIN ================= */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log("LOGIN ERROR:", error.message);
    showToast(error.message);
    return;
  }

  showToast("Login successful!", "success");

  setTimeout(() => {
    window.location.href = "combine.html";
  }, 1000);
}


/* ================= LOAD PROFILE (Protected pages) ================= */
export async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");

    if (nameField) nameField.value = data.full_name || "";
    if (emailField) emailField.value = data.email || "";
  }
}

/* ================= LOGOUT ================= */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

/* ================= LOAD PROFILE ================= */
export async function loadProfiles() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return;

  // Fill fields if present
  document.getElementById("firstName")?.setAttribute("value", data.first_name || "");
  document.getElementById("lastName")?.setAttribute("value", data.last_name || "");
  document.getElementById("emailField")?.setAttribute("value", data.email || "");
  document.getElementById("phoneField")?.setAttribute("value", data.phone || "");
  document.getElementById("dobField")?.setAttribute("value", data.dob || "");
  // Greeting text
const greeting = document.getElementById("greeting");
if (greeting && data.first_name) {
  greeting.textContent = `Hi ${data.first_name}!`;
}


  if (data.gender) {
    document.querySelector(`input[name="gender"][value="${data.gender}"]`)?.click();
  }
}

/* ================= UPDATE PROFILE ================= */
export async function updateProfile(profile) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,   // ✅ THIS IS THE KEY FIX
      ...profile
    });

  if (error) {
    throw error;
  }

  return true;
}

/* ================= GOOGLE LOGIN ================= */
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/combine.html"
    }
  });

  if (error) {
    showToast(error.message);

  }
}