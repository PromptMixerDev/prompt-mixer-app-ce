Feature: Install and uninstall connectors
  Scenario: Name
    Given I have opened the application
    When I click on the element "#connectors"
    Then I expect "1" tabs named "Connectors" to be open

    When I pause for 4000ms
    And I click on the element "//div[text()='Ollama Connector']"
    Then I expect that element "#install-btn" does exist

    When I click on the element "#install-btn"
    Then I expect that element "//div[text()='Installing connector...']" becomes displayed
    Then I expect that element "//div[text()='Connector installed successfully']" becomes displayed

    When I click on the element "#installed-tab"
    Then I expect that element "//div[text()='Ollama Connector']" does exist

    When I click on the element "//div[text()='Choose model']"
    Then I expect that container "[class*='SelectProperty_modelOptions']" contains the text "Ollama Connector"

    When I click on the element "#installed-tab"
    And I click on the element "//div[text()='Ollama Connector']"
    Then I expect that element "#remove-connector" does exist

    When I click on the element "#remove-connector"
    And I click on the element "//button[text()='Yes']"
    Then I expect that element "//div[text()='Connector removed successfully']" becomes displayed

    When I click on the element "//div[text()='Choose model']"
    Then I expect that container "[class*='SelectProperty_modelOptions']" not contains the text "Ollama Connector"

