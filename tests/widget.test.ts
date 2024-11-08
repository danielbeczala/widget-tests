import {expect, test} from "@playwright/test";
import {getFrameBySelector} from "../utils/iframeHelpers";
import {clickAndWaitForPopup} from "../utils/navigationHelpers";

test.describe("Widget tests", () => {
  test("Send message from widget to panel and from panel to widget", async ({
    page,
  }) => {
    await test.step("Login to project", async () => {
      await page.goto(
        `https://www.tidio.com/panel/?project_public_key=${process.env.PROJECT_PUBLIC_KEY}&api_token=${process.env.API_TOKEN}`
      );
    });
    await test.step("Simulate visitor and send message from widget to panel", async () => {
      // Click on the inbox button and verify it has the 'active' class
      const inboxButton = page.locator('[data-test-id="inbox-section-button"]');
      await inboxButton.click();
      await expect(inboxButton).toHaveClass(/active/);

      // Open popup and handle interactions
      const newPage = await clickAndWaitForPopup(page, 'Simulate a conversation');
      await expect(newPage).toHaveURL(/.*tidio\.com\/panel\/simulateVisitor.*/);

      // Handle iframe within the new popup page
      const iframe = await getFrameBySelector(newPage, '#tidio-chat-iframe');
      if (iframe) {
        await iframe.hover('[data-testid="flyMessage"]');
        await iframe.waitForSelector('#ic_close', { state: 'visible' });
        await iframe.locator('#ic_close').click();

        // Verify and interact with the widget button
        const widgetButton = iframe.locator('[data-testid="widgetButtonBody"]');
        await expect(widgetButton).toBeVisible();
        await widgetButton.click();

        // Fill in the message textarea
        const messageText = 'Hello world';
        const messageTextarea = iframe.locator('[data-testid="newMessageTextarea"]');
        await expect(messageTextarea).toBeVisible();
        await messageTextarea.fill(messageText);

        // Simulate pressing Enter to send the message
        await messageTextarea.press('Enter');

        // Locate and fill in the email input field
        const emailInput = iframe.locator('input[type="email"]');
        const email = 'test@test.com';
        await expect(emailInput).toBeVisible();
        await emailInput.fill(email);
        await emailInput.press('Enter');

        // Verify that the message was sent and check its content
        const sentMessage = iframe.locator('.message-visitor');
        await expect(sentMessage).toContainText(messageText);

        // Close the new page (popup)
        await newPage.close();
      } else {
        console.error('Iframe not found, skipping actions within iframe.');
      }
    });
    await test.step("Send a reply message from the panel", async () => {
      // Locate and click on the "Unassigned" button within the Live Conversation section
      const unassignedButton = page.locator('#inbox-live-conversations-folders >> text=Unassigned');
      await expect(unassignedButton).toBeVisible();
      await unassignedButton.click();

      const emailElement = page.locator('[data-unread="true"] >> text=test@test.com');
      const messageElement = page.locator('[data-unread="true"] >> text=Hello world');

      // Check visibility of the elements
      await expect(emailElement).toBeVisible();
      await expect(messageElement).toBeVisible();

      // Click on the message
      await messageElement.click();

      // Locate and click the Join conversation button
      const joinConversation = page.locator('button', { hasText: 'Join conversation' });
      await expect(joinConversation).toBeVisible();
      await joinConversation.click();

      // Send the Reply Message from the panel
      const replyMessageText = 'Reply Message'
      const messageTextarea = page.locator('[data-test-id="new-message-textarea"]');
      await expect(messageTextarea).toBeVisible();
      await messageTextarea.fill(replyMessageText);
      await messageTextarea.press('Enter');

      // Check that the message is visible and contains the correct text
      const sentMessage = page.locator(`div[data-message-id] >> text=${replyMessageText}`);
      await expect(sentMessage).toBeVisible();
      await expect(sentMessage).toHaveText(replyMessageText);
    });
  });
});
