// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

//INSERT INTO cats (name)
//VALUES ('TestCat')
//RETURNING id, name`);

let testCompany;
let companyName ="";
let companyCode = "";
let companyDesc = "";
let companyInv = [];


beforeEach(async function () {
    await db.query("DELETE FROM companies");
    let result = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.')
    RETURNING code, name, description`);
    testCompany = result.rows[0];
    companyName = testCompany.name;
    companyCode = testCompany.code;
    companyDesc = testCompany.description;
});

/**GET /companies return companies {code, name} */
describe("GET /companies", function () {
    test("Gets a list of 1 company", async function () {
        const resp = await request(app).get(`/companies`);
        expect(resp.body).toEqual({
          companies: [{code: testCompany.code, name: testCompany.name}],
        });
      });
});

/** GET /companies/:code return comapny with code {code, name, description}*/
describe("GET /companies/:code", function() {
    test("Gets 1 company of certain code", async function () {
        const resp = await request(app).get(`/companies/apple`);
        expect(resp.body).toEqual({
            company: {code: companyCode, name: companyName, description: companyDesc, invoices: companyInv}
        });
    });
});





afterAll(async function () {
    // close db connection --- if you forget this, Jest will hang
    await db.end();
  });