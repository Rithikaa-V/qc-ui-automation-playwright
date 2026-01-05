import { expect, Page } from '@playwright/test';
import { Locator } from '@playwright/test';
import { stat } from 'fs';
import path from 'path';
export class pricingConfiguration {
  isStateSelected(page: Page, arg1: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private page: Page) { }

  async clickButtonByName(page: Page, name: string) {
    const button = page.getByRole('button', { name })
    await expect(button).toBeVisible({ timeout: 6000 })
    await button.click();
  }

  async clickEditIcon(page: Page) {
    let editIcon = page.locator('div[class*="_editIconWrapper"] i.icon-edit').first();
    if (!(await editIcon.isVisible().catch(() => false))) {
      editIcon = page.locator('i.icon-edit').first();
    }
    const actionContainer = page.locator('[data-testid="actionItemComponent"]').first();
    if (await actionContainer.isVisible().catch(() => false)) {
      await actionContainer.hover({ force: true });
    }
    await editIcon.waitFor({ state: 'visible', timeout: 8000 });
    await editIcon.click({ force: true });
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

  async selectFoundation(page: Page, fieldLabel: string, optionText: string) {
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

  async selectBuilding(page: Page, buildingName?: string): Promise<string> {
    const input = page.locator('input#building');
    const dropdown = page.locator('div.ant-select-selector:has(input#building)');
    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const listId = await input.getAttribute('aria-controls');
    const options = page.locator(`#${listId} .ant-select-item-option:not(.ant-select-item-option-disabled)`);

    let selectedText = '';

    if (buildingName) {
      const option = options.filter({ hasText: new RegExp(`^${buildingName}$`, 'i') });
      if (await option.count() === 0) {
        const partialOption = options.filter({ hasText: buildingName });
        await expect(partialOption.first()).toBeVisible({ timeout: 5000 });
        selectedText = (await partialOption.first().textContent()) || buildingName;
        await partialOption.first().click({ force: true });
      } else {
        await expect(option).toBeVisible({ timeout: 5000 });
        selectedText = (await option.textContent()) || buildingName;
        await option.click({ force: true });
      }
      await page.keyboard.press('Escape');
    } else {
      const firstOption = options.first();
      await expect(firstOption).toBeVisible({ timeout: 10000 });
      await firstOption.scrollIntoViewIfNeeded();
      selectedText = (await firstOption.textContent()) || '';

      if (await firstOption.getAttribute('aria-selected') !== 'true') {
        await firstOption.click({ force: true });
      }

      await page.keyboard.press('Escape');
    }
    return selectedText.trim();
  }

  async selectRoomType(page: Page, roomTypeName?: string): Promise<string> {
    const input = page.locator('input#roomType');
    const dropdown = page.locator('div.ant-select-selector:has(input#roomType)');
    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const listId = await input.getAttribute('aria-controls');
    const options = page.locator(`#${listId} .ant-select-item-option:not(.ant-select-item-option-disabled)`);

    let selectedText = '';

    if (roomTypeName) {
      const option = options.filter({ hasText: new RegExp(`^${roomTypeName}$`, 'i') });
      if (await option.count() === 0) {
        const partialOption = options.filter({ hasText: roomTypeName });
        await expect(partialOption.first()).toBeVisible({ timeout: 5000 });
        selectedText = (await partialOption.first().textContent()) || roomTypeName;
        await partialOption.first().click({ force: true });
      } else {
        await expect(option).toBeVisible({ timeout: 5000 });
        selectedText = (await option.textContent()) || roomTypeName;
        await option.click({ force: true });
      }
      await page.keyboard.press('Escape');
    } else {
      const firstOption = options.first();
      await expect(firstOption).toBeVisible({ timeout: 10000 });
      await firstOption.scrollIntoViewIfNeeded();
      selectedText = (await firstOption.textContent()) || '';

      if (await firstOption.getAttribute('aria-selected') !== 'true') {
        await firstOption.click({ force: true });
      }

      await page.keyboard.press('Escape');
    }
    return selectedText.trim();
  }



  async clickPricingPlanByName(planName: string) {
    const row = this.page.locator('tr.ant-table-row', {
      has: this.page.locator('span[class*="planNameText"]', {
        hasText: planName,
      }),
    });
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.click({ force: true });
  }

  async getColumnIndex(headerName: string): Promise<number> {
    const header = this.page.locator('th[scope="col"]', { hasText: new RegExp(`^${headerName}$`, 'i') });
    await expect(header).toBeVisible({ timeout: 10000 });

    return await header.evaluate((node) => {
      const row = node.closest('tr');
      if (!row) return -1;
      return Array.from(row.children).indexOf(node);
    });
  }

  async getPricingPlanRowValues(planName: string) {
    const row = this.page.locator('tr.ant-table-row', {
      has: this.page.locator('span[class*="planNameText"]', {
        hasText: planName,
      }),
    });

    await expect(row).toBeVisible({ timeout: 15000 });

    const building = await row.locator('td').nth(4).innerText();
    const roomType = await row.locator('td').nth(5).innerText();

    return {
      building: building.trim(),
      roomType: roomType.trim(),
    };
  }

  async verifyPricingPlanValues(
    planName: string,
    expectedBuilding: string,
    expectedRoomType: string
  ) {
    const values = await this.getPricingPlanRowValues(planName);

    expect(values.building).toContain(expectedBuilding);
    expect(values.roomType).toContain(expectedRoomType);
  }

  async clickFirstPricingPlan() {
    const firstRow = this.page
      .locator('tr.ant-table-row')
      .filter({ has: this.page.locator('td') })
      .first();

    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await firstRow.click();
  }

  async verifyPricingPlanDetailFieldsWithValues() {
    const fields = [
      'Building',
      'Room Type',
      'Rent',
      'Deposit',
      'Cleaning Charges',
    ];

    for (const field of fields) {
      const header = this.page.locator('th[scope="col"]', { hasText: new RegExp(`^${field}$`, 'i') });
      await expect(header).toBeVisible({ timeout: 10000 });

      const index = await header.evaluate((node) => {
        const row = node.closest('tr');
        if (!row) return -1;
        return Array.from(row.children).indexOf(node);
      });

      if (index !== -1) {
        const value = this.page.locator('tr.ant-table-row').first().locator('td').nth(index);
        await expect(value).toBeVisible();
        await expect(value).not.toBeEmpty();
      } else {
        throw new Error(`Could not find index for field: ${field}`);
      }
    }
  }
  async uploadCSV(page: Page, filePath: string) {
    const fileInput = page.locator('input[data-testid="file-upload-dragger"]');
    await expect(fileInput).toBeAttached();

    await fileInput.setInputFiles(filePath);
  }

  async verifyUploadErrorTitle(page: Page) {
    const errorTitle = page.locator(
      '.ant-modal-content h4',
      { hasText: 'Error Info of upload file' }
    );

    await expect(errorTitle).toBeVisible();
  }

}