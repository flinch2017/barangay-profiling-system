import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_.]{2,29}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8}$/;

function validateAccountDetails({ username, email, password }) {
  if (username && !usernamePattern.test(username.trim())) return "Username must be 3–30 characters and use letters, numbers, periods, or underscores only.";
  if (email && !emailPattern.test(email.trim().toLowerCase())) return "Enter a valid email address.";
  if (password && !passwordPattern.test(password)) return "Password must be exactly 8 characters and include uppercase, lowercase, number, and special character.";
  return "";
}

export const createAuthResponse = (user) => {
  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role,
      barangayId: user.barangay_id
      ,residentId: user.resident_id,
      updatedAt: user.updated_at
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      barangayId: user.barangay_id
      ,residentId: user.resident_id
    }
  };
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const authResponse = createAuthResponse(user);

    return res.json({
      success: true,
      ...authResponse
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const signupBarangayAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      barangayId,
      role = "barangay_admin"
    } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      !barangayId
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and barangay ID are required"
      });
    }

    if (role !== "barangay_admin") {
      return res.status(400).json({
        success: false,
        message: "Invalid role for barangay admin signup"
      });
    }

    const validationError = validateAccountDetails({ username, email, password });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedBarangayId = barangayId.trim();

    if (
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedBarangayId
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and barangay ID cannot be blank"
      });
    }

    const {
      data: existingUser,
      error: existingUserError
    } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", trimmedUsername)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    const {
      data: existingEmail,
      error: existingEmailError
    } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existingEmailError) {
      throw existingEmailError;
    }

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const {
      data: user,
      error
    } = await supabase
      .from("users")
      .insert({
        username: trimmedUsername,
        email: trimmedEmail,
        password_hash: passwordHash,
        role: "barangay_admin",
        barangay_id: trimmedBarangayId
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const authResponse = createAuthResponse(user);

    return res.status(201).json({
      success: true,
      ...authResponse
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const updateAccountProfile = [verifyToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    if (!username || !email) return res.status(400).json({ message: "Username and email are required" });
    const validationError = validateAccountDetails({ username, email, password: newPassword || undefined });
    if (validationError) return res.status(400).json({ message: validationError });
    if (newPassword && !currentPassword) return res.status(400).json({ message: "Enter your current password to change it" });
    const { data: currentUser, error } = await supabase.from("users").select("*").eq("user_id", req.user.userId).single();
    if (error) throw error;
    if (newPassword && !(await bcrypt.compare(currentPassword, currentUser.password_hash))) return res.status(401).json({ message: "Current password is incorrect" });
    const trimmedUsername = username.trim(); const trimmedEmail = email.trim().toLowerCase();
    const { data: duplicate } = await supabase.from("users").select("user_id").or(`username.eq.${trimmedUsername},email.eq.${trimmedEmail}`).neq("user_id", currentUser.user_id).maybeSingle();
    if (duplicate) return res.status(409).json({ message: "Username or email is already in use" });
    const update = { username: trimmedUsername, email: trimmedEmail, updated_at: new Date().toISOString() };
    if (newPassword) update.password_hash = await bcrypt.hash(newPassword, 10);
    const { data: updatedUser, error: updateError } = await supabase.from("users").update(update).eq("user_id", currentUser.user_id).select("*").single();
    if (updateError) throw updateError;
    return res.json({ success: true, ...createAuthResponse(updatedUser), message: "Account profile updated" });
  } catch (error) { console.error(error); return res.status(500).json({ message: `Unable to update account profile: ${error.message}` }); }
}];
