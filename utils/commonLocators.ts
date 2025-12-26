import { expect, Page } from "@playwright/test";
import { Locator } from "@playwright/test";

export class CommonLocators {

  constructor(private page: Page) { }
  static async clickButtonByName(page: Page, name: string) {
    const button = page.getByRole('button', { name })
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
    const toast = page.getByText(message, { exact: false }).last();
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
    const errorLocator = page.getByText(expectedMessage, { exact: true }).last();
    await expect(errorLocator).toContainText(expectedMessage);
  }

  static async selectEndDate(page: Page, fieldLabelOrName: string, isValid: boolean = true) {
    const input = await this.getDateInput(page, fieldLabelOrName);
    await expect(input).toBeEnabled();
    await input.click();
    const index = isValid ? 1 : 0;
    await this.selectDateFromCalendar(page, index);
  }

  static async selectStartDate(page: Page, fieldLabelOrName: string, isValid: boolean = true) {
    const input = await this.getDateInput(page, fieldLabelOrName);
    await expect(input).toBeEnabled({ timeout: 5000 });
    await input.click();
    const index = isValid ? 0 : 2;
    await this.selectDateFromCalendar(page, index);
  }

  private static async getDateInput(page: Page, labelOrName: string): Promise<Locator> {
    const label = page.locator('label').filter({
      hasText: new RegExp(`^${labelOrName}\\*?$`, 'i'),
    });
    if (await label.count() > 0) {
      return label.locator('..').locator('input');
    }
    const byName = page.locator(`input[name="${labelOrName}"]`);
    if (await byName.count() > 0) return byName;
    const byPlaceholder = page.locator(`input[placeholder="${labelOrName}"]`);
    if (await byPlaceholder.count() > 0) return byPlaceholder;
    throw new Error(`Date input not found: ${labelOrName}`);
  }

  private static async selectDateFromCalendar(page: Page, index: number) {
    await page.waitForSelector('.ant-picker-dropdown', { state: 'attached' });
    const calendar = page.locator('.ant-picker-dropdown').filter({ has: page.locator('table') }).last();
    await expect(calendar).toBeVisible();

    const cells = calendar.locator('td.ant-picker-cell:not(.ant-picker-cell-disabled)');
    await expect(cells.nth(index)).toBeVisible(); // Ensure the cell at index exists
    await cells.nth(index).click();
  }

  static async verifyPagination(page: Page) {
    const pagination = page.locator('ul.ant-pagination');
    await expect(pagination).toBeVisible();
    const pageItems = pagination.locator('li.ant-pagination-item');
    await expect(pageItems.first()).toBeVisible();

    const page1 = pagination.locator('li.ant-pagination-item-1');
    await expect(page1).toHaveClass(/ant-pagination-item-active/);

    const page2 = pagination.locator('li.ant-pagination-item-2');
    await page2.click();

    await expect(page2).toHaveClass(/ant-pagination-item-active/);

    const nextButton = pagination.locator('li.ant-pagination-next:not(.ant-pagination-disabled)');
    await nextButton.click();

    const page3 = pagination.locator('li.ant-pagination-item-3');
    await expect(page3).toHaveClass(/ant-pagination-item-active/);

    const prevButton = pagination.locator('li.ant-pagination-prev:not(.ant-pagination-disabled)');
    await prevButton.click();

    await expect(page2).toHaveClass(/ant-pagination-item-active/);

    await page1.click();
    await expect(page1).toHaveClass(/ant-pagination-item-active/);
  }

  static async getFirstListItemTitle(page: Page): Promise<string> {
    // Using actionItemComponent as used in verifySearchResult
    const listItems = page.getByTestId('actionItemComponent');
    await expect(listItems.first()).toBeVisible({ timeout: 10000 });

    const title = listItems.first().locator(
      '[data-testid="actionItemTitle"] span'
    );

    await expect(title).toBeVisible();

    return (await title.textContent())?.trim() || '';
  }

}
