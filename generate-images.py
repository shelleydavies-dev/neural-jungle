#!/usr/bin/env python3
"""Generate atmospheric SVG images for Neural Jungle article pages."""

import random
import math
import os

OUT_DIR = "assets/images"

def rand(lo, hi):
    return lo + random.random() * (hi - lo)

def neural_nodes(count, x_range, y_range, color, opacity_range=(0.3, 0.8), size_range=(1.5, 4)):
    """Generate glowing neural nodes."""
    nodes = []
    positions = []
    for _ in range(count):
        x = rand(*x_range)
        y = rand(*y_range)
        r = rand(*size_range)
        op = rand(*opacity_range)
        positions.append((x, y))
        nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{color}" opacity="{op:.2f}"/>')
        # glow
        nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*3:.1f}" fill="{color}" opacity="{op*0.15:.3f}"/>')
    return nodes, positions

def neural_connections(positions, color, max_dist=200, opacity=0.15, count_limit=None):
    """Draw curved connections between nearby nodes."""
    lines = []
    drawn = 0
    for i, (x1, y1) in enumerate(positions):
        for j, (x2, y2) in enumerate(positions):
            if j <= i:
                continue
            dist = math.sqrt((x2-x1)**2 + (y2-y1)**2)
            if dist < max_dist and random.random() < 0.4:
                cx = (x1+x2)/2 + rand(-40, 40)
                cy = (y1+y2)/2 + rand(-40, 40)
                op = opacity * (1 - dist/max_dist)
                lines.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="{color}" stroke-width="0.8" fill="none" opacity="{op:.3f}"/>')
                drawn += 1
                if count_limit and drawn >= count_limit:
                    return lines
    return lines

def organic_shapes(count, vw, vh, colors, opacity_range=(0.02, 0.08)):
    """Generate abstract organic blob shapes."""
    shapes = []
    for _ in range(count):
        cx, cy = rand(0, vw), rand(0, vh)
        rx, ry = rand(40, 200), rand(40, 200)
        color = random.choice(colors)
        op = rand(*opacity_range)
        rot = rand(0, 360)
        shapes.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{color}" opacity="{op:.2f}" transform="rotate({rot:.0f} {cx:.0f} {cy:.0f})"/>')
    return shapes

def tree_lines(count, vw, vh, color="#1a3a18", opacity_range=(0.1, 0.3)):
    """Vertical tree trunk / vine lines."""
    lines = []
    for _ in range(count):
        x = rand(0, vw)
        y1 = rand(0, vh*0.3)
        y2 = rand(vh*0.5, vh)
        sway = rand(-30, 30)
        op = rand(*opacity_range)
        sw = rand(1, 4)
        lines.append(f'<path d="M{x:.0f},{y1:.0f} Q{x+sway:.0f},{(y1+y2)/2:.0f} {x+sway*0.5:.0f},{y2:.0f}" stroke="{color}" stroke-width="{sw:.1f}" fill="none" opacity="{op:.2f}"/>')
    return lines

def light_rays(count, origin_x, origin_y, vh, color="#c8e080", opacity=0.04):
    """Volumetric light rays from a point."""
    rays = []
    for _ in range(count):
        angle = rand(-0.8, 0.8)
        length = rand(200, vh)
        width = rand(20, 80)
        x2 = origin_x + math.sin(angle) * length
        y2 = origin_y + math.cos(angle) * length
        op = rand(opacity*0.5, opacity*1.5)
        rays.append(f'<line x1="{origin_x:.0f}" y1="{origin_y:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="{color}" stroke-width="{width:.0f}" opacity="{op:.3f}" stroke-linecap="round"/>')
    return rays

