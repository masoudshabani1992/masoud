#!/usr/bin/env python3
"""Generate legacy launcher PNGs (for API < 26) with pure stdlib (no Pillow).

Design mirrors res/drawable/ic_launcher_foreground.xml:
green background, white leaf circle, green inner circle, white veins.

Usage: python3 tools/make_launcher_icons.py
"""
import math
import os
import struct
import zlib

GREEN = (47, 125, 68, 255)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}


def write_png(path, size, pixels):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(
        b"\x00" + b"".join(struct.pack("4B", *px) for px in row) for row in pixels
    )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def sample(u, v, round_icon):
    """Color of normalized point (u, v) in [0, 1)."""
    c = 0.5
    if round_icon:
        if math.hypot(u - c, v - c) > 0.48:
            return TRANSPARENT
        color = GREEN
        r_white, r_green = 0.34, 0.26
    else:
        # Rounded-rect background, radius ~22%.
        r = 0.22
        qx = min(max(u, r), 1 - r)
        qy = min(max(v, r), 1 - r)
        if math.hypot(u - qx, v - qy) > r:
            return TRANSPARENT
        color = GREEN
        r_white, r_green = 0.36, 0.28

    d = math.hypot(u - c, v - c)
    if d <= r_white:
        color = WHITE
    if d <= r_green:
        color = GREEN

    # Veins (only inside the green leaf).
    if d <= r_green:
        veins = [
            ((c, 0.32), (c, 0.68), 0.020),
            ((c, 0.44), (c + 0.105, 0.375), 0.015),
            ((c, 0.52), (c + 0.105, 0.455), 0.015),
            ((c, 0.44), (c - 0.105, 0.375), 0.015),
            ((c, 0.52), (c - 0.105, 0.455), 0.015),
        ]
        for (ax, ay), (bx, by), w in veins:
            if seg_dist(u, v, ax, ay, bx, by) <= w:
                color = WHITE
                break
    return color


def render(size, round_icon, ss=3):
    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    u = (x + (sx + 0.5) / ss) / size
                    v = (y + (sy + 0.5) / ss) / size
                    col = sample(u, v, round_icon)
                    for i in range(4):
                        acc[i] += col[i]
            n = ss * ss
            row.append(tuple(int(round(v / n)) for v in acc))
        pixels.append(row)
    return pixels


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    res = os.path.join(root, "app", "src", "main", "res")
    for density, size in DENSITIES.items():
        for name, round_icon in (("ic_launcher.png", False), ("ic_launcher_round.png", True)):
            path = os.path.join(res, f"mipmap-{density}", name)
            print(f"rendering {density}/{name} ({size}px)...", flush=True)
            write_png(path, size, render(size, round_icon))
    print("done.")


if __name__ == "__main__":
    main()
