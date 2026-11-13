# Roadmap

Ideas for Home Ring, roughly in the order they build on each other. Nothing here is promised.

## Done in 1.5.0

- Customise on screen (the gear): hide, rename, move a thing to another kind, leave a light out of room switching.
- One setup for every screen, per account, or per screen.
- Groups: rooms of your own, holding things from any real rooms.
- My view / Everything switch.

## Ideas

### Choose a position on the wheel

- Move a floor, room or thing left or right, and make it bigger or smaller, from its Customise card.
- Pin a room to a fixed place, for example "Kitchen always at the top".
- Builds on the layout lock, which already stores the order and size of everything. Start with buttons; dragging on a ring is fiddly and can come later.

### Colours

- A colour per kind (Lights, Heating, …), replacing the built-in ones.
- A colour per floor, room or group.
- A fully custom colour for a single thing.
- A colour picker in the Customise card, with a "put back" button. Stored in the setup, so it follows the per-screen and per-account choice.
- Open question: how a custom room colour combines with the temperature tint.

### PIN pad

- **Alarm:** a keypad on the ring for arming and disarming. The code is passed to Home Assistant, which checks it, so this is as safe as Home Assistant's own keypad.
- **Locks:** the same for locks that take a code to open.
- **Locking things away:** mark any thing, room or group as "needs the PIN". Tapping it asks for a 4-digit code before its card opens or it can be switched.
  - This is a guard against curious hands on a wall tablet, not real security: the card runs in the browser, and anyone who can reach another dashboard or Home Assistant's own controls can get round it. The README must say so.
  - The PIN is stored hashed in the setup, never in plain text. Changing it needs an admin or the old PIN.
  - Decide how long an unlock lasts (one action, or a minute or two).

### Custom views

- Views of your own beside By room and By system, for example "Downstairs evening" or "Kids".
- Each picks kinds, rooms, groups or Home Assistant labels, and can be reordered or hidden.
- Needs the built-in systems table turned into data.

### Smaller things

- Hide scenes on screen (today that needs `scenes:` or `exclude` in YAML).
- An "Unassigned" segment in the Everything view for things with no room in Home Assistant.
- A visual card editor for the YAML options (cameras, alarm, heating, energy).
- A live demo page again ("Try it without Home Assistant"). The demo in `demo/index.html` still works when opened from disk; rebuild it with `node demo/build.mjs`.
- A new screenshot for `images/customise.jpg`, which still shows the old Customise button.

### Technical overhaul

The card is one hand-written file of about 2,000 lines with no build step and no tests. That was fine at 1,600 lines and is getting tight.

- **Split into modules** (model, drawing, gestures, cards, Customise, storage) with a small build step that still produces the single `dist/home-ring-card.js` HACS needs.
- **Tests:**
  - Unit tests for the parts with no screen: building the tree, the setup (hide, rename, groups), the layout lock.
  - A browser smoke test that drives the demo page through the main flows.
  - Run both in the GitHub workflow next to the HACS check.
- **One store for saved data.** The layout lock and the old corners store use an older mechanism than the Customise setup; fold them into one.
- **Texts in one place**, so the card can be translated.
- **Check on a real Home Assistant** that per-account saving works on the versions the card supports, and note the minimum version for it.
- **Version and changelog:** tag releases so HACS can offer versions instead of the latest commit.
