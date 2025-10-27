import { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
    constructor(private page: Page) {}

    async goto(BASE_URL: string) {
        await this.page.goto(BASE_URL);
      }

    async login(email: string, password: string, otp: string) {
    await this.page.locator('#email').fill(email);
    await this.page.locator('#password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();

    const otpInputs = this.page.locator('.ant-input.ant-input-lg.ant-input-outlined.ant-otp-input');
    await otpInputs.first().waitFor();

    for (let i = 0; i < otp.length; i++) {
      await otpInputs.nth(i).fill(otp[i]);
    }
    await this.page.getByRole('button', { name: 'Verify' }).click();
  }

  async authPage(email: string, password: string) {
    await this.page.locator('#email').fill(email);
    await this.page.locator('#password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
  

  async assertErrorNotification(expectedMessage: string) {
    const errorLocator = this.page.getByText(expectedMessage, { exact: true });
    await expect(errorLocator).toContainText(expectedMessage);

  }

  getErrorForField(fieldId: string): Locator {
    return this.page.locator(`//input[@id='${fieldId}']/ancestor::div[contains(@class,'_inputFieldWrapper')]/following-sibling::p`);
  }

  async assertErrorMessage(fieldId: string, expectedMessage: string) {
    await expect(this.getErrorForField(fieldId)).toHaveText(expectedMessage);
  }

  async clickForgotPassword() {
    await this.page.locator('._forgotPasswordText_rl8z2_25').click();
  }

  async emailInput(value: string){
    await this.page.locator('#email').fill(value);
  }

}


