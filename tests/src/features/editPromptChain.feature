Feature: Edit prompt chain
  Given I have opened the application

  Scenario: User add first prompt
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add "First prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "First prompt content"
    And I expect that "1" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

  Scenario: User edit first prompt
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add "First prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I add " updated" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "First prompt content updated"
    And I expect that "1" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

  Scenario: User add several prompts
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add "First prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I press "Enter"
    And I add "---" to the inputfield "[class*='public-DraftEditor-content']"
    And I press "Enter"
    And I add "Second prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I press "Enter"
    And I add "---" to the inputfield "[class*='public-DraftEditor-content']"
    And I press "Enter"
    And I add "Third prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "First prompt content"
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "Second prompt content"
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "Third prompt content"
    And I expect that "3" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

  Scenario: User inserts prepared multiline text separated by "---" divider
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add multiline text "First prompt content\n---\nSecond prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "First prompt content"
    Then I expect that element "[class*='public-DraftEditor-content']" contains the text "Second prompt content"
    And I expect that "2" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

  Scenario: User join two prompts into one
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add multiline text "First prompt content\n---\nSecond prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    And I press "ArrowUp"
    And I press "Backspace"
    And I press "Backspace"
    And I press "Backspace"
    And I pause for 250ms
    And I expect that "1" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"

  Scenario: User split one prompt into two
    When I close the "Untitled" tab
    And I click on the element "#create-chain-button"
    And I pause for 250ms
    And I add "One Two" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    And I press "ArrowLeft"
    And I press "ArrowLeft"
    And I press "ArrowLeft"
    And I press "Enter"
    And I add "---" to the inputfield "[class*='public-DraftEditor-content']"
    And I press "Enter"
    And I pause for 250ms
    And I expect that "2" child elements matching "[class*='PromptItemInfo_number']" exist inside container element "[class*='EditorArea_wrapper']"
