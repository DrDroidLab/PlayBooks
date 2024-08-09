import { authenticatedRoutes } from "@/utils/auth/authenticatedRoutes";

import {
  isUnAuth,
  unauthenticatedRoutes,
} from "@/utils/auth/unauthenticatedRoutes";

describe("isUnAuth - is unauthenticated page", () => {
  unauthenticatedRoutes.forEach((path) => {
    test(`should return true for path ${path}`, () => {
      expect(isUnAuth(path)).toBe(true);
    });
  });

  authenticatedRoutes.forEach((path) => {
    test(`should return false for path ${path}`, () => {
      expect(isUnAuth(path)).toBe(false);
    });
  });
});
