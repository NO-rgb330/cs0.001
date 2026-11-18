/* de_sandbox.js - GoldSrc-inspired 3-lane bomb defusal map with A/B sites, ramps, crates & bot waypoints */
(function () {
  // Helper: box defined by center (x,z), base y, width w, height h, depth d, texture key
  const B = (x, y, z, w, h, d, tex) => ({ x, y, z, w, h, d, tex });

  // Ramps: smooth slope between y1 and y2 along axis ('x' or 'z')
  const R = (x, z, w, d, y1, y2, axis, tex) => ({ x, z, w, d, y1, y2, axis, tex });

  CS.Maps.de_sandbox = {
    name: 'de_sandbox',
    skyColor: 0x9bb7d4,
    fogColor: 0xd3bf9a,
    floorTex: 'sand',
    size: 64,

    // Bombsite trigger volumes
    sites: [
      { id: 'A', x: -18, y: 1.2, z: -16, r: 4.5 },
      { id: 'B', x: 18,  y: 0.0, z: -16, r: 4.5 }
    ],

    // Team spawns (T South, CT North)
    spawns: {
      t: [
        { x: -4, y: 0, z: 23, yaw: 0 },
        { x: -1.5, y: 0, z: 24, yaw: 0 },
        { x: 1.5, y: 0, z: 24, yaw: 0 },
        { x: 4, y: 0, z: 23, yaw: 0 },
        { x: 0, y: 0, z: 22, yaw: 0 }
      ],
      ct: [
        { x: -4, y: 0, z: -23, yaw: Math.PI },
        { x: -1.5, y: 0, z: -24, yaw: Math.PI },
        { x: 1.5, y: 0, z: -24, yaw: Math.PI },
        { x: 4, y: 0, z: -23, yaw: Math.PI },
        { x: 0, y: 0, z: -22, yaw: Math.PI }
      ]
    },

    ramps: [
      // Ramp up to Site A platform from T-Long (South)
      R(-18, -6, 6, 6, 0, 1.2, 'z', 'sandstone'),
      // Ramp up to Site A platform from CT-Spawn (North)
      R(-11, -18, 6, 5, 1.2, 0, 'x', 'sandstone')
    ],

    boxes: [
      // Outer boundary walls
      B(0, 0, -29, 60, 7, 2, 'wall'),
      B(0, 0,  29, 60, 7, 2, 'wall'),
      B(-29, 0, 0, 2, 7, 60, 'wall'),
      B( 29, 0, 0, 2, 7, 60, 'wall'),

      // --- SITE A (West, elevated platform) ---
      B(-20, 0, -16, 14, 1.2, 14, 'sandstone'),
      // Site A cover crates & back wall
      B(-24, 1.2, -19, 2.2, 1.5, 2.2, 'crate'),
      B(-21.8, 1.2, -19, 1.8, 2.4, 1.8, 'crate'),
      B(-16, 1.2, -14, 2.0, 1.3, 3.0, 'crate'),
      B(-26, 0, -16, 2, 5.5, 16, 'wall'),

      // --- A LONG & T-SIDE WEST ---
      B(-12, 0, 4, 3, 4.5, 20, 'wall'),      // Divider between Mid & A Long
      B(-22, 0, 6, 2.2, 1.4, 2.2, 'crate'), // Long corner box
      B(-25, 0, 14, 4, 4.5, 6, 'sandstone'),

      // --- MID LANE ---
      B(0, 0, 2, 2.6, 1.4, 2.6, 'crate'),    // Mid Xbox
      B(0, 1.4, 2, 1.6, 1.1, 1.6, 'crate'),
      // Mid double doors (iconic gap)
      B(-5, 0, -6, 6, 4.5, 1.5, 'wall'),
      B( 5, 0, -6, 6, 4.5, 1.5, 'wall'),
      B( 0, 3.0, -6, 4, 1.5, 1.5, 'wall'),   // Archway lintel above mid doors

      // --- B TUNNELS & SITE B (East) ---
      B(12, 0, 4, 3, 4.5, 20, 'wall'),       // Divider between Mid & B Lane
      B(18, 0, 6, 2.4, 1.6, 2.4, 'crate'),   // B entrance cover
      B(25, 0, 0, 5, 4.5, 10, 'sandstone'),  // East choke
      // B tunnel roof / archway
      B(18, 0, -4, 3, 4.5, 1.5, 'wall'),
      B(24, 0, -4, 4, 4.5, 1.5, 'wall'),
      // Site B crates & pillars
      B(20, 0, -15, 2.4, 1.5, 2.4, 'crate'),
      B(22.4, 0, -15, 1.8, 2.6, 1.8, 'crate'),
      B(15, 0, -19, 2.2, 1.3, 2.2, 'crate'),
      B(26, 0, -18, 2, 5.5, 14, 'wall'),

      // --- T & CT SPAWN DECOR / COVER ---
      B(-8, 0, 18, 4, 3.5, 2, 'sandstone'),
      B( 8, 0, 18, 4, 3.5, 2, 'sandstone'),
      B(-6, 0, -19, 3, 3.5, 2, 'sandstone'),
      B( 6, 0, -19, 3, 3.5, 2, 'sandstone')
    ],

    // Navigation graph for bot pathfinding (id, x, y, z, neighbors)
    waypoints: [
      { id: 0,  x: 0,   y: 0,   z: 21,  n: [1, 2, 3] },        // T Spawn
      { id: 1,  x: -17, y: 0,   z: 18,  n: [0, 4] },           // T -> A Long
      { id: 2,  x: 0,   y: 0,   z: 12,  n: [0, 5, 6] },        // T -> Mid
      { id: 3,  x: 18,  y: 0,   z: 18,  n: [0, 7] },           // T -> B Lane
      { id: 4,  x: -18, y: 0,   z: 3,   n: [1, 8] },           // A Long
      { id: 5,  x: -2,  y: 0,   z: 0,   n: [2, 9] },           // Mid South
      { id: 6,  x: 4,   y: 0,   z: 2,   n: [2, 7, 9] },        // Mid East
      { id: 7,  x: 18,  y: 0,   z: 2,   n: [3, 6, 10] },       // B Approach
      { id: 8,  x: -18, y: 1.2, z: -15, n: [4, 11] },          // Site A (plant zone)
      { id: 9,  x: 0,   y: 0,   z: -12, n: [5, 6, 11, 12] },   // Mid Doors North
      { id: 10, x: 18,  y: 0,   z: -14, n: [7, 12] },          // Site B (plant zone)
      { id: 11, x: -5,  y: 0,   z: -22, n: [8, 9, 13] },       // CT West
      { id: 12, x: 5,   y: 0,   z: -22, n: [9, 10, 13] },      // CT East
      { id: 13, x: 0,   y: 0,   z: -23, n: [11, 12] }          // CT Spawn
    ]
  };
})();
