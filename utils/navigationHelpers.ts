export async function clickAndWaitForPopup(page, selector) {
    const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByText(selector).click()
    ]);
    return newPage;
}

module.exports = { clickAndWaitForPopup };
