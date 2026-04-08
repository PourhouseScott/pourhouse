import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "@/utils/jwt";

describe("jwt utils", () => {
  it("signs and verifies a token payload", () => {
    const payload = {
      userId: "user-1",
      email: "user@example.com",
      role: "USER" as const
    };

    const token = signToken(payload);
    const parsed = verifyToken(token);

    expect(token).toEqual(expect.any(String));
    expect(parsed).toMatchObject(payload);
  });
});
