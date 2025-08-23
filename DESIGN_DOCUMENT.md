# RevolvoMan Clone - Design Document

## Project Overview

**Technology Stack:** Next.js, TypeScript, Tailwind CSS, React (App Router), HTML5 Canvas

**Genre:** Puzzle/Action Game

**Target Platform:** Desktop and Mobile (Progressive Web App)

**Core Concept:** A gravity-based puzzle game where players control a miner character who must collect coins within a time limit. The unique mechanic is the ability to rotate the entire game board while gravity always pulls downward toward the bottom of the screen.

## Game Mechanics

### Core Gameplay Loop

1. Player spawns in a 15x15 grid level with coins scattered throughout
2. Character falls due to gravity until landing on a block or ground
3. Player uses arrow keys to move left/right and S/D keys to rotate the board
4. Goal: Collect all coins within 20 seconds
5. Board rotation changes the relative position of blocks and coins while gravity continues pulling downward, causing character to fall toward the bottom of the screen

### Controls

- **Left Arrow**: Move character one block left (only when grounded)
- **Right Arrow**: Move character one block right (only when grounded)
- **S Key**: Rotate board counter-clockwise 90 degrees
- **D Key**: Rotate board clockwise 90 degrees
- **R Key**: Restart current level
- **Escape**: Pause game
- **Mobile**: On-screen buttons for all controls

### Movement Rules

- Character moves in whole block increments only
- No movement allowed while falling
- Falling speed is constant regardless of distance
- Gravity always pulls downward toward the bottom of the screen
- Character always remains upright during board rotations
- Board rotation changes the relative position of blocks, making previously vertical surfaces become floors or ceilings
- No queuing of movements - precise timing required

## Visual Design

### Character Design

- **Appearance**: Miner character inspired by Jaeger Clade from Strange World
- **Details**: White shirt, brown trousers, mining pick, rope over shoulder
- **Animations**:
  - Idle (facing camera)
  - Walking left
  - Walking right
  - Falling
- **Style**: Highly detailed sprite graphics

### Environment Design

- **Blocks**: Light blue solid color or subtle gradient (rotationally symmetric)
- **Coins**: Circular, gold/copper color with cent symbol engraving
- **Grid**: 15x15 playing area
- **Color Palette**: Fun and friendly colors throughout

### UI Design

- Clean, modern interface
- Consistent color scheme matching game aesthetics
- Mobile-responsive design
- Clear visual hierarchy

## Game Modes

### Campaign Mode

- **Levels**: 200 predefined levels
- **Progression**: Linear unlock system (must beat level N to unlock N+1)
- **Difficulty Curve**:
  - Level 1: Simple "press right to collect coin"
  - Level 200: Complex timing and pathfinding challenges
- **Completion Reward**: Unlocks Endless Mode + congratulations screen

### Endless Mode

- **Availability**: Unlocked after completing Campaign Mode
- **Generation**: Procedurally generated levels using seeded random
- **Difficulty**: Gradually increasing complexity
- **Goal**: Achieve highest possible streak

## Progression & Rewards

### Campaign Medals System

Each level has 5 medal tiers based on completion time:

- **Participation Trophy**: Attempting the level
- **Bronze Medal**: Complete within 18.000 seconds
- **Silver Medal**: Complete within 15.250 seconds
- **Gold Medal**: Complete within 12.230 seconds
- **Author Medal** (Green Jade): Complete within 8.987 seconds

### Scoring Systems

#### Campaign Mode

- **Progress Tracking**: Visual representation via unlocked levels
- **Time Records**: Best completion time per level (3 decimal precision)
- **Medal Collection**: Track medals earned per level

#### Endless Mode Statistics

- **Levels Passed**: Total successful completions
- **Levels Failed**: Total failed attempts
- **Win Percentage**: Success rate calculation
- **Best Streak**: Longest consecutive wins
- **Average Time**: Mean completion time per level

#### Universal Stats

- **Total Coins Collected**: Currency for store purchases
- **Achievement Progress**: Various milestone tracking

## User Interface Specification

### In-Game HUD

**Above Game Board:**

- Left: "Level 20"
- Right: "Coins 12" (remaining coins, decrements on collection)

**Campaign Levels Display:**

- "Best time - Not completed" (or actual time)
- "Author: 10.000"
- "Gold: 12.230"
- "Silver: 15.273"
- "Bronze: 18.021"

