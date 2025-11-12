export const skillsData = [
  { 
    id: 1, 
    name: '拳击', 
    icon: '👊', 
    tags: '[単体][距離:1]', 
    description: 'POW40%の昇天技 そして相手はDEF-60%', 
    cost: 'MP 08',
    targets: ['enemy-1'],
    type: 'attack',
    baseDamage: 120
  },
  { 
    id: 2, 
    name: '横扫', 
    icon: '⛓️', 
    tags: '[全体][距離:3]', 
    description: 'POW60%の範囲攻撃 複数の敵にダメージを与える', 
    cost: 'MP 16',
    targets: ['enemy-1', 'enemy-2', 'enemy-3'],
    type: 'attack',
    baseDamage: 80
  },
  { 
    id: 3, 
    name: '治疗', 
    icon: '💚', 
    tags: '[単体][回復]', 
    description: 'HPを回復する 味方を治療する', 
    cost: 'MP 12',
    targets: ['player-1'],
    type: 'heal',
    healPercent: 0.3 
  },
  { 
    id: 4, 
    name: 'サンダーボルト', 
    icon: '⚡', 
    tags: '[全体][距離:3]', 
    description: 'POW80%の雷撃技 全体にダメージを与える', 
    cost: 'MP 24',
    targets: [],
    type: 'attack',
    baseDamage: 100
  }
]

