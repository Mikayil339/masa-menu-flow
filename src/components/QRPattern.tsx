/**
 * Pseudo-QR pattern as inline SVG — visually distinctive, not a real scannable QR.
 * Good enough for prototypes and printable previews.
 */
export function QRPattern({ value, size = 160, className = "" }: { value: string; size?: number; className?: string }) {
  // Deterministic grid from value hash
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  const N = 21;
  const cells: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  let x = h >>> 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    cells[r][c] = (x & 7) > 3;
  }
  // finder squares
  const finder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const rr = r + i, cc = c + j;
      if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
      if (i === -1 || i === 7 || j === -1 || j === 7) cells[rr][cc] = false;
      else if (i === 0 || i === 6 || j === 0 || j === 6) cells[rr][cc] = true;
      else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) cells[rr][cc] = true;
      else cells[rr][cc] = false;
    }
  };
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  const cell = size / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <rect width={size} height={size} fill="white" />
      {cells.flatMap((row, r) => row.map((on, c) =>
        on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1a1410" /> : null
      ))}
    </svg>
  );
}