**Mobile Controls:**
Row of buttons below game board:
[◄] [↺] [↻] [►]
(Left, Rotate CCW, Rotate CW, Right)

### Screen Hierarchy

#### 1. Welcome Page

- "RevolvoMan Clone" title screen
- Brief startup display

#### 2. Profile Selection

- List existing player profiles
- "New Player" button

#### 3. Create Profile

- Name input field
- Confirmation

#### 4. Main Menu

- **Navigation Options**: Campaign, Endless Mode, How to Play, Store, Achievements, Stats, Settings, Switch Profile
- **Display**: Current coin count, fun graphics
- **Visual Style**: Engaging and colorful

#### 5. Campaign Selection

- **Grid Layout**: All 200 levels displayed
- **Visual States**:
  - Locked levels (grayed out)
  - Unlocked levels (available)
  - Medal indicators per level
- **Level Details**: Click level to see times and medals
- **Play Button**: Starts selected level

#### 6. Settings

- **Music Volume**: Slider control + mute toggle
- **Sound Effects Volume**: Slider control + mute toggle

#### 7. Store

- **Currency Display**: Available coins
- **Purchase Options**: Themes, colors, skins, backgrounds
- **Visual Preview**: Show items before purchase

#### 8. Achievements

- **Display All**: Complete achievement list
- **Filtering**: Earned vs. unearned
- **Progress**: Visual progress bars for partially completed achievements

#### 9. Stats Dashboard

- **Comprehensive Metrics**: All player statistics
- **Visual Representation**: Charts and graphs where appropriate

#### 10. Pause Menu (In-Game)

- Resume
- Settings
- How to Play
- Main Menu

#### 11. Endless Mode Overview

- **Statistics Display**: Current endless mode stats (levels passed, failed, win percentage, best streak, average time)
- **Visual Progress**: Charts or graphs showing performance trends
- **Play Button**: Start endless mode
- **Back to Main Menu**: Navigation option

## Technical Architecture

### Data Persistence

- **Primary Storage**: Browser localStorage
- **Future Consideration**: Database hosting for cloud saves
- **Save Data**: Player profiles, progress, settings, statistics

### Audio System

- **Background Music**: Ambient tracks with volume control
- **Sound Effects**: Action feedback with independent volume control
- **Implementation**: Web Audio API or HTML5 Audio

### Performance Considerations

- **Canvas Optimization**: Efficient rendering for smooth gameplay
- **Mobile Performance**: Touch-friendly controls and responsive design
- **Frame Rate**: Target 60 FPS for smooth animations

### Level Generation

- **Campaign**: Hand-crafted levels (initially seeded random, later custom-designed)
- **Endless**: Procedural generation with difficulty scaling
- **Validation**: Ensure all generated levels are solvable within time limit

## Development Phases

### Phase 1: Core Mechanics

- Basic character movement and gravity
- Board rotation functionality
- Coin collection system
- Timer implementation
- **Screens**: Basic game screen with minimal UI

### Phase 2: Visual Polish

- Character sprite creation and animation
- Environment art and styling
- UI/UX design implementation
- **Screens**: Enhanced game screen with full HUD

### Phase 3: Basic Navigation & Profile System

- Profile management system
- Basic menu navigation
- Save/load system
- **Screens**: Welcome Page, Profile Selection, Create Profile, Main Menu, Settings

### Phase 4: Campaign Mode

- Campaign mode with progression
- Level selection interface
- Medal and scoring systems
- **Screens**: Campaign Selection, Pause Menu (In-Game)

### Phase 5: Advanced Features & Additional Screens

- Endless mode implementation
- Achievement system
- Statistics tracking
- Store system
- **Screens**: Endless Mode Overview, Achievements, Stats Dashboard, Store

### Phase 6: Audio & Final Polish

- Audio integration (music and sound effects)
- Mobile optimization
- Performance tuning
- Final UI/UX refinements
- **Screens**: Polish and refinement of all existing screens

## Success Metrics

- **Player Engagement**: Average session length and return rate
- **Difficulty Balance**: Completion rates per level
- **User Experience**: Intuitive controls and clear feedback
- **Technical Performance**: Smooth gameplay across devices

---

_This design document serves as the blueprint for developing the RevolvoMan Clone game. All features and specifications outlined here should be implemented according to the technical requirements and user experience goals._
