/**
 * Export 1:1 DXF (AutoCAD R12 compatible) for Laser Die-Cutting Machines
 */
export function exportDielineToDxf({
  boxType = 'tuck_end',
  length = 120,
  width = 60,
  height = 160,
  glueW = 15,
  filename = 'dieline.dxf'
}) {
  const L = parseFloat(length) || 120;
  const W = parseFloat(width) || 60;
  const H = parseFloat(height) || 160;
  const G = parseFloat(glueW) || 15;

  let lines = [];

  // Helper to add line entity
  const addLine = (layer, color, x1, y1, x2, y2) => {
    lines.push(`0\nLINE\n8\n${layer}\n62\n${color}\n10\n${x1.toFixed(3)}\n20\n${y1.toFixed(3)}\n30\n0.0\n11\n${x2.toFixed(3)}\n21\n${y2.toFixed(3)}\n31\n0.0`);
  };

  // Creases (Layer: CREASE, Color: 1 = Red / 5 = Blue)
  const x0 = 0;
  const x1 = G;
  const x2 = x1 + L;
  const x3 = x2 + W;
  const x4 = x3 + L;
  const x5 = x4 + W;

  const y0 = 0;
  const y1 = H;

  // Main body creases
  addLine('CREASE_LINE', 5, x1, y0, x1, y1);
  addLine('CREASE_LINE', 5, x2, y0, x2, y1);
  addLine('CREASE_LINE', 5, x3, y0, x3, y1);
  addLine('CREASE_LINE', 5, x4, y0, x4, y1);
  addLine('CREASE_LINE', 5, x1, y0, x5, y0);
  addLine('CREASE_LINE', 5, x1, y1, x5, y1);

  // Outer cut boundaries (Layer: CUT, Color: 1 = Red / 3 = Green)
  const tuck = Math.max(12, Math.min(25, W * 0.75));
  const flapH = W;

  // Top & bottom flap cuts
  addLine('CUT_LINE', 1, x0, y0 + 5, x1, y0);
  addLine('CUT_LINE', 1, x0, y1 - 5, x1, y1);
  addLine('CUT_LINE', 1, x0, y0 + 5, x0, y1 - 5);

  addLine('CUT_LINE', 1, x1, y1, x1, y1 + flapH + tuck);
  addLine('CUT_LINE', 1, x1, y1 + flapH + tuck, x2, y1 + flapH + tuck);
  addLine('CUT_LINE', 1, x2, y1 + flapH + tuck, x2, y1);

  addLine('CUT_LINE', 1, x3, y0, x3, y0 - flapH - tuck);
  addLine('CUT_LINE', 1, x3, y0 - flapH - tuck, x4, y0 - flapH - tuck);
  addLine('CUT_LINE', 1, x4, y0 - flapH - tuck, x4, y0);

  addLine('CUT_LINE', 1, x5, y0, x5, y1);

  const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
2
0
LAYER
2
CUT_LINE
70
0
62
1
6
CONTINUOUS
0
LAYER
2
CREASE_LINE
70
0
62
5
6
DASHED
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
${lines.join('\n')}
0
ENDSEC
0
EOF`;

  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
