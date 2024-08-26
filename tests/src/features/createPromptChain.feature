Feature: Create prompt chain
  Scenario: User create prompt chain by starting to type in default prompt chain editor
    Given I have opened the application
    Then I expect that "0" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
    When I set "New prompt content" to the inputfield "[class*='public-DraftEditor-content']"
    And I pause for 250ms
    Then I expect that "1" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"

  Scenario: User create prompt chain by clicking "Create chain" button
    Given I have opened the application
    Then I expect that "1" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
    When I click on the element "#create-chain-button"
    And I pause for 250ms
    Then I expect that "2" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
