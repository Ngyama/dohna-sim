# Battle Game UI

> **Note:** This is a course assignment practice project for learning purposes.

A turn-based battle game interface built with Vue 3.

## Tech Stack

- Vue 3
- Vite
- CSS3

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The project will start at http://localhost:3000

## Build for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/          # Vue components
│   │   ├── CharacterCard.vue    # Character card component
│   │   ├── SkillItem.vue        # Skill item component
│   │   ├── BattleLog.vue        # Battle log component
│   │   └── TargetLines.vue      # Target indicator lines component
│   ├── data/               # Data configuration
│   │   ├── skills.js           # Skills data
│   │   └── enemySkills.js      # Enemy skills data
│   ├── utils/              # Utility functions
│   │   ├── skillExecutor.js    # Skill execution logic
│   │   └── turnManager.js      # Turn management
│   ├── assets/             # Static assets
│   │   ├── background/         # Background images
│   │   └── enemy/              # Enemy sprites
│   ├── App.vue             # Main application component
│   ├── main.js             # Entry point
│   └── styles.css          # Global styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Project configuration
```

## Features

- ✅ Responsive data management
- ✅ Component-based architecture
- ✅ Dynamic target indicator lines
- ✅ Battle log system
- ✅ Character status display
- ✅ Skill selection and highlighting

## Development Notes

All game state is managed in `App.vue` using Vue 3's reactive system, including:
- Player and enemy data
- Skill data
- Current turn
- Battle logs
- Highlight states
