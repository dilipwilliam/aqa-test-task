@api
Feature: Vikunja REST API Tests
  As a QA engineer
  I want to verify the Vikunja REST API behaves correctly
  So that I can ensure backend functionality independently of the UI

  Background:
    Given the API base URL is configured

  @smoke @api-auth @positive
  Scenario: Authenticate via API and receive a token
    When I send a POST login request with username "qauser" and password "qaPassword1!"
    Then the API response status code should be 200
    And the response body should contain a "token" field
    And the token should not be empty

  @api-auth @negative
  Scenario: API login with invalid credentials returns error
    When I send a POST login request with username "nonexistent" and password "badpassword"
    Then the API response status code should be 401
    And the response body should contain an error message

  @smoke @api-projects @positive
  Scenario: Create a project via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    When I send a PUT request to "/projects" with title "API Created Project"
    Then the API response status code should be 201
    And the response body should contain field "title" with value "API Created Project"
    And the response body should contain a numeric "id" field

  @api-projects @positive @regression
  Scenario: Read all projects via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    When I send a GET request to "/projects"
    Then the API response status code should be 200
    And the response body should be a valid JSON array

  @api-projects @positive @regression
  Scenario: Update a project title via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    And a project exists via API with title "Project To Update Via API"
    When I send a POST request to update the project title to "Updated Via API"
    Then the API response status code should be 200
    And the response body should contain field "title" with value "Updated Via API"

  @api-projects @positive @regression
  Scenario: Delete a project via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    And a project exists via API with title "Project To Delete Via API"
    When I send a DELETE request to remove the project
    Then the API response status code should be 200

  @smoke @api-tasks @positive
  Scenario: Create a task in a project via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    And a project exists via API with title "Task API Test Project"
    When I create a task via API with title "API Task One"
    Then the API response status code should be 201
    And the response body should contain field "title" with value "API Task One"

  @api-tasks @positive @regression
  Scenario: Read all tasks in a project via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    And a project exists via API with title "Task Read Project"
    When I send a GET request to retrieve tasks for the project
    Then the API response status code should be 200
    And the response body should be a valid JSON array

  @api-tasks @positive @regression
  Scenario: Delete a task via API
    Given I am authenticated via API as "qauser" with password "qaPassword1!"
    And a project exists via API with title "Task Delete Project"
    And a task exists via API with title "Task To Delete Via API"
    When I send a DELETE request to remove the task
    Then the API response status code should be 200
