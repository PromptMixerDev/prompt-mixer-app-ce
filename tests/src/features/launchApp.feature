Feature: Application Launch

  Scenario: The main window opens successfully
    Given I have opened the application
    Then I expect that the title is "Prompt Mixer"
