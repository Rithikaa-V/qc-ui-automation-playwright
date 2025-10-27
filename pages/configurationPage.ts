import { expect, Page } from '@playwright/test';
import { Locator } from '@playwright/test';
import { stat } from 'fs';
export class ConfigurationPage {
    isStateSelected(page: Page, arg1: string) {
        throw new Error('Method not implemented.');
    }
    constructor(private page: Page) {}

    async selectConfigurationItems(menuName: string) { 
        await this.page.getByRole('menuitem', { name: menuName }).locator('span').click();
    }

}