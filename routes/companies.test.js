// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

//INSERT INTO cats (name)
//VALUES ('TestCat')
//RETURNING id, name`);

let testCompany;
let companyName = "";
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
            companies: [{ code: testCompany.code, name: testCompany.name }],
        });
    });
});

/** GET /companies/:code return comapny with code {code, name, description}*/
describe("GET /companies/:code", function () {
    test("Gets 1 company of certain code", async function () {
        const resp = await request(app).get(`/companies/apple`);
        expect(resp.body).toEqual({
            company: { code: companyCode, name: companyName, description: companyDesc, invoices: companyInv }
        });
    });
    test("GET a value NOT in the db", async function () {
        const resp = await request(app).get("/companies/purpleMonkeysInc");
        expect(resp.status).toEqual(404);
    });
});

/** POST /companies adds a company and returns obj of new company: {company: {code, name, description}}*/
describe("POST /companies", function () {
    test("Posts a company and checks return", async function () {
        const resp = await request(app)
            .post("/companies")
            .send({ code: "GOOG", name: "Google", description: "SearchEngine" });
        expect(resp.body).toEqual({
            company: { code: "GOOG", name: "Google", description: "SearchEngine" }
        });
    });
});

/** PUT /companies/:code updates and returns company object: {company: {code, name, description}} */
describe("PUT /companies/:code", function () {
    test("Test a PUT verb to change an existing company entry",
        async function () {
            const resp = await request(app)
                .put("/companies/apple")
                .send({
                    name: "Big O'l Apple",
                    description: "Biggest Apple Ever"
                });
            expect(resp.body).toEqual(
                {
                    company: {
                        code: "apple",
                        name: "Big O'l Apple",
                        description: "Biggest Apple Ever"
                    }
                });
        });
});

/** DELETE /companies/:code Returns {status: "deleted"}*/
describe("DELETE /companies/:code", function () {
    test("DELETE a value in the db", async function () {
        const resp = await request(app).delete("/companies/apple");
        expect(resp.body).toEqual({ message: "Deleted" });
    });
    test("DELETE a value NOT in the db", async function () {
        const resp = await request(app).delete("/companies/purpleMonkeysInc");
        expect(resp.status).toEqual(404);
    });
});


afterAll(async function () {
    // close db connection --- if you forget this, Jest will hang
    await db.end();
});