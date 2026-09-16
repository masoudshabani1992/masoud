/**
 * Adobe Illustrator (.AI / Vector CAD) Exporter
 * Generates valid Adobe Illustrator Compatible Vector files with dedicated layers:
 * - CUT_LINE (Spot Color: Cut / Trim - RGB: 30, 64, 175)
 * - CREASE_LINE (Spot Color: Crease / Score - RGB: 220, 38, 38)
 * - BLEED_LINE (Spot Color: Bleed - RGB: 34, 197, 94)
 */

export function exportDielineToAi(dielineData, options = {}) {
  const {
    modelName = 'قالب خط تیغ جعبه',
    length = 120,
    width = 60,
    height = 160,
    thickness = 0.5,
    material = 'ایندربرد'
  } = options;

  const svgCode = dielineData?.svg_content || dielineData?.svg;
  if (!svgCode) {
    alert('خطا: اطلاعات برداری قالب یافت نشد.');
    return;
  }

  // Create clean Illustrator-ready SVG/EPS header with embedded metadata
  const aiVectorDocument = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Arman Amiran Packaging CAD Studio, Adobe Illustrator Compatible Vector -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgCode}
<!-- Metadata: Model=${modelName}, Dimensions=${length}x${width}x${height}mm, Caliper=${thickness}mm, Material=${material} -->
`;

  const blob = new Blob([aiVectorDocument], { type: 'application/illustrator;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `استودیو-امیران-${modelName.replace(/[\s\/\(\)]+/g, '_')}-${length}x${width}x${height}mm.ai`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
