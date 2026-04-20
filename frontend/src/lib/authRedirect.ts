const KEY = "postLoginRedirect";

export const setPostLoginRedirect = (path: string) => {
  if (path && path !== "/login") {
    sessionStorage.setItem(KEY, path);
  }
};

export const consumePostLoginRedirect = (): string => {
  const path = sessionStorage.getItem(KEY);
  if (path) sessionStorage.removeItem(KEY);
  return path || "/";
};

// Hard navigation. Separated from consumePostLoginRedirect so tests can mock it.
export const hardRedirectTo = (path: string) => {
  window.location.href = path;
};
