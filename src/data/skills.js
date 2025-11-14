export const skillsData = [
  { 
    id: 1, 
    name: '斬撃', 
    tags: '[距離:1]', 
    cost: 'MP 08',
    targetIndices: [0],
    type: 'attack',
    baseDamage: 120
  },
  { 
    id: 2, 
    name: '薙ぎ払い', 
    tags: '[距離:2]', 
    cost: 'MP 16',
    targetIndices: [0, 1],
    type: 'attack',
    baseDamage: 80
  },
  { 
    id: 3, 
    name: '回復', 
    tags: '[距離:1]', 
    cost: 'MP 12',
    targets: ['player-1'],
    type: 'heal',
    healPercent: 0.3 
  }
]

export const warriorSkillsData = [
  { 
    id: 101, 
    name: '斬撃', 
    tags: '[距離:1]', 
    cost: 'MP 08',
    targetIndices: [0],
    type: 'attack',
    baseDamage: 120
  },
  { 
    id: 102, 
    name: '薙ぎ払い', 
    tags: '[距離:2]', 
    cost: 'MP 16',
    targetIndices: [0, 1],
    type: 'attack',
    baseDamage: 80
  },
  { 
    id: 103, 
    name: '下段斬り', 
    tags: '[距離:1]', 
    cost: 'MP 10',
    targetIndices: [0],
    type: 'attack',
    baseDamage: 100
  },
  { 
    id: 104, 
    name: '回復', 
    tags: '[距離:1]', 
    cost: 'MP 12',
    targets: ['player-2'],
    type: 'heal',
    healPercent: 0.3 
  }
]

