import { describe, it, expect } from "vitest";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "../src/validators/announcements.validator";

describe("Announcement validation", () => {
  it("should accept valid announcement data", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "MacBook Pro 2020",
      description: "Good condition, works perfectly",
      price: "1500",
      category: "Electronics",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.price).toBe(1500);
    }
  });

  it("should reject invalid announcement data", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "AB",
      description: "",
      price: "-100",
      category: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject empty update data", () => {
    const result = updateAnnouncementSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
