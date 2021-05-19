"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************* new job app - POST /users/:username/jobs/:id */

describe("POST /users/:username/jobs/:id - new job app", () => {
  test("works for admin", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/1`)
      .send({ status: "interested" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      applied: { status: "interested", username: "u1", jobId: 1 },
    });
  });

  test("works for logged-in user", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/1`)
      .send({ status: "interested" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      applied: { status: "interested", username: "u1", jobId: 1 },
    });
  });

  test("forbidden for non-admin trying to access other user", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/1`)
      .send({ status: "interested" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/1`)
      .send({ status: "interested" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .post(`/users/nope/jobs/1`)
      .send({ status: "interested" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such job", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/0`)
      .send({ status: "interested" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if status invalid", async function () {
    const resp = await request(app)
      .post(`/users/u1/jobs/1`)
      .send({ status: "maybe" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/*********************all job apps for user - GET /users/:username/jobs */

describe("GET /users/:username/jobs - all job apps for user", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      applications: [
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
      ],
    });
  });

  test("works for applicant", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      applications: [
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
      ],
    });
  });

  test("forbidden for non-admin trying to access other user", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs`)
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1/jobs`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .get(`/users/nope/jobs`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/********************* details of job app - GET /users/:username/jobs/:id */

describe("GET /users/:username/jobs/:id - details of one job app", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      application: {
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
          email: "user1@user.com",
        },
      },
    });
  });

  test("works for applicant", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      application: {
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
          email: "user1@user.com",
        },
      },
    });
  });

  test("forbidden for non-admin trying to access other user", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1/jobs/2`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .get(`/users/nope/jobs/2`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such job", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such application", async function () {
    const resp = await request(app)
      .get(`/users/u1/jobs/1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************ update app status PATCH /users/:username/id/:id */

describe("PATCH /users/:username/jobs/:id - update app status", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/2`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      application: { status: "accepted", username: "u1", jobId: 2 },
    });
  });

  test("works for applicant", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/2`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      application: { status: "accepted", username: "u1", jobId: 2 },
    });
  });

  test("forbidden for non-admin trying to access other user", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/2`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/2`)
      .send({ status: "accepted" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .patch(`/users/nope/jobs/2`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such job", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/0`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such application", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/1`)
      .send({ status: "accepted" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if status invalid", async function () {
    const resp = await request(app)
      .patch(`/users/u1/jobs/2`)
      .send({ status: "maybe" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/********************************** DELETE /users/:username/id/:id */

describe("DELETE /users/:username/id/:id - delete app", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: { jobId: 2, username: "u1" } });
  });

  test("works for applicant", async function () {
    const resp = await request(app)
      .delete(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: { jobId: 2, username: "u1" } });
  });

  test("forbidden for non-admin, non-applicant", async function () {
    const resp = await request(app)
      .delete(`/users/u1/jobs/2`)
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/u1/jobs/2`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .delete(`/users/nope/jobs/2`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such job", async function () {
    const resp = await request(app)
      .delete(`/users/u1/jobs/0`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such application", async function () {
    const resp = await request(app)
      .delete(`/users/u1/jobs/1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
