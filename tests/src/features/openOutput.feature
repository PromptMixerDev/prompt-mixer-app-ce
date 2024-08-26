Feature: Open Output Tab

  As a user
  I want to be able to open the outputs tab
  So that I can see the outputs of my prompt chain

  Scenario: Reopening the outputs tab after closing

    Given I have opened the application
    When I close the "Outputs" tab
    And I click on the element "#output"
    Then I expect a new "Outputs" tab to open

  Scenario: Attempting to open multiple outputs tabs

    Given I have opened the application
    When I click on the element "#output"
    Then I expect "1" tabs named "Outputs" to be open

#  Scenario: Closing and reopening the outputs tab repeatedly
#
#    Given the user opens and closes the outputs tab multiple times
#    When the user clicks on the 'outputs' button in the tools section after closing it
#    Then a new outputs tab should open each time
#    And only one outputs tab should be open at any given time
