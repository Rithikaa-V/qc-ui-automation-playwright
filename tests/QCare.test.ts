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
import { pricingConfiguration } from "../pages/pricingConfigurationPage";
import { discount } from "../pages/discountPage";

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
    await CommonLocators.assertErrorNotification(page, '')

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
    await CommonLocators.fillInput(page, 'Payment method', randomName)
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
    await CommonLocators.fillInput(page, 'Payment method', randomName)
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
    await CommonLocators.fillInput(page, 'Payment method', 'upi')
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
    await CommonLocators.fillInput(page, 'Payment method', '')
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertFieldError(page, 'payment method', 'Payment method name cannot be empty')

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
    await CommonLocators.fillInput(page, 'Institution', randomName)
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
    await CommonLocators.fillInput(page, 'Payment record', randomName)
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
    await CommonLocators.fillInput(page, 'ticket issue', randomName)
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
    await CommonLocators.fillInput(page, 'ticket location', randomName)
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
    await CommonLocators.fillInput(page, 'Year of study', randomName)
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

// testcase for edit and delete needs to be added - need clarification on the requirement and testcase













































































































































































































































































// Institution

test('Verify user can add a new institution', async ({ page }) => {
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
    await CommonLocators.clickButtonByName(page, 'Add Institution')
    await CommonLocators.fillInput(page, 'Institution', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New institution has been added successfully.')
})

test('Verify search functionality in Instituitions page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

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

test('Validate mandatory field validation during institution creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

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

//Payments

test('Verify user can add a new payment record', async ({ page }) => {
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
    await CommonLocators.clickButtonByName(page, 'Add Payment Record')
    await CommonLocators.fillInput(page, 'Payment record', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New payment record has been added successfully.')
})

test('Verify search functionality in Payment records page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

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

test('Validate mandatory field validation during payment record creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

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

//Tickets

test('Verify user can add a new ticket issue', async ({ page }) => {
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
    await CommonLocators.clickButtonByName(page, 'Add Ticket Issue')
    await CommonLocators.fillInput(page, 'Ticket Issue', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New ticket issue has been added successfully.')
})

test('Verify search functionality in Ticket issue page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

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

test('Validate mandatory field validation during ticket issue creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

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

test('Verify user can add a new ticket location', async ({ page }) => {
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
    await CommonLocators.clickButtonByName(page, 'Add Ticket Location')
    await CommonLocators.fillInput(page, 'Ticket location', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New Ticket Location has been added successfully.')
})

test('Verify search functionality in Ticket location page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

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

test('Validate mandatory field validation during ticket location creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

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

//Year of study

test('Verify user can add a new year of study', async ({ page }) => {
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
    await CommonLocators.clickButtonByName(page, 'Add Year of Study')
    await CommonLocators.fillInput(page, 'Year of study', randomName)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.verifySuccessMessage(page, 'New year of study has been added successfully.')
})

test('Verify search functionality in year of study page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

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

test('Validate mandatory field validation during year of study creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

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

//Pricing config module

test('verify user can add a new pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickButtonByName(page, 'Add Pricing Plan')
    await CommonLocators.fillInput(page, 'Plan Name', randomName)
    await pricingConfigurationPage.selectFoundation(page, 'Foundation', 'Business')
    await CommonLocators.selectStartDate(page, 'Start Date', true);
    await CommonLocators.selectEndDate(page, 'End Date', true);
    await pricingConfigurationPage.selectBuilding(page)
    await pricingConfigurationPage.selectRoomType(page)
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.verifySuccessMessage(page, 'New Pricing Plan has been added successfully')
})

test('Validate mandatory field validation during pricing plan creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL)
    await loginPage.login(EMAIL, PASSWORD, OTP)

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickButtonByName(page, 'Add Pricing Plan')
    await CommonLocators.fillInput(page, 'Plan Name', '')
    await pricingConfigurationPage.selectFoundation(page, 'Foundation', 'Business')
    await CommonLocators.selectStartDate(page, 'Start Date', true);
    await CommonLocators.selectEndDate(page, 'End Date', true);
    await pricingConfigurationPage.selectBuilding(page)
    await pricingConfigurationPage.selectRoomType(page)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'This field is required')
})

test('Verify system handles duplicate names in pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickButtonByName(page, 'Add Pricing Plan')
    await CommonLocators.fillInput(page, 'Plan Name', '')
    await pricingConfigurationPage.selectFoundation(page, 'Foundation', 'Business')
    await CommonLocators.selectStartDate(page, 'Start Date', true);
    await CommonLocators.selectEndDate(page, 'End Date', true);
    await pricingConfigurationPage.selectBuilding(page)
    await pricingConfigurationPage.selectRoomType(page)
    await CommonLocators.clickButtonByName(page, 'Save')
    await CommonLocators.assertErrorNotification(page, 'This field is required')

})

test('validate whether the system restricts to select invalid start date and end date', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickButtonByName(page, 'Add Pricing Plan')
    await CommonLocators.fillInput(page, 'Plan Name', randomName)
    await pricingConfigurationPage.selectFoundation(page, 'Foundation', 'Business')
    await CommonLocators.selectStartDate(page, 'Start Date', false);
    await CommonLocators.selectEndDate(page, 'End Date', false);
    await pricingConfigurationPage.selectBuilding(page)
    await pricingConfigurationPage.selectRoomType(page)
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.assertErrorNotification(page, 'End date must be after start date')
})

test('verify the valid building and room type selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickButtonByName(page, 'Add Pricing Plan')
    await CommonLocators.fillInput(page, 'Plan Name', randomName)
    await pricingConfigurationPage.selectFoundation(page, 'Foundation', 'Business')
    await CommonLocators.selectStartDate(page, 'Start Date', true);
    await CommonLocators.selectEndDate(page, 'End Date', true);
    await pricingConfigurationPage.selectBuilding(page)
    await pricingConfigurationPage.selectRoomType(page)
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.verifySuccessMessage(page, 'New Pricing Plan has been added successfully')
    await pricingConfigurationPage.verifyPricingPlanValues(randomName, 'FRS Building', 'NRB');
    await pricingConfigurationPage.clickPricingPlanByName(randomName);
})

test('verify the detailed view page of a pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.verifyPricingPlanDetailFieldsWithValues();
})

test('verify the edit action of a pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickEditIcon(page)
    await page.getByLabel('Deposit').fill('');
    await CommonLocators.fillInput(page, 'Deposit', '10.65')
    await page.getByLabel('Rent').fill('');
    await CommonLocators.fillInput(page, 'Rent', '10.65')
    await page.getByLabel('Cleaning Charges').fill('');
    await CommonLocators.fillInput(page, 'Cleaning Charges', '10.65')
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.verifySuccessMessage(page, 'Pricing Detail has been updated successfully')

})

test('verify the edit of a pricing plan with invalid values', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickEditIcon(page)
    await page.getByLabel('Deposit').fill('');
    await CommonLocators.fillInput(page, 'Deposit', 'hello')
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Maximum of 8 digits and only 2 decimal places allowed')
    await page.getByLabel('Rent').fill('');
    await CommonLocators.fillInput(page, 'Rent', 'hello')
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Maximum of 8 digits and only 2 decimal places allowed')
    await page.getByLabel('Cleaning Charges').fill('');
    await CommonLocators.fillInput(page, 'Cleaning Charges', 'hello')
    await CommonLocators.clickButtonByName(page, "Save ")
    await CommonLocators.assertErrorNotification(page, 'Maximum of 8 digits and only 2 decimal places allowed')

})

test('verify the export CSV of a pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Export CSV')
    await CommonLocators.assertErrorNotification(page, 'Template Downloaded Successfully')

})

test('verify the upload CSV in a pricing plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Upload')
    const csvFilePath = '/Users/rithikaa/Qcare UI Automation/test-files/valid values(in).csv';
    await pricingConfigurationPage.uploadCSV(page, csvFilePath);
    await page.waitForTimeout(1000);
    await pricingConfigurationPage.clickButtonByName(page, 'Continue')
    await CommonLocators.verifySuccessMessage(page, 'Files are uploaded Sucessfully')

})

test('validate invalid file type in CSV upload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Upload')
    const csvFilePath = '/Users/rithikaa/Qcare UI Automation/test-files/BillOfLading.pdf';
    await pricingConfigurationPage.uploadCSV(page, csvFilePath);
    await page.waitForTimeout(1000);
    await pricingConfigurationPage.verifyUploadErrorTitle(page)
})

