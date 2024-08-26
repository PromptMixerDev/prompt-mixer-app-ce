Feature: Theme Switching

  In order to customize the visual experience within the application
  As a user
  I want to be able to switch between a light and a dark theme

  Scenario: User switches from light to dark theme
    Given I have opened the application
    When I click on the element "#settings"
    Then I expect that element "#appearance" contains the text "Choose a theme"
    When I click on the element "#selectAppearance"
    And I click on the element "[data-name='Dark']"
    Then I expect that the attribute "data-theme" from element "body" is "dark"

  Scenario: User switches from dark to light theme
    Given I have opened the application
    When I click on the element "#settings"
    Then I expect that element "#appearance" contains the text "Choose a theme"
    When I click on the element "#selectAppearance"
    And I click on the element "[data-name='Light']"
    Then I expect that the attribute "data-theme" from element "body" is "light"
