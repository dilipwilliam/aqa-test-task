@ui @web
Feature: Task Management CRUD
  As a logged-in Vikunja user
  I want to manage tasks within my projects
  So that I can track my work items

  Background:
    Given I am logged into the application as "qauser" with password "qaPassword1!"
    And a project titled "Task Test Project" exists
    And I have opened the project "Task Test Project"

  @smoke @task @create @positive
  Scenario: Create a new task in a project
    When I create a task with title "My First Task"
    Then the task "My First Task" should be visible in the task list

  @task @create @positive @regression
  Scenario: Create multiple tasks in a project
    When I create a task with title "Task One"
    And I create a task with title "Task Two"
    And I create a task with title "Task Three"
    Then the task "Task One" should be visible in the task list
    And the task "Task Two" should be visible in the task list
    And the task "Task Three" should be visible in the task list

  @task @update @positive @regression
  Scenario: Mark a task as done
    Given a task titled "Task To Complete" exists in the project
    When I mark the task "Task To Complete" as done
    Then the task "Task To Complete" should be marked as complete

  @task @delete @positive
  Scenario: Delete a task from a project
    Given a task titled "Task To Delete" exists in the project
    When I delete the task "Task To Delete"
    Then the task "Task To Delete" should not be visible in the task list

  @task @read @positive
  Scenario: View all tasks in a project
    Given the project contains at least one task
    Then the task list should be visible and non-empty
