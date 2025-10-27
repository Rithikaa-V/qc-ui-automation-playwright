import { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class HomePage {
    constructor(private page: Page) {}

    async clickMenuItem(menuName: string) { 
        await this.page.getByRole('menuitem', { name: menuName }).locator('span').click();
    }
}