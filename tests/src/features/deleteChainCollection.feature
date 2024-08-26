Feature: Delete chain collection
  Scenario: User delete chain collection
    Given I have opened the application
    When I click on the element "#create-collection-button"
    And I pause for 2500ms
    And I move to element "[class*='TreeNode_content']"
    And I click on the element "[class*='TreeNode_dotIcon']"
    And I click on the element "//div[text()='Delete']"
    And I click on the element "//button[text()='Yes']"
    And I pause for 250ms
    Then I expect that "0" child elements matching "[class*='TreeNode_wrapper']" exist inside container element "#tree"
