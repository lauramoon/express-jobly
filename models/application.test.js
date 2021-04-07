"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Application = require("./application");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const app = require("../app");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** apply */
describe("create", function () {
  test("works", async function () {
    const app = await Application.create("u1", 1, "interested");
    expect(app).toEqual({
      jobId: 1,
      username: "u1",
      status: "interested",
    });
  });

  test("not found if no such user", async function () {
    try {
      await Application.create("u0", 1, "interested");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Application.create("u1", 10, "interested");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with invalid status", async function () {
    try {
      await Application.create("u1", 1, "maybe");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request with dup app", async function () {
    try {
      await Application.create("u1", 1, "interested");
      await Application.create("u1", 1, "interested");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("get all apps", function () {
  test("works", async function () {
    const apps = await Application.findAll();
    expect(apps).toEqual([
      { jobId: 2, username: "u1", status: "interested" },
      { jobId: 3, username: "u1", status: "applied" },
      { jobId: 3, username: "u2", status: "applied" },
      { jobId: 4, username: "u2", status: "rejected" },
    ]);
  });
});

describe("get specific app", function () {
  test("works", async function () {
    const app = await Application.get("u1", 2);
    expect(app).toEqual({
      status: "interested",
      job: {
        id: 2,
        title: "j2",
        salary: 60000,
        equity: "0.01",
        companyHandle: "c1",
      },
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
      },
    });
  });

  test("not found if no such user", async function () {
    try {
      await Application.get("u9", 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Application.get("u1", 10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such application", async function () {
    try {
      await Application.get("u1", 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("get all of user's apps", function () {
  test("works", async function () {
    const apps = await Application.getByUser("u1");
    expect(apps).toEqual([
      {
        status: "interested",
        jobId: 2,
        title: "j2",
        salary: 60000,
        equity: "0.01",
        companyHandle: "c1",
      },
      {
        status: "applied",
        jobId: 3,
        title: "j3",
        salary: 40000,
        equity: "0",
        companyHandle: "c2",
      },
    ]);
  });

  test("get empty array if user has no apps", async function () {
    const apps = await Application.getByUser("u3");
    expect(apps).toEqual([]);
  });

  test("not found if no such user", async function () {
    try {
      await Application.getByUser("u0");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("get all applicants to job", function () {
  test("works", async function () {
    const apps = await Application.getByJob(3);
    expect(apps).toEqual([
      {
        status: "applied",
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
      },
      {
        status: "applied",
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
      },
    ]);
  });

  test("get empty array if job has no applicants", async function () {
    const apps = await Application.getByJob(1);
    expect(apps).toEqual([]);
  });

  test("not found if no such job", async function () {
    try {
      await Application.getByJob(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update app status", function () {
  test("works", async function () {
    const app = await Application.update("u1", 3, "accepted");
    expect(app).toEqual({ jobId: 3, username: "u1", status: "accepted" });
  });

  test("not found if no such user", async function () {
    try {
      await Application.update("u0", 3, "accepted");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Application.update("u1", 10, "accepted");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such application", async function () {
    try {
      await Application.update("u1", 1, "accepted");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with invalid status", async function () {
    try {
      await Application.create("u1", 3, "maybe");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove app", function () {
  test("works", async function () {
    const app = await Application.remove("u1", 3);
    expect(app).toEqual(undefined);
    const res = await db.query(
      "SELECT * FROM applications WHERE username='u1' AND job_id=3"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await Application.remove("u0", 3);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job", async function () {
    try {
      await Application.remove("u1", 10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such application", async function () {
    try {
      await Application.remove("u1", 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
