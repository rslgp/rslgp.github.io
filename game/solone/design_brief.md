# SOLONE — Visual Design Brief
**For:** UI/UX Designer & VFX Artist  
**Game:** SOLONE — *Survive alone. How long can you last?*  
**Engine:** Defold (Lua) · Canvas: **640 × 1136 px** · Target: Mobile + HTML5  
**Tone:** Minimalist arcade with maximum juice. Every moment of play should feel crisp, readable, and satisfying to both the player and a spectator watching the screen.

---

## 1. Design Philosophy

SOLONE is intentionally minimal in structure but rich in feedback. The entire game is dots on a black field. That constraint is a feature — every piece of art must earn its place by communicating game state, not by decorating. The design goal is **juiciness**: every kill, every hit absorbed, every powerup collected must feel unmissably good through layered simultaneous feedback (scale + color + light).

**Core visual contract:**
- The player always knows their powerup state from their sprite color alone.
- Every enemy death is a small celebration.
- Every dangerous moment has a visual warning that fires before the danger lands.
- Spectators watching the screen should be able to follow what is happening without playing.

---

## 2. Color Palette & Identity

All art lives on a **near-black background** (`#0d0d0d` or `#000`). Sprites use saturated hues with no gradients at rest — gradients are reserved for glow and flash effects.

| Token | Hex | Used for |
|---|---|---|
| `bg` | `#0d0d0d` | Background, always |
| `white` | `#ffffff` | Default player, default enemy base, UI text |
| `orange` | `#ff8c1a` | Flame powerup, cascade, expiry pulse |
| `yellow` | `#ffff1a` | Turret powerup, tackle glow |
| `green` | `#1aff1a` | Berserker powerup |
| `teal` | `#27cfc3` | Ice powerup |
| `cyan` | `#4de6ff` | Bullet-time, laser |
| `gold` | `#f5d51a` | Wild West, ironman, milestone celebration |
| `blue-ghost` | `#b3b3ff` at 25% alpha | Ghost powerup pulse |
| `grey-desaturated` | `#8c8c8c` | Sniper active, fleeing enemies |
| `slow-blue` | `#9999ff` | Slowed/iced enemy tint |
| `danger-red` | `#ff3333` | Future use: damage flash |
| `ui-panel` | `#1a1a2e` | Panel backgrounds |
| `ui-button-off` | `#4d4d4d` | Disabled/inactive button fill |
| `ui-button-on` | `#267a40` | Active/selected button fill |

---

## 3. Sprites — What Exists & What Needs Replacing or Creating

> All sprites are currently simple geometric shapes (generated with ImageMagick or engine primitives). The designer should replace or upgrade each entry marked **[UPGRADE]** and create all entries marked **[NEW]**.

### 3.1 Player

The player is the character the user controls. Single circular sprite, ~40 px diameter at 1× scale. It scales up to 2.3× (berserker) and squashes/bounces constantly in response to game events.

| State | Current | Desired |
|---|---|---|
| Default | White circle | **[UPGRADE]** — clean glowing white circle with subtle inner core; slight bloom halo |
| Berserker (rage) | Green tint | The tint is applied by code; sprite just needs to look good when green-tinted |
| Ghost | Semi-transparent blue pulse | Sprite base should have a soft edge so semi-transparency reads as ethereal, not broken |
| Protected hit | Scale squash, no sprite change | **[NEW]** — hit-ring sprite: a white ring that expands outward from player center and fades (used on hit-absorbed events) |
| Death | Gray tint, scale reset | **[NEW]** — death burst: 6–8 white line-fragments flying outward radially, 200ms, fade out |

**Key animation moments** (handled in code, but VFX sprites can enhance):
- Powerup pickup: `1.0 → 1.2 → 1.0` scale in ~150ms
- Berserker entrance: scale overshoots to 2.3× with spring bounce
- Protected hit: squash to 82%, spring back
- Death: gray tint + any death-burst particle layer

---

### 3.2 Enemies

Enemies are circular sprites (~32 px diameter), factory-spawned. Each has a strategy label painted on top (2-char abbreviation: CS, PR, FL, etc.). There is no persistent team color — code applies random base tints and override tints based on state.

