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

  static async selectFoundation(page: Page, fieldLabel: string, optionText: string) {
    const label = page.locator('label, div', {
      hasText: new RegExp(`^${fieldLabel}\\*?$`, 'i'),
    });
    await expect(label.first()).toBeVisible();
    const dropdown = label.first().locator('xpath=following::*[contains(@class,"ant-select")][1]');
    await dropdown.locator('.ant-select-selector').click();
    const option = page.locator('.ant-select-dropdown').locator('.ant-select-item-option').filter({ hasText: optionText });
    await expect(option).toBeVisible();
    await option.click();
    await expect(dropdown).toContainText(optionText);
  }

  static async selectStartDate(page: Page, fieldLabelOrName: string, startDate: Date = new Date()) {
    const input = await this.getDateInput(page, fieldLabelOrName);
    await expect(input).toBeEnabled();
    await input.click();
    await this.selectDateFromCalendar(page, startDate);
  }

  static async selectEndDate(page: Page, fieldLabelOrName: string, startDate: Date, positive: boolean = true) {
    const endDate = new Date(startDate);
    if (positive) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const input = await this.getDateInput(page, fieldLabelOrName);
    await expect(input).toBeEnabled({ timeout: 5000 });
    await input.click();
    await this.selectDateFromCalendar(page, endDate);
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

  private static async selectDateFromCalendar(page: Page, date: Date) {
    const day = date.getDate().toString();
    await page.waitForSelector('.ant-picker-dropdown', { state: 'attached' });
    const calendar = page.locator('.ant-picker-dropdown').filter({ has: page.locator('table') }).last();
    await expect(calendar).toBeVisible();
    await calendar.locator('td.ant-picker-cell:not(.ant-picker-cell-disabled)', { hasText: new RegExp(`^${day}$`) }).first().click();
  }

  static async selectBuilding(page: Page, buildingNames: string | string[]) {
    const values = Array.isArray(buildingNames) ? buildingNames : [buildingNames];
    const dropdown = page.locator('div.ant-select-selector:has(input#building)');
    await expect(dropdown).toBeVisible();
    await dropdown.click();
    for (const value of values) {
      const option = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) ' +
        '.ant-select-item-option',
        { hasText: value }
      );
      await expect(option).toBeVisible();
      if (!(await option.getAttribute('aria-selected') === 'true')) {
        await option.click();
      }
    }
    const dropdownContent = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    if (await dropdownContent.isVisible()) {
      await page.keyboard.press('Escape');
    }
  }

  static async selectRoomType(page: Page, roomTypes: string | string[]) {
    const values = Array.isArray(roomTypes) ? roomTypes : [roomTypes];
    const dropdown = page.locator('div.ant-select-selector:has(input#roomType)');
    await expect(dropdown).toBeVisible();
    await dropdown.click();
    for (const value of values) {
      const option = page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
        { hasText: value }
      );
      await expect(option).toBeVisible();
      if (!(await option.getAttribute('aria-selected') === 'true')) {
        await option.click();
      }
    }
    const dropdownContent = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    if (await dropdownContent.isVisible()) {
      await page.keyboard.press('Escape');
    }
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

}
