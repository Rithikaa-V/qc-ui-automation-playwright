import { expect, Page } from '@playwright/test';
import { Locator } from '@playwright/test';
import { stat } from 'fs';
export class MetaConfiguration {
    isStateSelected(page: Page, arg1: string) {
        throw new Error('Method not implemented.');
    }
    constructor(private page: Page) {}

    async selectMetaOptions(optionName: string) {
        const optionLocator = this.page.locator('div').filter({
          hasText: new RegExp(`^${optionName}$`, 'i'),
        }).first();
    
        await optionLocator.waitFor({ state: 'visible', timeout: 8000 });
        await optionLocator.click();
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

}