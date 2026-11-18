/* de_dust2.js - Dust 2 layout rebuilt from boxes + ramps: T spawn south, CT spawn north, A site (north-east, raised) with Long A / Short A (catwalk) / CT ramp,
   B site (north-west) with upper + lower tunnels and the B window / doors, and a central mid with doors. Generated from a 1 m grid layout; waypoint links
   were verified by walking every link with the game's own movement + collision code. Units: metres, +x east, +z south (north = -z). */
(function () {
  // Helper: box defined by centre (x,z), base y, width w, height h, depth d, texture key, optional colour tint
  const B = (x, y, z, w, h, d, tex, color) => ({ x, y, z, w, h, d, tex, color });
  // Ramps: smooth slope between y1 (min side of axis) and y2 (max side)
  const R = (x, z, w, d, y1, y2, axis, tex) => ({ x, z, w, d, y1, y2, axis, tex });

  CS.Maps.de_dust2 = {
    name: 'de_dust2',
    skyColor: 0x8fb4da,
    fogColor: 0xdccaa2,
    fogNear: 45,
    fogFar: 150,
    floorTex: 'sand',
    size: 128,

    // Bombsite trigger volumes
    sites: [
      { id: 'A', x: 34, y: 2, z: -40, r: 5 },
      { id: 'B', x: -48, y: 0, z: -38, r: 5 }
    ],

    // Team spawns (T south, CT north)
    spawns: {
      t: [
        { x: -20, y: 0, z: 55, yaw: 0 },
        { x: -15, y: 0, z: 56, yaw: 0 },
        { x: -10, y: 0, z: 55, yaw: 0 },
        { x: -5, y: 0, z: 56, yaw: 0 },
        { x: 0, y: 0, z: 55, yaw: 0 }
      ],
      ct: [
        { x: -8, y: 0, z: -54, yaw: Math.PI },
        { x: -4, y: 0, z: -55, yaw: Math.PI },
        { x: 0, y: 0, z: -54, yaw: Math.PI },
        { x: 4, y: 0, z: -55, yaw: Math.PI },
        { x: 8, y: 0, z: -54, yaw: Math.PI }
      ]
    },

    ramps: [
      R(-44.5, -47.5, 5, 5, 0, 1.4, 'x', 'sandstone'),
      R(15, -46, 6, 8, 0, 2, 'x', 'sandstone'),
      R(23, -24, 10, 12, 2, 0, 'z', 'sandstone'),
      R(46, -24, 12, 12, 2, 0, 'z', 'sandstone')
    ],

    boxes: [
      B(0, 0, -59.5, 30, 8, 3, 'wall'),
      B(-13.5, 0, -52, 3, 8, 12, 'wall'),
      B(13.5, 0, -54, 3, 8, 8, 'wall'),
      B(34, 0, -53.5, 38, 8, 3, 'wall'),
      B(-47, 0, -51.5, 28, 8, 3, 'wall'),
      B(16.5, 0, -51, 3, 8, 2, 'wall'),
      B(34, 0, -41, 32, 2, 22, 'sandstone'),
      B(51.5, 0, -41, 3, 8, 22, 'wall'),
      B(-59.5, 0, -37.5, 3, 8, 25, 'wall'),
      B(-39, 0, -47.5, 6, 1.4, 5, 'sandstone'),
      B(-34.5, 0, -48, 3, 8, 4, 'wall'),
      B(-24, 0, -47.5, 18, 8, 3, 'wall'),
      B(-35, 0, -45, 2, 8, 2, 'wall'),
      B(15, 0, -34.5, 6, 8, 15, 'wall'),
      B(-35, 0, -39, 2, 8, 2, 'wall'),
      B(-35, 0, -36, 2, 1.2, 4, 'wall'),
      B(-35, 0, -29.5, 2, 8, 9, 'wall'),
      B(54, 0, -29.5, 2, 8, 7, 'wall'),
      B(-20, 0, -28.5, 28, 8, 3, 'wall'),
      B(-4.5, 0, -29, 3, 8, 2, 'wall', 0x4a78b0),
      B(2.5, 0, -29, 3, 8, 2, 'wall', 0x4a78b0),
      B(8, 0, -28.5, 8, 8, 3, 'wall'),
      B(34, 0, -28.5, 12, 8, 3, 'wall'),
      B(52.5, 0, -28, 1, 8, 4, 'wall'),
      B(58, 0, -27.5, 6, 8, 3, 'wall'),
      B(-53, 0, -26.5, 10, 8, 3, 'wall'),
      B(-47, 0, -5, 2, 8, 46, 'wall', 0xbca884),
      B(-37, 0, -8, 2, 8, 40, 'wall', 0xbca884),
      B(-33.5, 0, -26, 1, 8, 2, 'wall'),
      B(-7.5, 0, -8.5, 3, 8, 37, 'wall'),
      B(5.5, 0, -17.5, 3, 8, 19, 'wall'),
      B(16.5, 0, -17.5, 3, 8, 19, 'wall'),
      B(29.5, 0, -11, 3, 8, 32, 'wall'),
      B(38.5, 0, 8.5, 3, 8, 71, 'wall'),
      B(59.5, 0, -18.5, 3, 8, 15, 'wall'),
      B(-48.5, 0, -2, 1, 8, 46, 'wall'),
      B(-35.5, 0, -7.5, 1, 8, 35, 'wall'),
      B(55, 0, -12.5, 6, 8, 3, 'wall'),
      B(11, 0, -9.5, 8, 8, 3, 'wall'),
      B(53.5, 0, 24, 3, 8, 70, 'wall'),
      B(16, 0, 3.5, 24, 8, 3, 'wall'),
      B(5.5, 0, 24.5, 3, 8, 39, 'wall'),
      B(-22, 0, 9.5, 26, 8, 1, 'wall'),
      B(-21, 0, 11, 30, 8, 2, 'wall', 0xc2ae8a),
      B(-47, 0, 19.5, 2, 8, 3, 'wall'),
      B(-44, 0, 19.5, 4, 8, 3, 'wall', 0xbca884),
      B(-20, 0, 21, 28, 8, 2, 'wall', 0xc2ae8a),
      B(-43.5, 0, 38.5, 3, 8, 35, 'wall', 0xbca884),
      B(-20, 0, 22.5, 28, 8, 1, 'wall'),
      B(-32.5, 0, 33.5, 3, 8, 21, 'wall'),
      B(-7.5, 0, 34.5, 3, 8, 23, 'wall'),
      B(41.5, 0, 26, 3, 8, 4, 'wall', 0xd9b062),
      B(50.5, 0, 26, 3, 8, 4, 'wall', 0xd9b062),
      B(-27, 0, 42.5, 8, 8, 3, 'wall'),
      B(22, 0, 42.5, 30, 8, 3, 'wall'),
      B(-16, 0, 44.5, 14, 8, 3, 'wall'),
      B(-24.5, 0, 45, 3, 8, 2, 'wall'),
      B(-35.5, 0, 57.5, 19, 8, 3, 'wall'),
      B(28, 0, 57.5, 48, 8, 3, 'wall'),
      B(-27.5, 0, 61, 3, 8, 4, 'wall'),
      B(5.5, 0, 61, 3, 8, 4, 'wall'),
      B(-11, 0, 61.5, 30, 8, 3, 'wall'),
      B(-4, 0, 6, 3, 1.4, 3, 'crate'),
      B(-4, 1.4, 6, 2, 1.1, 2, 'crate'),
      B(2, 0, -16, 2, 1.2, 2, 'crate'),
      B(-4, 0, 28, 2, 1.4, 2, 'crate'),
      B(2, 0, 36, 3, 1.6, 2, 'crate'),
      B(41.5, 0, 34, 3, 1.8, 3, 'crate'),
      B(50, 0, 40, 2, 2, 2, 'crate'),
      B(42, 0, -10, 5, 2.8, 8, 'wall', 0x4a78a8),
      B(21, 0, -12, 2, 1.2, 2, 'crate'),
      B(25, 0, -4, 2, 1.4, 2, 'crate'),
      B(26, 2, -36, 3, 1.4, 3, 'crate'),
      B(26, 3.4, -36, 2, 1.2, 2, 'crate'),
      B(44, 2, -36, 3, 1.4, 3, 'crate'),
      B(46, 2, -47, 4, 2.4, 4, 'crate'),
      B(22, 2, -47, 2, 1.4, 2, 'crate'),
      B(-54, 0, -32, 3, 1.4, 3, 'crate'),
      B(-50, 0, -31, 2, 2.4, 2, 'crate'),
      B(-40, 0, -32, 3, 1.4, 3, 'crate'),
      B(-55, 0, -44, 4, 2.8, 4, 'crate'),
      B(-44, 0, -38, 2, 1.2, 2, 'crate'),
      B(-14, 0, -38, 3, 3.2, 6, 'sandstone'),
      B(-4, 0, -36, 2, 1.4, 2, 'crate'),
      B(6, 0, -38, 2, 1.4, 2, 'crate'),
      B(-24, 0, -34, 2, 1.4, 2, 'crate'),
      B(-20, 0, 52, 2, 1.4, 2, 'crate'),
      B(0, 0, 57, 2, 1.4, 2, 'crate'),
      B(10, 0, 50, 2, 1.2, 2, 'crate'),
      B(-35, 3.2, -36, 2, 4.8, 4, 'wall')
    ],

    // Navigation graph for bot pathfinding (id, x, y, z, neighbours). Ids 8 / 10 are the A / B plant zones.
    waypoints: [
      { id: 0, x: -10, y: 0, z: 53, n: [21, 22] },  // T spawn
      { id: 1, x: 16, y: 0, z: 50, n: [2, 3, 22] },  // T east hall
      { id: 2, x: 36, y: 0, z: 50, n: [1, 3] },  // outside long
      { id: 3, x: 46, y: 0, z: 46, n: [1, 2, 4] },  // long south
      { id: 4, x: 46, y: 0, z: 26, n: [3, 5] },  // long doors
      { id: 5, x: 46, y: 0, z: 4, n: [4, 6] },  // long mid
      { id: 6, x: 46, y: 0, z: -14, n: [5, 7, 8] },  // long top
      { id: 7, x: 46, y: 2, z: -34, n: [6, 8, 17] },  // A platform east
      { id: 8, x: 34, y: 2, z: -40, n: [6, 7, 9, 16, 17, 25] },  // A SITE
      { id: 9, x: 23, y: 2, z: -33, n: [8, 15, 16, 17, 23, 24, 25] },  // short ramp top
      { id: 10, x: -48, y: 0, z: -38, n: [12, 32, 33, 35] },  // B SITE
      { id: 11, x: -30, y: 0, z: -42, n: [12, 13, 15, 35, 37] },  // hall west
      { id: 12, x: -35, y: 0, z: -42, n: [10, 11, 13, 32, 33, 35, 37] },  // B doors
      { id: 13, x: -26, y: 0, z: -36, n: [11, 12, 15, 18, 35, 37] },  // hall w-mid
      { id: 14, x: -6, y: 0, z: -38, n: [15, 16, 17, 18] },  // hall centre
      { id: 15, x: 0, y: 0, z: -53, n: [9, 11, 13, 14, 16, 17, 18, 37] },  // CT spawn
      { id: 16, x: 8, y: 0, z: -46, n: [8, 9, 14, 15, 17, 18, 37] },  // CT ramp base
      { id: 17, x: 20, y: 2, z: -46, n: [7, 8, 9, 14, 15, 16, 18, 25] },  // CT ramp top
      { id: 18, x: -1, y: 0, z: -29, n: [13, 14, 15, 16, 17, 19, 20, 23, 37] },  // mid doors
      { id: 19, x: -1, y: 0, z: -16, n: [18, 20, 23] },  // mid north
      { id: 20, x: 0, y: 0, z: 0, n: [18, 19, 21, 23, 24, 25] },  // mid centre
      { id: 21, x: 0, y: 0, z: 24, n: [0, 20, 22, 23, 26, 27] },  // mid south
      { id: 22, x: -1, y: 0, z: 40, n: [0, 1, 21, 26, 27, 36] },  // mid T
      { id: 23, x: 10, y: 0, z: -3, n: [9, 18, 19, 20, 21, 24, 25, 26] },  // short entry
      { id: 24, x: 23, y: 0, z: -6, n: [9, 20, 23, 25] },  // short mid
      { id: 25, x: 23, y: 0, z: -16, n: [8, 9, 17, 20, 23, 24] },  // short ramp base
      { id: 26, x: -10, y: 0, z: 16, n: [21, 22, 23, 27, 28, 30, 31] },  // lower tunnel mouth
      { id: 27, x: -24, y: 0, z: 16, n: [21, 22, 26, 28, 30, 31, 32] },  // lower tunnel mid
      { id: 28, x: -38, y: 0, z: 16, n: [26, 27, 29, 30, 31, 32] },  // tunnel junction
      { id: 29, x: -36, y: 0, z: 48, n: [28, 30, 36] },  // upper tunnel start
      { id: 30, x: -38, y: 0, z: 32, n: [26, 27, 28, 29, 31, 36] },  // upper tunnel mid
      { id: 31, x: -42, y: 0, z: 8, n: [26, 27, 28, 30, 32, 33] },  // tunnel bend
      { id: 32, x: -42, y: 0, z: -10, n: [10, 12, 27, 28, 31, 33] },  // tunnel north
      { id: 33, x: -42, y: 0, z: -26, n: [10, 12, 31, 32, 35] },  // B tunnel exit
      { id: 34, x: -39, y: 1.4, z: -47.5, n: [35] },  // B platform
      { id: 35, x: -49, y: 0, z: -47.5, n: [10, 11, 12, 13, 33, 34, 37] },  // B ramp base
      { id: 36, x: -30, y: 0, z: 50, n: [22, 29, 30] },  // T west exit
      { id: 37, x: -20, y: 0, z: -33, n: [11, 12, 13, 15, 16, 18, 35] },  // B window hall
    ]
  };
})();
