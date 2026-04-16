@ui @web
Feature: User Authentication
  As a Vikunja user
  I want to be able to authenticate securely
  So that I can access my projects and tasks

  Background:
    Given the application is accessible

  @smoke @login @positive @TC_001
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter username "dilipwilliam"
    And I enter password "Test@123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should not see the login form

  @login @negative @TC_002
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter username "dilipwilliam"
    And I enter password "Test@1231"
    And I click the login button
    Then I should see an authentication error message
    And I should remain on the login page

  @smoke @login @positive @TC_003
  Scenario: Login page elements are displayed correctly
    Given I am on the login page
    Then the username field should be visible
    And the password field should be visible
    And the login button should be visible

  @login @negative @TC_004
  Scenario: Login with empty credentials
    Given I am on the login page
    When I enter username ""
    And I enter password ""
    And I click the login button
    Then I should see a validation error

  @login @positive @regression @TC_005
  Scenario Outline: Login with multiple credential sets
    Given I am on the login page
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the login button
    Then I should see an authentication error message

    Examples:
      | username         | password       |
      | dilipwilliam     | Test@1111      |
      | dilipwilliam     | Test@4444    |
