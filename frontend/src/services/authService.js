import axios from "axios";
import { apiUrl } from "../lib/api";

export const loginUser = async (
  username,
  password
) => {
  const response = await axios.post(
    apiUrl("/api/auth/login"),
    {
      username,
      password
    }
  );

  return response.data;
};

export const signupBarangayAdmin = async (
  username,
  email,
  password,
  barangayId,
  role
) => {
  const response = await axios.post(
    apiUrl("/api/auth/signup/barangay-admin"),
    {
      username,
      email,
      password,
      barangayId,
      role
    }
  );

  return response.data;
};
