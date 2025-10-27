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

      

}