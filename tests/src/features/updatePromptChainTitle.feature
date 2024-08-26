Feature: Update prompt chain title

  Scenario: User updates the title of a prompt
    Given I have opened the application
    When I clear the inputfield "#chain-title-input"
    And I set "My Updated Prompt" to the inputfield "#chain-title-input"
    And I press "Enter"
    Then I expect that element "#chain-title-input" contains the text "My Updated Prompt"
