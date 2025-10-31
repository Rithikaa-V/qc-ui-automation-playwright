import { expect, Page } from "@playwright/test";
import { Locator } from "@playwright/test";

export class CommonLocators {

    constructor(private page: Page) {}
    static async clickButtonByName(page: Page, name: string) {
        const button =  page.getByRole('button', { name })
        await expect(button).toBeVisible({ timeout: 6000 })
        await button.click();
    }

static async assertFieldError(page: Page, fieldLabel: string, expectedMsg: string) {
    const labelLocator = page.locator('div._inputLabel_1pyr9_45', { hasText: fieldLabel });
    const errorLocator = page.locator('div').filter({
      hasText: new RegExp(`^${expectedMsg}$`)
    });
    await expect(labelLocator).toBeVisible({ timeout: 5000 });
    await expect(errorLocator).toBeVisible({ timeout: 8000 });
    await expect(errorLocator).toHaveText(expectedMsg);
  }

static async verifySuccessMessage(page: Page, message: string) {
  const toast = page.getByText(message, { exact: false });
  await expect(toast).toBeVisible({ timeout: 10000 });
  await expect(toast).toContainText(message);
}
  
static async fillInput(page: Page, fieldLabelOrPlaceholder: string, value: string) {
  let input;

  const labelLocator = page.locator('div._inputLabel_1pyr9_45').filter({
    hasText: new RegExp(`^${fieldLabelOrPlaceholder}\\*?$`, 'i'),
  });

  if (await labelLocator.count() > 0) {
    input = labelLocator.locator('xpath=following::input[1]');
  } else {
    input = page.getByPlaceholder(fieldLabelOrPlaceholder);
  }

  await input.waitFor({ state: 'visible', timeout: 8000 });
  await input.fill(value);
}

static async assertErrorNotification(page: Page, expectedMessage: string) {
  const errorLocator = page.getByText(expectedMessage, { exact: true });
  await expect(errorLocator).toContainText(expectedMessage);
}


}


