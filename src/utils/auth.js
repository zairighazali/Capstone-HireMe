export const isLoggedIn = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return Boolean(user?.id);
  } catch {
    return false;
  }
};

// Note:
// this helper function checks if a user is logged in.
// it tries to read the "user" object from localStorage.
// if the object exists and has an `id`, it returns true.
// otherwise (missing or invalid data), it returns false.
// i found it useful for protecting routes or showing user-specific UI.
