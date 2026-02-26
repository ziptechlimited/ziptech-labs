import { createCheckIn } from "../controllers/checkInController";

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

describe("checkInController.createCheckIn", () => {
  it("returns 400 when goalId is missing", async () => {
    const req: any = {
      user: { _id: "user-id" },
      body: {
        status: "done",
      },
    };
    const res = createMockResponse();

    await createCheckIn(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ message: "Missing goalId" });
  });
});

