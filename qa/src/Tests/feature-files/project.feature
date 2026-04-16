@ui @web
Feature: Project Management CRUD
  As a logged-in Vikunja user
  I want to manage my projects
  So that I can organize my tasks effectively

  Background:
    Given I am logged into the application as "qauser" with password "qaPassword1!"

  @smoke @project @create @positive
  Scenario: Create a new project
    Given I am on the projects page
    When I create a project with title "Smoke Test Project"
    Then the project "Smoke Test Project" should be visible in the project list

  @project @create @positive @regression
  Scenario: Create multiple projects with unique titles
    Given I am on the projects page
    When I create a project with title "Project Alpha"
    And I create a project with title "Project Beta"
    Then the project "Project Alpha" should be visible in the project list
    And the project "Project Beta" should be visible in the project list

  @project @read @positive
  Scenario: View existing projects on the projects page
    Given I am on the projects page
    Then the projects page should display a list of projects

  @project @delete @positive
  Scenario: Delete an existing project
    Given I am on the projects page
    And a project titled "Project To Delete" exists
    When I delete the project "Project To Delete"
    Then the project "Project To Delete" should not be visible in the project list

  @project @update @positive @regression
  Scenario: Update an existing project title
    Given I am on the projects page
    And a project titled "Project To Update" exists
    When I update the project title from "Project To Update" to "Updated Project Title"
    Then the project "Updated Project Title" should be visible in the project list
    And the project "Project To Update" should not be visible in the project list

  @project @create @negative
  Scenario: Attempt to create a project with an empty title
    Given I am on the projects page
    When I attempt to create a project with an empty title
    Then I should see a project title validation error
