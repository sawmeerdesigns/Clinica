// Click-through check of the prototype flow. Run `npm run dev` (or `npm run preview`), then: npm run check
// Set URL to point somewhere else, e.g. URL=http://localhost:4173 npm run check
const { chromium } = require('playwright');
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('ok -', m); };
(async () => {
  const b = await chromium.launch(process.env.EX ? { executablePath: process.env.EX } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.URL || 'http://localhost:5173');
  await p.waitForTimeout(2200);
  assert(await p.isVisible('text=Choose your language'), 'splash auto-advances to language');
  await p.click('.tile[data-v="ne"]'); assert(await p.getAttribute('.tile[data-v="ne"]','aria-checked')==='true', 'Nepali tile selects');
  // Phase 6 (F15/R12): Nepali now covers sign-in too, so this flow switches back to English before going on; Nepali is checked further down.
  assert(await p.isVisible('.cta >> text=जारी राख्नुहोस्'), 'F15/R12: Continue in Nepali once chosen'); await p.click('.tile[data-v="en"]');
  await p.click('text=Continue'); await p.click('text=Next'); await p.click('text=Next'); await p.click('text=Get started');
  await p.fill('#tel', '98412 345'); await p.click('text=Send code');
  assert(await p.isVisible('text=Nepali mobile numbers are 10 digits'), 'invalid number error (11)');
  assert(await p.inputValue('#tel') === '98412 345', 'typed number kept');
  await p.click('text=Terms of use'); assert(await p.isVisible('.appbar >> text=Terms of use'), 'terms opens'); await p.click('[aria-label=Back]');
  await p.fill('#tel', '9841234412'); await p.click('text=Send code');
  assert(await p.isVisible('text=+977 98•• ••• 412'), 'masked number on code screen');
  assert(await p.isDisabled('text=Verify'), 'verify disabled when empty');
  await p.keyboard.type('111111'); await p.waitForTimeout(100);
  assert(await p.isVisible("text=2 tries left"), 'auto-verify on 6th digit → wrong (08)');
  await p.click('text=Send a new code'); await p.keyboard.type('222222');
  assert(await p.isVisible("text=1 try left"), 'second wrong');
  await p.click('text=Send a new code'); await p.keyboard.type('333333');
  assert(await p.isVisible('text=Too many tries'), 'lockout (14)');
  // restart via panel to code screen
  await p.evaluate(() => jumpTo('07')); await p.fill('#code-in', '000000'); await p.waitForTimeout(100);
  assert(await p.isVisible('text=That code has expired'), 'expired (13)');
  assert(await p.isDisabled('text=Verify'), 'verify disabled on expired');
  await p.click('text=Send a new code'); await p.fill('#code-in', '123456'); await p.waitForTimeout(100);
  assert(await p.isVisible("text=Who's using the app?"), 'right code → chooser (09)');
  await p.click('text=Someone else');
  await p.click('.cta >> text=Create profile'); 
  assert(await p.isVisible('text=Choose one.') && await p.isVisible('text=Enter your date of birth.'), 'all errors at once (18)');
  await p.click('label:has-text("Female")'); assert(!(await p.isVisible('text=Choose one.')), 'choosing sex clears its error');
  await p.fill('#name', 'Anisha Sharma');
  // Phase 6 (F26): tapping the empty field opens the picker; typing still works from the keyboard, so the mask is checked by focusing.
  await p.click('#dob'); assert(await p.evaluate(() => !!S.picker), 'F26: tapping the empty date-of-birth field opens the picker'); await p.evaluate(() => { S.picker = null; render(); });
  await p.focus('#dob'); await p.keyboard.type('01122050'); assert(await p.inputValue('#dob')==='01 / 12 / 2050', 'dob mask');
  await p.click('#name'); await p.waitForTimeout(100);
  assert(await p.isVisible("text=2050 is in the future in AD"), 'future date error (19)');
  await p.click('[aria-label="Choose date of birth"]'); await p.waitForTimeout(300);
  assert(await p.getAttribute('.seg[data-act="cal:BS"]','aria-pressed')==='true', 'picker opens on BS');
  assert(await p.textContent('#conv') === "That's 14 March 1994 AD.", 'BS→AD conversion: ' + await p.textContent('#conv'));
  await p.click('text=Done'); await p.waitForTimeout(100);
  assert(await p.inputValue('#dob') === '14 / 03 / 1994', 'Done fills AD date');
  assert(await p.isVisible('text=1 Chaitra 2050 BS'), 'BS shown under field (17)');
  await p.click('.cta >> text=Create profile');
  assert(await p.isVisible('text=We may already know you'), 'Sharma → possible match (22)');
  await p.click('text=Continue'); assert(await p.isVisible('text=Your records are waiting for reception'), 'waiting (23)');
  await p.evaluate(() => jumpTo('21')); await p.click('text=Send a code to'); assert(await p.isVisible('text=Enter the code'), 'session expired → code');
  // ---- Booking flow ----
  await p.evaluate(() => jumpTo('09')); await p.click('text=Anisha Sharma');
  assert(await p.isVisible('text=Your next appointment'), 'choosing yourself → Home (B01)');
  await p.click('.qa >> text=Book a visit'); assert(await p.isVisible('text=3 doctors at City Hospital'), 'Find doctor (B02)');
  await p.fill('#q', 'ramesh'); assert(await p.isVisible('text=1 doctor at City Hospital'), 'search filters doctors');
  await p.click('[data-act="clear-q"]'); assert(await p.isVisible('text=3 doctors at City Hospital'), 'clear search');
  await p.click('.specs >> text=Cardiology'); assert(await p.isVisible('#phone >> text=1 doctor in Cardiology') && await p.isVisible('[data-act="doctor:sk"]'), "Cardiology: Dr. Suman KC, and his row opens (SB08)");
  await p.fill('#q', 'fever'); assert(await p.isVisible('#phone >> text=Fever is usually seen in General medicine.') && !(await p.isVisible('.specs')), 'condition search explains itself (SB06)');
  await p.fill('#q', 'eye'); assert(await p.isVisible('#phone >> text=No eye doctors at City Hospital'), 'no eye doctor (SB07)');
  await p.click('[data-act="clear-q"]');
  await p.click('.specs >> text=General medicine');
  await p.click('text=Dr. Ramesh Shrestha'); assert(await p.isVisible('text=No times left today'), 'no slots (B07)');
  assert(!(await p.isVisible('.cta >> text=Book')), 'no Book button when nothing to book');
  await p.click('text=See Thu, Sep 3'); assert(await p.isVisible('text=Choose a time'), 'next opening shows times');
  await p.click('[aria-label=Back]'); await p.click('text=Dr. Priya Sharma');
  assert(await p.isDisabled('.pick.day >> text=Sat'), 'Saturday closed');
  assert(await p.isDisabled('.pick.time >> text=10:30 AM'), 'taken slot disabled');
  assert(await p.isDisabled('.cta .btn'), 'Book disabled until a time is picked');
  // Run 6 Y02: her own 4:30 is "Your visit" and can't be booked again; another time that day asks first. (Was: book 4:30, then 5:00.)
  assert(await p.isDisabled('.pick.time:has-text("4:30 PM")') && await p.isVisible('.pick.time:has-text("4:30 PM") >> text=Your visit') && (await p.getAttribute('.pick.time:has-text("4:30 PM")', 'aria-label')) === '4:30 PM, your visit', 'Y02: the slot she holds shows as "Your visit" and is disabled');
  await p.click('.pick.time >> text=5:00 PM'); await p.click('text=Book 5:00 PM today');
  assert(await p.isVisible('.csheet >> text=You already have a visit with Dr. Sharma that day') && await p.isVisible('.csheet >> text=Today, 4:30 PM') && !(await p.isVisible('.appbar >> text=Review booking')), 'Y02: a second visit with the same doctor that day asks first');
  await p.click('.csheet >> text=Keep just the one'); assert(!(await p.isVisible('.csheet')) && await p.isVisible('text=Choose a time'), 'Y02: keeping the one stays on the doctor page');
  await p.click('text=Book 5:00 PM today'); await p.click('.csheet .btn:text-is("Book a second visit")');
  assert(await p.isVisible('.appbar >> text=Review booking'), 'review (B04)');
  await p.fill('#reason', 'Fever for three days');
  assert(await p.isDisabled('.cta .btn:text-is("Choose how to pay")') && await p.isVisible('text=Choose how to pay to confirm.'), 'R10: Confirm waits for a payment choice');
  await p.click('.pay-tile:has-text("Pay at reception")'); assert(await p.isVisible('text=NPR 800, to pay at reception'), 'R10: Pay at reception is an explicit choice');
  await p.evaluate(() => showCases()); await p.selectOption('[data-s="failNext"]', 'taken'); await p.waitForTimeout(450); await p.click('text=Confirm booking');
  assert(await p.isVisible('text=5:00 PM was just taken'), 'booking failed (B08)');
  assert(await p.inputValue('#reason') === 'Fever for three days', 'reason kept after failure');
  await p.click('text=Choose another time');
  assert(await p.isDisabled('.pick.time >> text=5:00 PM'), '5:00 now shown as taken');
  await p.click('.pick.time >> text=5:30 PM'); await p.click('text=Book 5:30 PM today'); await p.click('.csheet .btn:text-is("Book a second visit")'); await p.waitForTimeout(450); await p.click('text=Confirm booking');
  assert(await p.isVisible('text=Appointment booked') && await p.isVisible('text=at 5:30 PM today'), 'confirmed (B05)');
  assert(!(await p.isVisible('[aria-label=Back]')), 'no back arrow on Confirmed');
  await p.click('text=Done'); assert(await p.isVisible('text=Know if Dr. Sharma is running late'), 'notifications asked after booking (B06)');
  // Run 6 Y02: both visits are kept. Home shows the soonest (was: the new one replaced it); Care lists both, each opening its own page.
  await p.click('text=Not now'); assert(await p.isVisible('#phone .card >> text=Today, 4:30 PM') && !(await p.isVisible('#phone .card >> text=Today, 5:30 PM')), 'Y02: Home shows the soonest of two visits');
  await p.click('.bnav >> text=Care'); assert(await p.isVisible('#phone .card >> text=Today, 4:30 PM') && await p.isVisible('#phone .card >> text=Today, 5:30 PM'), 'Y02: Care lists both upcoming visits');
  await p.click('#phone .card >> text=Today, 5:30 PM'); assert(await p.isVisible('#phone >> text=Arrive by 5:15 PM') && await p.isVisible('#phone >> text=Fever for three days'), 'Y02: the new visit opens its own page');
  await p.click('#phone .cta >> text=Cancel visit'); assert((await p.textContent('.csheet')).includes("Cancel Anisha's visit today at 5:30 PM?"), 'Y02/Y10: its own cancel, naming whose visit');
  await p.click('.csheet >> text=Cancel visit'); assert(await p.isVisible('#phone .card >> text=Today, 4:30 PM') && !(await p.isVisible('#phone .card >> text=Today, 5:30 PM')), 'Y02: cancelling it keeps the 4:30');
  await p.evaluate(() => jumpTo('B09')); await p.click('text=Book another time');
  assert(await p.isVisible('text=No times left today'), 'cancelled → her availability without today');
  // ---- Health ----
  const pin = async digits => { for (const d of digits) await p.click(`[data-act="pin-digit:${d}"]`); await p.waitForTimeout(300); };
  await p.evaluate(() => jumpTo('B01'));
  await p.click('.bnav >> text=Health'); assert(await p.isVisible('text=Your health records are locked'), 'Health tab opens locked (H01)');
  await p.click('button.btn:text-is("Unlock")'); assert(await p.isVisible('text=Choose a PIN for your health records'), 'first unlock creates a PIN (H12)');
  await pin('1234'); assert(await p.isVisible('text=Enter it again'), 'fourth digit moves on (H13)');
  await pin('1111'); assert(await p.isVisible("text=Those PINs didn't match"), 'mismatch back to 12 with reason');
  await pin('1234'); await pin('1234'); assert(await p.isVisible('text=Use your fingerprint next time?'), 'fingerprint opt-in (H14)');
  await p.click('text=Use fingerprint'); assert(await p.isVisible('text=Taking now') && await p.isVisible('text=Your records'), 'unlocked Health (H02)');
  assert(await p.isVisible('text=1 running low'), 'Medicines row counts low stock');
  await p.click('text=Visit history'); await p.click('text=Aug 28, Dr. Priya Sharma'); assert(await p.isVisible('text=Visit on Aug 28'), 'visit detail (H04)');
  await p.click('[aria-label=Back]'); await p.click('[aria-label=Back]');
  await p.click('.list >> text=Prescriptions'); await p.click('text=Dr. Priya Sharma, Aug 28'); await p.click('text=Show to pharmacist');
  assert(await p.isVisible('text=5 days · Dispense 15 tablets'), 'show to pharmacist (H07)');
  await p.click('text=Done'); assert(await p.isVisible('.appbar >> text=Prescription'), 'Done goes back');
  await p.click('[aria-label=Back]'); await p.click('[aria-label=Back]');
  await p.click('text=Lab reports'); await p.click('text=CBC blood test'); assert(await p.isVisible('text=Your doctor is reviewing this report'), 'report being reviewed (H10)');
  await p.click('[aria-label=Back]'); await p.click('text=Thyroid panel'); assert(await p.isVisible('text=What your doctor says'), 'released report (H09)');
  // leaving the tab re-locks; fingerprint prompt, first touch fails
  await p.click('[aria-label=Back]'); await p.click('[aria-label=Back]'); await p.click('.bnav >> text=Home'); await p.click('.bnav >> text=Health');
  assert(await p.isVisible('text=Your health records are locked'), 'leaving the tab re-locks');
  await p.click('button.btn:text-is("Unlock")'); assert(await p.isVisible('text=Touch the fingerprint sensor'), 'fingerprint prompt (H15)');
  await p.click('[aria-label="Fingerprint sensor"]'); assert(await p.isVisible('text=Not recognised. Try again.'), 'not recognised (H16)');
  await p.click('text=Use PIN instead'); assert(await p.isVisible('text=Enter your PIN'), 'PIN fallback (H17)');
  for (let i = 0; i < 4; i++) await pin('0000');
  assert(await p.isVisible("text=That PIN didn't match. 1 try left."), 'wrong PIN with tries left (H18)');
  await pin('0000'); assert(await p.isVisible('text=Too many tries') && await p.isVisible('text=You can try again in 0:30'), 'too many tries (H19)');
  await p.click('text=Reset with an SMS code'); assert(await p.isVisible('text=Reset your PIN'), 'reset sheet (H20)');
  await p.click('.scrim', { position: { x: 180, y: 120 } }); assert(!(await p.isVisible('.csheet')), 'scrim = safe choice');
  await p.click('text=Reset with an SMS code'); await p.click('text=Send code');
  assert(await p.isVisible('text=Enter the code'), 'same code screen as sign-in (H21)');
  await p.fill('#code-in', '123456'); await p.waitForTimeout(200);
  assert(await p.isVisible('text=Choose a new PIN'), 'new PIN (H22)');
  await pin('5678'); await pin('5678'); assert(await p.isVisible('text=Your records'), 'confirm new PIN → straight into Health (H23)');
  // Medicines tracker
  const V = sel => p.isVisible('#phone >> ' + sel);
  await p.click('.item-title:text-is("Medicines")'); assert(await V('text=Your action is required') && await V('text=6 tablets left'), 'medicines tracker (MT01)');
  await p.click('.mt-row:has-text("Metformin")'); assert(!(await V('.mt-alert')) && await V('text=28 tablets'), 'fine stock: no warning');
  await p.click('#phone >> text=I took a dose'); assert(await V('text=Dose logged') && await V('.mt-n:text-is("27")'), 'dose logged (MT06)');
  await p.click('[aria-label=Back]'); assert(await V('text=27 tablets left'), 'back to the list, the count follows');
  await p.click('#phone >> text=Add a medicine'); await p.click('#phone >> text=Save medicine'); assert(await V("text=Enter the medicine's name."), 'manual form validates (MT02)');
  await p.fill('#mf-name', 'Omeprazole'); await p.fill('#mf-strength', '20 mg'); await p.fill('#mf-qty', '14 capsules'); await p.fill('#mf-each', '1 capsule'); await p.fill('#mf-often', 'Once a day');
  await p.click('#phone >> text=Save medicine'); assert(await V('text=Omeprazole 20 mg') && await V('text=14 capsules left'), 'manual medicine saved');
  await p.click('.mt-row:has-text("Paracetamol")'); assert(await V('text=Only 6 tablets remain'), 'low stock detail (MT05)');
  await p.click('#phone >> text=Add medicine'); assert(await p.inputValue('#mf-name') === 'Paracetamol' && await p.inputValue('#mf-qty') === '', 'restock prefilled, count empty (MT08)');
  await p.click('#phone >> text=Or tell the assistant how much you bought'); assert(await V('text=Listening…'), 'tell the assistant (MT03)');
  await p.waitForTimeout(3300); assert(await V('text=Filled in from what you said') && await p.inputValue('#mf-qty') === '20 tablets', 'review what was heard (MT04)');
  await p.click('#phone >> text=Save medicine'); assert(await V('text=26 tablets left') && !(await V('text=Your action is required')), 'restocked: the warning clears');
  await p.click('[aria-label=Back]'); await p.click('.bnav >> text=Home');
  assert(!(await V('.banner')), 'Home banner follows stock');
  // ---- Care: cancel the follow-up, so Ask can book one ----
  await p.click('.bnav >> text=Care'); assert(await p.isVisible('#phone >> text=Coming up') && await p.isVisible('#phone >> text=Past visits'), 'Care tab (C01)');
  await p.click('.card >> text=Fri, Sep 11, 10:30 AM'); assert(await p.isVisible('#phone >> text=Before you come'), 'appointment detail (C02)');
  await p.click('button:text-is("Cancel visit")'); assert(await p.isVisible("#phone >> text=Cancel Anisha's visit on Fri, Sep 11?") && await p.isVisible('#phone .list >> text=Anisha Sharma'), 'cancel sheet (C05); Run 6 Y10: the page and the sheet name whose visit (was: "Cancel your visit")');
  await p.mouse.click(180 + (await p.locator('#phone').boundingBox()).x, 120 + (await p.locator('#phone').boundingBox()).y);
  assert(!(await p.isVisible('.csheet')), 'scrim is the safe choice');
  await p.click('button:text-is("Cancel visit")'); await p.click('.csheet >> text=Cancel visit');
  assert(await p.isVisible('#phone >> text=Your Sep 11 visit is cancelled') && !(await p.isVisible('#phone >> text=Coming up')), 'cancelled, Neutral with tag (C06)');
  // ---- Ask ----
  await p.click('.bnav >> text=Ask'); assert(await p.isVisible('text=Messages is now Ask'), 'first open (A01)');
  await p.click('text=Start'); assert(await p.isVisible('text=You could ask'), 'assistant home (A02)');
  await p.click('[aria-label="Ask by voice"]'); assert(await p.isVisible('#phone >> text=Let Clinica use the microphone?'), 'first tap asks for the microphone (AM03)');
  await p.click('[data-act="mic-allow"]'); assert(await p.isVisible('text=Listening…'), 'listening (A03)');
  await p.waitForTimeout(3200); assert(await p.isVisible('text=You have one visit coming up.'), 'voice question answered (A04)');
  await p.click('.chip:has-text("Summarise my last visit")').catch(() => {});
  await p.fill('#ask-in', 'Summarise my last visit'); await p.press('#ask-in', 'Enter'); await p.waitForTimeout(800);
  assert(await p.isVisible('text=Unlock with PIN'), 'records ask for the PIN inline (A05)');
  await p.click('text=Unlock with PIN'); await pin('5678'); await p.waitForTimeout(300);
  assert(await p.isVisible('text=Dr. Priya Sharma wrote'), 'after unlocking, the answer shows (A06)');
  await p.click('button:text-is("Book follow-up")'); assert(await p.isDisabled('.cta .btn'), 'patient must choose the time (A10)');
  await p.click('.pick.time >> text=11:00 AM'); await p.click('text=Book Fri, Sep 11, 11:00 AM');
  assert(await p.isVisible("text=Your follow-up is booked. We've sent the details by SMS."), 'booked, back in the conversation (A11)');
  assert(await p.isVisible("text=A follow-up in 2 weeks isn't booked yet."), 'earlier answer unchanged');
  await p.fill('#ask-in', 'Is my thyroid result normal?'); await p.press('#ask-in', 'Enter'); await p.waitForTimeout(800);
  assert(await p.isVisible('text=Dr. Anita Joshi wrote'), 'unlock lasts for the conversation (A13)');
  await p.fill('#ask-in', 'I have chest pain'); await p.press('#ask-in', 'Enter'); await p.waitForTimeout(800);
  assert(await p.isVisible("text=If it's severe, call 102 now"), 'safety route (A12)');
  await p.click('[aria-label="New conversation"]'); assert(await p.isVisible('text=You could ask'), '+ clears the conversation');
  await p.click('.chip:has-text("Prepare for my visit")'); await p.waitForTimeout(800); await p.click('text=Add a question');
  await p.fill('#askq', 'Should I keep taking cetirizine?'); await p.click('text=Save question');
  assert(await p.isVisible('text=Should I keep taking cetirizine?') && await p.isVisible('text=Add another'), 'question saved (A19)');
  await p.fill('#ask-in', 'Summarise my last visit'); await p.press('#ask-in', 'Enter'); await p.waitForTimeout(800);
  assert(await p.isVisible('text=Unlock with PIN'), 'new conversation asks for the PIN again');
  await p.evaluate(() => showCases()); await p.check('#offline');
  await p.fill('#ask-in', 'When is my next visit?'); await p.press('#ask-in', 'Enter'); await p.waitForTimeout(800);
  assert(await p.isVisible('text=Saved at 9:12 AM'), 'offline answer (A16)');
  await p.uncheck('#offline');
  // Phase 6 (T22): she has a Health PIN on a shared number, so Home's appointments and medicines are locked too, behind the same PIN.
  await p.click('.back-l'); assert(await p.isVisible('text=Locked on this shared phone') && !(await p.isVisible('text=Your next appointment')), '← Home leaves for Home (T22: appointments locked)');
  await p.click('text=Locked on this shared phone'); assert(await p.isVisible('text=To see your appointments and medicines.'), 'T22: the same PIN screen, saying why');
  await pin('5678'); assert(await p.isVisible('text=Your next appointment'), 'T22: the PIN shows Home in full');
  // ---- Care: reschedule and calendar ----
  const box = await p.locator('#phone').boundingBox(), scrim = () => p.mouse.click(box.x + 180, box.y + 120);
  await p.evaluate(() => jumpTo('C02')); await p.click('#phone >> text=So you get a reminder too');
  assert(await p.isVisible('.syscal >> text=Appointment — City Hospital') && !(await p.isVisible('.syscal >> text=Priya')), 'system sheet names the clinic, not the doctor (K02)');
  assert(await p.isVisible('.syscal >> text=Fri, Sep 11, 10:30 AM') && await p.isVisible('.syscal >> text=11:00 AM'), 'sheet pre-filled with time and a 30-minute end');
  const dl = p.waitForEvent('download'); await p.click('.syscal >> text=Add'); const ics = await (await dl).path();
  const icsText = require('fs').readFileSync(ics, 'utf8');
  assert(/SUMMARY:Appointment — City Hospital/.test(icsText) && /TRIGGER:-P1D/.test(icsText) && /TRIGGER:-PT2H/.test(icsText), '.ics has the clinic title and both alerts');
  assert(await p.isVisible('#phone >> text=In your calendar'), 'saved (K03)');
  await p.click('#phone >> text=Reschedule'); assert(await p.isDisabled('.cta .btn'), 'reschedule needs a time (C03)');
  assert(await p.isDisabled('.pick.day[aria-label^="Sat"]') && await p.isDisabled('.pick.time[aria-label^="10:30 AM"]'), 'Saturday closed; the current time is not a choice');
  await p.click('.pick.day >> text=Sun'); await p.click('.pick.time >> text=11:00 AM'); await p.click('#phone >> text=Move to Sun, 11:00 AM');
  assert(await p.isVisible('#phone >> text=Visit moved') && await p.isVisible('#phone >> text=Calendar still shows Fri, Sep 11'), 'moved, calendar copy is stale (K05)');
  await p.click('[aria-label=Back]'); assert(await p.isVisible('.card >> text=Sun, Sep 13, 11:00 AM') && await p.isVisible('#phone >> text=So you get a reminder too'), 'back to the appointment, at the new time');
  await p.click('button:text-is("Cancel visit")'); await p.click('.csheet >> text=Cancel visit');
  assert(await p.isVisible('#phone >> text=Your Sep 13 visit is cancelled') && !(await p.isVisible('#phone >> text=Remove it from your calendar')), 'no calendar warning when the new time was never added');
  await p.evaluate(() => jumpTo('C02')); await p.click('#phone >> text=So you get a reminder too'); await p.click('.syscal >> text=Add');
  await p.click('button:text-is("Cancel visit")'); await p.click('.csheet >> text=Cancel visit');
  assert(await p.isVisible('#phone >> text=Remove it from your calendar'), 'cancelled after adding → remove it (K06)');
  await p.evaluate(() => jumpTo('B05')); await p.evaluate(() => showCases()); await p.check('[data-s="calOff"]');
  await p.click('#phone >> text=Add to calendar'); assert(await p.isVisible("#phone >> text=Clinica can't add to your calendar"), 'access refused (K04)');
  await scrim(); assert(!(await p.isVisible('.csheet')), 'Not now / scrim closes it'); await p.uncheck('[data-s="calOff"]');
  // ---- Care: visit day ----
  await p.evaluate(() => jumpTo('C01')); await p.click('.card >> text=Today, 4:30 PM'); assert(await p.isVisible('#phone >> text=Arrive by 4:15 PM'), 'visit day (C07)');
  await p.selectOption('[data-s="visitDay"]', 'late'); assert(await p.isVisible('#phone >> text=Dr. Sharma is running late') && await p.isVisible('#phone >> text=Reschedule instead'), 'running late (C08)');
  await p.click('#phone >> text=Reschedule instead'); assert(await p.isVisible('#phone >> text=Currently') && !(await p.isVisible('.pick.day >> text=Aug 28')), "today's visit moves within the booking week");
  await p.click('.pick.day >> text=Sun'); await p.click('.pick.time >> text=4:30 PM'); await p.click('#phone >> text=Move to Sun, 4:30 PM');
  assert(await p.isVisible('#phone >> text=Your slot today at 4:30 PM has been released'), 'today moved');
  await p.click('.btn >> text=Add to calendar'); await p.click('.syscal >> text=Add');
  await p.click('[aria-label=Back]'); assert(await p.isVisible('#phone >> text=Sun, Aug 30, 4:30 PM') && !(await p.isVisible('#phone >> text=Reschedule instead')), 'back on the visit, booked again at the new time');
  await p.click('[aria-label=Back]'); await p.click('.bnav >> text=Home'); assert(await p.isVisible('#phone >> text=Sun, Aug 30, 4:30 PM'), 'Home follows the move');
  await p.selectOption('[data-s="visitDay"]', 'checkedin'); await p.click('.bnav >> text=Care');
  await p.click('.card >> text=Sun, Aug 30, 4:30 PM'); assert(await p.isVisible('#phone >> text=Waiting for Dr. Priya Sharma'), 'checked in (C09)');
  await p.selectOption('[data-s="visitDay"]', 'done'); assert(await p.isVisible('#phone >> text=Visit complete') && await p.isVisible('#phone >> text=Sun, Sep 13, 11:00 AM') === false, 'visit complete (C10)');
  await p.selectOption('[data-s="visitDay"]', 'missed'); await p.evaluate(() => jumpTo('C01')); await p.selectOption('[data-s="visitDay"]', 'missed');
  assert(await p.isVisible('#phone >> text=We missed you at 4:30 PM'), 'missed replaces the visit (C11)');
  await p.evaluate(() => jumpTo('C10')); await p.click('#phone >> text=Book follow-up'); await p.click('.pick.time >> text=10:30 AM'); await p.click('#phone >> text=Book Fri, Sep 11, 10:30 AM');
  assert(await p.isVisible('#phone >> text=Next step') && await p.isVisible('.card >> text=Fri, Sep 11, 10:30 AM'), 'follow-up booked from Care replaces the card');
  // ---- Notification centre ----
  await p.evaluate(() => jumpTo('B01')); assert(await p.isVisible('.bell .dot'), 'unread dot on the bell');
  await p.click('[aria-label^="Notifications"]'); assert(await p.isVisible('#phone >> text=Dr. Sharma is running late'), 'bell opens the centre (N01)');
  await p.click('#phone >> text=Dr. Sharma is running late'); assert(await p.isVisible('#phone >> text=No need to watch the app'), 'the delay opens in Care');
  await p.click('[aria-label=Back]'); assert(await p.locator('.nt.unread').count() === 1, 'opened row is read');
  await p.click('[aria-label="Mark all as read"]'); assert(await p.locator('.nt.unread').count() === 0, 'mark all as read');
  await p.click('[aria-label=Back]'); assert(!(await p.isVisible('.bell .dot')), 'bell dot clears');
  await p.click('[aria-label^="Notifications"]'); assert(await p.evaluate(() => S.notifs.filter(n => n.t.includes('lab report is ready')).length === 0), 'W10: no anonymous "A lab report is ready" in the app');
  await p.click('#phone >> text=Your HbA1c blood test is ready — Dr. Sharma wants to see you'); assert(await p.isVisible('#phone >> text=Your health records are locked'), 'reports open through the Health lock');
  await p.evaluate(() => jumpTo('N01')); await p.click('[aria-label="Notification settings"]'); assert(await p.isVisible('#phone >> text=Appointment reminders'), 'gear opens settings (P04)');
  // ---- Profile ----
  await p.click('.bnav >> text=Home').catch(() => {}); await p.evaluate(() => jumpTo('B01')); await p.click('.bnav >> text=Profile');
  assert(await p.isVisible('#phone >> text=Patient at City Hospital') && await p.isVisible('#phone >> text=Close account'), 'Profile tab (P01)');
  await p.click('#phone >> text=Your details'); assert(await p.isVisible('#phone >> text=14 Mar 1994, or 1 Chaitra 2050 BS'), 'details in AD and BS (P02)'); await p.click('[aria-label=Back]');
  await p.click('#phone >> text=Language'); await p.click('.tile[data-v="ne"]'); await p.click('[aria-label=पछाडि]'); assert(await p.isVisible('#phone >> text=नेपाली'), 'language follows (P03)'); // Phase 8: Back's label is Nepali too
  // Phase 6 (F15/R12): the rest of the patient app's chrome follows the language, then this flow goes back to English.
  assert(await p.isVisible('.bnav >> text=प्रोफाइल') && await p.isVisible('.bnav >> text=हेरचाह') && await p.isVisible('#phone >> text=तपाईंको विवरण') && await p.isVisible('#phone >> text=स्वास्थ्य लक'), 'F15/R12: Profile and the tab bar in Nepali');
  await p.click('#phone >> text=भाषा'); await p.click('.tile[data-v="en"]'); await p.click('[aria-label=Back]'); assert(await p.isVisible('#phone >> text=Your details'), 'back to English');
  await p.click('#phone >> text=Notifications'); await p.click('[role=switch]:has-text("Follow-up reminders")');
  assert(await p.getAttribute('[role=switch]:has-text("Follow-up reminders")', 'aria-checked') === 'true', 'switch toggles at once (P04)');
  assert(await p.isDisabled('[role=switch]:has-text("Delays and cancellations")'), 'delays always on');
  await p.check('[data-s="notifOff"]'); assert(await p.isVisible('#phone >> text=Notifications are off for Clinica') && await p.isDisabled('[role=switch]:has-text("Follow-up reminders")'), 'blocked: switches disabled, value kept (P09)');
  assert(await p.getAttribute('[role=switch]:has-text("Follow-up reminders")', 'aria-checked') === 'true', 'value kept while disabled');
  await p.uncheck('[data-s="notifOff"]'); await p.click('[aria-label=Back]');
  await p.click('#phone >> text=Health lock'); await p.click('#phone >> text=Change PIN'); assert(await p.isVisible('#phone >> text=Choose a new PIN'), 'no PIN yet: straight to a new one');
  await pin('2468'); await pin('2468'); assert(await p.isVisible('#phone >> text=Locks automatically'), 'new PIN saved, back to Health lock (P05)');
  await p.click('#phone >> text=Change PIN'); assert(await p.isVisible('#phone >> text=Enter your current PIN'), 'changing asks for the current PIN (PM01)');
  await pin('2468'); assert(await p.isVisible('#phone >> text=Choose a new PIN'), 'then a new one'); await pin('1357'); await pin('1357');
  assert(await p.isVisible('#phone >> text=Locks automatically'), 'changed');
  assert(await p.isVisible('#phone >> text=PIN changed'), 'a Success note confirms it (PM04)');
  // Phase 6 (T22): each person can choose whether Home's appointments and medicines lock too.
  const homeLock = '[role=switch]:has-text("Also lock appointments and medicines")';
  assert(await p.getAttribute(homeLock, 'aria-checked') === 'true', 'T22: Home lock is on by default on a shared number');
  await p.click(homeLock); assert(await p.getAttribute(homeLock, 'aria-checked') === 'false' && await p.isVisible('#phone >> text=Off. Anyone with this phone sees them on Home'), 'T22: each person can turn it off');
  await p.click(homeLock); assert(await p.getAttribute(homeLock, 'aria-checked') === 'true', 'T22: and back on');
  await p.click('[role=switch]:has-text("Use fingerprint")'); assert(await p.isVisible('#phone >> text=Use your fingerprint next time?'), 'turning it on goes through the opt-in (PM10)');
  await p.click('[data-act="finger:on"]'); await p.click('[aria-label=Back]'); assert(await p.isVisible('#phone >> text=PIN and fingerprint'), 'fingerprint on');
  await p.click('#phone >> text=Switch person'); await p.click('#phone >> text=Ramesh Sharma'); assert(await p.isVisible("#phone >> text=Enter Ramesh's PIN"), "Ramesh's PIN (P11)");
  await pin('0000'); assert(await p.isVisible("#phone >> text=That PIN didn't match"), 'wrong PIN');
  await pin('1961'); assert(await p.isVisible('#phone >> text=Ramesh') && await p.isVisible('#phone >> text=Your next appointment'), 'right PIN opens their Home');
  // Run 6 Y01: Ramesh's own record, not Anisha's: nothing booked, his own medicine, no reports. Each person's Home lock is their own.
  assert(await V('text=Nothing booked yet') && !(await V('text=Today, 4:30 PM')) && !(await V('.banner')) && !(await V('text=Lab report ready')), "Y01: Ramesh's Home has none of Anisha's visit, medicine or report");
  await p.click('.bnav >> text=Care'); assert(await V('text=No upcoming visits') && !(await V('text=Fri, Sep 11')), "Y01: Ramesh's Care has none of her visits");
  await p.click('.bnav >> text=Health'); assert(await V('text=Nothing here yet'), 'Y01: no reports in his Health');
  await p.click('#phone .list >> text=Medicines'); assert(await V('text=Amlodipine') && !(await V('text=Paracetamol')), 'Y01: his own medicine'); await p.click('[aria-label=Back]');
  await p.click('.bnav >> text=Home'); assert(await V('text=Locked on this shared phone'), "Y01/T22: Ramesh's Home locks with his lock");
  await p.click('.bnav >> text=Health'); assert(await V('text=Locked on this shared phone') && !(await V('#phone .list >> text=Medicines')), "Y01/T22: his medicines stay behind the lock from Health too"); await p.click('.bnav >> text=Home');
  await p.click('#phone >> text=Locked on this shared phone'); await pin('1961'); assert(await V('text=Nothing booked yet'), 'Y01/T22: and opens with his PIN');
  await p.click('.bnav >> text=Profile'); await p.click('#phone >> text=Switch person'); await p.click('#phone >> text=Anisha Sharma'); await pin('1357');
  assert(await V('text=Today, 4:30 PM') && await V('text=Lab report ready') && await V('text=Anisha'), "Y01: switching back brings Anisha's own record back");
  await p.click('.bnav >> text=Profile'); await p.click('#phone >> text=Sign out'); assert(await p.isVisible('#phone >> text=Sign out of Clinica?'), 'sign out sheet (P08)');
  await p.click('#phone >> text=Stay signed in'); assert(!(await p.isVisible('.csheet')), 'stay signed in');
  await p.click('#phone >> text=Close account'); assert(await p.isVisible('#phone >> text=Close your Clinica account?') && await p.isVisible('.csheet .btn.destructive'), 'close account is red (P10)');
  await p.click('.csheet >> text=Close account'); assert(await p.isVisible('#phone >> text=Your account is closed'), "says what is and isn't deleted (PM09)");
  await p.click('#phone >> text=Done'); await p.waitForTimeout(200); assert(await p.isVisible('#phone >> text=Clinica'), 'account closed → start again');
  // ---- Medicine alerts and the lock-screen push ----
  await p.evaluate(() => jumpTo('MT09')); await p.click('.push'); assert(await p.isVisible('#phone >> text=Your health records are locked'), 'push opens the medicine through the lock (MT09)');
  await p.evaluate(() => jumpTo('MT07')); assert(await p.isVisible('#phone >> text=Time for your Metformin'), 'medicine alerts (MT07)');
  await p.click('#phone >> text=Time for your Metformin'); assert(await p.isVisible('#phone >> text=Your health records are locked'), 'alerts open through the lock');
  // ---- Section 2: more states ----
  const J = async n => { await p.evaluate(n => jumpTo(n), n); await p.waitForTimeout(150); };
  const P = sel => p.isVisible('#phone >> ' + sel);
  await p.evaluate(() => showCases());
  // booking for someone else; a reply that never came
  await J('B04'); await p.click('#phone >> text=Booking for'); assert(await P('text=Who is this visit for?'), 'who is this visit for (SB01)');
  await p.click('.radio-row:has-text("Ramesh Sharma")'); assert(!(await P('.sheet')) && await P('text=Ramesh Sharma'), 'choosing closes the sheet (SB02)');
  await p.click('#phone >> text=Confirm booking'); assert(await P('text=Ramesh is booked with') && await P("text=switch to him in Profile"), 'confirmed for Ramesh (SB03)');
  await p.click('#phone >> text=Done').catch(() => {}); await p.click('[data-act="not-now"]').catch(() => {});
  // Run 6 Y01: the visit goes into Ramesh's own record (B04 is before Anisha's own 4:30 was booked). Was: Anisha's Home still showed her 4:30.
  assert(await P('text=Your next appointment') && await P('text=Nothing booked yet') && !(await P('.card >> text=Today, 4:30 PM')), "Ramesh's visit doesn't become Anisha's");
  await p.click('.bnav >> text=Profile'); await p.click('#phone >> text=Switch person'); await p.click('#phone >> text=Ramesh Sharma'); await pin('1961');
  assert(await P('.card >> text=Today, 4:30 PM'), "Y01: it's on Ramesh's Home");
  await J('B04'); await p.check('[data-s="offline"]'); await p.waitForTimeout(450); await p.click('#phone >> text=Confirm booking');
  assert(await P("text=Couldn't send your booking"), 'offline booking (SB04)'); await p.uncheck('[data-s="offline"]');
  await p.waitForTimeout(450); await p.click('.cta >> text=Try again'); assert(await P('text=Appointment booked'), 'retry is safe once online');
  await J('B04'); await p.selectOption('[data-s="failNext"]', 'noreply'); await p.waitForTimeout(450); await p.click('#phone >> text=Confirm booking');
  assert(await P("text=We couldn't confirm your booking"), 'no reply (SB05)');
  await p.waitForTimeout(450); await p.click('.cta >> text=Try again'); assert(await P('text=Appointment booked') && await P("text=You're booked once"), "trying again finds it already booked — no double booking, and says so (W14)");
  // filters and saved doctors
  await J('B02'); await p.click('[aria-label="Filter doctors"]'); await p.click('[data-act="fd-today"]'); await p.click('.radio-row:has-text("Female")');
  assert(await P('text=Show 1 doctor'), 'the count before applying (SB12)'); await p.click('#phone >> text=Show 1 doctor');
  assert(await P('text=Available today · Female doctor') && await P('text=Dr. Priya Sharma') && !(await P('text=Dr. Ramesh Shrestha')), 'filtered, and says so (SB13)');
  await p.click('.filt-row >> text=Clear'); assert(await P('text=3 doctors at City Hospital'), 'clear filters');
  await p.click('[data-act="doctor:ps"]'); await p.click('[aria-label="Save doctor"]'); assert(await p.getAttribute('[data-act="fav:ps"] img', 'src') === 'assets/icon-heart-filled.svg', 'saved: a filled heart (SB14)');
  await p.click('[aria-label=Back]'); assert(await P('.sec-label:text-is("Saved")'), 'saved doctors on top (SB15)');
  // reschedule: the time was taken meanwhile
  await J('C03'); await p.selectOption('[data-s="failNext"]', 'taken'); await p.click('#phone >> text=Move to Sun, 11:00 AM');
  assert(await P('text=11:00 AM on Sun was just taken') && await p.isDisabled('.pick.time[aria-label^="11:00 AM"]') && await p.isDisabled('.cta .btn'), 'time taken; current visit still booked (SC03)');
  await p.click('.pick.time >> text=3:30 PM'); await p.click('#phone >> text=Move to Sun, 3:30 PM'); assert(await P('text=Visit moved'), 'then moves');
  // visit day
  await J('C07'); for (const [v, t] of [['ontime', 'is back on time'], ['turn', 'Your turn'], ['with', 'In progress']]) {
    await p.selectOption('[data-s="visitDay"]', v); assert(await P(`text=${t}`), `visit day: ${v} (SC)`); }
  await p.selectOption('[data-s="visitDay"]', 'late'); await J('B01'); await p.selectOption('[data-s="visitDay"]', 'late'); assert(await P("text=Today's visit") && await P('text=Dr. Sharma is running late'), 'Home follows the visit day (SH02)');
  // the notification centre and the lock screen
  await J('NM02'); await p.click('#phone >> text=City Hospital cancelled your visit'); assert(await P('text=The clinic cancelled your Sep 11 visit') && await P('text=Book another time'), 'clinic cancellation: Error tone (SC06)');
  await J('N01'); await p.click('[aria-label="Mark all as read"]'); assert(!(await P('[aria-label="Mark all as read"]')), 'nothing left to mark (NM01)');
  await J('NM03'); await p.click('#phone >> text=A lab report is ready'); assert(await P('text=Unlock to see your new lab report'), 'lock screen → the report, through the lock (HM01)');
  await p.click('[data-act="unlock-start"]'); assert(await P('text=Choose a PIN for your health records'), 'first unlock creates the PIN');
  await pin('1234'); await pin('1234'); await p.click('[data-act="finger:off"]'); assert(await P('text=Dr. Sharma asked to see you'), 'lands on the report, not the hub (HM03)');
  await p.click('#phone >> text=HbA1c blood test report'); assert(await P('text=Page 1 of 1'), 'report file (HM05)');
  const dl2 = p.waitForEvent('download'); await p.click('#phone >> text=Download report'); assert((await (await dl2).suggestedFilename()).endsWith('.pdf'), 'a real PDF through the save prompt');
  // a new fingerprint on the phone
  await J('H15'); await p.check('[data-s="fingerChanged"]'); await J('H01'); await p.check('[data-s="fingerChanged"]'); await p.evaluate(() => { S.pin = '1234'; S.finger = 'on'; });
  await p.click('[data-act="unlock-start"]'); assert(await P('text=Fingerprint unlock is off') && !(await P('.bio-sheet')), 'no fingerprint prompt after a new one is added (HM07)');
  await pin('1234'); assert(await P('text=Use your fingerprint next time?'), 'then the opt-in asks again');
  // Profile: change number, add someone
  await J('P02'); await p.evaluate(() => { S.pin = '1234'; }); await p.click('#phone >> text=Mobile number');
  assert(await P('text=To change your mobile number.'), 'changing the number needs the PIN (PM05)'); await pin('1234');
  await p.fill('#tel', '9761234208'); await p.click('#phone >> text=Send code'); assert(await P('text=Sent by SMS to +977 97•• ••• 208.'), 'code to the new number (PM07)');
  await p.fill('#code-in', '123456'); await p.waitForTimeout(150); assert(await P('text=Mobile number changed') && await P('text=+977 97•• ••• 208'), 'number changed (PM08)');
  await J('P07'); await p.click('#phone >> text=Someone else'); assert(await P('text=Add someone on this phone'), 'add someone (PM11)');
  await p.click('#phone >> text=Send code'); await p.fill('#code-in', '123456'); await p.waitForTimeout(150); assert(await P("text=Who's using the app?"), 'then the record chooser');
  await J('P01'); await p.click('.item-title:text-is("Help")'); assert(await P('text=How your records are kept private'), 'Help (PM12)');
  await p.click('#phone >> text=Terms of use'); assert(await P('.appbar >> text=Terms of use'), 'Help → Terms');
  // Ask: which visit, feedback, the PIN sheet, didn't catch that
  await J('AM02'); await p.click('#phone >> text=Aug 12 · Dr. Ramesh Shrestha'); await p.waitForTimeout(800); assert(await P('text=An ear infection'), 'each option leads to its answer (AM02)');
  assert(await P('text=Was this what you needed?'), 'feedback under the answer (AM06)'); await p.click('[data-act="ask-fb:no"]');
  assert(await P('text=Sorry about that. Try asking another way'), 'not what you needed (AM07)');
  await J('AM01'); await pin('9999'); assert(await P("text=That PIN didn't match"), 'wrong PIN in the sheet');
  await pin('1234'); assert(await P('text=Dr. Priya Sharma wrote') && !(await P('.sheet')), 'the right PIN opens the answer (AM01)');
  await J('A02'); await p.evaluate(() => { S.micPerm = 'granted'; }); await p.click('[aria-label="Ask by voice"]'); await p.click('[aria-label="Stop listening"]');
  assert(await P("text=I didn't catch that."), "stopping before anything was heard (AM05)");
  await J('A02'); await p.click('[aria-label="Ask by voice"]'); await p.click('[data-act="mic-deny"]'); assert(await P('text=Voice is off. You can still type.'), 'microphone refused (AM04)');
  // across the app
  await J('B01'); await p.check('[data-s="offline"]'); assert(await P("text=You're offline. Showing what was saved at 9:12 AM.") && !(await P('.banner')), 'offline line (GX01)');
  await p.click('.bnav >> text=Care'); assert(await P("text=You're offline."), 'Care offline (GX02)'); await p.uncheck('[data-s="offline"]');
  await p.click('.bnav >> text=Care'); assert(await P('text=Updating…'), 'tapping Care again refreshes (GX05)'); await p.waitForTimeout(1400); assert(!(await P('text=Updating…')), 'refresh ends');
  await J('GX06'); await p.click('#phone >> text=Try again'); assert(await P('.sk'), 'try again → loading (GX04)'); await p.waitForTimeout(1100); assert(await P('text=Good morning,'), 'content arrives');
  // ---- Section 3: other doctors; system prompts ----
  await J('B02'); await p.click('[data-act="doctor:aj"]'); assert(await P('text=Next slot Sun, Aug 30') && await P('text=Closed on Saturdays'), 'Dr. Joshi: next slot Sun, Aug 30 after the closed Saturday (OD14)');
  await p.click('.pick.day >> text=Sun'); await p.click('.pick.time >> text=9:00 AM'); await p.click('#phone >> text=Book Sun, Aug 30, 9:00 AM');
  assert(await P('text=Sun, Aug 30, 9:00 AM'), 'review with this doctor and time (OD15)'); await p.click('.pay-tile:has-text("Pay at reception")'); await p.waitForTimeout(450); await p.click('#phone >> text=Confirm booking');
  assert(await P('text=booked with Dr. Anita Joshi on Sun, Aug 30 at 9:00 AM'), 'confirmed (OD16)');
  await p.click('#phone >> text=Done'); assert(await P('text=Good morning,') && !(await P('text=Allow notifications')), "Done goes to Home, not the notifications prompt");
  await J('P06'); await p.click('#phone >> text=Call reception'); assert(await P('.as >> text=Call +977 1-4412345'), 'the phone asks before calling (SY1)');
  assert(await p.getAttribute('.as a.as-btn', 'href') === 'tel:+97714412345', 'the confirm really dials');
  await p.click('.as-cancel'); assert(!(await P('.as')), 'cancel closes it');
  await p.click('#phone a[href="tel:102"]'); assert(await P('.as >> text=Ambulance'), 'call 102 prompt (SY2)'); await p.click('.as-cancel');
  await J('C07'); await p.click('#phone >> text=Get directions'); assert(await P('.as >> text=OPD 2, City Hospital, Maharajgunj'), 'directions prompt (SY3)'); await p.click('.as-cancel');
  await J('P09'); await p.click('#phone >> text=Open phone settings'); assert(await P(".as >> text=Open your phone's settings for Clinica?"), 'phone settings prompt (SY4)'); await p.click('.as-cancel');
  await J('K06'); await p.click('#phone >> text=Open calendar'); assert(await P('.as >> text=Open your calendar at Fri, Sep 11?'), 'open calendar prompt (SY6)'); await p.click('.as-cancel');
  await J('H09'); const dl3 = p.waitForEvent('download'); await p.click('#phone >> text=Download report'); await dl3;
  assert(await P(".as >> text=Thyroid panel report.pdf") && await P(".as >> text=Saved to your phone's Files."), 'download prompt (SY5)');
  // ---- One prototype: two ways in, and the situations in Demo inputs ----
  assert(!(await p.$('#jump')), 'no screen list in the side panel');
  await J('B01'); await p.evaluate(() => { S.report = 'thyroid'; }); await p.click('#phone >> text=Lab report ready');
  assert(await p.evaluate(() => S.report) === 'hba1c', 'T03: Home "Lab report ready" opens the newest report');
  await p.evaluate(() => start('empty')); assert(await P('text=Nothing booked yet') && !(await P('text=Recent')) && !(await P('.bell .dot')), 'Empty: a new patient on Home');
  await p.click('.bnav >> text=Care'); assert(await P('text=No upcoming visits'), 'Empty: Care (C12)');
  await p.click('.bnav >> text=Health'); assert(await P('text=Nothing here yet'), 'Empty: Health (H11)');
  await p.click('.bnav >> text=Ask'); assert(await P('text=Nothing to look up yet'), 'Empty: Ask (A17)');
  await p.click('.bnav >> text=Home'); await p.click('[aria-label^="Notifications"]'); assert(await P('text=No notifications yet'), 'Empty: notifications (N02)');
  await p.click('[aria-label=Back]'); await p.click('.qa >> text=Book a visit'); await p.click('[data-act="doctor:ps"]'); await p.click('.pick.time >> text=5:00 PM');
  await p.click('#phone >> text=Book 5:00 PM today'); await p.click('.pay-tile:has-text("Pay at reception")'); await p.waitForTimeout(450); await p.click('#phone >> text=Confirm booking'); await p.click('#phone >> text=Done');
  await p.click('[data-act="not-now"]').catch(() => {}); assert(await P('text=Today, 5:00 PM'), 'Empty: the first booking fills Home');
  await p.evaluate(() => start('full')); await p.waitForTimeout(2200); assert(await P('text=Choose your language'), 'Full: starts at the splash');
  await p.evaluate(() => jumpTo('B01')); await p.click('[data-case=edge]');
  for (const [v, t] of [['slow', 'Taking longer than usual'], ['session', 'Send a code to'], ['update', 'Update Clinica to keep going'], ['maint', 'Clinica is down for maintenance'], ['lock', 'Your 4:30 PM visit is running late'], ['push', 'Paracetamol is almost out of stock']]) {
    await p.selectOption('#open-as', v); await p.click('#open-as + button'); assert(await P(`text=${t}`), `open the app as: ${v}`); }
  await p.selectOption('#open-as', 'signedin'); await p.click('#open-as + button'); await p.waitForTimeout(1900); assert(await P('.sk'), 'signed in: splash, then Home loads (20, GX04)'); await p.waitForTimeout(1100);
  await p.selectOption('[data-s="homeState"]', 'cancelled'); assert(await P('text=Book another time'), 'doctor cancelled today (B09)');
  await p.selectOption('[data-s="homeState"]', 'walkin'); assert(await P('text=Waiting for Dr. Anita Joshi'), 'walk-in (B10)'); await p.selectOption('[data-s="homeState"]', 'default');
  await p.selectOption('#notif-set', 'meds'); await p.click('[aria-label^="Notifications"]'); assert(await P('text=Time for your Metformin'), 'medicine alerts (MT07)');
  await p.selectOption('#notif-set', 'more'); assert(await P('text=City Hospital cancelled your visit'), 'more kinds of update (NM02)');
  await p.click('.bnav >> text=Care').catch(() => {}); await p.evaluate(() => jumpTo('C02'));
  await p.check('[data-s="cancelSoon"]'); await p.click('button:text-is("Cancel visit")'); assert(await P("text=It's soon, but cancelling still helps"), 'late cancel (SC07)'); await p.click('.csheet >> text=Keep my visit');
  await p.check('[data-s="rsNone"]'); await p.click('#phone >> text=Reschedule'); assert(await P('text=No other times this week'), 'no times left (SC04)');
  await p.evaluate(() => jumpTo('C01')); await p.check('[data-s="careErr"]'); assert(await P('text=Something went wrong'), 'Care fails to load (GX07)');
  await p.click('#phone >> text=Try again'); await p.waitForTimeout(1400); assert(await P('text=Coming up'), 'try again loads Care');
  // ---- Doctor app: one world with the patient app ----
  await p.evaluate(() => start('doctor')); assert(await P("text=For City Hospital's care team"), 'doctor sign-in (D01)');
  await p.fill('#d-id', 'CH-0231'); await p.fill('#d-pw', 'nope'); await p.click('#phone >> text=Sign in');
  assert(await P('text=Staff ID or password is incorrect. Try again.'), 'wrong password (D01b)');
  await p.fill('#d-pw', 'clinica'); await p.click('#phone >> text=Sign in');
  assert(await P('text=5 of 8 seen today') && await P("text=You're with Nabin Tamang now. Anisha Sharma is next."), "today's queue (D02)");
  await p.evaluate(() => switchPhone()); assert(await P("text=You're checked in"), "switching phones: Anisha's Home shows her checked in");
  await p.evaluate(() => switchPhone()); assert(await P('text=5 of 8 seen today'), 'and back to the queue, where it was');
  await p.click('[data-act="d-patient:sk"]'); assert(await P('text=Not arrived') && !(await P('text=Start visit')), 'not arrived: no Start visit (D03e)'); await p.click('[aria-label=Back]');
  await p.click('[data-act="d-patient:bt"]'); assert(await P('.tag >> text=Visit complete'), 'done (D03d)'); await p.click('[aria-label=Back]');
  await p.click('[data-act="d-patient:as"]'); await p.click('#phone >> text=View history'); assert(await P('text=Dr. Ramesh Shrestha · Ear infection'), 'visit history (D03b)'); await p.click('[aria-label=Back]');
  // Run 6 Y04: Nabin is still with the doctor, so starting Anisha's visit asks first and never completes him.
  await p.click('#phone >> text=Start visit'); { const t = await p.textContent('#phone .csheet');
    assert(t.includes('Nabin Tamang is still with you') && t.includes("Finish Nabin Tamang's visit first") && t.includes("Keep it open and start Anisha's") && await p.evaluate(() => S.drq.nt === 'with' && S.visitDay === 'checkedin'), 'Y04: starting a visit while Nabin is with the doctor asks first'); }
  await p.click('#phone .csheet .btn.primary'); assert(await P('.appbar >> text=Complete visit') && await P('text=Nabin Tamang') && await P('text=CH-1922'), "Y04: Finish Nabin's visit first opens his visit");
  await p.click('[aria-label=Back]'); assert(await P('text=5 of 8 seen today') && await P('.dq-t:has-text("Nabin Tamang") >> text=With doctor'), 'Y04: and nothing was completed');
  await p.click('[data-act="d-patient:as"]'); await p.click('#phone >> text=Start visit'); await p.click('#phone .csheet .btn:text-is("Keep it open and start Anisha\'s")');
  assert(await P("text=Doctor's note") && await P('text=No medicines yet.') && await p.inputValue('#d-note') === '' && (await p.getAttribute('#d-note', 'placeholder')).startsWith('Suggested: '), 'complete visit (D04): F04/F23 nothing pre-filled, the note is a suggestion');
  assert(await P('.radio-row:has-text("In 2 weeks · Fri, Sep 11")'), 'R24: the follow-up date shows while choosing');
  // F04/R24: add a medicine with its dose, edit it, add a duplicate, remove one
  await p.click('#phone >> text=Add another medicine'); await p.fill('#dm-name', 'Paracetamol'); await p.fill('#dm-strength', '500 mg'); await p.click('.radio-row:has-text("Tablet")');
  await p.fill('#dm-dose', '1 tablet'); await p.fill('#dm-qty', '10 tablets'); await p.click('.radio-row:has-text("Twice a day")'); await p.click('.radio-row:has-text("5 days")'); await p.click('#phone >> text=Save medicine');
  assert(await P('.dr-med >> text=1 tablet, twice a day') && await P('.dr-med >> text=10 tablets'), 'R24: a new medicine shows its dose and quantity');
  await p.click('[aria-label="Edit Paracetamol 500 mg"]'); assert(await P('.appbar >> text=Edit medicine') && await p.inputValue('#dm-dose') === '1 tablet', 'F04: Edit opens the medicine, filled in');
  await p.click('.radio-row:has-text("3 times a day")'); await p.click('#phone >> text=Save medicine');
  assert(await P('.dr-med >> text=1 tablet, 3 times a day') && (await p.$$('#phone .dr-med')).length === 1, 'F04: the edit replaces it, no second card');
  await p.fill('#d-note', 'A viral infection.'); await p.click('[aria-label=Back]'); assert(await P('text=5 of 8 seen today') && await P("text=You're with Nabin Tamang now.") && await P('.dq-t:has-text("Nabin Tamang") >> text=With doctor'), 'Back from the visit goes to the queue; Y04: Nabin is still with the doctor (was: 6 of 8, Nabin completed)');
  await p.click("#phone >> text=You're with Anisha Sharma now."); assert(await p.inputValue('#d-note') === 'A viral infection.' && await P('.dr-med >> text=1 tablet, 3 times a day') && await P('text=Draft kept'), 'F03/V21: the banner opens her visit; the phone draft was kept on Back, and says so');
  await p.click('#phone >> text=Add another medicine'); await p.fill('#dm-name', 'Paracetamol'); await p.fill('#dm-strength', '650 mg'); await p.click('.radio-row:has-text("Tablet")');
  await p.fill('#dm-dose', '1 tablet'); await p.click('.radio-row:has-text("Once a day")'); await p.click('.radio-row:has-text("3 days")'); await p.click('#phone >> text=Save medicine');
  await p.click('.radio-row:has-text("In 2 weeks")'); await p.click('.btn:text-is("Complete visit")');
  { const t = await p.textContent('#phone .csheet'); assert(t.includes('Complete this visit?') && t.includes('Same medicine twice') && t.includes('Paracetamol is listed more than once') && t.includes('Fri, Sep 11') && t.includes('10 tablets') && t.includes('“A viral infection.”'), 'F05/V17/R24: review sheet with doses, quantity, the follow-up date and a duplicate warning'); }
  await p.click('#phone .csheet >> text=Back to editing'); assert(!(await P('.csheet')) && await p.inputValue('#d-note') === 'A viral infection.' && (await p.$$('#phone .dr-med')).length === 2, 'Back to editing keeps everything');
  await p.click('[aria-label="Remove Paracetamol 650 mg"]'); assert((await p.$$('#phone .dr-med')).length === 1, 'F04: Remove takes a medicine off');
  await p.fill('#d-note', 'A viral infection. Rest and fluids. Come back if the fever lasts more than 3 days.'); await p.click('.radio-row:has-text("No follow-up")');
  await p.click('.btn:text-is("Complete visit")'); assert(!(await p.textContent('#phone .csheet')).includes('Same medicine twice'), 'no duplicate, no warning'); await p.click('#phone .csheet .btn.primary'); assert(await P('text=6 of 8 seen today') && await P('.dq-t:has-text("Anisha Sharma") >> text=Completed') && await P('.dq-t:has-text("Nabin Tamang") >> text=With doctor'), 'Anisha done; Y04: Nabin is not completed without his own visit (was: 7 of 8, Nabin completed)');
  await p.evaluate(() => switchPhone()); await p.evaluate(() => { S.screen = 'cday'; S.stack = ['care']; render(); });
  assert(await P('text=Visit complete') && await P('text=No follow-up needed'), "Anisha's Care follows the doctor: visit complete, no follow-up");
  await p.evaluate(() => { S.unlocked = true; S.visit = 'aug28'; S.screen = 'hvisit'; render(); });
  assert(await P('text=Rest and fluids.'), "the note she reads is the one the doctor wrote");
  await p.evaluate(() => switchPhone()); await p.click('.bnav >> text=Reports'); assert(await P('text=2 results are waiting on you'), 'reports (D05)');
  assert(await P('.bnav a:has-text("Reports") .nbadge >> text=2'), 'R30: Reports shows 2 waiting');
  await p.click('[data-act="d-report:cbc"]'); assert(await P('text=13.2 g/dL') && await P('text=Release to Anisha'), 'report detail (D06)');
  assert(await P('.dv-row:has-text("Haemoglobin") >> text=Range 12.0–15.5 g/dL') && await P('.dv-row:has-text("Haemoglobin") .dv-f >> text=Normal'), 'T10/W06: reference range beside each value, Normal against it');
  await p.click("#phone >> text=View Anisha's history"); assert(await P('.tag >> text=Other doctor') && !(await P('text=Your visit')), 'T25: history from the report, doctor wording');
  await p.click('#phone .list-item:has-text("Jul 3, 2026")'); assert(await P('.appbar >> text=Visit on Jul 3'), 'T25: a past visit opens'); await p.click('[aria-label=Back]'); await p.click('[aria-label=Back]');
  assert(await p.isDisabled('#phone .btn:text-is("Release to Anisha")') && !(await P('[role=radio][aria-checked="true"]')) && await p.inputValue('#d-comment') === '', 'W06/F23: no decision, empty comment, Release disabled');
  await p.click('.radio-row:has-text("I need to see them again")'); assert(await P('text=Release with follow-up request') && await p.inputValue('#d-comment') === '' && await p.getAttribute('#d-comment', 'placeholder') === 'Suggested: Please book a follow-up so we can discuss this.', 'flag follow-up (D06b): suggestion shown, not filled in');
  await p.click('#phone >> text=Release with follow-up request'); { const t = await p.textContent('#phone .csheet'); assert(t.includes('“Please book a follow-up so we can discuss this.”') && t.includes('asked to book a follow-up') && !t.includes('expect a call'), 'W05: follow-up sheet quotes the comment and says what she sees'); }
  await p.click('#phone .csheet .btn.primary'); assert(await P('text=1 result is waiting on you') && !(await P('[data-act="d-report:cbc"]')), 'released, off the list');
  assert(await P('[role=status] .toast >> text=CBC blood test released to Anisha Sharma.') && await P('.toast >> text=Undo'), 'F24/W07/V09: a toast names the patient, with Undo');
  assert(await P('text=Released today') && await P('.list-item.static:has-text("Anisha Sharma") >> text=Released by Dr. Priya Sharma at'), 'F24/T11: Released today, who and when');
  assert(await P('.bnav .nbadge >> text=1'), 'R30: the count drops');
  await p.click('.toast >> text=Undo'); assert(await P('.appbar >> text=Review report') && await P('[role=radio][aria-checked="true"]:has-text("I need to see them again")') && !(await P('.toast')), 'Undo reopens the report as it was');
  assert(await p.evaluate(() => S.drPending.includes('cbc') && !S.released.cbc && !S.notifs.some(n => n.go === 'hreport-cbc') && !S.drOut.length), 'Undo: pending again, nothing on her side');
  await p.click('#phone >> text=Release with follow-up request'); await p.click('#phone .csheet .btn.primary'); assert(await P('text=1 result is waiting on you') && await P('text=Released today'), 'released again');
  await p.click('[data-act="d-report:lipid"]'); assert(await p.isDisabled('#phone .btn:text-is("Release to Kabita")'), 'Kabita: Release waits for a decision');
  await p.click('.radio-row:has-text("I need to see them again")'); await p.click('.radio-row:has-text("Everything is normal")');
  assert((await p.getAttribute('#d-comment', 'placeholder')).includes('cholesterol') && await p.inputValue('#d-comment') === '', "F01/R01 (phone): after Anisha's release, Kabita's suggestion is her own");
  await p.click('#phone >> text=Release to Kabita'); { const t = await p.textContent('#phone .csheet'); assert(t.includes('“Your cholesterol levels are all within a healthy range. Keep up the good work.”') && !t.includes('blood count'), 'W05: release sheet quotes her comment'); }
  await p.click('#phone .csheet >> text=Release to Kabita'); assert(await P('text=Nothing waiting on you'), 'no reports pending (D05b)');
  await p.evaluate(() => switchPhone()); await p.evaluate(() => { S.screen = 'home'; S.stack = []; render(); }); await p.click('[aria-label^="Notifications"]');
  assert(await P('text=Your CBC blood test is ready — Dr. Sharma wants to see you') && await P('text=Your HbA1c blood test is ready'), 'W10: two lab notifications, each naming its test and Dr. Sharma');
  await p.click('#phone >> text=Your CBC blood test is ready'); await p.evaluate(() => { S.unlocked = true; S.screen = 'hreport'; S.stack = ['health', 'hlabs']; render(); });
  assert(await P('text=CBC blood test') && await P('text=Dr. Sharma asked to see you') && await P('text=Please book a follow-up so we can discuss this.'), "Anisha sees the released CBC, with the doctor's comment and the asked-to-see-you card");
  await p.evaluate(() => switchPhone()); await p.click('.bnav >> text=Profile'); assert(await P('text=NMC registration'), 'doctor profile (D07)');
  await p.click('#phone >> text=Notifications'); assert(await P('[role=switch]:has-text("Schedule changes")[aria-checked="false"]'), 'account settings (D07b)');
  await p.click('[role=switch]:has-text("Schedule changes")'); assert(await P('[role=switch]:has-text("Schedule changes")[aria-checked="true"]'), 'switch toggles');
  await p.fill('#d-pw1', 'short'); await p.click('#phone >> text=Save password'); assert(await P('text=Use at least 8 characters.'), 'password rules');
  await p.click('[aria-label=Back]'); await p.click('#phone >> text=Sign out'); await p.click('#phone .csheet .btn.primary'); assert(await P("text=For City Hospital's care team"), 'sign out');
  // ---- Doctor desktop: same day, third device ----
  await p.evaluate(() => start('desk')); assert(await p.evaluate(() => document.getElementById('phone').classList.contains('desk')), 'desktop stage (1440 × 900)');
  await p.fill('#d-id', 'CH-0231'); await p.fill('#d-pw', 'x'); await p.click('#phone >> text=Sign in'); assert(await P('text=Staff ID or password is incorrect'), 'desktop wrong password');
  await p.fill('#d-pw', 'clinica'); await p.click('#phone >> text=Sign in'); assert(await P('text=Select a patient') && await P('text=Aug 28 · 5 of 8 seen'), 'nothing pre-selected (K10)');
  await p.click('[data-act="k-sel:sk"]'); assert(await P('text=Scheduled visit') && await P('.k-hd >> text=Not arrived'), 'not arrived (K11e)');
  await p.click('[data-act="k-sel:bt"]'); assert(await P("text=Today's visit — complete"), 'visit complete (K11d)');
  await p.click('[data-act="k-sel:nt"]'); await p.click('#phone >> text=View history'); assert(await P('text=Dr. Priya Sharma · Follow-up'), "Nabin's own history (K12g)");
  await p.click('#phone >> text=Back to visit'); await p.click('[data-act="k-sel:as"]'); assert(await P('text=Start visit'), 'Anisha (K11)');
  await p.click('#phone >> text=Start visit'); assert(await P('.csheet >> text=Nabin Tamang is still with you') && !(await P("text=Doctor's note")), 'Y04: the desktop asks first too');
  await p.click('#phone .csheet .btn:text-is("Keep it open and start Anisha\'s")'); assert(await P("text=Doctor's note") && await P('.k-row.sel >> text=With doctor') && await P('.k-row:has-text("Nabin Tamang") >> text=With doctor'), 'completing inline (K11b); Y04: Nabin stays with the doctor');
  await p.click('.radio-row:has-text("In 2 weeks")'); await p.click('.k-hd >> text=Complete visit'); assert(await P('.csheet >> text=Complete this visit?'), 'F05: desktop review sheet'); await p.click('#phone .csheet .btn.primary');
  assert(await P("text=Today's visit — complete") && await P('text=Aug 28 · 6 of 8 seen'), 'completed: read-only, the count moves (Y04: was 7 of 8, with Nabin auto-completed)');
  await p.click('.k-ni >> text=Reports'); assert(await P('text=Select a report') && await P('text=2 are waiting on you'), 'reports, nothing selected (K20a)');
  await p.click('[data-act="k-rep:cbc"]'); await p.click('.radio-row:has-text("I need to see them again")'); assert(await P('text=Release with follow-up request'), 'flag follow-up (K20b)');
  assert(await P('.k-ni:has-text("Reports") .nbadge >> text=2'), 'R30: desktop Reports badge');
  assert(await P('.dv-row:has-text("Platelets") >> text=Range 150,000–400,000/µL'), 'T10: desktop reference ranges');
  await p.click('#phone >> text=Release with follow-up request'); await p.click('#phone .csheet .btn.primary'); assert(await P('text=1 is waiting on you'), 'released');
  assert(await P('.toast >> text=CBC blood test released to Anisha Sharma.') && await P('.k-row.static:has-text("Anisha Sharma") >> text=Released by Dr. Priya Sharma'), 'desktop toast and Released today');
  await p.click('.toast >> text=Undo'); assert(await P('text=2 are waiting on you') && await p.evaluate(() => S.kRep === 'cbc' && !S.released.cbc) && await P('text=Release with follow-up request'), 'desktop Undo: pending and open again');
  await p.click('#phone >> text=Release with follow-up request'); await p.click('#phone .csheet .btn.primary'); assert(await P('text=1 is waiting on you') && await p.evaluate(() => !!S.released.cbc), 'desktop re-release');
  await p.click('[data-act="k-rep:lipid"]'); await p.click("#phone >> text=View Kabita's history"); assert(await P('.k-row.sel:has-text("Kabita Gurung")') && await P('text=Back to visit'), 'T25: desktop history from the report');
  await p.click('.k-ni >> text=Reports');
  await p.click('[data-act="k-rep:lipid"]'); assert(await p.evaluate(() => S.drRep) === 'lipid' && await p.isDisabled('#phone .btn:text-is("Release to Kabita")'), 'F01/R01: k-rep opens Kabita as drRep, undecided');
  await p.click('.radio-row:has-text("I need to see them again")'); await p.click('.radio-row:has-text("Everything is normal")');
  assert((await p.getAttribute('#d-comment', 'placeholder')).includes('cholesterol'), "F01/R01 (desktop): toggling gives Kabita's own text, not Anisha's");
  await p.fill('#d-comment', 'Your cholesterol is fine.'); await p.click('.radio-row:has-text("I need to see them again")');
  assert(await P('.csheet >> text=Keep your comment?'), 'T15: changing the decision after editing asks first');
  await p.click('#phone .csheet >> text=Keep my comment'); assert(await p.inputValue('#d-comment') === 'Your cholesterol is fine.' && await P('text=Release with follow-up request'), 'T15: keep');
  await p.click('.radio-row:has-text("Everything is normal")'); await p.click('#phone .csheet >> text=Use the suggested text'); assert(await p.inputValue('#d-comment') === '' && await P('text=Release to Kabita'), 'T15: replace');
  await p.evaluate(() => showApp('doctor')); assert(await P('text=1 result is waiting on you') || await P('text=6 of 8 seen today'), "the doctor's phone shows the same day (Y04: was 7 of 8)");
  await p.evaluate(() => showApp('patient')); await p.evaluate(() => { S.screen = 'cday'; S.stack = ['care']; render(); });
  assert(await P('text=Visit complete') && await P('text=Follow-up in 2 weeks'), "Anisha's phone: visit complete, follow-up in 2 weeks advised");
  await p.evaluate(() => showApp('desk')); await p.click('.k-ni >> text=Profile'); assert(await P('text=NMC registration'), 'desktop profile (K30)');
  await p.click('#phone >> text=Change password'); assert(await P('text=Save password') && await P('text=Schedule changes'), 'account settings (K30b)');
  await p.click('.k-ni >> text=Profile'); await p.click('#phone >> text=Sign out'); await p.click('#phone .csheet .btn.primary'); assert(await P('.k-card'), 'desktop sign out → the card');
  // ---- Hospital staff web app: admin, front desk and HR, same day ----
  const signStaff = async (id, pw = 'clinica') => { await p.fill('#st-id', id); await p.fill('#st-pw', pw); await p.click('#phone >> text=Sign in'); };
  await p.evaluate(() => start('staff')); assert(await P('text=Hospital management — City Hospital'), 'staff sign-in (T00)');
  await signStaff('CH-ADM-04', 'nope'); assert(await P('text=Admin ID or password is incorrect. Try again.'), 'wrong password (T00b)');
  await signStaff('CH-ADM-04'); assert(await P('.st-stat:has-text("Reports awaiting review") >> text=7') && await P('.st-stat:has-text("Not yet arrived") >> text=4'), 'admin dashboard counts from the shared day (T01)');
  await p.click('#phone >> text=View all doctors'); assert(await P('text=8 on the roster · 6 on duty today'), 'doctors roster (T02)');
  await p.click('[data-act="st-menu:dept"]'); await p.click('[data-act="st-f:dept|Dermatology"]'); assert(await P('text=2 of 8 · filtered by department'), 'department filter (T02d)');
  await p.click('.st-ttl'); assert(!(await P('.st-dd')), 'a click outside closes the panel');
  await p.click('[data-act="st-f:dept|Dermatology"]').catch(() => {}); await p.click('.k-ni >> text=Departments'); await p.click('[data-act="st-dept:derm"]');
  assert(await P('text=Staff on leave') && await P('text=Dr. Maya Shrestha · OPD 5'), 'department detail (T03b)');
  await p.click('.k-ni >> text=Patients'); await p.click('[data-act="st-pat:as|0"]'); assert(await P('text=Dr. Ramesh Shrestha · Ear infection') && await P('text=Female · 32 · CH-2381'), "Anisha's record matches her apps (T05a)");
  await p.click('#phone >> a.k-link'); await p.click('[data-act="st-menu:date"]'); await p.click('[data-act="st-day:20"]'); await p.click('[data-act="st-day:28"]');
  assert(await P('text=20 of 33 · filtered by visited date'), 'date range filters by visit date (T05c)');
  await p.click('.k-ni >> text=Settings'); await p.click('#phone >> text=Add a doctor'); await p.click('#phone >> text=Add doctor'); assert(await P("text=Enter the doctor's full name."), 'add doctor needs a name');
  await p.fill('#sa-name', 'Kabita Shrestha'); await p.selectOption('#sa-spec', 'Cardiology'); await p.click('#phone >> text=Add doctor'); await p.click('.csheet >> text=Save without them');
  assert(await P('text=Dr. Kabita Shrestha has been added'), 'doctor added (T04a2)'); await p.click('#phone >> text=View in roster');
  assert(await P('text=9 on the roster') && await P('text=Dr. Kabita Shrestha'), 'the new doctor is on the roster');
  await p.click('.k-ni >> text=Settings'); await p.click('#phone >> text=Assign roles'); await p.click('[aria-label="Select Sabina Rai"]'); await p.click('[aria-label="Select Rajesh Koirala"]');
  assert(await P('text=2 selected'), 'bulk selection (T04b2)'); await p.click('[aria-label="Select Rajesh Koirala"]');
  await p.click('#phone >> text=Assign role to selected'); assert(await P('text=What Front desk can access'), 'role picker (T04c)');
  await p.click('[data-act="st-pick:hr"]'); assert(await P('text=Leave requests and approvals'), 'access follows the chosen role');
  await p.click('[data-act="st-pick:desk"]'); await p.click('#phone >> text=Save role'); assert(await P('text=Sabina Rai is now Front desk.'), 'role saved');
  await p.click('.k-me'); await p.click('.st-dd >> text=Sign out'); await p.click('.csheet button:has-text("Sign out")'); assert(await P('.k-card'), 'staff sign out');
  // Front desk
  await signStaff('CH-FD-12'); assert(await P('text=21 patients across the hospital') && await P('.k-row:has-text("Nabin Tamang") >> text=With doctor'), "front desk: today's arrivals follow the doctor's queue (R01)");
  await p.fill('#st-q', 'sunita'); assert(await P('text=5 results for “sunita”') && await P('.k-row:has-text("Sunita Thapa")') && await P('.k-row:has-text("Sunita Karki")'), 'search finds both Sunitas, and Dr. Sunita Rai\'s patients (R01c, F10/T19)');
  await p.click('[data-act="st-arr:sk"]'); await p.click('#phone >> text=Check in'); await p.click('.csheet .btn.primary'); assert(await P('text=Checked in at 4:52 PM'), 'checked in (R03)');
  assert(await p.evaluate(() => drStatus('sk')) === 'waiting', "Sunita is now Waiting in Dr. Sharma's queue");
  await p.click('#phone >> a.k-link'); await p.click('#phone >> text=Register a walk-in'); await p.fill('#wk-name', 'Sunita'); await p.fill('#wk-age', '30'); await p.click('.radio-row:has-text("Female")'); await p.fill('#wk-doc', 'Dr. Suman KC');
  await p.click('#phone >> text=Add to queue'); assert(await P("text=Dr. Suman KC isn't in today"), "can't add a walk-in for a doctor who's off");
  await p.fill('#wk-doc', 'priya'); await p.fill('#wk-reason', 'Sore throat'); await p.click('#phone >> text=Add to queue');
  assert(await P('text=Is this Sunita?') && await P('text=phone ending 8821'), 'name matches two records (R06)');
  await p.click('#phone >> text=None of these — register as new patient'); assert(await P('text=22 patients across the hospital'), 'walk-in added to arrivals');
  assert(await p.evaluate(() => drToday().some(k => DR_PATIENTS[k].name === 'Sunita' && drStatus(k) === 'waiting')), "and to Dr. Sharma's own queue");
  await p.click('#phone >> text=Register a walk-in'); await p.click('.radio-row:has-text("Follow-up visit")'); await p.fill('#wk-name', 'Kiran Basnet');
  assert(await P('text=Dr. Ramesh Shrestha · Chest infection'), 'follow-up shows recent visits (R05)');
  await p.click('.k-me'); await p.click('.st-dd >> text=Sign out'); await p.click('.csheet button:has-text("Sign out")');
  // HR
  await signStaff('CH-HR-03'); await p.click('.k-ni >> text=Staff'); assert(await P('text=15 people · 1 on leave'), 'HR staff directory, with the new doctor (HR01)');
  await p.click('[data-act="st-menu:role"]'); await p.click('[data-act="st-f:role|Nurse"]'); assert(await P('text=2 of 15 · filtered by role'), 'role filter (HR01b)');
  await p.click('[data-act="st-person:mt"]'); assert(await P('text=CH-STF-0231'), 'staff record (HR02)');
  await p.click('.k-ni >> text=Leave requests'); assert(await P('text=1 pending · 4 already approved'), 'leave requests (HR03)');
  await p.click('[data-act="st-req:pk"]'); await p.click('#phone .btn:has-text("Approve")'); await p.click('.csheet >> text=Approve request'); assert(await P('text=Approved by Anjali Basnet, today') && await P('text=Prasant has been notified'), 'approved, with the approver (HR05)');
  await p.click('#phone >> a.k-link'); assert(await P('text=No pending requests') && await P('text=History'), 'none pending, history kept (HR03b)');
  await p.click('.k-ni >> text=Attendance'); await p.click('[data-act="st-menu:sort"]'); await p.click('[data-act="st-sort:absent-desc"]');
  assert(await p.textContent('.st-rows .st-tr .nm') === 'SKDr. Suman KC', 'sorted by absences (HR08b)');
  await p.click('[data-act="st-att:ms"]'); assert(await P("text=Counts are working days in August 2026 only"), "Maya's attendance (HR09)");
  // ---- The Sep design round: IDs, tags, sign-out sheets, offline, history, follow-up date, payment ----
  const T = () => p.textContent('#phone'), has = async t => (await T()).includes(t);
  const tagCls = l => p.evaluate(l => [...document.querySelectorAll('#phone .tag')].filter(x => x.textContent.trim() === l).map(x => x.className).join('|'), l);
  await J('R01'); assert(await has('CH-2411') && await has('CH-2412') && await has('CH-1140'), 'arrivals show patient IDs: Rita CH-2411, Kabita CH-2412');
  await J('D02'); const q = await T();
  assert(['Completed', 'With doctor', 'Waiting', 'Not arrived'].every(x => q.includes(x)) && !/\bDone\b/.test(q), 'queue tags: Completed / With doctor / Waiting / Not arrived');
  assert(/error/.test(await tagCls('Not arrived')) && /warn/.test(await tagCls('Waiting')), 'Not arrived is red, Waiting is amber');
  assert(await p.evaluate(() => [...document.querySelectorAll('#phone button')].find(b => /^Status/.test(b.textContent.trim()))?.getBoundingClientRect().height) < 60, 'status filter chip, normal height');
  await J('K10'); assert(await has('With doctor') && !(await has('With you now')), 'desktop queue tags');
  await p.evaluate(() => { S.kSel = 'sk'; render(); }); assert(/error/.test(await tagCls('Not arrived')), 'Not arrived red in the desktop detail');
  await J('HR03c'); const lv = await T(); assert(['Pending', 'Approved', 'Denied'].every(x => lv.includes(x)), 'HR leave filter: Pending / Approved / Denied');
  for (const [id, body] of [['R10', "today's check-ins"], ['HR12', 'staff and leave requests'], ['T06', 'manage the hospital'], ['D07c', "today's queue"], ['K30c', "today's queue"]]) {
    await J(id); const txt = await p.textContent('.csheet');
    const b = await p.evaluate(() => { const b = document.querySelector('.csheet .btn.primary'); return b && { t: b.textContent.trim(), img: !!b.querySelector('img'), bg: getComputedStyle(b).backgroundColor }; });
    assert(txt.includes('Sign out of Clinica?') && txt.includes(body) && b?.t === 'Sign out' && b.img && b.bg === 'rgb(11, 98, 214)', `sign-out sheet ${id}: Brand button with a check, not red`);
  }
  assert(await p.evaluate(() => getComputedStyle(document.querySelector('.scrim')).backgroundColor) === 'rgba(0, 0, 0, 0.4)', 'sheet scrim is 40%, not black');
  await J('R09'); assert(await has('Kiran Basnet') && await has('Sunita Thapa'), 'reception Patients, one row per visit');
  await J('T05'); assert(await p.evaluate(() => [...document.querySelectorAll('#phone .st-tr')].some(r => r.textContent.includes('Prakash') && r.textContent.includes('Ramesh Shrestha'))), 'admin Patients: Prakash saw Dr. Ramesh Shrestha');
  await J('T04a3'); assert(await p.evaluate(() => [...document.querySelectorAll('#phone a.k-link')].some(e => e.textContent.trim() === 'Doctors')), 'Add doctor goes back to Doctors');
  await J('T03h'); assert(await has('Orthopaedics has been added'), 'department added');
  await J('K20e'); const fs = await p.textContent('.csheet'); assert(fs.includes('Release with a follow-up request?') && fs.includes('“Please book a follow-up so we can discuss this.”') && fs.includes('asked to book a follow-up') && !fs.includes('expect a call'), 'follow-up release asks first, quoting the comment (W05)');
  await J('D06d'); assert((await p.textContent('.csheet')).includes('Kabita Gurung (CH-2412)'), 'release sheet names the patient and ID');
  await J('D02e'); assert(await has("You're offline") && await has('5 of 8'), 'offline queue keeps the progress (D02e)');
  await J('K10c'); assert(await has("You're offline"), 'offline desktop queue (K10c)');
  assert(await p.evaluate(() => { showCases(); return [...document.querySelectorAll('#cases .pn-check')].some(l => l.textContent.includes('Offline')); }), "doctor's panel has the Offline toggle"); await p.click('[aria-label="Close edge cases"]');
  await J('D04e'); assert((await T()).split('This field is required.').length - 1 >= 5, 'add medicine: required fields');
  // Run 6 Y03: long-term medicines, and an End date that has to agree with the length
  await J('D04d'); assert(await P('.radio-row:has-text("3 months")') && await P('.radio-row:has-text("Ongoing")') && await P('.radio-row:has-text("14 days")'), 'Y03: longer lengths to choose from');
  await p.fill('#dm-name', 'Metformin'); await p.fill('#dm-strength', '500 mg'); await p.click('.radio-row:has-text("Tablet")'); await p.fill('#dm-dose', '1 tablet');
  await p.click('.radio-row:has-text("Twice a day")'); await p.click('.radio-row:has-text("7 days")'); await p.fill('#dm-end', '28 / 11 / 2026'); await p.click('#phone >> text=Save medicine');
  assert(await P('text=7 days from today ends Sep 4, not Nov 28. Change one so they agree.') && await P('.appbar >> text=Add another medicine'), 'Y03: a length that disagrees with the End date is not saved');
  await p.click('.radio-row:has-text("Ongoing")'); await p.click('#phone >> text=Save medicine'); assert(await P('text=Ongoing has no end date'), 'Y03: Ongoing with an End date asks too');
  await p.click('.radio-row:has-text("3 months")'); await p.click('#phone >> text=Save medicine');
  assert(await P('.dr-med:has-text("Metformin 500 mg") >> text=For 3 months, until Nov 28'), 'Y03: 3 months saved with its end date');
  await p.click('.btn:text-is("Complete visit")'); assert((await p.textContent('#phone .csheet')).includes('Metformin 500 mg — 1 tablet, twice a day · For 3 months, until Nov 28'), 'Y03: the review sheet shows the true length');
  await p.click('#phone .csheet >> text=Back to editing'); await p.click('#phone >> text=Add another medicine'); await p.fill('#dm-name', 'Amlodipine'); await p.fill('#dm-strength', '5 mg'); await p.click('.radio-row:has-text("Tablet")'); await p.fill('#dm-dose', '1 tablet');
  await p.click('.radio-row:has-text("Once a day")'); await p.fill('#dm-end', '28 / 09 / 2026'); await p.click('#phone >> text=Save medicine');
  assert(await P('.dr-med:has-text("Amlodipine 5 mg") >> text=For 1 month, until Sep 28'), 'Y03: an End date alone sets the length'); // the D04d preset's stack is shared too, so Back lands on the queue
  await J('K11j'); assert(!!(await p.$('.csheet.dr-medsheet')), 'desktop add medicine is a sheet');
  await J('D04f'); assert((await T()).includes('Paracetamol is listed more than once'), 'D04f: review sheet flags the duplicate');
  await J('K11k'); assert((await T()).includes('Complete this visit?') && (await T()).includes('Fri, Sep 11'), 'K11k: desktop review sheet');
  // T21: Reception says when a half-filled walk-in was kept
  await J('R01'); await p.click('#phone >> text=Register a walk-in'); assert(!(await has('Draft kept')), 'a fresh walk-in form has no cue');
  await p.fill('#wk-name', 'Half Filled'); await p.click('.k-ni >> nth=0'); await p.click('#phone >> text=Register a walk-in');
  assert(await has('Draft kept') && await p.inputValue('#wk-name') === 'Half Filled', 'T21: the kept walk-in says so');
  await J('K11'); assert(await has('CH-2381'), 'patient ID in the desktop visit header');
  await J('D03g'); assert(await has('RS') && !(await has('stay with the doctor who saw her')), "other doctor's visit: their avatar, no designer note");
  await J('D03f'); assert(await has("Doctor's note") && !(await has('Lipid panel')) && !(await has('Book follow-up')), 'own visit in full, nothing extra');
  await J('HR10'); assert(await has('12') && await has('On leave today'), 'HR dashboard');
  await J('HR09'); assert(await has('Nov 2022'), "Maya joined Nov 2022");
  await J('HR09b'); assert((await T()).toLowerCase().includes('leave'), 'attendance day popover');
  await J('A02'); assert(!(await has('Good afternoon')) && !(await p.evaluate(() => [...document.querySelectorAll('#phone .back-l')].some(a => a.textContent.includes('Home')))), 'Ask home: no greeting, no Home link');
  await J('A04'); assert(await p.evaluate(() => [...document.querySelectorAll('#phone .back-l')].some(a => a.textContent.includes('Home'))), 'a conversation keeps Home');
  await J('B04'); assert(await has('NPR 800, to pay at reception') && await p.getAttribute('.pay-tile:has-text("Pay at reception")', 'aria-checked') === 'true', 'B04: Pay at reception chosen explicitly');
  await J('B04b'); assert(await has('to pay with eSewa') && !(await has('paid with eSewa')), 'F09/W01: eSewa chosen, "to pay" until paid');
  // the desktop close keeps a draft
  await J('K11b'); await p.fill('#k-note', 'Draft note kept'); await p.click('#phone [aria-label^="Close"]'); assert(!(await p.$('#k-note')), 'X closes the visit');
  await p.click('#phone .k-row:has-text("Anisha Sharma")'); await p.click('#phone >> text=Start visit'); assert(await p.inputValue('#k-note') === 'Draft note kept', 'the draft note is still there');
  // follow-up on another date reaches the patient
  await J('D04c'); await p.click('#phone [aria-label^="Choose follow-up"]'); assert(!!(await p.$('.seg[data-act="cal:BS"]')), 'follow-up date opens the AD/BS wheels');
  await p.evaluate(() => { S.picker = null; S.drDraft.followDate = '18 / 09 / 2026'; render(); }); await p.click('.btn:text-is("Complete visit")');
  assert((await p.textContent('#phone .csheet')).includes('Fri, Sep 18'), 'the review shows the other date as a real date'); await p.click('#phone .csheet .btn.primary');
  await p.evaluate(() => switchPhone()); await p.evaluate(() => { S.screen = 'care'; S.stack = []; render(); }); await p.click('#phone .card >> text=Dr. Priya Sharma');
  assert(await has('Follow-up on Sep 18'), "the date shows on the patient's visit day");
  // HR adds staff
  await J('HR11'); const sel = await p.$$('#phone select'); await p.fill('#phone input >> nth=0', 'Test Person'); await p.fill('#phone input >> nth=1', '+977 9800000000'); await p.fill('#as-start', '2026-08-28');
  await sel[0].selectOption({ label: 'Nurse' }); await sel[1].selectOption({ index: 1 }); await p.click('#phone .btn:has-text("Add staff")');
  assert(await has('Test Person has been added'), 'staff added (HR11)'); await p.click('#phone >> text=Test Person >> nth=-1'); assert(await has('Added by'), 'the record says who added them');
  // ---- Phase 3: patient app ----
  const W = () => p.waitForTimeout(450); // R10: Confirm ignores taps for 400 ms after a screen change
  // Khalti + no reply → retry → booked once → hand-off → paid, with a receipt, in Profile › Payments
  await J('B04'); await p.click('.pay-tile:has-text("Khalti")'); assert(await has('NPR 800, to pay with Khalti'), 'F09/W01: Khalti chosen: "to pay with Khalti"');
  await p.evaluate(() => showCases()); await p.selectOption('[data-s="failNext"]', 'noreply'); await W(); await p.click('#phone >> text=Confirm booking');
  assert(await has('You have not been charged.') && await has('Trying again is safe'), 'W01/W14: no reply: not charged, retry is safe');
  await W(); await p.click('.cta >> text=Try again'); assert(await P("text=You're booked once") && await P('.as >> text=Pay with Khalti'), 'W14: booked once, then the Khalti hand-off');
  await p.click('.as a.as-btn'); await p.waitForTimeout(100);
  assert(await has('Receipt KHALTI-48213') && await P('.item-title:text-is("Paid")'), 'F09/T05/W02: Paid, with a receipt reference');
  await p.click('#phone >> text=Done').catch(() => {}); await p.click('[data-act="not-now"]').catch(() => {});
  assert(await has('Receipt KHALTI-48213'), 'W02: Home shows the paid wallet visit');
  await p.click('.bnav >> text=Profile'); await p.click('#phone >> text=Payments'); assert(await has('NPR 800 with Khalti · Receipt KHALTI-48213'), 'T05/W02: Payments list in Profile');
  // Fonepay + taken → not charged → another time → cancel the hand-off → Not paid → Pay now → paid
  await J('B04'); await p.click('.pay-tile:has-text("Fonepay")'); await p.selectOption('[data-s="failNext"]', 'taken'); await W(); await p.click('#phone >> text=Confirm booking');
  assert(await has('was just taken') && await has('to pay with Fonepay. You have not been charged.'), 'W01: slot taken: not charged');
  await p.click('#phone >> text=Choose another time'); await p.click('.pick.time >> text=5:30 PM'); await p.click('#phone >> text=Book 5:30 PM today'); await W(); await p.click('#phone >> text=Confirm booking');
  await p.click('.as-cancel'); assert(await P('.item-title:text-is("Not paid")') && await P('.card >> text=Pay now'), 'W02: a cancelled hand-off: Not paid · Pay now');
  await p.click('#phone .card >> text=Pay now'); assert(await P('.as >> text=Pay with Fonepay'), 'W02: Pay now reopens the hand-off');
  await p.click('.as a.as-btn'); await p.waitForTimeout(100); assert(await has('Receipt FONEPAY-48213'), 'W02: then paid');
  await J('B04'); await W(); await p.click('#phone >> text=Confirm booking'); await J('C07'); await p.evaluate(() => { S.appt.pay = { how: 'esewa', paid: false }; render(); });
  assert(await has('Not paid') && await P('.card >> text=Pay now'), 'W02: appointment details offer Pay now');
  await J('B04'); await p.click('.pay-tile:has-text("eSewa")'); await W(); await p.click('#phone >> text=Confirm booking'); assert(await P('.as >> text=Pay with eSewa'), 'eSewa hand-off');
  // R10: a double-tap on Book doesn't confirm
  await J('B03'); await p.evaluate(() => { S.payWith = 'reception'; }); await p.click('.pick.time >> text=4:30 PM');
  await p.click('#phone >> text=Book 4:30 PM today'); await p.click('#phone .cta .btn', { force: true }); assert(await P('.appbar >> text=Review booking'), 'R10: the second tap of a double-tap is ignored');
  await W(); await p.click('#phone >> text=Confirm booking'); assert(await P('text=Appointment booked'), 'R10: a deliberate tap confirms');
  // F25/R26: fast PIN taps across create → confirm
  await J('H01'); await p.click('[data-act="unlock-start"]'); await p.keyboard.type('12341234', { delay: 30 }); await p.waitForTimeout(500);
  assert(await P('text=Use your fingerprint next time?'), 'F25/R26: a digit tapped during the screen change is kept');
  // F02/R04/T04/V03: the card names the booked doctor
  await J('C01'); await p.evaluate(() => { S.appt = { doc: 'sk', day: 4, time: '10:30 AM' }; render(); });
  assert(await P('.card >> text=Dr. Suman KC') && !(await P('.card .h-s:text-is("Dr. Priya Sharma") >> nth=1')), 'F02/R04: Care card names Dr. Suman KC');
  await p.click('#phone .card >> text=Dr. Suman KC'); assert(await P('.card >> text=Dr. Suman KC') && !(await has('PSDr. Priya Sharma')), 'F02/T04: appointment detail names him too');
  // V14, R23/T14: today's visit shows the reason and the fee, and can be rescheduled
  await J('C07'); assert(await has('Fever for three days, with a headache') && await has('Pay at reception') && await P('.cta >> text=Reschedule'), "V14/R23: reason, payment and Reschedule on today's visit");
  await p.click('.cta >> text=Reschedule'); assert(await P('text=Choose a new day'), "R23: today's visit can be moved");
  // W11: follow-up from a report
  await J('HM03'); assert(await has('Aug 24'), 'HbA1c dated Aug 24, before the demo day'); await p.click('#phone >> text=Book follow-up');
  assert(await P('text=You already have a visit with Dr. Sharma'), 'W11: warns about the visit already booked');
  await p.click('.pick.time >> text=5:00 PM'); await p.click('#phone >> text=Book 5:00 PM today'); await p.click('.csheet .btn:text-is("Book a second visit")'); // Run 6 Y02: same day, so it asks
  assert(await P('.tag:text-is("Follow-up")') && (await p.inputValue('#reason')).includes('HbA1c blood test'), 'W11: tagged follow-up, reason from the report');
  // F22/R22/T22: a new number sees nobody else
  await J('06'); await p.fill('#tel', '9801112233'); await p.click('#phone >> text=Send code'); await p.fill('#code-in', '123456'); await p.waitForTimeout(150);
  assert(await P('text=Create your profile') && !(await has('Ramesh Sharma')), 'F22/R22: another number goes straight to Create profile');
  // R25/V16: year first, roomy Sex, pronouns
  assert(await has('Pronouns (optional)') && await has('Prefer not to say'), 'V16: optional pronouns with Prefer not to say');
  await p.click('[aria-label="Choose date of birth"]'); await p.waitForTimeout(200); assert(await p.evaluate(() => document.activeElement.id === 'w-y' && document.querySelector('.wheels .wheel #w-y') === document.querySelector('.wheels .wheel ul')), 'R25: the picker starts at the year');
  await p.keyboard.press('Escape');
  // W16: unlock returns to the report
  await J('H09'); await p.evaluate(() => { S.pin = '1234'; S.finger = 'off'; Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  assert(await P('text=Locked because you left Clinica'), 'locked on leaving'); await p.click('[data-act="unlock-start"]'); await pin('1234');
  assert(await P('text=What your doctor says') && await P('.appbar >> text=Thyroid panel'), 'W16: unlocking returns to the report');
  // W15: Profile reads her own choice
  await J('P01'); await p.evaluate(() => { S.notNow = 1; render(); }); assert(await has('Off. You chose Not now'), 'W15: Not now shows as Off');
  // F14/R11: Anisha opens her father's profile and his Health with her own PIN
  await J('P07'); await p.evaluate(() => { S.pin = '1234'; }); assert(await has('Managed by Anisha Sharma'), 'F14: Ramesh is managed by Anisha');
  await p.click('#phone >> text=Ramesh Sharma'); await pin('1234'); assert(await P('text=Good morning,') && await P('text=Ramesh'), "F14: her PIN switches to him");
  // Run 6 Y01: Ramesh's own Health has nothing to lock yet, so the caregiver PIN is checked on his locked Home instead (was: his Health).
  await p.click('.bnav >> text=Health'); assert(await P('text=Nothing here yet'), "Y01: Ramesh's Health is his own, empty");
  await p.click('.bnav >> text=Home'); await p.click('#phone >> text=Locked on this shared phone'); assert(await P("text=Or Anisha's own Clinica PIN"), 'F14/R11: the caregiver path is stated');
  await pin('1234'); assert(await P('text=Nothing booked yet') && !(await P('text=Locked on this shared phone')), "F14/R11: her PIN opens his Home");
  // V18, F15/R12
  await J('B03'); assert(!(await p.$('#phone img[src$="icon-more.svg"]')), 'V18: no dead "more" icon');
  await J('B04'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('text=बुकिङ जाँच्नुहोस्') && await P('text=बुकिङ पक्का गर्नुहोस्'), 'F15/R12: Nepali booking strings');
  // ---- Phase 4: Reception, HR, Admin ----
  await p.click('[aria-label="Close edge cases"]', { timeout: 1000 }).catch(() => {}); // the Phase 3 steps left the panel open
  await J('R01'); await p.fill('#st-q', '8821'); assert(await P('.k-row:has-text("Sunita Thapa") >> text=41 yrs · phone ending 8821'), 'F10/F11/R09: Sunita Thapa listed, found by the last 4 digits, age shown');
  assert((await p.textContent('.k-row:has-text("Sunita Thapa")')).includes('General medicine'), 'F21: department on each arrival');
  await p.fill('#st-q', 'CH-1187'); assert((await p.$$('.k-row')).length === 1, 'T19: search by CH- ID');
  await p.fill('#st-q', 'Ramesh'); assert(await p.evaluate(() => [...document.querySelectorAll('.k-row')].every(r => r.textContent.includes('Ramesh Shrestha'))), 'T19: search by doctor');
  await J('R02b'); const ck = await p.textContent('.csheet'); assert(ck.includes('Check in Sunita Thapa?') && ck.includes('8821') && ck.includes('Dr. Ramesh Shrestha'), 'F11/T19: check-in asks first, naming the patient');
  await J('R04b'); assert(await has('General medicine doctors on duty — choose one') && await has('Dr. Anita Joshi · OPD 3'), "W12: a department lists its doctors on duty");
  await p.fill('#wk-name', 'Kamal Thapa'); await p.fill('#wk-age', '45'); await p.click('.radio-row:has-text("Male")'); await p.click('#phone >> text=Add to queue');
  assert(await has('Choose one of the General medicine doctors below.'), 'W12: no silent pick');
  await p.click('.radio-row:has-text("Dr. Anita Joshi")'); await p.fill('#wk-note', 'Headaches'); await p.press('#wk-note', 'Enter'); await p.waitForTimeout(150);
  assert((await p.textContent('.toast-region')).includes("Kamal Thapa (CH-2508) added to Dr. Anita Joshi's queue") && await P('.k-row.sel:has-text("Kamal Thapa")'), 'F12/R14/T20/F26: Enter submits; toast with ID; row highlighted');
  await J('R04'); await p.fill('#wk-doc', 'fever'); assert(await has('“fever” usually goes to General medicine'), 'R15: symptom → department');
  await J('R07'); assert(await has('Matched to CH-1187') && await has('BP follow-up – headaches this week') && await has('Follow-up, hypertension review'), 'T09/V10: matched, both reasons kept');
  await J('HR04'); assert(await has("My sister's wedding") && await has('Cardiology will have no nurse') && await has('3 calendar days · 2 working days'), 'F16/T17 (Phase 6: Sun–Fri week, was 1 working day): reason, coverage from the staff list, calendar vs working days');
  await p.click('#phone .btn:has-text("Deny")'); await p.fill('#sl-why', 'No cover'); await p.click('.csheet >> text=Deny request');
  assert(await has('Denied by Anjali Basnet') && await has('Sent to Prasant: “No cover”'), 'W08: deny confirmed, reason sent, approver shown');
  await p.click('.toast-act'); assert(!(await has('Denied by')), 'W08/V11: Undo');
  await J('HR03'); assert(await has('Nurse · Cardiology · Annual leave'), 'W19: role · department on leave rows');
  await J('HR10'); assert(await P('.k-row .tag'), 'V13: status chips on the dashboard leave rows');
  await J('HR08'); assert((await p.$$('#phone .st-chips [data-act^="st-menu:"]')).length === 1, 'V13: one Sort control'); await p.fill('#st-q', 'maya'); assert(await has('August 2026 · 24 working days so far (Sun–Fri)'), 'V13: period kept while searching (Phase 6: Sun–Fri, was 20)');
  await J('HR09'); assert(!(await has('Non-requested')) && await has('Annual leave'), 'R17: one label; Aug 17–21 has a request');
  await p.click('[data-act="st-calday:18"]'); assert(await P('.att-pop a:has-text("Annual leave")'), 'F17: a leave day links to its request');
  await J('HR11'); await p.fill('#as-name', 'Kopila Rai'); await p.fill('#as-phone', '+977 9811111111'); await p.selectOption('#as-role', 'Nurse'); await p.selectOption('#as-dept', 'Cardiology'); await p.fill('#as-start', '2026-09-14');
  await p.click('#phone .btn:has-text("Add staff")'); assert(await P('.st-tr:has-text("Kopila Rai") >> text=Pending'), 'F18/R19/T13: Pending until the start date');
  await p.click('.st-tr:has-text("Kopila Rai")'); await p.click('#phone .btn:has-text("Edit")'); await p.fill('#as-grade', 'Level 4'); await p.click('#phone .btn:has-text("Save changes")'); assert(await has('Level 4'), 'R19: the record is editable');
  await J('T04a'); await p.fill('#sa-name', 'Nirmala Pandey'); await p.selectOption('#sa-spec', 'Cardiology'); await p.click('#phone .btn:has-text("Add doctor")');
  assert((await p.textContent('.csheet')).includes('Save without an OPD or working days?'), 'R06: warns before saving without OPD/days'); await p.click('.csheet >> text=Save without them');
  await p.click('#phone >> text=View in roster'); await p.click('.st-tr:has-text("Nirmala Pandey")'); assert(!(await has('nirmala.pandey@')) && !(await has('Sun–Thu')) && (await T()).split('Not set').length > 4, 'F06/T24: Not set, nothing invented');
  await J('T04c5'); assert(await has('Not included: prescriptions and releasing lab reports'), 'F08: Nurse access role');
  await J('T04c6'); assert((await p.textContent('.csheet')).includes('They lose:'), 'F19/T18: switch warns what is lost');
  await J('T04c'); await p.click('[data-act="st-lvok"]'); await p.fill('#sr-until', '2026-09-30'); await p.click('#phone >> text=Save role');
  assert((await p.textContent('.toast-region')).includes('Front desk + approves leave until Sep 30'), 'W04: leave add-on saved, toast');
  await p.click('.k-ni >> text=Settings'); assert(await has('Sabina Rai: Front desk → Front desk + approves leave until Sep 30'), 'R16/T18: audit log in Settings');
  await J('T01'); assert(await has('Waiting by department') && await has('Cardiology · heart') && await has('Reopens Sun, Aug 30, 9 AM'), 'F13/R21/T27/T23: waiting per department, closure flagged');
  await J('T03'); assert(await has('Dr. Maya Shrestha on leave'), 'R29: full doctor names');
  await J('HR01'); assert(await has('Job title'), 'W09: the Staff column is Job title');
  // ---- Phase 5: accessibility and the shell ----
  const foc = () => p.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + a.textContent.trim().slice(0, 40); });
  assert(await p.evaluate(() => document.querySelector('.shell > a.skip')?.getAttribute('href') === '#phone'), 'W18: a skip link to the app');
  assert(await p.evaluate(() => !document.querySelector('main.stage') && document.querySelectorAll('main, [role=main]').length === 1), 'A6: the stage is a div; one main landmark');
  await J('B01'); await p.click('.qa >> text=Book a visit'); assert(/^H1:Find doctor/.test(await foc()), 'W03/W13: phone — focus moves to the new screen\'s h1');
  assert(await p.evaluate(() => document.querySelectorAll('#phone h1').length) === 1, 'W13: one h1 per screen');
  await p.fill('#q', 'ramesh'); assert(/^H1:/.test(await foc()) === false && (await p.textContent('#phone .vh[aria-live]')).includes('1 doctor'), 'W18: typing keeps focus; the count is in a live region');
  await J('C01'); assert(await p.getAttribute('.bnav a:has-text("Care")', 'aria-current') === 'page', 'W18: aria-current on the bottom tabs');
  await J('H17'); const pin0 = await p.evaluate(() => document.querySelectorAll('#phone .pin-dots .dot.on').length); await p.click('.key:text-is("1")');
  assert((await p.textContent('#phone .vh[aria-live]')) === `${pin0 + 1} of 4 digits entered`, 'R26: PIN progress announced per digit');
  await J('HR01'); assert(await p.evaluate(() => { const t = document.querySelector('#phone [role=table]'); return !!t && t.querySelectorAll(':scope > [role=rowgroup]').length === 2 && t.querySelectorAll('[role=columnheader]').length === 5 && !!t.querySelector('[role=row] > [role=cell] a.st-nm'); }), 'A2/R28/V19: table, rowgroup, columnheader and cell roles; the name is a link');
  await p.focus('a.st-nm:has-text("Maya Tuladhar")'); await p.keyboard.press('Enter'); assert(/^H1:Maya Tuladhar/.test(await foc()), 'W03/R28: desktop — Enter on a row name opens it; focus on its h1');
  await J('T05'); await p.click('[data-act="st-nsort"]'); assert(await p.getAttribute('[role=columnheader]:has([data-act="st-nsort"])', 'aria-sort') === 'ascending', 'W18: aria-sort on the sorted column');
  await J('HR04'); await p.click('#phone .btn:has-text("Approve")');
  assert(await p.evaluate(() => document.querySelector('[aria-modal=true]').contains(document.activeElement) && !!document.querySelector('#phone .st-main').closest('[inert]')), 'V05: the page behind a sheet is inert; focus is in the sheet');
  await p.click('.csheet >> text=Go back'); assert(await p.evaluate(() => !document.querySelector('#phone [inert]')) && /Approve/.test(await foc()), 'V05: closing the sheet clears inert; focus returns to Approve');
  await J('R02'); await p.click('[data-act="st-checkin"]'); await p.click('[data-act="st-checkin-ok"]'); assert((await p.textContent('.toast-region')).includes('checked in'), 'W03: check-in announced by the shared toast');
  // ---- Phase 6 ----
  await J('D03b'); assert(await P('text=Lab results') && await P('text=HbA1c blood test') && await P('text=Thyroid panel'), 'T25: lab results in the doctor\'s history');
  await p.click('#phone [data-act="d-lab:hba1c"]'); assert(await P('text=What the patient was told') && await P('text=Reviewed by Dr. Priya Sharma on Aug 26'), 'T25: a result opens read-only');
  await J('D03b'); await p.click('#phone [data-act="d-lab:cbc"]'); assert(await P('text=Review report') && await P('text=Haemoglobin'), 'T25: a result waiting on her opens for review');
  await J('K11f'); await p.click('#phone [data-act="d-lab:thyroid"]'); assert(await P('text=Reviewed by Dr. Anita Joshi on Jul 5') && await P('text=Back to history'), 'T25: desktop opens it in the detail pane');
  await J('C07'); await p.evaluate(() => { S.appt.pay = { how: 'esewa', paid: true, ref: 'ESEWA-1' }; render(); }); await p.click('#phone .cta >> text=Cancel visit');
  assert((await p.textContent('.csheet')).includes("Cancel Anisha's visit today at 4:30 PM?") /* Run 6 Y10: names whose visit */ && (await p.textContent('.csheet')).includes('goes back to your eSewa wallet'), 'R13: cancel today, with the wallet refund said');
  await p.click('.csheet .btn.destructive'); assert(await P('text=Your Aug 28 visit is cancelled') && (await p.textContent('.toast-region')).includes('going back to your eSewa wallet'), 'R13: cancelled, toast');
  assert(await p.evaluate(() => !drToday().includes('as')), 'R13: she leaves the doctor\'s queue');
  await J('C09'); assert(!(await P('.cta >> text=Cancel visit')), 'R13: no in-app cancel once checked in');
  await J('B01'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('text=शुभ प्रभात,') && await P('.bnav >> text=गृहपृष्ठ') && await P('text=भेट बुक गर्नुहोस्'), 'F15/R12: Home in Nepali');
  await J('C01'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('h1:text("हेरचाह")'), 'F15/R12: Care in Nepali');
  await J('H01'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('text=तपाईंको स्वास्थ्य रेकर्ड लक छ'), 'F15/R12: Health lock in Nepali');
  await J('MT01'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('h1:text("औषधिहरू")'), 'F15/R12: Medicines in Nepali');
  await J('15'); await p.evaluate(() => { S.lang = 'ne'; S.picker = null; render(); }); assert(await P('text=आफ्नो प्रोफाइल बनाउनुहोस्') && await P('text=जन्म मिति'), 'F15/R12: Create profile in Nepali');
  await J('T02c'); await p.evaluate(() => { S.stId = 'sk'; render(); }); assert(await has('Not in today · works Sun–Thu · next in Sun, Aug 30'), 'T08: Not in today, with her days and the next one');
  await J('T03e'); assert(await has('OPDs running') && await P('#st-cover'), 'Cover: shown and changeable on a closed department (OPDs running restored)');
  await p.selectOption('#st-cover', 'Dr. Anita Joshi'); assert(await has('Cover: Dr. Anita Joshi'), 'Cover: changing it updates the notice');
  await J('HR11'); await p.fill('#as-name', 'Gita Shah'); await p.fill('#as-phone', '+977 9822222222'); await p.selectOption('#as-role', 'Nurse'); await p.selectOption('#as-dept', 'Cardiology'); await p.fill('#as-start', '2026-08-28');
  await p.click('#phone .btn:has-text("Add staff")'); assert(await P('.st-tr.hi:has-text("Gita Shah")'), 'F26: the new staff row is highlighted');
  const payDl = p.waitForEvent('download'); await J('HR01'); await p.click('#phone >> text=Export for payroll'); const csv = require('fs').readFileSync(await (await payDl).path(), 'utf8');
  assert(csv.startsWith('"Name","Employee ID","Job title","Department","Start date","Grade","Working days (Aug 2026)"') && csv.includes('"Maya Tuladhar"'), 'T13: payroll CSV downloads');
  await J('HR04'); await p.click('#phone .btn:has-text("Approve")'); await p.click('.csheet .btn:has-text("Approve")'); assert(!(await P('text=Reopen')), 'W08: Undo first, no Reopen yet');
  await p.evaluate(() => { S.toast = null; render(); }); await p.click('#phone >> text=Reopen'); assert(await P('.btn:has-text("Approve")') && await p.evaluate(() => S.stAudit[0].to === 'Pending (reopened)'), 'W08: Reopen returns it to Pending and logs it');
  await J('T01'); await p.evaluate(() => { S.stMe = 'tb'; S.screen = 'sdash'; render(); });
  assert(!(await P('text=View all doctors')) && (await p.$$('#phone .k-nav a, #phone .k-nav span')).length === 2, 'T23: trustee sees Dashboard and Departments only');
  await p.click('#phone .k-nav >> text=Departments'); assert(!(await P('text=Add department')), 'T23: no Add department');
  await p.click('#phone [data-act="st-dept:card"]'); assert(await has('Cover:') && !(await P('#st-cover')), 'T23: cover shown, not changeable');
  // ---- Phase 7 (Figma sync bugs) ----
  await J('NM03'); assert(await P('text=Friday, 28 August') && !(await P('text=Thursday')), 'Phase 7: lock screen weekday from TODAY (Friday)');
  assert(await P('text=Time for your medicine') && !(await p.textContent('#phone')).match(/Paracetamol|Metformin/), 'Phase 7: lock screen medicine alert names no medicine');
  await p.click('#phone >> text=Time for your medicine'); assert(await P('text=Your health records are locked'), 'Phase 7: it opens through the Health lock');
  await J('MT07'); assert(await P('text=Time for your Metformin'), 'Phase 7: the in-app centre may name the medicine');
  await J('B04b'); assert(await p.evaluate(() => { const i = document.querySelector('.pay-mark.reception'); return !!i && getComputedStyle(i).backgroundColor !== getComputedStyle(i.closest('.pay-tile')).backgroundColor; }), 'Phase 7: Pay at reception icon sits on a tile, not white on white');
  await J('SY7'); assert(await P('.card >> text=Not paid') && await P('text=NPR 800 with eSewa. Your visit is still booked.') && !(await P('.card >> text=Pay at reception')), 'Phase 7: SY7 shows an eSewa booking behind the prompt');
  await J('R09'); assert(!(await P('text=Previous')) && !(await P('.st-pg')), 'Phase 7: no pager on a one-page table (R09)');
  await J('SB03'); assert((await p.textContent('#note')).startsWith('SB03'), 'Phase 7: SB03 shows its own panel entry, not B05');
  await J('D02'); assert((await p.textContent('#note')).startsWith('D02'), "Phase 7: D02 Today's queue is reachable");
  const NE = async (n, ...t) => { await J(n); await p.evaluate(() => { S.lang = 'ne'; render(); }); for (const x of t) if (!(await P(`text=${x}`))) return x; return ''; };
  assert(!(await NE('B06', 'सूचना अनुमति दिनुहोस्', 'अहिले होइन', 'आज, दिउँसो 4:30', 'यो बन्द गरे पनि हामी SMS बाट खबर पठाइरहन्छौं।')), 'Phase 7: B06 in Nepali');
  assert(!(await NE('B03', 'आज दिउँसो 4:30 मा बुक गर्नुहोस्', 'रिसेप्सनमा, वा eSewa, Khalti वा Fonepay बाट तिर्नुहोस्।')), 'Phase 7: Book button and fee line in Nepali');
  assert(!(await NE('B05', 'रिसेप्सनमा तिर्ने', 'सकियो')), 'Phase 7: Pay at reception and Done in Nepali');
  assert(!(await NE('B10', 'तपाईं चेक इन हुनुभयो', 'तपाईंको भेट', 'कहाँ')), "Phase 7: walk-in card in Nepali");
  assert(!(await NE('H06', 'फार्मासिस्टलाई देखाउनुहोस्')) && !(await NE('H07', 'सकियो')) && !(await NE('H09', 'रिपोर्ट डाउनलोड गर्नुहोस्')), 'Phase 7: Health actions in Nepali');
  assert(!(await NE('H15', 'बरु PIN प्रयोग गर्नुहोस्', 'औंठाछाप सेन्सर छुनुहोस्')) && !(await NE('H17', 'PIN बिर्सनुभयो?')), 'Phase 7: fingerprint sheet and PIN screen in Nepali');
  assert(!(await NE('B07', 'क्लिनिकमा फोन गर्नुहोस्')) && !(await NE('H01', 'Clinica PIN ले अनलक नगरेसम्म')), 'Phase 7: Call the clinic and the Health lock body in Nepali');
  // ---- Phase 8: Nepali everywhere in the patient app, the lab trend, the sample privacy policy ----
  assert(!(await NE('B05', 'तपाईं Dr. Priya Sharma सँग आज दिउँसो 4:30 मा बुक हुनुभयो।', '15 मिनेट अगाडि आइपुग्नुहोस् र रिसेप्सनमा चेक इन गर्नुहोस्।')), 'Phase 8: Confirmed in Nepali (booked line, arrive early)');
  assert(!(await NE('B10', 'Dr. Anita Joshi लाई पर्खँदै', 'NPR 800, रिसेप्सनमा तिरिएको')), 'Phase 8: B10 waiting and paid line in Nepali');
  assert(!(await NE('C02', '15 मिनेट अगाडि आइपुगेर रिसेप्सनमा चेक इन गर्नुहोस्। अहिले खाइरहेका औषधिहरू लिएर आउनुहोस्।', 'शुक्र, सेप्टेम्बर 11, बिहान 10:30')), 'Phase 8: appointment detail and dates in Nepali');
  assert(!(await NE('SC04', 'अर्को हप्ताबारे सोध्न क्लिनिकमा फोन गर्नुहोस्।')), 'Phase 8: Care sentence in Nepali');
  assert(!(await NE('SH02', 'Dr. Sharma ढिला हुनुहुन्छ')) && !(await NE('07', '0:42 पछि नयाँ कोड पठाउन सकिन्छ')), 'Phase 8: running late and resend timer in Nepali');
  assert(!(await NE('GX08', 'जारी राख्न Clinica अपडेट गर्नुहोस्', 'अपडेट गर्नुहोस्')) && !(await NE('NM01', '10 मिनेटअघि')), 'Phase 8: update screen and notification centre in Nepali');
  assert(!(await NE('A06', 'Dr. Priya Sharma ले लेख्नुभयो', 'भाइरल संक्रमण।', 'दिनको 3 पटक 1 ट्याब्लेट, खाना खाएपछि')), "Phase 8: Ask's answer and the doctor's canned words in Nepali");
  assert(!(await NE('HM03', 'अगस्ट 24, सिटी हस्पिटल ल्याब', 'तपाईंको रगतमा चिनीको मात्रा हुनुपर्नेभन्दा बढी छ।')), 'Phase 8: report explanation in Nepali');
  await J('H08'); assert(await P('text=June 2026') && await P('text=Jun 20, City Hospital lab'), 'Phase 8: the earlier HbA1c is in the reports list');
  await J('HM03'); assert(await P('text=Over time') && await P('text=6.1% → 7.2% ↑') && await P('text=Jun 20 → Aug 24 · Higher in the latest test') && await p.$eval('#phone svg[aria-hidden=true] polyline', e => !!e), 'Phase 8: patient report shows the trend in words, with a decorative line');
  await J('H09b'); assert(await P('text=6.1% → 7.2% ↑') && (await p.textContent('#note')).startsWith('H09b'), 'Phase 8: H09b trend frame');
  assert(!(await NE('HM03', 'समयसँगै', 'जुन 20 → अगस्ट 24 · पछिल्लो जाँचमा बढी')), 'Phase 8: trend in Nepali');
  await J('K11f'); assert(await P('text=6.1% → 7.2%, Jun 20 → Aug 24'), 'Phase 8: trend in the desk history lab list');
  await p.click('#phone [data-act="d-lab:hba1c"]'); assert(await P('text=Over time') && await P('text=Jun 20 → Aug 24 · Higher in the latest test') && await P('text=7.2%'), 'Phase 8: trend on the desk lab view');
  await J('25'); assert(await P('text=Sample policy for this prototype, not legal advice; to be reviewed by the hospital\'s legal team before release.'), 'Phase 8: privacy policy marked as a sample');
  for (const h of ['What we collect', 'Why we use it', 'Who sees it', 'Your Health PIN', 'Text messages (SMS)', 'Paying with a wallet', 'How long we keep it', 'Your rights', 'Contact', 'Changes']) if (!(await P(`h3:text("${h}")`))) throw new Error('FAIL: policy section ' + h);
  assert(await P('text=Delete: Profile › Close account deletes your app account, sign-in and PIN.'), 'Phase 8: policy covers every section, deletion via Close account');
  assert(!(await NE('25', 'नमुना नीति', 'तपाईंका अधिकार', 'वालेटबाट भुक्तानी')), 'Phase 8: privacy policy in Nepali');
  await J('K11f'); await p.evaluate(() => { S.lang = 'ne'; render(); }); assert(await P('text=Lab results') && await P('text=Back to visit') && !(await P('text=पछाडि')), 'Phase 8: staff apps stay English with Nepali chosen');
  const neThrows = await p.evaluate(async () => { const bad = []; // frameIds/jumpTo are on window, so this also runs against the built app (CI)
    for (const id of frameIds()) { try { jumpTo(id); if (S.app && S.app !== 'patient') continue; S.lang = 'ne'; render(); } catch (e) { bad.push(id + ': ' + e.message); } } return bad; });
  assert(!neThrows.length, `Phase 8: every patient frame renders in Nepali (${neThrows.join('; ')})`);
  // Run 6 Y05: a real reload keeps what was saved — a role change and its audit entry, a check-in, a walk-in — and locks Health again.
  await J('T04c'); await p.click('[data-act="st-lvok"]'); await p.click('#phone >> text=Save role'); assert(await has('Sabina Rai is now Front desk + approves leave'), 'Y05: a role change');
  await p.click('[data-tab="reception"]'); await p.click('[data-act="st-arr:sk"]'); await p.click('#phone >> text=Check in'); await p.click('.csheet .btn.primary'); assert(await P('text=Checked in at'), 'Y05: a check-in');
  await p.click('#phone >> a.k-link'); await p.click('#phone >> text=Register a walk-in'); await p.fill('#wk-name', 'Gita Basnet'); await p.fill('#wk-age', '40'); await p.click('.radio-row:has-text("Female")');
  await p.fill('#wk-doc', 'priya'); await p.fill('#wk-reason', 'Fever'); await p.click('#phone >> text=Add to queue'); assert(await P('text=22 patients across the hospital') && await P('.k-row:has-text("Gita Basnet")'), 'Y05: a walk-in');
  await p.click('[data-tab="patient"]'); await p.click('.bnav >> text=Health'); await p.click('button.btn:text-is("Unlock")'); await pin('1234'); await pin('1234'); await p.click('#phone >> text=Just use my PIN');
  assert(await P('text=Taking now'), 'Y05: Health unlocked before the reload');
  await p.reload(); await p.waitForTimeout(600);
  assert(await P('text=Your health records are locked') && !(await P('text=Taking now')) && !(await p.textContent('.toast-region')), 'Y05: after a reload Health is locked again, and no toast is replayed');
  await p.click('button.btn:text-is("Unlock")'); assert(await P('text=Enter your PIN'), 'Y05: her PIN was kept, so unlocking asks for it'); await pin('1234'); assert(await P('text=Taking now'), 'Y05: and opens Health');
  await p.click('[data-tab="reception"]'); assert(await P('text=22 patients across the hospital') && await P('.k-row:has-text("Gita Basnet")') && await p.evaluate(() => drStatus('sk')) === 'waiting', 'Y05: the walk-in and the check-in survive the reload');
  await p.click('[data-tab="admin"]'); await p.click('.k-ni >> text=Settings'); assert(await has('Sabina Rai: Front desk → Front desk + approves leave'), 'Y05: the role change and its audit entry survive the reload');
  console.log('page errors:', errs);
  if (errs.length) process.exitCode = 1; // CI: a page error fails the run
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
