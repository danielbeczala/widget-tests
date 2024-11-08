import { Page, Frame } from 'playwright';

export async function getFrameBySelector(page: Page, iframeSelector: string): Promise<Frame | null> {
    const iframeElementHandle = await page.$(iframeSelector);
    if (!iframeElementHandle) {
        console.warn(`Iframe element not found for selector: ${iframeSelector}`);
        return null;
    }

    const frame = await iframeElementHandle.contentFrame();
    if (!frame) {
        console.warn(`Failed to get the frame object for selector: ${iframeSelector}`);
    }

    return frame;
}
