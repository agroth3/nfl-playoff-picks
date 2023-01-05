import { faker } from "@faker-js/faker";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";

describe("leagues", () => {
  beforeEach(() => {
    cy.login();
    cy.visitAndCheck("/leagues");
  });

  after(() => {
    cy.cleanupUser();
  });

  it("should allow you to create a league and view it", () => {
    const testLeague = {
      name: "My First League",
      password: "12345678",
    };

    cy.findByRole("link", { name: /\Create league/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(testLeague.name);
    cy.findByRole("textbox", { name: /password/i }).type(testLeague.password);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByText(testLeague.name);
  });
});
