import confetti from 'canvas-confetti'

export function celebrate() {
  const colors = ['#8b5cf6', '#06b6d4', '#f472b6', '#34d399']
  confetti({ particleCount: 90, spread: 75, startVelocity: 45, origin: { y: 0.6 }, colors })
  setTimeout(() => confetti({ particleCount: 50, spread: 100, startVelocity: 30, origin: { y: 0.65 }, colors }), 150)
}
