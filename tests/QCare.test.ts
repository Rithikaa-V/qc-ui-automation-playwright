import { LoginPage } from "../pages/loginPage";
import { BASE_URL, EMAIL, PASSWORD, OTP } from '../utils/env';
import { test, expect } from '@playwright/test';
import { CommonLocators } from '../utils/commonLocators';
import { HomePage } from "../pages/homePage";
import { ConfigurationPage } from "../pages/configurationPage";
import { MetaConfiguration } from "../pages/MetaConfigurationPage";

test('Valid Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

})

test('Login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidPassword = '123456'
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage(EMAIL, invalidPassword);
    await loginPage.assertErrorNotification('Invalid username/password.')
})

test('Login with invalid email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidEmail = 'Test@gmail.com'
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage(invalidEmail, PASSWORD);
    await loginPage.assertErrorNotification('Invalid username/password.')
})

test('Empty email input validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage('', PASSWORD);
    await CommonLocators.assertFieldError(page, 'Email', 'Email is required')
})

test('Invalid email input validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidEmail = 'invalidEMAIL.com'
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage(invalidEmail, PASSWORD);
    await CommonLocators.assertFieldError(page, 'Email', 'Invalid email format')
})

test('Empty password input validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage(EMAIL, '');
    await CommonLocators.assertFieldError(page, 'Password', 'Password is required')
})

test('Invalid OTP', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const InvalidOTP = '123456'
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, InvalidOTP);
    await loginPage.assertErrorNotification('Invalid OTP. Please try again')

})

test('valid email input in forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput('superadmin@example.com')
    await CommonLocators.clickButtonByName(page, 'Submit')
    await loginPage.assertErrorNotification('A password reset link has been sent to your email.')

})

// Test will fail as there is a existing bug
test('Unregistered email input in forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const UnregisteredEmail = 'Unregisteredemail@gmail.co'
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput(UnregisteredEmail)
    await CommonLocators.clickButtonByName(page, 'Submit')
    await loginPage.assertErrorNotification('') 

})

test('Empty email input forgot password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput('')
    await CommonLocators.clickButtonByName(page, 'Submit')
    await CommonLocators.assertFieldError(page, 'Email', 'Email is required')

})

test('Invalid email input in forgot password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidEmail = 'invalidEMAIL.com'
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput(invalidEmail)
    await CommonLocators.clickButtonByName(page, 'Submit')
    await CommonLocators.assertFieldError(page, 'Email', 'Invalid email format')

})

test('Empty input in payment method field in meta page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await CommonLocators.clickButtonByName(page, 'Add Payment Method')
    await CommonLocators.clickButtonByName(page, 'save')
    await CommonLocators.assertFieldError(page, 'Payment method', 'Payment method name is required')

})

test.only('Valid input in payment method field in meta page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await CommonLocators.clickButtonByName(page, 'Add Payment Method')
    await CommonLocators.fillInput(page, 'Year of study' ,'Money')
    await CommonLocators.clickButtonByName(page, 'save')

})
