test('validate large file size error in CSV upload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')

    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Upload')
    const csvFilePath = '/Users/rithikaa/Qcare UI Automation/test-files/sample_11mb.csv';
    await pricingConfigurationPage.uploadCSV(page, csvFilePath);
    await page.waitForTimeout(1000);
    await pricingConfigurationPage.verifyUploadErrorTitle(page)
})

test('validate empty values in CSV upload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Upload')
    const csvFilePath = '/Users/rithikaa/Qcare UI Automation/test-files/empty values(in).csv';
    await pricingConfigurationPage.uploadCSV(page, csvFilePath);
    await page.waitForTimeout(1000);
    await pricingConfigurationPage.clickButtonByName(page, 'Continue')
    await pricingConfigurationPage.verifyUploadErrorTitle(page)
})

test('validate file with invalid values in CSV upload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await pricingConfigurationPage.clickFirstPricingPlan();
    await pricingConfigurationPage.clickButtonByName(page, 'Upload')
    const csvFilePath = '/Users/rithikaa/Qcare UI Automation/test-files/invalid values(in).csv';
    await pricingConfigurationPage.uploadCSV(page, csvFilePath);
    await page.waitForTimeout(1000);
    await pricingConfigurationPage.clickButtonByName(page, 'Continue')
    await pricingConfigurationPage.verifyUploadErrorTitle(page)
})

