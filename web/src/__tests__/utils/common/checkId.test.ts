import checkId from "@/utils/common/checkId";

describe("checkId - function to check if an id is a valid backend ID (numeric)", () => {
  it("should return the same numerical ID if it is a valid ID", () => {
    expect(checkId("123")).toBe("123");
    expect(checkId("456789")).toBe("456789");
  });

  it('should return "0" for non-numeric IDs', () => {
    expect(checkId("abc")).toBe("0");
    expect(checkId("123abc")).toBe("0");
    expect(checkId("abc123")).toBe("0");
    expect(checkId("!@#$%^&*()")).toBe("0");
  });

  it('should return "0" for IDs with mixed characters', () => {
    expect(checkId("12a3")).toBe("0");
    expect(checkId("4567b89")).toBe("0");
  });

  it('should return "0" for empty strings', () => {
    expect(checkId("")).toBe("0");
  });

  it('should return "0" for IDs with whitespace', () => {
    expect(checkId(" 123")).toBe("0");
    expect(checkId("123 ")).toBe("0");
    expect(checkId("12 34")).toBe("0");
  });

  it('should return "0" for IDs with special characters', () => {
    expect(checkId("123!")).toBe("0");
    expect(checkId("@456")).toBe("0");
  });

  it("should return the same numerical ID for long numeric strings", () => {
    expect(checkId("12345678901234567890")).toBe("12345678901234567890");
  });
});
