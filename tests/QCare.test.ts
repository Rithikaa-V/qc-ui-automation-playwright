import { LoginPage } from "../pages/loginPage";
import { BASE_URL, EMAIL, PASSWORD, OTP } from '../utils/env';
import { test, expect } from '@playwright/test';
import { CommonLocators } from '../utils/commonLocators';
import { HomePage } from "../pages/homePage";
import { ConfigurationPage } from "../pages/configurationPage";
import { MetaConfiguration } from "../pages/MetaConfigurationPage";
import { compileFunction } from "vm";
import { generateRandomName } from "../utils/randomData";
import { asyncWrapProviders } from "async_hooks";

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

// Test will fail as there is a existing bug
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

// Incomplete Test case
// test('Edit action in payment method', async ({ page }) => {
//     const loginPage = new LoginPage(page);
//     const homePage = new HomePage(page);
//     const configurationPage = new ConfigurationPage(page);
//     const metaConfigurationPage = new MetaConfiguration(page);
    
//     await loginPage.goto(BASE_URL);
//     await loginPage.login(EMAIL, PASSWORD, OTP);

//     await homePage.clickMenuItem('Configurations')
//     await configurationPage.selectConfigurationItems('Meta')
//     await metaConfigurationPage.selectMetaOptions('Payment methods')

//     await metaConfigurationPage.clickActionIcon(page, "edit")
//     await page.pause()

// })
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



































































































































































































































































 







test('Verify user can add a new institution', async ({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await CommonLocators.clickButtonByName(page, 'Add Institution')
    await CommonLocators.fillInput(page, 'Institution', 'QA University')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page,'New institution has been added successfully.')
})

test('Verify search functionality in Instituitions page', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await CommonLocators.fillInput(page, 'Search', 'random')
    await metaConfigurationPage.verifySearchResult(page, 'random', true)
    await CommonLocators.fillInput(page, 'Search', 'Test University')
    await metaConfigurationPage.verifySearchResult(page, 'Test University', true)
    await CommonLocators.fillInput(page, 'Search', 'tutufy')
    await metaConfigurationPage.verifySearchResult(page, 'tutufy', false)

})

test('Validate mandatory field validation during institution creation', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL,PASSWORD,OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await CommonLocators.clickButtonByName(page, 'Add Institution')
    await CommonLocators.fillInput(page, 'Institution', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Institution name is required')
})

test('Verify system handles duplicate names in Instituitions', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Institutions')
    await CommonLocators.clickButtonByName(page, 'Add Institution')
    await CommonLocators.fillInput(page, 'Institution', 'QA University')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'QA University with the same name already exists.')

})

test('Verify user can add a new payment record', async ({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await CommonLocators.clickButtonByName(page, 'Add Payment Record')
    await CommonLocators.fillInput(page, 'Payment record', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page,'New payment record has been added successfully.')
})

test('Verify search functionality in Payment records page', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await CommonLocators.fillInput(page, 'Search', 'random')
    await metaConfigurationPage.verifySearchResult(page, 'random', true)
    await CommonLocators.fillInput(page, 'Search', 'Paid upi')
    await metaConfigurationPage.verifySearchResult(page, 'Paid upi', true)
    await CommonLocators.fillInput(page, 'Search', 'tutufy')
    await metaConfigurationPage.verifySearchResult(page, 'tutufy', false)

})

test('Validate mandatory field validation during payment record creation', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL,PASSWORD,OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await CommonLocators.clickButtonByName(page, 'Add Payment Record')
    await CommonLocators.fillInput(page, 'Payment record', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Payment record name is required')
})

test('Verify system handles duplicate names in Payment record', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Payment records')
    await CommonLocators.clickButtonByName(page, 'Add Payment Record')
    await CommonLocators.fillInput(page, 'Payment record', 'Paid UPI')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Paid UPI with the same name already exists.')

})

test('Verify user can add a new ticket issue', async ({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Issue')
    await CommonLocators.fillInput(page, 'Ticket Issue', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page,'New ticket issue has been added successfully.')
})

test('Verify search functionality in Ticket issue page', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await CommonLocators.fillInput(page, 'Search', 'random')
    await metaConfigurationPage.verifySearchResult(page, 'random', true)
    await CommonLocators.fillInput(page, 'Search', 'payment issue')
    await metaConfigurationPage.verifySearchResult(page, 'payment issue', true)
    await CommonLocators.fillInput(page, 'Search', 'tutufy')
    await metaConfigurationPage.verifySearchResult(page, 'tutufy', false)

})

test('Validate mandatory field validation during ticket issue creation', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL,PASSWORD,OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Issue')
    await CommonLocators.fillInput(page, 'Ticket Issue', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Payment record name is required')
})

test('Verify system handles duplicate names in ticket issue', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket Issue')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Issue')
    await CommonLocators.fillInput(page, 'Ticket Issue', 'Payment issue')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Payment issue with the same name already exists.')

})

test('Verify user can add a new ticket location', async ({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Location')
    await CommonLocators.fillInput(page, 'Ticket location', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page,'New Ticket Location has been added successfully.')
})

test('Verify search functionality in Ticket location page', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await CommonLocators.fillInput(page, 'Search', 'random')
    await metaConfigurationPage.verifySearchResult(page, 'random', true)
    await CommonLocators.fillInput(page, 'Search', 'Cool area')
    await metaConfigurationPage.verifySearchResult(page, 'Cool area', true)
    await CommonLocators.fillInput(page, 'Search', 'tutufy')
    await metaConfigurationPage.verifySearchResult(page, 'tutufy', false)

})

test('Validate mandatory field validation during ticket location creation', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL,PASSWORD,OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Location')
    await CommonLocators.fillInput(page, 'Ticket location', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Ticket location name is required')
})

test('Verify system handles duplicate names in ticket location', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Ticket location')
    await CommonLocators.clickButtonByName(page, 'Add Ticket Location')
    await CommonLocators.fillInput(page, 'Ticket location', 'New ticket folder')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'New ticket folder with the same name already exists.')

})

test('Verify user can add a new year of study', async ({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await CommonLocators.clickButtonByName(page, 'Add Year of Study')
    await CommonLocators.fillInput(page, 'Year of study', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page,'New year of study has been added successfully.')
})

test('Verify search functionality in year of study page', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL,PASSWORD,OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await CommonLocators.fillInput(page, 'Search', 'random')
    await metaConfigurationPage.verifySearchResult(page, 'random', true)
    await CommonLocators.fillInput(page, 'Search', 'Certificate')
    await metaConfigurationPage.verifySearchResult(page, 'Certificate', true)
    await CommonLocators.fillInput(page, 'Search', 'tutufy')
    await metaConfigurationPage.verifySearchResult(page, 'tutufy', false)

})

test('Validate mandatory field validation during year of study creation', async({page}) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL,PASSWORD,OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await CommonLocators.clickButtonByName(page, 'Add Year of Study')
    await CommonLocators.fillInput(page, 'Year of study', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'Year of study is required')
})

test('Verify system handles duplicate names in year of study', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    
    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Year of study')
    await CommonLocators.clickButtonByName(page, 'Add Year of Study')
    await CommonLocators.fillInput(page, 'Year of study', 'PG 2nd year')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'PG 2nd year with the same name already exists.')

})



