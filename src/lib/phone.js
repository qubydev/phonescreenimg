export const CORNER_RADIUS = 0.06

export const STUDIO_POSES = [
  { name: "Default Front", rot: [0, 0, 0] },
  { name: "Dynamic Isometric", rot: [15, -35, -10] },
  { name: "Product Showcase", rot: [5, 25, 0] },
  { name: "Flat Lay Presentation", rot: [45, 0, -30] },
  { name: "Dramatic Low Angle", rot: [-15, -20, 5] },
  { name: "Sleek Side Profile", rot: [0, 75, 0] },
  { name: "Tilted Perspective", rot: [20, 45, 15] }
]

export function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
