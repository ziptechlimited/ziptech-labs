import { createMeeting } from "../controllers/meetingController";

const createMockResponse = () => {
  const res: any = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((body: any) => {
    res.body = body;
    return res;
  });
  return res;
};

describe("meetingController.createMeeting", () => {
  it("returns 401 when user is not authenticated", async () => {
    const req: any = { user: undefined, body: {} };
    const res = createMockResponse();

    await createMeeting(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ message: "Not authenticated" });
  });

  it("returns 403 when user is not facilitator or admin", async () => {
    const req: any = {
      user: { role: "founder" },
      body: {
        cohort: "cohort-id",
        title: "Test Meeting",
        scheduledAt: new Date().toISOString(),
      },
    };
    const res = createMockResponse();

    await createMeeting(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({
      message: "Not authorized to create meetings",
    });
  });
});

