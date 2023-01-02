import { faker } from "@faker-js/faker";

describe("leagues", () => {
  beforeEach(() => {
    cy.login();
    cy.visitAndCheck("/");
  });

  after(() => {
    cy.cleanupUser();
  });

  it("should allow you to create a league and view it", () => {
    const testLeague = {
      name: "My First League",
      password: "12345678",
    };

    cy.findByRole("link", { name: /leagues/i }).click();
    cy.findByText("You are not a member of any leagues yet");

    cy.findByRole("link", { name: /\Create league/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(testLeague.name);
    cy.findByRole("textbox", { name: /password/i }).type(testLeague.password);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findAllByTestId("league-member-list-item").should("have.length", 1);
    cy.findByRole("button", { name: /delete/i }).should("be.visible");
  });

  it("should allow you to create a league", () => {
    const testLeague = {
      name: "My First League",
      password: "12345678",
    };

    cy.findByRole("link", { name: /leagues/i }).click();
    cy.findByText("You are not a member of any leagues yet");

    cy.findByRole("link", { name: /\Create league/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(testLeague.name);
    cy.findByRole("textbox", { name: /password/i }).type(testLeague.password);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByRole("button", { name: /delete/i }).click();

    cy.findByText("You are not a member of any leagues yet");
  });
});
