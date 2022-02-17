"use strict";
const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db");

const router = express.Router();

/** Get route to return all companies' information 
 * {companies: [{code, name}, ...]}
*/
router.get("/", async function (req, resp, next) {
  const companyQuery = await db.query(
    'SELECT code, name FROM companies'
  );
  const companies = companyQuery.rows;
  return resp.json({ companies });

});

/** Get route to return company with certain code
 * {company: {code, name, description}}
 * If company doesn't exist throw 404 status response
 */
router.get("/:code", async function (req, res, next) {
  let code = req.params.code;

  const companyQuery = await db.query(`
    SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [code]
  );

  const company = companyQuery.rows[0];
  if (!company) throw new NotFoundError();
  return res.json({ company });
});

/** Add company 
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
*/
router.post("/", async function (req, res, next) {
  let { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];

  return res.json({ company });
})

module.exports = router;