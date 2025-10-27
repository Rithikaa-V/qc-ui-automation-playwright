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

 static async fillInput(page: Page, field: string, value: string) {
    await page.locator(`[id='${field}']`).fill(value);
}

}