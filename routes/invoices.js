"use strict";
const express = require("express");
const { NotFoundError } = require("../expressError");
const db = require("../db");

const router = express.Router();

/**
 * Return info on invoices:
 * {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res, next) {
  const invoiceQuery = await db.query(
    'SELECT id, comp_code FROM invoices'
  );
  const invoices = invoiceQuery.rows;
  return res.json({ invoices });
});

/**
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: 
 *  {id, amt, paid, add_date, paid_date, 
 *  company: {code, name, description}}
 */
router.get("/:id", async function (req, res, next) {
  const invoiceId = req.params.code;

  const invoiceQuery = await db.query(`
    SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices
    WHERE id = $1`,
    [invoiceId]
  );
  const invoice = invoiceQuery.rows[0];
  if (!invoice) throw new NotFoundError(`No matching invoice at code: ${invoiceId}`);

  const comp_code = invoice.comp_code;

  const companyQuery = await db.query(`
    SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [comp_code]
  );
  const company = companyQuery.rows[0];
  delete invoice.comp_code;
  invoice.company = company;
  return res.json({ invoice });
});

/**Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

router.post("/", async function (req, res, next) {
  let { comp_code, amt } = req.body;

  const invoiceQuery = await db.query(
    `INSERT INTO invoices(comp_code, amt)
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );

  const invoice = invoiceQuery.rows[0];
  return res.json({ invoice });
});

/** Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

router.put("/:id", async function (req, res, next) {
  let id = req.params.id;
  let { amt } = req.body;

  const invoiceQuery = await db.query(
    `UPDATE invoices
    SET amt = $1,
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date
  `, [amt, id]);

  const invoice = invoiceQuery.rows[0];

  if (!invoice) throw new NotFoundError(`No invoice with ${id}`);

  return res.json({ invoice });
});

/**Deletes an invoice.
If invoice cannot be found, returns a 404.
Returns: {status: "deleted"} */

router.delete("/:id", async function (req, res, next) {
  let id = req.parans.id;

  const invoiceQuery = await db.query(
    `DELETE
      FROM invoices
      WHERE id = $1
      RETURNING id`,
    [id]
  );

  const invoice = invoiceQuery.rows[0];
  if (!invoice) throw new NotFoundError(`No invoice with ${id}`);

  return res.json({ status: "deleted" });
});

module.exports = router;