def make_svg(width, height, elements, bg_gradient=None):
    """Wrap elements in an SVG."""
    if bg_gradient is None:
        bg_gradient = [("#141e18", 0), ("#1a2a1e", 50), ("#141e18", 100)]

    grad_stops = "\n".join(f'      <stop offset="{off}%" stop-color="{c}"/>' for c, off in bg_gradient)

    els = "\n  ".join(elements)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
{grad_stops}
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c8e080" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#c8e080" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5ba8c8" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#5ba8c8" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur1"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  <rect width="{width}" height="{height}" fill="url(#bg)"/>
  {els}
</svg>'''


# ===== IMAGE GENERATORS =====

def img_hero_brain_rainforest():
    """Guides hero: brain-shaped canopy with neural glow."""
    w, h = 1600, 900
    els = []
    # Deep jungle layers
    els += organic_shapes(15, w, h, ["#1a2a1e", "#122414", "#1a3018"], (0.1, 0.4))
    # Brain outline (rough ellipse of foliage)
    els.append('<ellipse cx="800" cy="420" rx="340" ry="280" fill="#142010" opacity="0.6"/>')
    els.append('<ellipse cx="800" cy="420" rx="320" ry="260" fill="#1a2a14" opacity="0.4"/>')
    # Canopy texture
    els += organic_shapes(20, w, h, ["#1a3a18", "#1d4020", "#162e14"], (0.05, 0.2))
    # Neural network inside brain area
    nodes, pos = neural_nodes(45, (480, 1120), (180, 660), "#c8e060", (0.3, 0.8), (1.5, 3.5))
    els += neural_connections(pos, "#8abf40", 180, 0.12)
    els += nodes
    # Golden glow center
    els.append('<ellipse cx="800" cy="400" rx="200" ry="160" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Light rays from top
    els += light_rays(8, 800, -50, h, "#d4e890", 0.03)
    # Vine lines
    els += tree_lines(12, w, h, "#1a3a18", (0.08, 0.2))
    # Floating particles
    for _ in range(30):
        x, y = rand(0, w), rand(0, h)
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="1" fill="#c8e060" opacity="{rand(0.1, 0.5):.2f}"/>')
    return make_svg(w, h, els, [("#141e18", 0), ("#1a2a1a", 40), ("#141e18", 100)])

def img_overgrown_trail():
    """Diptych left: dark overgrown path."""
    w, h = 800, 600
    els = []
    els += organic_shapes(12, w, h, ["#101a12", "#141e18", "#182618"], (0.2, 0.6))
    # Dense vine tangle
    els += tree_lines(20, w, h, "#1a2a18", (0.15, 0.4))
    for _ in range(15):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = rand(0, w), rand(0, h)
        cx, cy = rand(0, w), rand(0, h)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#1a2a15" stroke-width="{rand(1,5):.1f}" fill="none" opacity="{rand(0.1, 0.3):.2f}"/>')
    # Very dim neural traces
    nodes, pos = neural_nodes(8, (100, 700), (100, 500), "#4a6a3a", (0.1, 0.2), (1, 2))
    els += nodes
    # Darkness gradient overlay
    els.append('<rect width="800" height="600" fill="#141e18" opacity="0.3"/>')
    return make_svg(w, h, els, [("#101a12", 0), ("#141e18", 50), ("#0e160e", 100)])

def img_clearing_path():
    """Diptych right: clear path with light."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#1a2a1e", "#142014"], (0.1, 0.3))
    # Tree trunks on sides
    els += tree_lines(6, w, h, "#1a3a18", (0.1, 0.25))
    # Light rays from center-top
    els += light_rays(12, 400, -20, h, "#d4e890", 0.05)
    els += light_rays(6, 400, -20, h, "#f0f4c0", 0.02)
    # Central glow
    els.append('<ellipse cx="400" cy="250" rx="250" ry="200" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Neural paths along trees
    nodes, pos = neural_nodes(25, (100, 700), (50, 550), "#c8e060", (0.3, 0.7), (1.5, 3))
    els += neural_connections(pos, "#8abf40", 150, 0.15)
    els += nodes
    # Ground moss glow
    els.append('<ellipse cx="400" cy="550" rx="350" ry="60" fill="#2a4a20" opacity="0.2" filter="url(#blur2)"/>')
    return make_svg(w, h, els, [("#1a2a1a", 0), ("#142014", 50), ("#1a2a1e", 100)])

def img_canopy_light():
    """Sunlight through canopy onto forest floor."""
    w, h = 1600, 900
    els = []
    # Canopy blobs at top
    for _ in range(20):
        x = rand(0, w)
        y = rand(-50, 350)
        rx, ry = rand(60, 200), rand(40, 120)
        els.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="#1a2a1e" opacity="{rand(0.3, 0.7):.2f}"/>')
    # Light shafts
    els += light_rays(15, 800, -30, h, "#d4e890", 0.04)
    els += light_rays(8, 750, -30, h, "#f0f4c0", 0.02)
    # Central illumination
    els.append('<ellipse cx="800" cy="500" rx="400" ry="250" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Neural traces on tree roots (bottom)
    nodes, pos = neural_nodes(35, (200, 1400), (500, 850), "#c8e060", (0.2, 0.6), (1, 3))
    els += neural_connections(pos, "#a0c840", 200, 0.1)
    els += nodes
    # Tree trunks
    els += tree_lines(10, w, h, "#1a3a18", (0.1, 0.3))
    # Moss floor
    els.append(f'<rect x="0" y="700" width="{w}" height="200" fill="#1a2a1a" opacity="0.4"/>')
    return make_svg(w, h, els, [("#0e160e", 0), ("#1a2a1a", 30), ("#141e18", 100)])

def img_beginners_jungle_neurons():
    """Dense jungle with neural dendrite vines."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(12, w, h, ["#1a2a1e", "#122014", "#1a3018"], (0.1, 0.35))
    # Dense vine network that looks neural
    for _ in range(25):
        x1 = rand(0, w)
        y1 = rand(0, h*0.4)
        segments = random.randint(3, 6)
        path = f"M{x1:.0f},{y1:.0f}"
        cx, cy = x1, y1
        for _ in range(segments):
            nx = cx + rand(-100, 100)
            ny = cy + rand(50, 150)
            qx = (cx+nx)/2 + rand(-40, 40)
            qy = (cy+ny)/2 + rand(-20, 20)
            path += f" Q{qx:.0f},{qy:.0f} {nx:.0f},{ny:.0f}"
            cx, cy = nx, ny
        els.append(f'<path d="{path}" stroke="#1d3a18" stroke-width="{rand(1,3):.1f}" fill="none" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Synaptic nodes at junctions
    nodes, pos = neural_nodes(40, (100, 1500), (50, 850), "#c8e060", (0.3, 0.8), (1.5, 4))
    els += neural_connections(pos, "#8abf40", 180, 0.12)
    els += nodes
    # Ambient glow
    els.append('<ellipse cx="800" cy="450" rx="500" ry="300" fill="url(#glow1)" filter="url(#blur3)" opacity="0.5"/>')
    return make_svg(w, h, els)

def img_field_guide_plants():
    """Diverse plants with different colored bioluminescence."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(10, w, h, ["#1a2a1e", "#122414"], (0.1, 0.3))
    # Plant groups with different glow colors
    colors = ["#c8e060", "#5ba8c8", "#9b7ecb", "#e8a44a", "#60c890"]
    for i, color in enumerate(colors):
        cx = 160 + i * 320
        cy = rand(300, 600)
        # Stem
        els.append(f'<path d="M{cx},{h} Q{cx+rand(-20,20):.0f},{cy+100:.0f} {cx},{cy:.0f}" stroke="#1a3018" stroke-width="3" fill="none" opacity="0.3"/>')
        # Fronds / leaves
        for _ in range(random.randint(3, 6)):
            angle = rand(-1.5, 1.5)
            length = rand(40, 120)
            lx = cx + math.sin(angle) * length
            ly = cy - abs(math.cos(angle)) * length
            els.append(f'<path d="M{cx},{cy:.0f} Q{(cx+lx)/2+rand(-20,20):.0f},{(cy+ly)/2:.0f} {lx:.0f},{ly:.0f}" stroke="#1a4018" stroke-width="2" fill="none" opacity="0.25"/>')
        # Bioluminescent nodes
        for _ in range(random.randint(4, 8)):
            nx = cx + rand(-80, 80)
            ny = cy + rand(-80, 40)
            r = rand(1.5, 4)
            els.append(f'<circle cx="{nx:.0f}" cy="{ny:.0f}" r="{r:.1f}" fill="{color}" opacity="{rand(0.4, 0.8):.2f}"/>')
            els.append(f'<circle cx="{nx:.0f}" cy="{ny:.0f}" r="{r*4:.1f}" fill="{color}" opacity="{rand(0.03, 0.1):.3f}" filter="url(#blur1)"/>')
    # Ground
    els.append(f'<rect x="0" y="750" width="{w}" height="150" fill="#182618" opacity="0.5"/>')
    return make_svg(w, h, els)

def img_set_explorer():
    """Silhouette at jungle entrance with neural glow."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#141e18", "#182618"], (0.2, 0.5))
    # Mist
    els.append('<ellipse cx="400" cy="300" rx="350" ry="200" fill="#1a2a18" opacity="0.15" filter="url(#blur3)"/>')
    # Tree lines framing
    els += tree_lines(8, w, h, "#1a3018", (0.1, 0.3))
    # Figure silhouette (simple)
    els.append('<path d="M380,600 L380,420 Q380,380 400,370 Q420,380 420,420 L420,600" fill="#0e160e" opacity="0.7"/>')
    els.append('<circle cx="400" cy="355" r="18" fill="#0e160e" opacity="0.7"/>')
    # Neural glow within figure
    els.append('<circle cx="400" cy="380" r="8" fill="#c8e060" opacity="0.3"/>')
    els.append('<circle cx="400" cy="380" r="25" fill="#c8e060" opacity="0.05" filter="url(#blur2)"/>')
    # Faint neural lines
    nodes, pos = neural_nodes(10, (350, 450), (350, 450), "#c8e060", (0.1, 0.3), (0.5, 1.5))
    els += neural_connections(pos, "#c8e060", 80, 0.08)
    els += nodes
    # Path ahead
    els += light_rays(5, 400, 100, 400, "#d4e890", 0.02)
    return make_svg(w, h, els, [("#101a12", 0), ("#1a2a1e", 50), ("#141e18", 100)])

def img_setting_clearing():
    """Calm sunlit clearing with neural moss."""
    w, h = 800, 600
    els = []
    els += organic_shapes(6, w, h, ["#1a2a1e", "#142014"], (0.08, 0.2))
    # Warm light
    els += light_rays(10, 400, -20, h, "#e8d880", 0.04)
    els.append('<ellipse cx="400" cy="280" rx="250" ry="180" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Moss patterns on ground (neural circuit shapes)
    nodes, pos = neural_nodes(20, (100, 700), (380, 560), "#60c860", (0.2, 0.5), (1, 2.5))
    els += neural_connections(pos, "#40a840", 120, 0.12)
    els += nodes
    # Gentle tree framing
    els += tree_lines(4, w, h, "#1a3a18", (0.08, 0.2))
    return make_svg(w, h, els, [("#1a2a1a", 0), ("#142014", 40), ("#1a2a1e", 100)])

def img_depression_dark():
    """Dark oppressive forest, dying neural paths."""
    w, h = 1600, 900
    els = []
    # Very dark layers
    els += organic_shapes(15, w, h, ["#0e160e", "#101a12", "#141e18"], (0.2, 0.6))
    # Dense tangled branches
    for _ in range(30):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = rand(0, w), rand(0, h)
        cx, cy = rand(0, w), rand(0, h)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#121e10" stroke-width="{rand(1,4):.1f}" fill="none" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Dying dim neural paths
    nodes, pos = neural_nodes(15, (200, 1400), (200, 700), "#3a5a2a", (0.08, 0.2), (1, 2))
    els += neural_connections(pos, "#2a3a20", 250, 0.06)
    els += nodes
    # Heavy darkness overlay
    els.append(f'<rect width="{w}" height="{h}" fill="#141e18" opacity="0.4"/>')
    return make_svg(w, h, els, [("#0c1408", 0), ("#101a12", 50), ("#0c1408", 100)])

def img_depression_clearing():
    """Light breaking through with new neural pathways."""
    w, h = 1600, 900
    els = []
    # Dark canopy top half
    els += organic_shapes(12, w, h, ["#141e18", "#182618"], (0.15, 0.4))
    # Dramatic light break
    els += light_rays(18, 800, -50, h, "#d4e890", 0.05)
    els += light_rays(8, 820, -30, h, "#f0f4c0", 0.03)
    # Bright center glow
    els.append('<ellipse cx="800" cy="350" rx="300" ry="250" fill="url(#glow1)" filter="url(#blur3)"/>')
    # New green shoots
    for _ in range(8):
        x = rand(400, 1200)
        y2 = rand(500, 800)
        y1 = y2 + rand(50, 150)
        els.append(f'<path d="M{x:.0f},{y1:.0f} Q{x+rand(-15,15):.0f},{(y1+y2)/2:.0f} {x+rand(-10,10):.0f},{y2:.0f}" stroke="#40a040" stroke-width="1.5" fill="none" opacity="0.3"/>')
    # Vibrant neural network where light hits
    nodes, pos = neural_nodes(35, (400, 1200), (200, 700), "#c8e060", (0.4, 0.9), (1.5, 4))
    els += neural_connections(pos, "#a0d040", 200, 0.15)
    els += nodes
    # Contrast: dark edges
    els.append(f'<rect x="0" y="0" width="250" height="{h}" fill="#141e18" opacity="0.3"/>')
    els.append(f'<rect x="1350" y="0" width="250" height="{h}" fill="#141e18" opacity="0.3"/>')
    return make_svg(w, h, els, [("#101a12", 0), ("#1a2a1e", 40), ("#141e18", 100)])

def img_creativity_fog():
    """Dense fog in forest, obscured paths."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(8, w, h, ["#1a2a1e", "#122414"], (0.1, 0.25))
    # Tree silhouettes
    els += tree_lines(10, w, h, "#162e14", (0.1, 0.25))
    # Heavy fog layers
    for i in range(6):
        y = 150 + i * 120
        els.append(f'<ellipse cx="{rand(200,1400):.0f}" cy="{y}" rx="{rand(400,700):.0f}" ry="{rand(60,120):.0f}" fill="#1a2a18" opacity="{rand(0.05, 0.15):.3f}" filter="url(#blur3)"/>')
    # Ghostly neural outlines dissolving into mist
    nodes, pos = neural_nodes(20, (200, 1400), (200, 700), "#4a6a3a", (0.05, 0.15), (1, 2.5))
    els += neural_connections(pos, "#3a5a2a", 200, 0.05)
    els += nodes
    # Fog overlay
    els.append(f'<rect width="{w}" height="{h}" fill="#1a2a1e" opacity="0.25"/>')
    return make_svg(w, h, els, [("#141e18", 0), ("#1a2a1e", 50), ("#141e18", 100)])

def img_looking_up():
    """Looking up through canopy — expansive, neural branches."""
    w, h = 800, 600
    els = []
    # Bright center (sky)
    els.append('<ellipse cx="400" cy="300" rx="300" ry="250" fill="#142014" opacity="0.3"/>')
    els.append('<ellipse cx="400" cy="300" rx="180" ry="150" fill="#1a3018" opacity="0.2"/>')
    # Radial branches from edges
    for _ in range(20):
        angle = rand(0, math.pi*2)
        r1 = rand(250, 400)
        r2 = rand(50, 200)
        x1 = 400 + math.cos(angle) * r1
        y1 = 300 + math.sin(angle) * r1
        x2 = 400 + math.cos(angle) * r2
        y2 = 300 + math.sin(angle) * r2
        cx = (x1+x2)/2 + rand(-30, 30)
        cy = (y1+y2)/2 + rand(-30, 30)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#1a3018" stroke-width="{rand(2,6):.1f}" fill="none" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Bright center light
    els += light_rays(6, 400, 300, 300, "#e8d880", 0.03)
    els.append('<ellipse cx="400" cy="300" rx="100" ry="80" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Neural nodes at branch points
    nodes, pos = neural_nodes(25, (100, 700), (50, 550), "#c8e060", (0.4, 0.8), (2, 4))
    els += nodes
    return make_svg(w, h, els, [("#1a2a1e", 0), ("#142014", 50), ("#1a2a1e", 100)])

def img_looking_down():
    """Looking down at tangled vines — ruts."""
    w, h = 800, 600
    els = []
    els += organic_shapes(10, w, h, ["#101a12", "#141e18"], (0.2, 0.5))
    # Loop patterns (circular vine ruts)
    for _ in range(8):
        cx, cy = rand(100, 700), rand(100, 500)
        rx, ry = rand(30, 100), rand(20, 80)
        els.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" stroke="#1a2a15" stroke-width="{rand(1,3):.1f}" fill="none" opacity="{rand(0.1, 0.25):.2f}"/>')
    # Dense tangles
    for _ in range(20):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = x1+rand(-150, 150), y1+rand(-150, 150)
        cx, cy = (x1+x2)/2+rand(-50, 50), (y1+y2)/2+rand(-50, 50)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#162a12" stroke-width="{rand(0.5, 2.5):.1f}" fill="none" opacity="{rand(0.1, 0.3):.2f}"/>')
    # Dark mood
    els.append(f'<rect width="{w}" height="{h}" fill="#141e18" opacity="0.2"/>')
    return make_svg(w, h, els, [("#101a12", 0), ("#141e18", 50), ("#0e160e", 100)])

def img_morning_forest():
    """Morning light, subtle neural filaments."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(8, w, h, ["#1a2a1e", "#142014"], (0.08, 0.25))
    # Tall trees
    els += tree_lines(8, w, h, "#1a3a18", (0.1, 0.25))
    # Warm golden morning light
    els += light_rays(15, 1100, -30, h, "#e8d880", 0.04)
    els += light_rays(8, 1050, -20, h, "#f0e8a0", 0.02)
    # Morning mist
    for i in range(4):
        y = 400 + i * 100
        els.append(f'<ellipse cx="{rand(400,1200):.0f}" cy="{y}" rx="{rand(300,500):.0f}" ry="{rand(40,80):.0f}" fill="#1a3018" opacity="{rand(0.03, 0.08):.3f}" filter="url(#blur3)"/>')
    # Delicate floating neural filaments
    nodes, pos = neural_nodes(30, (300, 1300), (200, 700), "#c8e060", (0.15, 0.4), (0.8, 2))
    els += neural_connections(pos, "#a0c840", 250, 0.06)
    els += nodes
    # Right side glow
    els.append('<ellipse cx="1100" cy="400" rx="350" ry="300" fill="url(#glow1)" filter="url(#blur3)" opacity="0.6"/>')
    return make_svg(w, h, els, [("#141e18", 0), ("#1a2a1a", 40), ("#141e18", 100)])

def img_microdosing_expedition():
    """Deep jungle expedition — dramatic scale."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#1a2a1e", "#122414"], (0.15, 0.4))
    # Large tree trunks
    for x in [100, 250, 550, 700]:
        sway = rand(-20, 20)
        wid = rand(8, 15)
        els.append(f'<path d="M{x},600 Q{x+sway:.0f},300 {x+sway*0.5:.0f},-20" stroke="#1a3018" stroke-width="{wid:.0f}" fill="none" opacity="0.3"/>')
    # Bright neural blazes on cut vines
    nodes, pos = neural_nodes(20, (150, 650), (100, 500), "#e8c040", (0.5, 0.9), (2, 5))
    els += neural_connections(pos, "#c8a030", 150, 0.2)
    els += nodes
    # Path through center
    els.append('<path d="M350,600 Q400,400 420,200 Q430,100 400,-20" stroke="#2a4a20" stroke-width="30" fill="none" opacity="0.08"/>')
    return make_svg(w, h, els, [("#101a12", 0), ("#1a2a1e", 50), ("#141e18", 100)])

def img_microdosing_tending():
    """Gentle moss and tiny ferns with miniature neural net."""
    w, h = 800, 600
    els = []
    # Soft ground
    els.append(f'<rect width="{w}" height="{h}" fill="#182618"/>')
    els += organic_shapes(8, w, h, ["#122014", "#1a2a18", "#1a2a1a"], (0.1, 0.3))
    # Tiny mushrooms
    for _ in range(6):
        x = rand(100, 700)
        y = rand(300, 550)
        h_stem = rand(15, 35)
        w_cap = rand(10, 20)
        els.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x:.0f}" y2="{y-h_stem:.0f}" stroke="#2a4a28" stroke-width="2" opacity="0.3"/>')
        els.append(f'<ellipse cx="{x:.0f}" cy="{y-h_stem:.0f}" rx="{w_cap:.0f}" ry="{w_cap*0.5:.0f}" fill="#1a3a20" opacity="0.3"/>')
        # Tiny glow
        els.append(f'<circle cx="{x:.0f}" cy="{y-h_stem:.0f}" r="3" fill="#c8e060" opacity="0.4"/>')
        els.append(f'<circle cx="{x:.0f}" cy="{y-h_stem:.0f}" r="10" fill="#c8e060" opacity="0.06" filter="url(#blur1)"/>')
    # Hair-thin neural filaments
    nodes, pos = neural_nodes(25, (50, 750), (250, 580), "#60c860", (0.15, 0.4), (0.5, 1.5))
    els += neural_connections(pos, "#40a840", 100, 0.1)
    els += nodes
    # Soft diffused light
    els.append('<ellipse cx="400" cy="250" rx="350" ry="200" fill="url(#glow1)" filter="url(#blur3)" opacity="0.3"/>')
    return make_svg(w, h, els, [("#182618", 0), ("#1a2a1e", 50), ("#141e18", 100)])

def img_safety_rugged():
    """Rugged steep terrain with warning-colored neural paths."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(10, w, h, ["#141e18", "#182618"], (0.15, 0.4))
    # Rocky ground shapes
    for _ in range(12):
        x = rand(0, w)
        y = rand(400, 850)
        points = []
        for j in range(random.randint(4, 7)):
            px = x + rand(-80, 80)
            py = y + rand(-40, 40)
            points.append(f"{px:.0f},{py:.0f}")
        els.append(f'<polygon points="{" ".join(points)}" fill="#121e10" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Exposed roots (thick)
    for _ in range(10):
        x1 = rand(0, w)
        y1 = rand(350, 550)
        x2 = x1 + rand(-200, 200)
        y2 = rand(550, 850)
        cx = (x1+x2)/2 + rand(-60, 60)
        cy = (y1+y2)/2
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#1a2a15" stroke-width="{rand(3,8):.1f}" fill="none" opacity="{rand(0.15, 0.3):.2f}"/>')
    # Warning amber neural traces
    nodes, pos = neural_nodes(25, (200, 1400), (350, 800), "#e8a44a", (0.3, 0.7), (1.5, 3.5))
    els += neural_connections(pos, "#c88030", 200, 0.12)
    els += nodes
    # Danger atmosphere
    els.append(f'<rect width="{w}" height="{h}" fill="#141210" opacity="0.15"/>')
    return make_svg(w, h, els, [("#121c14", 0), ("#141e18", 50), ("#101a12", 100)])

def img_safety_maintained():
    """Well-maintained trail with golden-green neural guideposts."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(6, w, h, ["#1a2a1e", "#142014"], (0.08, 0.2))
    # Tall trees
    for x in [200, 450, 1150, 1400]:
        els.append(f'<path d="M{x},-20 L{x+rand(-5,5):.0f},920" stroke="#1a3a18" stroke-width="{rand(6,12):.0f}" fill="none" opacity="0.2"/>')
    # Clear path through center
    els.append('<path d="M600,900 Q780,600 800,300 Q810,100 800,-20" stroke="#1a2a18" stroke-width="80" fill="none" opacity="0.06"/>')
    # Golden-green guidepost nodes along trail
    trail_nodes = []
    for i in range(12):
        t = i / 11
        x = 600 + (800-600)*t + rand(-20, 20) + (200 * t * (1-t)) * (1 if i%2==0 else -1) * 0.5
        y = 850 - t * 870
        r = rand(2, 4)
        trail_nodes.append((x, y))
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="#c8e060" opacity="0.6"/>')
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r*4:.1f}" fill="#c8e060" opacity="0.08" filter="url(#blur1)"/>')
    # Connections along trail
    for i in range(len(trail_nodes)-1):
        x1, y1 = trail_nodes[i]
        x2, y2 = trail_nodes[i+1]
        cx = (x1+x2)/2 + rand(-15, 15)
        cy = (y1+y2)/2 + rand(-15, 15)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#a0c840" stroke-width="0.8" fill="none" opacity="0.2"/>')
    # Gentle overhead light
    els += light_rays(8, 800, -30, h, "#d4e890", 0.03)
    els.append('<ellipse cx="800" cy="300" rx="300" ry="250" fill="url(#glow1)" filter="url(#blur3)" opacity="0.4"/>')
    return make_svg(w, h, els, [("#1a2a1a", 0), ("#1a2a1e", 50), ("#141e18", 100)])

def img_legal_aerial():
    """Aerial view of forest with clearings and neural patterns."""
    w, h = 1600, 900
    els = []
    # Dense canopy base (top-down view)
    for _ in range(60):
        x, y = rand(0, w), rand(0, h)
        r = rand(20, 80)
        shade = random.choice(["#1a2a1e", "#122014", "#1a3018", "#142010"])
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{shade}" opacity="{rand(0.15, 0.4):.2f}"/>')
    # Clearings (lighter patches)
    clearings = [(400, 350, 120, 90), (1000, 500, 150, 100), (700, 200, 80, 60), (1300, 300, 100, 70)]
    for cx, cy, rx, ry in clearings:
        els.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#1a3018" opacity="0.3"/>')
        els.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx*0.6:.0f}" ry="{ry*0.6:.0f}" fill="#c8e060" opacity="0.04" filter="url(#blur2)"/>')
    # River cutting through
    els.append('<path d="M0,450 Q200,420 400,460 Q600,500 800,440 Q1000,380 1200,420 Q1400,460 1600,430" stroke="#1a3a28" stroke-width="12" fill="none" opacity="0.15"/>')
    # Golden neural network in clearings
    nodes, pos = neural_nodes(35, (200, 1400), (100, 800), "#c8e060", (0.3, 0.7), (1.5, 3))
    els += neural_connections(pos, "#a0c840", 250, 0.1)
    els += nodes
    return make_svg(w, h, els, [("#141e18", 0), ("#182618", 50), ("#141e18", 100)])


# ===== GENERATE ALL IMAGES =====

random.seed(42)  # Reproducible

images = {
    "guides-hero-brain-rainforest": img_hero_brain_rainforest,
    "guides-overgrown-trail": img_overgrown_trail,
    "guides-clearing-path": img_clearing_path,
    "guides-canopy-light": img_canopy_light,
    "beginners-jungle-neurons": img_beginners_jungle_neurons,
    "beginners-field-guide-plants": img_field_guide_plants,
    "beginners-set-explorer": img_set_explorer,
    "beginners-setting-clearing": img_setting_clearing,
    "depression-dark-forest": img_depression_dark,
    "depression-clearing-light": img_depression_clearing,
    "creativity-fog-forest": img_creativity_fog,
    "creativity-looking-up": img_looking_up,
    "creativity-looking-down": img_looking_down,
    "creativity-morning-forest": img_morning_forest,
    "microdosing-expedition": img_microdosing_expedition,
    "microdosing-tending": img_microdosing_tending,
    "safety-rugged-terrain": img_safety_rugged,
    "safety-maintained-trail": img_safety_maintained,
    "legal-aerial-forest": img_legal_aerial,
}

os.makedirs(OUT_DIR, exist_ok=True)

for name, gen_fn in images.items():
    svg = gen_fn()
    path = os.path.join(OUT_DIR, f"{name}.svg")
    with open(path, "w") as f:
        f.write(svg)
    print(f"  Created {path}")

print(f"\nDone — {len(images)} images generated.")
