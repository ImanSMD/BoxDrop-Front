// Live smoke test: drives the real frontend against the Dockerized backend.
// Usage: node scripts/smoke.mjs
import { chromium } from "playwright";
import { execSync } from "node:child_process";

const PHONE_LOCAL = "09120000001"; // seeded user +989120000001
const COMPOSE = "d:\\Work files\\BoxDrop\\BoxDrop-Backend\\docker-compose.yml";
const CHROME = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

const log = (...a) => console.log("•", ...a);

// Read the most recent dev OTP for our phone straight from the web container.
function latestOtp() {
  const out = execSync(`docker compose -f "${COMPOSE}" logs web --tail 40`, {
    encoding: "utf8",
  });
  const matches = [...out.matchAll(/OTP for \+989120000001 is (\d+)/g)];
  return matches.length ? matches[matches.length - 1][1] : null;
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

try {
  // --- Login ---
  await page.goto("http://localhost:3000/login", { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector('input[autocomplete="tel"]', { timeout: 60000 });
  // Let React hydrate so the submit runs the JS handler (not a native GET).
  await page.waitForTimeout(3500);
  await page.fill('input[autocomplete="tel"]', PHONE_LOCAL);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/verify**", { timeout: 20000 });
  log("reached /verify");

  // The form submit just triggered a fresh OTP — read it from the container.
  await page.waitForTimeout(1200);
  const OTP = latestOtp();
  if (!OTP) throw new Error("could not read OTP from web container logs");
  log("OTP from logs:", OTP);

  // Fill the 6 OTP boxes
  const boxes = page.locator('input[inputmode="numeric"]');
  await boxes.first().waitFor();
  for (let i = 0; i < OTP.length; i++) {
    await boxes.nth(i).fill(OTP[i]);
  }
  await page.waitForURL((u) => !/\/verify/.test(u.toString()), { timeout: 15000 });
  log("logged in, landed on", new URL(page.url()).pathname);

  // --- Home feed ---
  if (!/\/$|\/$/.test(new URL(page.url()).pathname) && new URL(page.url()).pathname !== "/") {
    await page.goto("http://localhost:3000/", { waitUntil: "commit", timeout: 60000 });
  }
  await page.waitForTimeout(1500);

  // Count rendered deal cards (join buttons) + presence of restored features
  const joinButtons = await page.getByRole("button", { name: "پیوستن" }).count();
  log("deal join buttons on feed:", joinButtons);

  const stepperPlus = page.getByRole("button", { name: "افزایش تعداد" }).first();
  const hasStepper = await stepperPlus.count();
  log("qty steppers present:", hasStepper);

  // --- Card stepper -> modal sync ---
  if (hasStepper) {
    const faToEn = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    // The stepper value sits between the +/- buttons inside the first card.
    const firstCard = page.locator("div.cursor-pointer").filter({
      has: page.getByRole("button", { name: "افزایش تعداد" }),
    }).first();
    const qtyCell = firstCard.locator("span.min-w-\\[22px\\]");

    await firstCard.getByRole("button", { name: "افزایش تعداد" }).click();
    await firstCard.getByRole("button", { name: "افزایش تعداد" }).click();
    await page.waitForTimeout(300);
    const cardQty = Number(faToEn((await qtyCell.innerText()).trim()));
    log("card stepper qty after +2:", cardQty);

    // open join modal for the same (first) card
    await firstCard.getByRole("button", { name: "پیوستن" }).click();
    await page.waitForTimeout(1200);
    const modalText = await page.locator("body").innerText();
    log("join modal opened:", modalText.includes("چند تا می‌خوای"));
    const m = modalText.match(/قیمت محصول \(([۰-۹\d]+) عدد\)/);
    const modalQty = m ? Number(faToEn(m[1])) : NaN;
    log("modal product-line qty:", modalQty);
    log(
      cardQty === modalQty
        ? `SYNC OK ✓ (card=${cardQty} == modal=${modalQty})`
        : `SYNC MISMATCH ✗ (card=${cardQty} vs modal=${modalQty})`,
    );
  }

  // --- Wallet (Jalali date + clickable header already covered) ---
  await page.goto("http://localhost:3000/wallet", { waitUntil: "commit", timeout: 60000 });
  await page.waitForTimeout(1200);
  const walletText = await page.locator("body").innerText();
  log("wallet shows balance label:", walletText.includes("موجودی قابل استفاده"));

  // --- Profile ---
  await page.goto("http://localhost:3000/profile", { waitUntil: "commit", timeout: 60000 });
  await page.waitForTimeout(1200);
  const hasEdit = await page.getByRole("button", { name: /ویرایش/ }).count();
  log("profile edit button present:", hasEdit > 0);

  log("CONSOLE ERRORS:", errors.length ? errors.slice(0, 8) : "none");
  console.log("RESULT: OK");
} catch (e) {
  console.log("RESULT: FAIL —", e.message);
  console.log("recent console errors:", errors.slice(0, 8));
  process.exitCode = 1;
} finally {
  await browser.close();
}
