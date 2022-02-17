"use strict";
const express = require("express");

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



module.exports = router;