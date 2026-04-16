@ui @web
Feature: User Registration
  As a new Vikunja user
  I want to create an account
  So that I can access my projects and tasks

  Background:
    Given the application is accessible

  @smoke @register @positive @TC_006
  Scenario: Successfully create a new account with random credentials
    Given I am on the login page
    When I click the "Create account" link
    And I fill in the registration form with random credentials
    And I click the "Create account" button
    Then I should see the "Winding down" welcome message on the dashboard
