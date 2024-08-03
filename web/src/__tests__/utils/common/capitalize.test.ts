import capitalizeFirstLetter from "@/utils/common/capitalize";

describe("capitalizeFirstLetter - Capitalizes the first letter of a string", () => {
  it("should capitalize the first letter of a lowercase word", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
  });

  it("should capitalize the first letter of an uppercase word", () => {
    expect(capitalizeFirstLetter("World")).toBe("World");
  });

  it("should handle empty strings gracefully", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it("should capitalize the first letter and keep the rest of the string unchanged", () => {
    expect(capitalizeFirstLetter("jAVAscript")).toBe("JAVAscript");
  });

  it("should work with strings that have leading spaces", () => {
    expect(capitalizeFirstLetter("  space")).toBe("  space");
  });

  it("should work with strings that start with numbers", () => {
    expect(capitalizeFirstLetter("123abc")).toBe("123abc");
  });

  it("should return the same string if it contains only one character", () => {
    expect(capitalizeFirstLetter("a")).toBe("A");
    expect(capitalizeFirstLetter("Z")).toBe("Z");
  });

  it("should handle strings with special characters at the start", () => {
    expect(capitalizeFirstLetter("!hello")).toBe("!hello");
    expect(capitalizeFirstLetter("@world")).toBe("@world");
  });
});