| Sprite | Current | Desired |
|---|---|---|
| Base enemy body | Colored circle | **[UPGRADE]** — cleaner circle with a thin ring outline; the inner fill takes the code tint, the ring stays white at 60% opacity |
| Strategy label | Engine text label on GO | Keep as text, but designer should specify font: **monospace bold, 8–10px, white, centered** |
| Tackle charge | Gold tint applied by code | **[NEW]** — brief gold ring pulse emanating from the enemy as it charges |
| Slow/ice state | Blue tint applied by code | **[NEW]** — ice crystal overlay: 3–4 tiny diamond/shard shapes around the enemy circle at 40% opacity, static |
| Death | [CURRENT] Scale-out + fade | **[UPGRADE]** — add a brief circular color burst (enemy's current tint color) that expands ~1.5× and fades in 140ms behind the scale-out |
| Spawn entrance | Spring scale-in from 0 | **[NEW]** — brief spawn flash: single-frame white ring at the spawn point, fades in 80ms |
| Flee state | Gray tint | Fine as-is; gray communicates running away clearly |

**Strategy-specific visual identity (optional enhancement):**
Each of the 11 strategies could have a subtle ring shape or body marking so experienced players identify them at a glance. This is optional but high value for spectators.

| Strategy | Abbreviation | Suggested marking |
|---|---|---|
| CHASE (0) | CS | Plain circle — the baseline |
| PREDICT (1) | PR | Small forward-pointing arrow inside the body |
| FLANK L (2) | FL | Small left-arc inside body |
| FLANK R (3) | FR | Small right-arc inside body |
| DIAGONAL A (4) | DA | 45° diagonal tick inside body |
| DIAGONAL B (5) | DB | 135° diagonal tick |
| BOUNCE INTERCEPT (6) | IC | Two parallel horizontal lines (=) inside body |
| BOUNCE BILLIARD (7) | BL | Small angled bounce line inside body |
| BOUNCE SHADOW (8) | SH | Body flattened slightly (ellipse) to suggest wall-hugging |
| QUADRANT PATROL (9) | QP | Circle-within-circle (patrol ring) |
| FALSE9 (10) | F9 | Two-tone split: one half lighter, one darker — signals it is deceptive |

---

### 3.3 Powerup Pickups (the items on the floor)

Powerups spawn every 10 seconds at a random position. They are stationary, with a label. Currently a plain circle with text. They expire after 15 seconds.

**Overall design spec:** Each powerup should be visually distinct by shape AND color. The label is already rendered in code — the designer provides the background badge shape only.

| Powerup | Code name | Color | Suggested shape |
|---|---|---|---|
| FIRE | `flame` | Orange `#ff8c1a` | Teardrop / flame silhouette |
| ICE | `ice` | Teal `#27cfc3` | Hexagon (snowflake) |
| PUSH | `squeegee` | White/grey | Horizontal bar with chevron |
| GUN | `turret` | Yellow `#ffff1a` | Crosshair circle |
| RAGE | `berserker` | Green `#1aff1a` | Spiked/jagged circle |
| BOMB | `bomb` | White | Circle with fuse line |
| AIM | `sniper` | Grey | Diamond / scope reticle |
| ARTY | `artillery` | Orange | Triangle (downward shell) |
| SLOW | `bullet_time` | Cyan `#4de6ff` | Hourglass |
| DUEL | `wild_west` | Gold `#f5d51a` | Star (sheriff) |
| GHOST | `ghost` | Blue-ghost | Ring with transparent center |
| SPIN | `ironman` | Gold | Circle with arm extending right |
| LASER | `laser` | Cyan | Horizontal beam line through circle |
| CHAIN | `cascade` | Orange | Lightning bolt / branching line |

**All powerups need:**
- An idle pulse animation: subtle scale `1.0 → 1.07 → 1.0` on a ~1s loop (draws the eye)
- A collect burst: brief flash of the powerup's color at the collection point (120ms, fades out)
- An expiry warning: after 10s on screen, begin a flicker/pulse to signal "pick me up soon"

---

### 3.4 Projectiles

| Sprite | Used by | Current | Desired |
|---|---|---|---|
| **Bullet** | Turret | Small circle, cyan-ish | **[UPGRADE]** — elongated oval, yellow-white, directional (points in flight direction), 8×4 px, slight motion blur tail |
| **BT Bullet** | Bullet-time | Small circle | **[UPGRADE]** — similar to turret bullet but cyan `#4de6ff`, smaller (6×3 px) |
| **Cascade projectile** | Cascade chain | Small orange circle | **[UPGRADE]** — bright orange core with electric-arc edges; should look like a spark |
| **WW Aim marker** | Wild West | Small triangle | **[UPGRADE]** — gold arrowhead or bullet silhouette flying toward target |
| **Bomb** | Bomb, Artillery | Circle with label | **[UPGRADE]** — round bomb body with a lit fuse; countdown label stays |
| **Sniper bullet** | Sniper | (visual from draw_line or animation) | **[NEW]** — a fast narrow white streak (line sprite, 40×2 px) that appears for ~80ms |

---

### 3.5 Persistent Visual Effects (draw_line — candidates to replace with sprites)

These currently use the engine's debug `draw_line` which renders as 1px lines. They are functional but look unpolished. Each can be replaced with a proper sprite-based approach.

| Effect | What it is | Upgrade suggestion |
|---|---|---|
| **Ironman spinning arm** | Golden line rotating around player at 180px radius | Replace with a thin elongated glowing sprite (gradient: bright gold core → transparent tips), 180px long, rotated by code. Add a very faint ghost trail at 30% opacity behind it. |
| **Laser beam** | Cyan line fired bidirectionally, 620px | Replace with a laser sprite: bright white-cyan center 4px wide, outer glow 12px, 620px length. Flash on for 180ms then fade. Consider a brief screen-edge flash at the moment of firing. |
| **Wild West cone** | Two golden lines forming a 60° cone | Replace with a cone-fill sprite: gold, 60°, ~500px long, filled at 20% opacity, outlined at 60% opacity. Should look like a spotlight or danger zone. |
| **Cascade trail** | Orange draw_line between prev_pos and current pos | Replace with a spark-trail particle: 4–6 orange-white dots fading out over 80ms behind the cascade projectile |
| **Cascade hop circle** | Orange circle drawn each frame (32 segments) | Keep the logic; upgrade to a proper orange ring sprite (1–2px stroke, `#ff8c1a` at 55% alpha) as a sprite rather than draw_line segments |

---

## 4. Particle Effects

All effects below are currently absent or minimal. Each represents a UX moment where more visual feedback would increase satisfaction.

### 4.1 Kill Confirmation (highest priority)
When any enemy dies:
- **Burst**: 6–10 tiny particles (the enemy's current body color) fly outward radially, travel ~40px, fade in 200ms
- **Flash ring**: a white ring expands from the death position, ~60px diameter at peak, fades in 150ms
- **Scale-out**: the sprite already does this; particle layer adds on top

### 4.2 Powerup Collection Burst
At the moment the player overlaps a powerup:
- **Color burst**: 8 tiny particles in the powerup's color fly outward from the player, travel 30px, fade in 120ms
- This layered on top of the player's existing scale burst gives the double-confirmation (transient + persistent)

### 4.3 Powerup Expiry Flash
When a timed powerup expires (flame, turret, bullet_time, ghost, ironman, laser):
- **Orange pulse ring**: a ring expands from the player, orange `#ff8c1a` at 55% alpha, fades in 300ms
- Currently done with sprite tint; a particle ring here would make it unmissable

### 4.4 Milestone Kill Celebration
At kill counts 5, 10, 20, 50, 100:
- **Gold shower**: 12–16 tiny gold particles burst upward and fall, 400ms
- **Screen edge pulse**: the screen edges briefly pulse gold `#f5d51a` at 30% opacity for 150ms

### 4.5 Bomb & Artillery Explosion
- **Inner flash**: bright white circle expanding to the explosion radius, fades in 100ms
- **Shockwave ring**: white ring at the edge of the radius, expands 20% beyond radius, fades in 200ms
- **Debris**: 8–12 tiny fragments (enemy-color or white) fly outward, fade in 300ms

### 4.6 Berserker Entry / Exit
- **Entry**: green radial burst from player, 2.3× radius, 300ms — matches the Hulk-transform feel
- **Exit**: green particles implode toward player center as scale shrinks back (not outward)

### 4.7 Squeeze / Squeegee Screen Wipe
- The squeegee is a large horizontal bar sweeping the screen. Enemies it touches should:
  - Flash white for 50ms
  - Leave a brief white streak trail behind them (not on the squeegee itself)
- The squeegee bar itself: add a leading edge glow (bright white 8px) and a trailing smear (50% opacity, 20px fade)

### 4.8 Death Balloon
Currently an emoji floats upward for 2.5s. This is good. Enhancements:
- Slight wobble animation on the balloon (±3° rotation, 0.4s cycle)
- Optional: a few floating dust particles rising alongside it

### 4.9 Enemy Spawn Entrance
Currently a spring scale-in from 0. Add:
- A brief white ring at the spawn position (80ms, expands to ~50px, fades) — signals "enemy appeared here"

---

## 5. UI — Game Over Screen

**Canvas:** Full 640×1136 overlay  
**Background:** Semi-transparent dark overlay (72% black) over the frozen game scene

### 5.1 Layout (top to bottom)

```
┌─────────────────────────────────┐
│  [SCORE: 47 kills · 3m 12s]     │  Large, centered, white bold
│  [BEST:  62 kills · 5m 04s]     │  Smaller, muted white
│                                  │
│  [KILLED BY: FALSE9 >>]          │  Deaths table, monospace, left-aligned
│  CS  12   PR  8   F9 >> 5 ...   │  ">>" marks the killer row
│                                  │
│  [ PLAY NORMAL ]  [ PLAY HARD ]  │  Primary action buttons
│                                  │
│  [ ☑ TACKLE ON ]                 │  Checkbox-style toggle
│  [ CFG ENEMIES ]                 │  Opens strategy config panel
│                                  │
│  [ ★ RATE ]  [ ↑ SHARE ]        │  Secondary actions
│  [ 🏆 LEADERBOARD ]              │
│  [ ✉ SUBMIT SCORE ]             │  Hidden unless eligible
│                                  │
│  [Nickname input field]          │
│  [ PT-BR ▾ ]  [ EN ]            │  Language switcher
│                                  │
│  [FAVE POWERUP poll]             │  9-option grid
└─────────────────────────────────┘
```

### 5.2 Button Specs

| Button | Size | State: default | State: pressed | State: disabled |
|---|---|---|---|---|
| PLAY NORMAL | 260×64 px | Dark green `#267a40`, white bold text | Scale 0.92×, 60ms | Not applicable |
| PLAY HARD | 260×64 px | Dark red `#7a2626`, white bold text | Scale 0.92×, 60ms | Not applicable |
| TACKLE toggle | 240×52 px | Gray (off) / green (on), label changes | Scale 0.92× | — |
| CFG ENEMIES | 240×52 px | Dark neutral `#3a3a3a`, white text | Scale 0.92× | Grayed out |
| RATE | 140×48 px | Outlined gold, star icon + text | Fill gold | — |
| SHARE (WhatsApp) | 140×48 px | Outlined green, share icon + text | Fill green | Gray when no score |
| LEADERBOARD | 280×52 px | Outlined white, trophy icon + text | Fill white, text dark | — |
| SUBMIT SCORE | 280×52 px | Filled gold `#f5d51a`, dark text | Scale 0.92× | Hidden |

**All buttons:** 12px corner radius. Tap produces a `0.92×` scale squash over 60ms, springs back over 80ms (already in code — designer specifies visual appearance only).

### 5.3 Score/Best Text Animation
- **New personal best**: gold flash + scale bounce on the record value (`1.35×`, 180ms up, 180ms down)
- **Kills table reveal**: fades in at 40% into the overlay animation (staggered, not immediate)
- **Overlay entrance**: dark background fades from 0% to 72% over 220ms

### 5.4 Nickname Input Field
- Rectangle, 400×52 px, dark background `#1e1e3a` (idle) → slightly brighter blue `#2e2e6a` (editing)
- Blinking cursor (|) while editing, 500ms blink cycle
- Monospace font, white text

---

## 6. UI — Strategy Config Panel (CFG menu)

A full-overlay modal that appears when the player taps CFG ENEMIES.

```
┌─────────────────────────────────┐
│  [dark panel overlay]           │
│  ╔═══════════════════════════╗  │
│  ║  CONFIGURE ENEMIES        ║  │
│  ║  Disabled strategies:     ║  │
│  ║  [CS][PR][FL][FR][DA]     ║  │
│  ║  [DB][IC][BL][SH][QP][F9] ║  │
│  ║                           ║  │
│  ║       [ DONE ]            ║  │
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

- Each strategy button: 80×44 px, 2-char abbreviation
- **Enabled** (default): green `#267a40` fill, white text
- **Disabled**: dark gray `#4d4d4d` fill, text at 60% opacity, optional strikethrough
- Tap toggles. Microinteraction: scale squash `0.92×` on tap

---

## 7. UI — Leaderboard Panel

An overlay panel that slides in from the bottom or fades in.

```
┌────────────────────────────────┐
│  [LEADERBOARD]                 │
│  [BY KILLS ●] [BY TIME  ○]    │  sort toggle buttons
│  ─────────────────────────     │
│   1. PlayerName   124K  208s   │
│   2. anon         98K   145s   │
│   3. Rafinha      87K   320s   │
│  ...                           │
│  ─────────────────────────     │
│         [ CLOSE ]              │
└────────────────────────────────┘
```

- Panel: `#1a1a2e` background, 24px corner radius
- Sort buttons: pill-shaped toggle, 160×44 px each; active = green, inactive = gray
- Row text: monospace, white, 13px, rank number in muted yellow
- CLOSE button: 200×52 px, outlined white

---

## 8. UI — HUD (during gameplay)

The HUD is always visible during play. Extremely minimal — any distraction costs player attention.

```
[KILL COUNTER — world space, center-screen top]
   Shows: "⚔ 47" or equivalent
   On each kill: scale pop (1.45×)
   At milestones (5/10/20/50/100): gold flash + 2× scale bounce

[PAUSE BUTTON — top-right]
   60×60 px minimum (thumb hit area)
   Icon: two vertical bars (standard pause)
   Tapping produces scale squash feedback

[VERSION — bottom-left of HUD]
   "v1.0.0" in yellow, 10px, muted (for completeness, not for players)
```

### Kill Counter Visual Spec
- Font: bold, high contrast, white
- Lives in world-space (not GUI), meaning it sits behind enemies visually by z-layer
- On regular kill: brief scale pop `1.45×`, 80ms up, 100ms back
- On milestone: gold color flash (`#f5d51a` → white over 550ms) + `2.0×` scale bounce

---

## 9. Pause Overlay

```
┌─────────────────────────────────────────────────────┐
│  [Frozen game scene, visible through 60%+ dark overlay] │
│                                                         │
│              [  PAUSED  ]                               │
│                                                         │
│             [ ▶ RESUME ]                               │
│             [ ★ RATE   ]                               │
│             [ 🏆 LEADERBOARD ]                         │
│             [ ↑ SHARE  ]                               │
│                                                         │
│             [FAVE POWERUP poll]                        │
└─────────────────────────────────────────────────────────┘
```

- Overlay: `#000000` at 60% alpha — must clearly separate PAUSED from PLAYING
- RESUME button: largest element, green, prominent
- PAUSED label: large, white, centered
- All elements fade in over 150ms on pause

---

## 10. Spectator Experience — What an Observer Sees

SOLONE is played on a mobile screen that others may watch. The visual design should communicate game state to a spectator with no context.

**What a spectator needs to read at a glance:**
1. Where is the player? → White glowing dot, always the brightest object
2. Is the player in danger? → Enemy tints and proximity
3. What powerup is active? → Player tint color (must be saturated enough to read at arm's length)
4. Is the game going well? → Kill counter in center-top, visible without squinting
5. Is something exciting happening? → Particle bursts, explosions, chain lightning should be visually large enough to register as events from 50cm away

**Spectator-specific enhancements:**
- Kill milestone celebrations (at 5/10/20/50/100) should be large enough to be seen by someone not holding the phone
- Bomb explosions: the shockwave ring should reach 60% of screen width at max radius
- Cascade chain lightning: each hop should produce a visible arc/flash, not just a dot flying between enemies
- Berserker: when the player is in RAGE mode (green, 2.3×), it should be obvious to an observer that something exceptional is happening

---

## 11. Animation Timing Reference

All timing values are what the code currently uses. Designer should target these for any sprite animations.

| Event | Duration | Easing feel |
|---|---|---|
| Button press | 60ms down, 80ms restore | Fast snap |
| Powerup pickup burst | 100ms up, 80ms down | Snappy |
| Regular kill pop | 80ms up, 100ms down | Quick bounce |
| Milestone kill bounce | 140ms up (2×), 140ms down | Spring overshoot |
| Enemy spawn entrance | 220ms | Spring (overshoot to 1.1× then settle at 1.0) |
| Enemy death scale-out | 140ms | Fast ease-out |
| Berserker entrance | 450ms | Heavy spring overshoot |
| Berserker exit | 750ms | Slow deflate, ease-in |
| Protected hit squash | 70ms down, 120ms restore | Elastic |
| Laser beam flash | 180ms visible | Hard cut in, fade out |
| Powerup expiry pulse | 300ms | Orange → white, ease-out |
| Overlay fade-in | 220ms | Ease-out |
| Score text celebrate | 180ms up, 180ms down | Bounce |

---

## 12. Typography

The game uses engine-rendered label text (Defold). Designer specifies the desired look; implementation uses system/embedded font.

| Usage | Weight | Size | Color | Notes |
|---|---|---|---|---|
| Kill counter | Bold | 28–32px | White | World-space, must read at any enemy density |
| Strategy abbreviation on enemy | Bold | 8–10px | White | Tiny, monospace preferred |
| Score on game-over | Bold | 26px | White | |
| Best score | Regular | 18px | White 70% | |
| Deaths table | Regular | 12px | White | Monospace — column alignment matters |
| Button labels | Bold | 15–17px | White | All-caps preferred |
| Nickname input | Regular | 16px | White | Monospace |
| Leaderboard rows | Regular | 13px | White | Monospace — fixed-width columns |
| Version label | Regular | 10px | Yellow 60% | Not for players |

---

## 13. What NOT to Design

These are constraints the designer must respect:

- **No background art.** The game field is pure black. No grid, no texture, no vignette. The action is the visual.
- **No enemy health bars.** Enemies die in one hit. No HP feedback needed.
- **No damage numbers.** The kill counter does all score communication.
- **No tutorial overlays.** Game teaches through play. No tooltip sprites needed.
- **No character faces or personalities.** Everything is abstract geometry — circles, lines, arcs. Introducing faces breaks the aesthetic.
- **No persistent glow around the player.** The player tint communicates powerup state. A permanent halo would reduce legibility of that signal.
- **No UI chrome during gameplay.** Only the kill counter and pause button appear during play. Nothing else.

---

## 14. Deliverable Format

All sprites must be delivered as:
- **PNG with transparency** (alpha channel required for all game objects)
- **1× and 2× versions** for retina/HD (e.g. `sprite.png` at 64×64 and `sprite@2x.png` at 128×128)
- **Atlas-compatible**: no bleeding edges; 2px transparent padding on all sides
- **Defold atlas format**: sprites will be imported into a `.atlas` file; name them with their in-game ID (e.g. `player`, `enemy_base`, `powerup_flame`, `fx_kill_burst`, `btn_play_normal`)

Particle effect frames should be delivered as:
- A spritesheet (single PNG, uniform grid of frames) OR
- Individual numbered frames (e.g. `fx_kill_burst_01.png` through `fx_kill_burst_08.png`)

---

## 15. Priority Order

Ship in this order — earlier items have the most gameplay impact per second on screen:

1. Player sprite (always visible)
2. Enemy base sprite + death burst particle
3. All 14 powerup pickup icons
4. Kill counter visual refresh
5. Bomb / explosion particle
6. Cascade spark projectile + hop circle ring
7. Ironman arm sprite (replace draw_line)
8. Laser beam sprite (replace draw_line)
9. Wild West cone fill sprite (replace draw_line)
10. Turret bullet + BT bullet
11. Game Over screen buttons and layout
12. Pause overlay
13. Leaderboard panel
14. Strategy config panel
15. Milestone celebration particles
16. All remaining polish particles (spawn flash, slow-ice crystals, etc.)
