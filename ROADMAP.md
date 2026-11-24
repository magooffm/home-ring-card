# Roadmap

Ideas for Home Ring, roughly in the order they build on each other. Nothing here is promised.

## Done in 1.5.0

- Customise on screen (the gear): hide, rename, move a thing to another kind, leave a light out of room switching.
- One setup for every screen, per account, or per screen.
- Groups: rooms of your own, holding things from any real rooms.
- My view / Everything switch.

## Done in 1.6.0

- Places: give each kind (and each system in By system) a fixed spot on the ring, in every room.
- Colours for kinds, floors, rooms, groups and single things.
- Look: Dark, Light, or follow Home Assistant's theme, per screen or per person like the rest of the setup.
- After a Home Assistant restart, an open screen no longer treats an unread setup as an empty one, and never saves over it.
- The setup keeps fields it does not know, so an older card can no longer strip what a newer one saved.

## Done in 1.7.0

- A bar above the ring: pick the kinds to show (one kind drops the kind ring entirely), By room / By system, Lock layout.
- Two rings at a time by default, set per screen.
- Sensors and Other left out of All unless picked.

## Done in 1.7.1

- Ring only (the new default): no corners or panel, the ring has the whole card. Tap a light, switch, fan, speaker or blind to switch it; tap anything else or hold any thing for Home Assistant's own dialog. The panel shows only while customising. `layout: full` or Customise brings corners and panel back, per screen.

## Done in 1.7.2

- Choose what floor and room labels say: temperature, readings such as humidity or CO₂, and how many of each kind are on. One shared choice per level, and an own choice for any floor or room.

## Done in 1.7.3

- Slide on a room's Lights to dim its lights together, without going in. Choose in Customise which lights join in; a hold switches the same ones.

## Ideas

### Positions, continued

- Move single rooms and floors left or right, and make them bigger or smaller (kinds already have places).
- A finer dial (12 or 16 spots), or dragging a slice round the ring.

### Colours, continued

- How a custom room colour combines with the temperature tint: today the tint wins when the room is warm or cold.
- Accent colour for the panel and buttons.

### PIN pad

- **Alarm:** a keypad on the ring for arming and disarming. The code is passed to Home Assistant, which checks it, so this is as safe as Home Assistant's own keypad.
- **Locks:** the same for locks that take a code to open.
- **Locking things away:** mark any thing, room or group as "needs the PIN". Tapping it asks for a 4-digit code before its card opens or it can be switched.
  - This is a guard against curious hands on a wall tablet, not real security: the card runs in the browser, and anyone who can reach another dashboard or Home Assistant's own controls can get round it. The README must say so.
  - The PIN is stored hashed in the setup, never in plain text. Changing it needs an admin or the old PIN.
  - Decide how long an unlock lasts (one action, or a minute or two).

### Home Assistant's own cards in the panel

- With `layout: full`, show real dashboard cards (tile, thermostat, media) in the side panel in place of the hand-built ones, with a card definition per kind, including installed custom cards.
- Embedded cards follow the Home Assistant theme, so this goes with the Look setting.
- Check on a real Home Assistant first: the helper for creating other cards is widely used but not a guaranteed interface.

### Custom views

- Views of your own beside By room and By system, for example "Downstairs evening" or "Kids".
- Each picks kinds, rooms, groups or Home Assistant labels, and can be reordered or hidden.
- Needs the built-in systems table turned into data.

### Smaller things

- Full name of a cut-off slice on hover or touch, shown in the centre.
- "+5 more" slice for rooms with many tiny slices.
- Search: type a name and the ring jumps there.

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
