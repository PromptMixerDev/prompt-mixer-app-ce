Feature: Create chain collection
  Scenario: User create chain collection by clicking "Create collection" button
    Given I have opened the application
    Then I expect that "0" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
    When I click on the element "#create-collection-button"
    And I pause for 250ms
    Then I expect that "1" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
