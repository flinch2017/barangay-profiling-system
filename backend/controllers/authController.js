import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

const createAuthResponse = (user) => {
  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role,
      barangayId: user.barangay_id
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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address"
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