test('verify pagination controls in pricing config', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const pricingConfigurationPage = new pricingConfiguration(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Pricing')
    await CommonLocators.verifyPagination(page);
})

// Discount

test('verify user can add a global discount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.verifySuccessMessage(page, 'New discount has been added successfully.')
})

test('Validate mandatory field validation during discount creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', '')
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.assertErrorNotification(page, 'Discount name is required')
})

test('verify date validation in Discount creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', false)
    await CommonLocators.selectEndDate(page, 'Validity To', false)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.assertErrorNotification(page, 'Validity To must be after Validity From')
})

test('verify the system only accepts numeric values in Discount creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', 'hello')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.assertErrorNotification(page, 'Enter a valid percentage value with maximum 2 decimal places')
})

test('verify user can add a resident discount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'One time')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Residents')
    await CommonLocators.clickButtonByName(page, 'Next')
    await discountPage.selectValues(page, 5)
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000)
    await CommonLocators.verifySuccessMessage(page, 'New discount has been added successfully.')
})

test('verify if save button is disabled when residents are not selected while creating resident discount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'One time')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Residents')
    await CommonLocators.clickButtonByName(page, 'Next')
    const saveButton = page.getByRole('button', { name: 'Save' })
    await expect(saveButton).toBeVisible()
    await expect(saveButton).toBeDisabled()
})

test('verify user can add a building discount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'One time')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Buildings')
    await CommonLocators.clickButtonByName(page, 'Next')
    await discountPage.selectValues(page, 5)
    await CommonLocators.clickButtonByName(page, 'Next')
    await discountPage.selectValues(page, 5)
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000)
    await CommonLocators.verifySuccessMessage(page, 'New discount has been added successfully.')
})

test('verify if save button is disabled when room types are not selected while creating building discount', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'One time')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Buildings')
    await CommonLocators.clickButtonByName(page, 'Next')
    await discountPage.selectValues(page, 5)
    await CommonLocators.clickButtonByName(page, 'Next')
    const saveButton = page.getByRole('button', { name: 'Save' })
    await expect(saveButton).toBeVisible()
    await expect(saveButton).toBeDisabled()
})

test('verify the restriction of duplicate discount creation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', 'Do not delete')
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.assertErrorNotification(page, 'Discount Plan with the same name already exists.')
})

test('verify that the newly added discount is listed first in the page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const configurationPage = new ConfigurationPage(page);
    const metaConfigurationPage = new MetaConfiguration(page);
    const discountPage = new discount(page);
    const randomName = generateRandomName();

    await loginPage.goto(BASE_URL);
    await loginPage.login(EMAIL, PASSWORD, OTP);

    await homePage.clickMenuItem('Configurations')
    await configurationPage.selectConfigurationItems('Meta')
    await metaConfigurationPage.selectMetaOptions('Discount')
    await discountPage.clickButtonByName(page, 'Add Discount')
    await CommonLocators.fillInput(page, 'Discount', randomName)
    await discountPage.selectDropdown(page, 'Type', 'Percentage')
    await CommonLocators.fillInput(page, 'Value', '10.75')
    await discountPage.selectDropdown(page, 'Applicability', 'Recurring')
    await CommonLocators.selectStartDate(page, 'Validity From', true)
    await CommonLocators.selectEndDate(page, 'Validity To', true)
    await discountPage.selectDropdown(page, 'Scope', 'Global')
    await CommonLocators.clickButtonByName(page, 'Save')
    await page.waitForTimeout(1000);
    await CommonLocators.verifySuccessMessage(page, 'New discount has been added successfully.')
    const firstDiscountName = await CommonLocators.getFirstListItemTitle(page);
    expect(firstDiscountName).toBe(randomName);
})
