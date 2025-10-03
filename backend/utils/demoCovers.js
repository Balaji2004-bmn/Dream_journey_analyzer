// Demo cover images for dreams (royalty-free Unsplash sources)
// Deterministic selection based on a seed keeps the same dream with the same cover.

const DEMO_COVERS = [
  'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop', // cosmos
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // forest
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // phoenix-like
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop', // dragon scales
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', // library
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', // crystals
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', // underwater
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop', // moon garden
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=600&fit=crop', // desert night
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=600&fit=crop', // aurora
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop', // city night
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop', // mountains
  'https://images.unsplash.com/photo-1501785888041-7f3b9a0826d1?w=800&h=600&fit=crop', // misty valley
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop', // dreamlike clouds
  'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=800&h=600&fit=crop', // ocean horizon
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&h=600&fit=crop', // star trail
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop', // neon alley
  'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&h=600&fit=crop', // galaxy swirl
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', // lake reflection
  'https://images.unsplash.com/photo-1445227291386-3e7a0fd3c3a0?w=800&h=600&fit=crop'  // fantasy landscape
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function pickDemoCover(...seeds) {
  const seedString = seeds.filter(Boolean).join('|') || `${Date.now()}`;
  const idx = hashString(seedString) % DEMO_COVERS.length;
  return DEMO_COVERS[idx];
}

module.exports = {
  DEMO_COVERS,
  pickDemoCover,
};
