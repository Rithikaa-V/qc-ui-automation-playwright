import { LoginPage } from "../pages/loginPage";
import { BASE_URL, EMAIL, PASSWORD, OTP } from '../utils/env';
import { test, expect } from '@playwright/test';
import { CommonLocators } from '../utils/commonLocators';
import { HomePage } from "../pages/homePage";
import { ConfigurationPage } from "../pages/configurationPage";
import { MetaConfiguration } from "../pages/MetaConfigurationPage";
import { compileFunction } from "vm";
import { generateRandomName } from "../utils/randomData";

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
    await CommonLocators.assertErrorNotification(page, 'Invalid username/password.')
})

test('Login with invalid email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidEmail = 'Test@gmail.com'
    
    await loginPage.goto(BASE_URL);
    await loginPage.authPage(invalidEmail, PASSWORD);
    await CommonLocators.assertErrorNotification(page, 'Invalid username/password.')
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
    await CommonLocators.assertErrorNotification(page, 'Invalid OTP. Please try again')

})

test('valid email input in forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput('superadmin@example.com')
    await CommonLocators.clickButtonByName(page, 'Submit')
    await CommonLocators.assertErrorNotification(page, 'A password reset link has been sent to your email.')

})

// Test will fail as there is a existing bug -- bug id 79693
test('Unregistered email input in forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const UnregisteredEmail = 'Unregisteredemail@gmail.co'
    
    await loginPage.goto(BASE_URL);
    await loginPage.clickForgotPassword()
    await loginPage.emailInput(UnregisteredEmail)
    await CommonLocators.clickButtonByName(page, 'Submit')
    await CommonLocators.assertErrorNotification(page,'') 

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

test('verify user can add a new payment method', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await CommonLocators.clickButtonByName(page, 'Add Payment Method')
    await CommonLocators.fillInput(page, 'Payment method' , randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New payment method has been added successfully.')

})

test('Verify successful Edit action in payment method', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'Payment method' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Payment method has been updated successfully.')

})

test('Search functionality in payment method page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await CommonLocators.fillInput(page, 'Search', 'upi')
    await metaConfigurationPage.verifySearchResult(page, 'upi', true)
    await metaConfigurationPage.verifySearchResult(page, 'money', false)

})

test('Verify system handles duplicate names in payment method', async ({ page }) => {
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
    await CommonLocators.fillInput(page, 'Payment method' , 'upi')
    await CommonLocators.clickButtonByName(page, 'save')
    await CommonLocators.assertErrorNotification(page, 'upi with the same name already exists.')

})

test('Verify empty field in Edit action in payment method', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'Payment method','')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertFieldError(page, 'payment method','Payment method name cannot be empty')

})

test('verify successful deletion of payment method', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment methods')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Payment methods has been deleted successfully')

})


//Institutions
test('Verify successful Edit action in Institutions', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'Institution' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Institution has been updated successfully.')

})


test('verify successful deletion of Institution', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Institutions has been deleted successfully')

})

//Payment record has been updated successfully.
//Payment records


test('Verify successful Edit action in Payment records', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'Payment record' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Payment record has been updated successfully.')

})

test('verify successful deletion of Payment records', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Payment records has been deleted successfully')

})

//Ticket issue

test('Verify successful Edit action in Ticket Issue', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'ticket issue' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Ticket issue has been updated successfully.')

})


test('verify successful deletion of Ticket issue', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Ticket Issue has been deleted successfully')

})

//Ticket location

test('Verify successful Edit action in Ticket location', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'ticket location' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Ticket location has been updated successfully.')

})


test('verify successful deletion of ticket location', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Ticket location has been deleted successfully')

})

//Year of study

test('Verify successful Edit action in year of study', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await metaConfigurationPage.clickActionIcon(page, "edit")
    await CommonLocators.fillInput(page, 'Year of study' , randomName)
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Year of study has been updated successfully.')

})

test('verify successful deletion of year of study', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await metaConfigurationPage.clickActionIcon(page, "delete")
    await CommonLocators.clickButtonByName(page, 'Confirm')
    await CommonLocators.assertErrorNotification(page, 'Year of study has been deleted successfully')

})


