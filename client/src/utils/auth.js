import { jwtDecode } from "jwt-decode";

export function getValidToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (decodedToken?.exp && Date.now() >= decodedToken.exp * 1000) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function getDecodedToken() {
  const token = getValidToken();

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}
