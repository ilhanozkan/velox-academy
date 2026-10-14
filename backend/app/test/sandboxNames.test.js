const { toResourceName, userInstanceName } = require("../services/vmServices");

describe("Compute Engine resource names", () => {
  const VALID = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;

  it("keeps simple names readable", () => {
    expect(userInstanceName(7, "web-dev-101")).toBe("user-7-training-web-dev-101-vm");
  });

  it("normalises characters Compute Engine rejects", () => {
    const name = toResourceName("1_User 7/Training_ÇOK-Özel--");
    expect(name).toMatch(VALID);
  });

  it("shortens long names without collisions", () => {
    const a = userInstanceName(1, "a-very-long-training-identifier-that-goes-on-and-on-alpha");
    const b = userInstanceName(1, "a-very-long-training-identifier-that-goes-on-and-on-beta");

    expect(a.length).toBeLessThanOrEqual(63);
    expect(a).toMatch(VALID);
    expect(a).not.toBe(b);
  });
});
