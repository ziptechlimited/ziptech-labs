import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("emailService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("creates a transporter once and sends a verification email", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
    process.env.EMAIL_FROM = "no-reply@example.com";
    process.env.APP_BASE_URL = "http://localhost:5001";
    const emailService = await import("../services/emailService");
    const sendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as unknown as jest.Mock).mockReturnValue({
      sendMail,
    });

    // First call configures transporter
    await emailService.sendVerificationEmail("user@example.com", "testtoken");
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const args = sendMail.mock.calls[0][0];
    expect(args.to).toBe("user@example.com");
    expect(args.subject).toMatch(/Verify/);
    expect(args.html).toMatch(/testtoken/);

    // Second call reuses transporter
    await emailService.sendVerificationEmail(
      "user@example.com",
      "anothertoken",
    );
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});
