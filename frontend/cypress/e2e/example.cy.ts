// https://on.cypress.io/api

// login with username user123 and select room javascript

const login = () => {

  cy.visit('/')
  // input username
  cy.get('#username').type('user123')
  // select room
  cy.get('#room').select('JavaScript')
  // click submit
  cy.get('.btn').click()
}

// send message
describe('Chat Application', () => {
  beforeEach(() => {
    login()
  })

  it('Send message', () => {
    // input message
    cy.get('#msg').type('Hello Cypress')
    // click send
    cy.get('.btnSubmit').click()
    // check if message is sent
    cy.contains('Hello Cypress').should('be.visible')

    // logout
    cy.get('.btnLogout').click()
  })
})