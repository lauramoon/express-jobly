"use strict";

const app = require("../app");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForQuery } = require("../helpers/sql");

/** Related functions for applications. */

class Application {
  /** Apply for job
   *
   * Add username and job id to applications table
   *
   * Returns { applied: jobId }
   *
   * Warning: should only be called by user or admin!
   */

  static async create(username, jobId, status) {
    try {
      const appRes = await db.query(
        `INSERT INTO applications (username, job_id, status)
          VALUES ($1, $2, $3)
          RETURNING job_id AS "jobId", username, status`,
        [username, jobId, status]
      );
      return appRes.rows[0];
    } catch (err) {
      if (err.code === "23503") {
        throw new NotFoundError();
      }
      if (err.code === "22P02") {
        throw new BadRequestError("Invalid status");
      }
      if (err.code === "23505") {
        throw new BadRequestError(`Duplicate application`);
      }
      throw new BadRequestError();
    }
  }

  /** get all applications
   *
   * returns [ {  jobId, username, status }, ...]
   *
   * Warning: should only be called by admin
   */

  static async findAll() {
    const appRes = await db.query(
      `SELECT job_id AS "jobId", username, status
        FROM applications
        ORDER BY job_id`
    );
    return appRes.rows;
  }

  /** get one application with user and job details
   *
   * returns { status, job: { jobId, title, salary, equity, companyHandle },
   *          user: { username, firstName, lastName, email }}
   *
   * Should only be called by admin or the user on the application
   */

  static async get(username, jobId) {
    // first check if application exists
    const appRes = await db.query(
      `SELECT username
        FROM applications
        WHERE username = $1
          AND job_id = $2`,
      [username, jobId]
    );

    const app = appRes.rows[0];

    if (!app)
      throw new NotFoundError(
        `No application for job ${jobId} and user ${username}`
      );

    const applicationRes = await db.query(
      `SELECT a.status, 
                  j.id, 
                  j.title, 
                  j.salary, 
                  j.equity, 
                  j.company_handle AS "companyHandle",
                  u.username, 
                  u.first_name AS "firstName",
                  u.last_name AS "lastName",
                  u.email
            FROM applications AS a
              JOIN jobs AS j ON (a.job_id = j.id)
              JOIN users AS u ON (a.username = u.username)
            WHERE a.username = $1
              AND a.job_id = $2
            ORDER BY a.job_id`,
      [username, jobId]
    );
    const {
      status,
      id,
      title,
      salary,
      equity,
      companyHandle,
      firstName,
      lastName,
      email,
    } = applicationRes.rows[0];
    const application = {
      status,
      job: { id, title, salary, equity, companyHandle },
      user: { username, firstName, lastName, email },
    };
    return application;
  }

  /** get all user's job applications with job details
   *
   * returns [ {status, jobId, title, salary, equity, companyHandle}, ...]}
   *
   * should only be called by that user or admin
   */

  static async getByUser(username) {
    //first check if user exists
    const userRes = await db.query(
      `SELECT username
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const appRes = await db.query(
      `SELECT a.status, 
                a.job_id AS "jobId", 
                j.title, 
                j.salary, 
                j.equity, 
                j.company_handle AS "companyHandle"
          FROM applications AS a
            JOIN jobs AS j ON (a.job_id = j.id)
          WHERE a.username = $1
          ORDER BY a.job_id`,
      [username]
    );
    return appRes.rows;
  }

  /** get all applications to job with applicant details
   *
   * returns [ { status, username, firstName, lastName, email }, ...]
   *
   * should only be called by admin
   */

  static async getByJob(jobId) {
    //first check if job exists
    const jobRes = await db.query(
      `SELECT id
            FROM jobs
            WHERE id = $1`,
      [jobId]
    );

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job with id: ${jobId}`);

    const appRes = await db.query(
      `SELECT a.status, 
                a.username, 
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.email
          FROM applications AS a
            JOIN users AS u ON (a.username = u.username)
          WHERE a.job_id = $1
          ORDER BY a.username`,
      [jobId]
    );
    return appRes.rows;
  }

  /** Update job status
   *
   * Returns: { jobId, username, status }
   *
   * Warning: ensure only admins can update status
   */

  static async update(username, jobId, status) {
    const appRes = await db.query(
      `UPDATE applications 
          SET status = $1
          WHERE username = $2
            AND job_id = $3
          RETURNING job_id AS "jobId", username, status`,
      [status, username, jobId]
    );

    const app = appRes.rows[0];
    if (!app)
      throw new NotFoundError(
        `No application for job ${jobId} and user ${username}`
      );

    return app;
  }

  /** Delete job application
   *
   * returns undefined; throws error if not found
   *
   * should only be called by admin
   */

  static async remove(username, jobId) {
    const appRes = await db.query(
      `DELETE FROM applications
        WHERE username = $1
          AND job_id = $2
        RETURNING username`,
      [username, jobId]
    );
    const app = appRes.rows[0];
    if (!app)
      throw new NotFoundError(
        `No application for job ${jobId} and user ${username}`
      );
  }
}

module.exports = Application;
