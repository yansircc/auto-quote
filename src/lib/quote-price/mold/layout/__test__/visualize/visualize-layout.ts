import * as fs from 'fs';
import * as path from 'path';

interface Rectangle {
  width: number;
  height: number;
}

interface PlacedRectangle extends Rectangle {
  x: number;
  y: number;
  rotated: boolean;
}

interface LayoutVisualizerOptions {
  padding: number;
  fontSize: number;
  strokeWidth: number;
  backgroundColor: string;
  rectStrokeColor: string;
  textColor: string;
}

const defaultOptions: LayoutVisualizerOptions = {
  padding: 50,
  fontSize: 14,
  strokeWidth: 1,
  backgroundColor: '#ffffff',
  rectStrokeColor: '#666666',
  textColor: '#333333'
};

function drawDistanceMarker(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  distance: number,
  opt: LayoutVisualizerOptions
): string {
  const isVertical = x1 === x2;
  const markerLength = 10;
  let svg = '';

  if (isVertical) {
    // 垂直间距标注
    const x = x1;
    const y = Math.min(y1, y2);
    const height = Math.abs(y2 - y1);
    if (height > 0) {
      svg += `
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y + height}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}" stroke-dasharray="2,2"/>
        <line x1="${x - markerLength/2}" y1="${y}" x2="${x + markerLength/2}" y2="${y}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}"/>
        <line x1="${x - markerLength/2}" y1="${y + height}" x2="${x + markerLength/2}" y2="${y + height}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}"/>
        <text x="${x - 5}" y="${y + height/2}" 
          font-family="Arial" font-size="${opt.fontSize * 0.8}" fill="${opt.textColor}"
          text-anchor="end" dominant-baseline="middle">
          ${distance}
        </text>`;
    }
  } else {
    // 水平间距标注
    const x = Math.min(x1, x2);
    const y = y1;
    const width = Math.abs(x2 - x1);
    if (width > 0) {
      svg += `
        <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}" stroke-dasharray="2,2"/>
        <line x1="${x}" y1="${y - markerLength/2}" x2="${x}" y2="${y + markerLength/2}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}"/>
        <line x1="${x + width}" y1="${y - markerLength/2}" x2="${x + width}" y2="${y + markerLength/2}"
          stroke="${opt.textColor}" stroke-width="${opt.strokeWidth}"/>
        <text x="${x + width/2}" y="${y - 5}" 
          font-family="Arial" font-size="${opt.fontSize * 0.8}" fill="${opt.textColor}"
          text-anchor="middle" dominant-baseline="baseline">
          ${distance}
        </text>`;
    }
  }
  return svg;
}

export function visualizeLayout(
  layout: PlacedRectangle[],
  filename: string,
  options: Partial<LayoutVisualizerOptions> = {}
): void {
  const opt = { ...defaultOptions, ...options };

  // 计算容器尺寸
  const containerWidth = Math.max(...layout.map(rect => rect.x + rect.width));
  const containerHeight = Math.max(...layout.map(rect => rect.y + rect.height));
  const width = containerWidth + opt.padding * 2;
  const height = containerHeight + opt.padding * 2;

  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" 
  viewBox="0 0 ${width} ${height}"
  xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${opt.backgroundColor}"/>
  <g transform="translate(${opt.padding}, ${opt.padding})">`;

  // 绘制容器边界
  svg += `<rect x="0" y="0" width="${containerWidth}" height="${containerHeight}" 
    fill="none" stroke="${opt.rectStrokeColor}" stroke-width="${opt.strokeWidth}" stroke-dasharray="5,5"/>`;

  // 绘制容器尺寸标注
  svg += `<text x="10" y="-10" font-family="Arial" font-size="${opt.fontSize}" fill="${opt.textColor}">
    ${containerWidth} × ${containerHeight}
  </text>`;

  // 绘制每个矩形
  layout.forEach((rect, index) => {
    const hue = (index * 60) % 360;
    
    // 矩形轮廓和填充
    svg += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" 
      fill="hsla(${hue}, 70%, 80%, 0.2)" 
      stroke="${opt.rectStrokeColor}" 
      stroke-width="${opt.strokeWidth}"/>`;

    // 宽度标注（上边缘）
    svg += `<text x="${rect.x + rect.width/2}" y="${rect.y - 5}" 
      font-family="Arial" font-size="${opt.fontSize}" fill="${opt.textColor}"
      text-anchor="middle" dominant-baseline="baseline">
      ${rect.width}
    </text>`;

    // 高度标注（右边缘）
    svg += `<text x="${rect.x + rect.width + 5}" y="${rect.y + rect.height/2}" 
      font-family="Arial" font-size="${opt.fontSize}" fill="${opt.textColor}"
      text-anchor="start" dominant-baseline="middle">
      ${rect.height}
    </text>`;
  });

  // 添加间距标注
  for (const rect of layout) {
    // 查找右侧最近的矩形
    const rightRect = layout.find(r => r.x > rect.x && 
      r.y < rect.y + rect.height && 
      r.y + r.height > rect.y);
    if (rightRect) {
      const distance = rightRect.x - (rect.x + rect.width);
      svg += drawDistanceMarker(
        rect.x + rect.width,
        rect.y + rect.height/2,
        rightRect.x,
        rect.y + rect.height/2,
        distance,
        opt
      );
    }

    // 查找下方最近的矩形
    const bottomRect = layout.find(r => r.y > rect.y && 
      r.x < rect.x + rect.width && 
      r.x + r.width > rect.x);
    if (bottomRect) {
      const distance = bottomRect.y - (rect.y + rect.height);
      svg += drawDistanceMarker(
        rect.x + rect.width/2,
        rect.y + rect.height,
        rect.x + rect.width/2,
        bottomRect.y,
        distance,
        opt
      );
    }
  }

  svg += `</g></svg>`;

  // 获取当前文件所在目录
  const outputDir = __dirname;
  const outputPath = path.join(outputDir, filename);

  // 写入SVG文件
  fs.writeFileSync(outputPath, svg);
}
