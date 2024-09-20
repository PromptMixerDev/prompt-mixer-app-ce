Feature: Run model with prompt to get output
  Scenario: Name
    Given I have opened the application
    And I pause for 1000ms
    When I add "Hello world" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "Hello world"
    Then I expect that "1" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

    When I click on the element "//div[text()='Choose model']"
    Then I expect that "2" child elements matching "[class*='SelectProperty_modelGroup']" exist inside container element "[class*='SelectProperty_modelOptions']"

    When I click on the element "//div[text()='claude-2.0']"
    Then I expect that element "[class*='SelectProperty_selectedModel']" contains the text "claude-2.0"

    When I click on the element "#connectors"
    Then I expect "1" tabs named "Connectors" to be open

    When I click on the element "#installed-tab"
    And I click on the element "//div[text()='Anthropic AI Connector']"
    Then I expect that element "[class*='ConnectorPage_title']" contains the text "Anthropic AI Connector"

    When I set "ANTHROPIC_AI_API_KEY" environment variable to the inputfield "#API_KEY"
    And I close the "Connectors" tab
    And I click on the element "#run-button"
    Then I expect that element "#run-button" is not enabled
    Then I expect that "1" child elements matching "[class*='Output_wrapper']" exist inside container element "[class*='Layout_content']"
    Then I expect that element "[class*='Output_modelInfo']" contains the text "Anthropic AI Connector, claude-2.0"
    Then I expect that element "[class*='Output_outputLoading']" does exist
    Then I expect that element "[class*='Output_content']" does not exist

    And I pause for 2000ms
    Then I expect that element "[class*='Output_outputLoading']" does not exist
    Then I expect that element "[class*='Output_stepButtons']" does exist
    Then I expect that element "[class*='Output_content']" does exist
