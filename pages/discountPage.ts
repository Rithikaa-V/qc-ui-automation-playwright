import { expect, Page } from '@playwright/test';
import { Locator } from '@playwright/test';
import { stat } from 'fs';
import path from 'path';
export class discount {
  isStateSelected(page: Page, arg1: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private page: Page) { }

  async clickButtonByName(page: Page, name: string) {
    const button = page.getByRole('button', { name })
    await expect(button).toBeVisible({ timeout: 6000 })
    await button.click();
  }

  async clickActionIcon(page: Page, action: 'edit' | 'delete') {
    const testId = action === 'edit' ? 'actionEditIcon' : 'actionDeleteIcon';
    const iconLocator = page.getByTestId(testId).first();
    await page.waitForTimeout(1000);
    const actionContainer = page.locator('[data-testid="actionItemComponent"]').first();
    await actionContainer.hover({ force: true });
    await iconLocator.waitFor({ state: 'visible', timeout: 8000 });
    await iconLocator.click({ force: true });
  }

  async verifySearchResult(page: Page, expectedText: string, shouldExist = true) {
    const resultLocator = page.getByTestId('actionItemComponent').filter({
      hasText: new RegExp(expectedText, 'i'),
    });

    if (shouldExist) {
      await expect(resultLocator).toBeVisible({ timeout: 8000 });
      await expect(resultLocator).toContainText(expectedText);
    } else {
      await expect(resultLocator).toHaveCount(0);
    }
  }

  async selectDropdown(page: Page, fieldLabel: string, optionText: string) {
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

  async selectValues(page: Page, count: number) {
    const modal = page.locator('.ant-modal-body').last();
    await expect(modal).toBeVisible();

    const checkboxGroup = modal.locator('.ant-checkbox-group');
    await expect(checkboxGroup).toBeVisible();

    const wrappers = checkboxGroup.locator('label.ant-checkbox-wrapper');
    await wrappers.first().waitFor({ state: 'visible' });

    const total = await wrappers.count();
    const limit = Math.min(count, total);

    for (let i = 0; i < limit; i++) {
      const wrapper = wrappers.nth(i);
      const checkboxSpan = wrapper.locator('.ant-checkbox');
      const isChecked = await checkboxSpan.getAttribute('class');

      if (isChecked && !isChecked.includes('ant-checkbox-checked')) {
        await wrapper.click();
      }
    }
  }

}