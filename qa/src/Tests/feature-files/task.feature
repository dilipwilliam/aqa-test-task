@ui @web
Feature: Task Management CRUD
  As a logged-in Vikunja user
  I want to manage tasks within my projects
  So that I can track my work items

  @crud @task @positive  @TC_007
  Scenario: Task Creation - CRUD Flow

    Given I am on the login page
    When I enter username "dilipwilliam"
    And I enter password "Test@123"
    And I click the login button
    
    # CREATE
    When I create a task with a unique generated title
    Then the dynamically created task should be visible in the task list

    # READ
    When I open the dynamically created task
    Then the task detail header should contain the task title
    And the "Subscribe" button should be visible on task detail
    And the "Add to Favorites" button should be visible on task detail
    And the "Description" section should be visible on task detail
    And the "Comments" section should be visible on task detail

    # UPDATE — add a bullet-list comment
    When I add a bullet list comment to the task
    Then I should see the success message "The comment was added successfully."

    # DELETE
    When I delete the task from the detail page
    And I confirm the task deletion
    Then I should see the success message "The task has been deleted successfully."
