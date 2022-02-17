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

  const invoiceQuery = db.query(`
    SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices
    WHERE id = $1`,
    [invoiceId]
  );
  const invoice = invoiceQuery.rows[0];
  if (!invoice) throw new NotFoundError(`No matching invoice at code: ${invoiceId}`);

  const comp_code = invoice.comp_code;

  const companyQuery = db.query(`
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



module.exports = router;