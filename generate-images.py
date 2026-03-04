#!/usr/bin/env python3
"""Generate vibrant jungle SVG images for Neural Jungle article pages."""

import random
import math
import os

OUT_DIR = "assets/images"

def rand(lo, hi):
    return lo + random.random() * (hi - lo)

def neural_nodes(count, x_range, y_range, color, opacity_range=(0.4, 0.9), size_range=(1.5, 4)):
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
        nodes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*3:.1f}" fill="{color}" opacity="{op*0.2:.3f}"/>')
    return nodes, positions

def neural_connections(positions, color, max_dist=200, opacity=0.25, count_limit=None):
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
                lines.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="{color}" stroke-width="1" fill="none" opacity="{op:.3f}"/>')
                drawn += 1
                if count_limit and drawn >= count_limit:
                    return lines
    return lines

def organic_shapes(count, vw, vh, colors, opacity_range=(0.05, 0.2)):
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

def tree_lines(count, vw, vh, color="#3a3422", opacity_range=(0.15, 0.45)):
    """Vertical tree trunk / vine lines."""
    lines = []
    for _ in range(count):
        x = rand(0, vw)
        y1 = rand(0, vh*0.3)
        y2 = rand(vh*0.5, vh)
        sway = rand(-30, 30)
        op = rand(*opacity_range)
        sw = rand(1.5, 5)
        lines.append(f'<path d="M{x:.0f},{y1:.0f} Q{x+sway:.0f},{(y1+y2)/2:.0f} {x+sway*0.5:.0f},{y2:.0f}" stroke="{color}" stroke-width="{sw:.1f}" fill="none" opacity="{op:.2f}"/>')
    return lines

def light_rays(count, origin_x, origin_y, vh, color="#e8d060", opacity=0.07):
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
        bg_gradient = [("#1a1a14", 0), ("#22201a", 50), ("#1a1a14", 100)]

    grad_stops = "\n".join(f'      <stop offset="{off}%" stop-color="{c}"/>' for c, off in bg_gradient)

    els = "\n  ".join(elements)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
{grad_stops}
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8d060" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#b89b3e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#b89b3e" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#b89b3e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8b840" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#e8b840" stop-opacity="0"/>
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
    # Deep jungle layers - rich greens
    els += organic_shapes(15, w, h, ["#2a2820", "#2e2c22", "#383428", "#24221a"], (0.15, 0.5))
    # Brain outline (rough ellipse of foliage)
    els.append('<ellipse cx="800" cy="420" rx="340" ry="280" fill="#22201a" opacity="0.7"/>')
    els.append('<ellipse cx="800" cy="420" rx="320" ry="260" fill="#2c2a1e" opacity="0.5"/>')
    # Canopy texture - lush greens
    els += organic_shapes(20, w, h, ["#3a3828", "#3e3c2a", "#2a2a1e", "#343222"], (0.08, 0.3))
    # Golden light glow center
    els.append('<ellipse cx="800" cy="380" rx="250" ry="200" fill="url(#glowGold)" filter="url(#blur3)"/>')
    # Neural network inside brain area - vibrant green-gold
    nodes, pos = neural_nodes(50, (480, 1120), (180, 660), "#8a9040", (0.4, 0.9), (1.5, 4))
    els += neural_connections(pos, "#8a9040", 180, 0.2)
    els += nodes
    # Gold neural highlights
    gold_nodes, gold_pos = neural_nodes(15, (550, 1050), (250, 580), "#e8b840", (0.5, 0.9), (2, 5))
    els += gold_nodes
    # Light rays from top - warm golden
    els += light_rays(10, 800, -50, h, "#e8d060", 0.06)
    els += light_rays(5, 800, -50, h, "#f0e880", 0.03)
    # Vine lines - visible green
    els += tree_lines(12, w, h, "#3a3828", (0.12, 0.35))
    # Floating particles - mix of green and gold
    for _ in range(40):
        x, y = rand(0, w), rand(0, h)
        color = random.choice(["#8a9040", "#e8b840", "#b8b880", "#98a050"])
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rand(1,2.5):.1f}" fill="{color}" opacity="{rand(0.2, 0.7):.2f}"/>')
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 40), ("#1a1a14", 100)])

def img_overgrown_trail():
    """Diptych left: dark overgrown path."""
    w, h = 800, 600
    els = []
    els += organic_shapes(12, w, h, ["#14130e", "#1a1914", "#20201a"], (0.25, 0.6))
    # Dense vine tangle - deeper greens
    els += tree_lines(20, w, h, "#28261c", (0.2, 0.5))
    for _ in range(15):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = rand(0, w), rand(0, h)
        cx, cy = rand(0, w), rand(0, h)
        color = random.choice(["#28261c", "#2a281e", "#30301e"])
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="{color}" stroke-width="{rand(1.5,5):.1f}" fill="none" opacity="{rand(0.15, 0.4):.2f}"/>')
    # Dim neural traces - fading
    nodes, pos = neural_nodes(10, (100, 700), (100, 500), "#5a5838", (0.1, 0.3), (1, 2.5))
    els += nodes
    # Slight amber warning glow
    els.append('<ellipse cx="400" cy="300" rx="200" ry="150" fill="#8a5020" opacity="0.04" filter="url(#blur3)"/>')
    return make_svg(w, h, els, [("#12110e", 0), ("#1a1a14", 50), ("#12110e", 100)])

def img_clearing_path():
    """Diptych right: clear path with light."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#22201a", "#28261c"], (0.1, 0.35))
    # Tree trunks on sides - earthy brown-green
    els += tree_lines(6, w, h, "#3a3422", (0.15, 0.35))
    # Warm golden light rays from center-top
    els += light_rays(14, 400, -20, h, "#e8d060", 0.08)
    els += light_rays(8, 400, -20, h, "#f0e880", 0.04)
    # Central golden glow
    els.append('<ellipse cx="400" cy="250" rx="250" ry="200" fill="url(#glowGold)" filter="url(#blur3)"/>')
    els.append('<ellipse cx="400" cy="250" rx="150" ry="120" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Vibrant neural paths
    nodes, pos = neural_nodes(30, (100, 700), (50, 550), "#8a9040", (0.4, 0.85), (1.5, 3.5))
    els += neural_connections(pos, "#8a9040", 150, 0.25)
    els += nodes
    # Gold accents
    gold_nodes, _ = neural_nodes(8, (250, 550), (150, 400), "#e8b840", (0.5, 0.8), (2, 4))
    els += gold_nodes
    # Ground moss glow
    els.append('<ellipse cx="400" cy="550" rx="350" ry="60" fill="#3a3828" opacity="0.3" filter="url(#blur2)"/>')
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 50), ("#1a1a14", 100)])

def img_canopy_light():
    """Sunlight through canopy onto forest floor."""
    w, h = 1600, 900
    els = []
    # Canopy blobs at top - rich jungle greens
    for _ in range(20):
        x = rand(0, w)
        y = rand(-50, 350)
        rx, ry = rand(60, 200), rand(40, 120)
        color = random.choice(["#2a2820", "#2e2c22", "#24221a", "#343222"])
        els.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{color}" opacity="{rand(0.3, 0.6):.2f}"/>')
    # Golden light shafts
    els += light_rays(18, 800, -30, h, "#e8d060", 0.07)
    els += light_rays(10, 750, -30, h, "#f0e880", 0.04)
    # Central warm illumination
    els.append('<ellipse cx="800" cy="500" rx="400" ry="250" fill="url(#glowGold)" filter="url(#blur3)"/>')
    # Neural traces on tree roots
    nodes, pos = neural_nodes(40, (200, 1400), (500, 850), "#8a9040", (0.3, 0.8), (1, 3.5))
    els += neural_connections(pos, "#9a9850", 200, 0.2)
    els += nodes
    # Gold highlights
    gold_nodes, _ = neural_nodes(12, (400, 1200), (400, 700), "#e8b840", (0.4, 0.8), (2, 4))
    els += gold_nodes
    # Tree trunks - warm brown
    els += tree_lines(10, w, h, "#3a3424", (0.15, 0.4))
    # Moss floor - lush green
    els.append(f'<rect x="0" y="700" width="{w}" height="200" fill="#22201a" opacity="0.5"/>')
    return make_svg(w, h, els, [("#12110e", 0), ("#1a1a14", 30), ("#1a1a14", 100)])

def img_beginners_jungle_neurons():
    """Dense jungle with neural dendrite vines."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(12, w, h, ["#2a2820", "#2e2c22", "#383428"], (0.12, 0.4))
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
        color = random.choice(["#3a3828", "#3e3c2a", "#3a3422"])
        els.append(f'<path d="{path}" stroke="{color}" stroke-width="{rand(1.5,4):.1f}" fill="none" opacity="{rand(0.2, 0.45):.2f}"/>')
    # Synaptic nodes at junctions - vibrant
    nodes, pos = neural_nodes(45, (100, 1500), (50, 850), "#8a9040", (0.4, 0.9), (1.5, 4.5))
    els += neural_connections(pos, "#8a9040", 180, 0.2)
    els += nodes
    # Gold accent nodes
    gold_nodes, _ = neural_nodes(10, (300, 1300), (200, 700), "#e8b840", (0.5, 0.85), (2, 5))
    els += gold_nodes
    # Ambient glow - warm
    els.append('<ellipse cx="800" cy="450" rx="500" ry="300" fill="url(#glow1)" filter="url(#blur3)" opacity="0.6"/>')
    # Floating particles
    for _ in range(30):
        x, y = rand(0, w), rand(0, h)
        color = random.choice(["#8a9040", "#b8b880", "#e8b840"])
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rand(0.8,2):.1f}" fill="{color}" opacity="{rand(0.2, 0.6):.2f}"/>')
    return make_svg(w, h, els)

def img_field_guide_plants():
    """Diverse plants with different colored bioluminescence."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(10, w, h, ["#22201a", "#28261e"], (0.1, 0.35))
    # Plant groups with vibrant glow colors
    colors = ["#8a9040", "#b89b3e", "#a87ee0", "#e8b840", "#a0a060"]
    glow_colors = ["#8a9040", "#b89b3e", "#a87ee0", "#e8b840", "#a0a060"]
    for i, color in enumerate(colors):
        cx = 160 + i * 320
        cy = rand(300, 600)
        # Stem - visible green-brown
        els.append(f'<path d="M{cx},{h} Q{cx+rand(-20,20):.0f},{cy+100:.0f} {cx},{cy:.0f}" stroke="#3a3422" stroke-width="3" fill="none" opacity="0.45"/>')
        # Fronds / leaves - lush
        for _ in range(random.randint(3, 6)):
            angle = rand(-1.5, 1.5)
            length = rand(40, 120)
            lx = cx + math.sin(angle) * length
            ly = cy - abs(math.cos(angle)) * length
            els.append(f'<path d="M{cx},{cy:.0f} Q{(cx+lx)/2+rand(-20,20):.0f},{(cy+ly)/2:.0f} {lx:.0f},{ly:.0f}" stroke="#3a3828" stroke-width="2.5" fill="none" opacity="0.35"/>')
        # Bioluminescent nodes - bright!
        for _ in range(random.randint(5, 10)):
            nx = cx + rand(-80, 80)
            ny = cy + rand(-80, 40)
            r = rand(2, 5)
            els.append(f'<circle cx="{nx:.0f}" cy="{ny:.0f}" r="{r:.1f}" fill="{color}" opacity="{rand(0.5, 0.9):.2f}"/>')
            els.append(f'<circle cx="{nx:.0f}" cy="{ny:.0f}" r="{r*4:.1f}" fill="{color}" opacity="{rand(0.06, 0.18):.3f}" filter="url(#blur1)"/>')
    # Ground - moss green
    els.append(f'<rect x="0" y="750" width="{w}" height="150" fill="#22201a" opacity="0.6"/>')
    return make_svg(w, h, els)

def img_set_explorer():
    """Silhouette at jungle entrance with neural glow."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#1a1a14", "#201e18"], (0.2, 0.5))
    # Mist - warm
    els.append('<ellipse cx="400" cy="300" rx="350" ry="200" fill="#26241c" opacity="0.2" filter="url(#blur3)"/>')
    # Tree lines framing
    els += tree_lines(8, w, h, "#3a3422", (0.15, 0.4))
    # Figure silhouette
    els.append('<path d="M380,600 L380,420 Q380,380 400,370 Q420,380 420,420 L420,600" fill="#0e0d0a" opacity="0.8"/>')
    els.append('<circle cx="400" cy="355" r="18" fill="#0e0d0a" opacity="0.8"/>')
    # Vibrant neural glow within figure
    els.append('<circle cx="400" cy="380" r="10" fill="#8a9040" opacity="0.5"/>')
    els.append('<circle cx="400" cy="380" r="30" fill="#8a9040" opacity="0.1" filter="url(#blur2)"/>')
    els.append('<circle cx="400" cy="380" r="50" fill="#e8b840" opacity="0.05" filter="url(#blur3)"/>')
    # Neural lines radiating from figure
    nodes, pos = neural_nodes(12, (350, 450), (340, 440), "#8a9040", (0.3, 0.6), (0.8, 2))
    els += neural_connections(pos, "#8a9040", 80, 0.15)
    els += nodes
    # Path ahead - golden light
    els += light_rays(7, 400, 80, 400, "#e8d060", 0.05)
    els.append('<ellipse cx="400" cy="150" rx="150" ry="100" fill="url(#glowGold)" filter="url(#blur3)" opacity="0.6"/>')
    return make_svg(w, h, els, [("#12110e", 0), ("#1a1a14", 50), ("#1a1a14", 100)])

def img_setting_clearing():
    """Calm sunlit clearing with neural moss."""
    w, h = 800, 600
    els = []
    els += organic_shapes(6, w, h, ["#22201a", "#28261e"], (0.1, 0.3))
    # Warm golden light
    els += light_rays(12, 400, -20, h, "#e8c040", 0.07)
    els.append('<ellipse cx="400" cy="280" rx="250" ry="180" fill="url(#glowGold)" filter="url(#blur3)"/>')
    els.append('<ellipse cx="400" cy="280" rx="150" ry="120" fill="url(#glow1)" filter="url(#blur3)"/>')
    # Moss patterns on ground (neural circuit shapes) - lush
    nodes, pos = neural_nodes(25, (100, 700), (380, 560), "#8a9040", (0.3, 0.7), (1, 3))
    els += neural_connections(pos, "#7a8838", 120, 0.2)
    els += nodes
    # Warm gold accent nodes
    gold_nodes, _ = neural_nodes(6, (200, 600), (350, 500), "#e8b840", (0.4, 0.7), (1.5, 3))
    els += gold_nodes
    # Gentle tree framing
    els += tree_lines(4, w, h, "#3a3422", (0.12, 0.3))
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 40), ("#1a1a14", 100)])

def img_depression_dark():
    """Dark oppressive forest, dying neural paths."""
    w, h = 1600, 900
    els = []
    # Dark but still jungle-colored layers
    els += organic_shapes(15, w, h, ["#141310", "#181712", "#201e18"], (0.2, 0.55))
    # Dense tangled branches
    for _ in range(30):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = rand(0, w), rand(0, h)
        cx, cy = rand(0, w), rand(0, h)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#24221a" stroke-width="{rand(1.5,5):.1f}" fill="none" opacity="{rand(0.2, 0.4):.2f}"/>')
    # Dying dim neural paths - fading
    nodes, pos = neural_nodes(18, (200, 1400), (200, 700), "#4a4830", (0.1, 0.25), (1, 2.5))
    els += neural_connections(pos, "#38361e", 250, 0.1)
    els += nodes
    # Slight purple melancholy glow
    els.append(f'<ellipse cx="800" cy="450" rx="400" ry="300" fill="#4a2868" opacity="0.04" filter="url(#blur3)"/>')
    return make_svg(w, h, els, [("#100f0c", 0), ("#141310", 50), ("#100f0c", 100)])

def img_depression_clearing():
    """Light breaking through with new neural pathways."""
    w, h = 1600, 900
    els = []
    # Dark canopy top half
    els += organic_shapes(12, w, h, ["#1a1a14", "#201e18"], (0.15, 0.4))
    # Dramatic golden light break
    els += light_rays(20, 800, -50, h, "#e8d060", 0.08)
    els += light_rays(10, 820, -30, h, "#f0e880", 0.05)
    # Bright warm center glow
    els.append('<ellipse cx="800" cy="350" rx="300" ry="250" fill="url(#glowGold)" filter="url(#blur3)"/>')
    els.append('<ellipse cx="800" cy="350" rx="200" ry="170" fill="url(#glow1)" filter="url(#blur3)"/>')
    # New green shoots - vibrant
    for _ in range(10):
        x = rand(400, 1200)
        y2 = rand(500, 800)
        y1 = y2 + rand(50, 150)
        color = random.choice(["#788830", "#8a9040", "#98a050"])
        els.append(f'<path d="M{x:.0f},{y1:.0f} Q{x+rand(-15,15):.0f},{(y1+y2)/2:.0f} {x+rand(-10,10):.0f},{y2:.0f}" stroke="{color}" stroke-width="2" fill="none" opacity="0.4"/>')
    # Vibrant new neural network where light hits
    nodes, pos = neural_nodes(40, (400, 1200), (200, 700), "#8a9040", (0.5, 0.95), (1.5, 4.5))
    els += neural_connections(pos, "#a0a060", 200, 0.25)
    els += nodes
    # Gold neural sparks
    gold_nodes, _ = neural_nodes(12, (500, 1100), (200, 600), "#e8b840", (0.5, 0.9), (2, 5))
    els += gold_nodes
    return make_svg(w, h, els, [("#12110e", 0), ("#1a1a14", 40), ("#1a1a14", 100)])

def img_creativity_fog():
    """Dense fog in forest, obscured paths."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(8, w, h, ["#22201a", "#28261c"], (0.12, 0.3))
    # Tree silhouettes - visible
    els += tree_lines(10, w, h, "#343222", (0.15, 0.35))
    # Fog layers - with slight color
    for i in range(6):
        y = 150 + i * 120
        color = random.choice(["#302e22", "#24221c", "#323024"])
        els.append(f'<ellipse cx="{rand(200,1400):.0f}" cy="{y}" rx="{rand(400,700):.0f}" ry="{rand(60,120):.0f}" fill="{color}" opacity="{rand(0.06, 0.18):.3f}" filter="url(#blur3)"/>')
    # Ghostly neural outlines dissolving
    nodes, pos = neural_nodes(25, (200, 1400), (200, 700), "#6a6840", (0.08, 0.25), (1, 3))
    els += neural_connections(pos, "#5a5838", 200, 0.1)
    els += nodes
    # Hint of gold trying to break through
    els.append('<ellipse cx="800" cy="200" rx="300" ry="150" fill="#e8b840" opacity="0.03" filter="url(#blur3)"/>')
    return make_svg(w, h, els, [("#141310", 0), ("#1a1a14", 50), ("#141310", 100)])

def img_looking_up():
    """Looking up through canopy — expansive, neural branches."""
    w, h = 800, 600
    els = []
    # Sky center - warm golden light
    els.append('<ellipse cx="400" cy="300" rx="300" ry="250" fill="#22201a" opacity="0.4"/>')
    els.append('<ellipse cx="400" cy="300" rx="180" ry="150" fill="#2c2a1e" opacity="0.3"/>')
    # Radial branches from edges - lush green
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
        color = random.choice(["#3a3422", "#3a3828", "#3e3c2a"])
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="{color}" stroke-width="{rand(2,7):.1f}" fill="none" opacity="{rand(0.2, 0.45):.2f}"/>')
    # Bright center golden light
    els += light_rays(8, 400, 300, 300, "#e8c040", 0.06)
    els.append('<ellipse cx="400" cy="300" rx="100" ry="80" fill="url(#glowGold)" filter="url(#blur3)"/>')
    # Bright neural nodes at branch points
    nodes, pos = neural_nodes(30, (100, 700), (50, 550), "#8a9040", (0.5, 0.9), (2, 5))
    els += nodes
    # Gold sparks
    for _ in range(8):
        x, y = rand(200, 600), rand(150, 450)
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rand(1.5,3):.1f}" fill="#e8b840" opacity="{rand(0.4, 0.8):.2f}"/>')
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 50), ("#1a1a14", 100)])

def img_looking_down():
    """Looking down at tangled vines — ruts."""
    w, h = 800, 600
    els = []
    els += organic_shapes(10, w, h, ["#14130e", "#1a1914"], (0.2, 0.5))
    # Loop patterns (circular vine ruts) - more visible
    for _ in range(8):
        cx, cy = rand(100, 700), rand(100, 500)
        rx, ry = rand(30, 100), rand(20, 80)
        color = random.choice(["#28261c", "#2a281e", "#30301e"])
        els.append(f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" stroke="{color}" stroke-width="{rand(1.5,4):.1f}" fill="none" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Dense tangles
    for _ in range(20):
        x1, y1 = rand(0, w), rand(0, h)
        x2, y2 = x1+rand(-150, 150), y1+rand(-150, 150)
        cx, cy = (x1+x2)/2+rand(-50, 50), (y1+y2)/2+rand(-50, 50)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#302e1e" stroke-width="{rand(0.8, 3):.1f}" fill="none" opacity="{rand(0.15, 0.35):.2f}"/>')
    # Fading stuck neural nodes
    nodes, pos = neural_nodes(10, (100, 700), (100, 500), "#5a5838", (0.1, 0.25), (1, 2))
    els += nodes
    return make_svg(w, h, els, [("#12110e", 0), ("#1a1a14", 50), ("#12110e", 100)])

def img_morning_forest():
    """Morning light, subtle neural filaments."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(8, w, h, ["#22201a", "#28261e"], (0.1, 0.3))
    # Tall trees - visible
    els += tree_lines(8, w, h, "#3a3422", (0.15, 0.35))
    # Warm golden-orange morning light
    els += light_rays(18, 1100, -30, h, "#e8c040", 0.07)
    els += light_rays(10, 1050, -20, h, "#f0d860", 0.04)
    # Morning mist - with warm tint
    for i in range(4):
        y = 400 + i * 100
        els.append(f'<ellipse cx="{rand(400,1200):.0f}" cy="{y}" rx="{rand(300,500):.0f}" ry="{rand(40,80):.0f}" fill="#302e22" opacity="{rand(0.05, 0.12):.3f}" filter="url(#blur3)"/>')
    # Delicate neural filaments - vibrant
    nodes, pos = neural_nodes(35, (300, 1300), (200, 700), "#8a9040", (0.2, 0.6), (1, 2.5))
    els += neural_connections(pos, "#9a9850", 250, 0.12)
    els += nodes
    # Right side warm glow
    els.append('<ellipse cx="1100" cy="400" rx="350" ry="300" fill="url(#glowGold)" filter="url(#blur3)" opacity="0.7"/>')
    # Floating golden particles
    for _ in range(20):
        x, y = rand(600, 1400), rand(100, 700)
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rand(0.8,2):.1f}" fill="#e8b840" opacity="{rand(0.2, 0.6):.2f}"/>')
    return make_svg(w, h, els, [("#141310", 0), ("#1a1a14", 40), ("#1a1a14", 100)])

def img_microdosing_expedition():
    """Deep jungle expedition — dramatic scale."""
    w, h = 800, 600
    els = []
    els += organic_shapes(8, w, h, ["#22201a", "#28261c"], (0.15, 0.4))
    # Large tree trunks - visible brown-green
    for x in [100, 250, 550, 700]:
        sway = rand(-20, 20)
        wid = rand(8, 15)
        els.append(f'<path d="M{x},600 Q{x+sway:.0f},300 {x+sway*0.5:.0f},-20" stroke="#343020" stroke-width="{wid:.0f}" fill="none" opacity="0.4"/>')
    # Bright gold neural blazes
    nodes, pos = neural_nodes(25, (150, 650), (100, 500), "#e8b840", (0.5, 0.95), (2, 5.5))
    els += neural_connections(pos, "#d0a030", 150, 0.3)
    els += nodes
    # Green neural complement
    green_nodes, _ = neural_nodes(15, (150, 650), (100, 500), "#8a9040", (0.4, 0.8), (1.5, 3.5))
    els += green_nodes
    # Path through center - visible
    els.append('<path d="M350,600 Q400,400 420,200 Q430,100 400,-20" stroke="#343020" stroke-width="30" fill="none" opacity="0.12"/>')
    # Golden glow
    els.append('<ellipse cx="400" cy="300" rx="200" ry="200" fill="url(#glowGold)" filter="url(#blur3)" opacity="0.5"/>')
    return make_svg(w, h, els, [("#141310", 0), ("#1a1a14", 50), ("#1a1a14", 100)])

def img_microdosing_tending():
    """Gentle moss and tiny ferns with miniature neural net."""
    w, h = 800, 600
    els = []
    # Soft mossy ground - rich green
    els.append(f'<rect width="{w}" height="{h}" fill="#22201a"/>')
    els += organic_shapes(8, w, h, ["#2a2820", "#2c2a20", "#22201a"], (0.12, 0.35))
    # Tiny mushrooms - with glow!
    for _ in range(8):
        x = rand(100, 700)
        y = rand(300, 550)
        h_stem = rand(15, 35)
        w_cap = rand(10, 20)
        els.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x:.0f}" y2="{y-h_stem:.0f}" stroke="#3a3828" stroke-width="2.5" opacity="0.4"/>')
        els.append(f'<ellipse cx="{x:.0f}" cy="{y-h_stem:.0f}" rx="{w_cap:.0f}" ry="{w_cap*0.5:.0f}" fill="#3a3422" opacity="0.4"/>')
        # Vivid glow caps
        glow_color = random.choice(["#8a9040", "#e8b840", "#b89b3e"])
        els.append(f'<circle cx="{x:.0f}" cy="{y-h_stem:.0f}" r="4" fill="{glow_color}" opacity="0.6"/>')
        els.append(f'<circle cx="{x:.0f}" cy="{y-h_stem:.0f}" r="14" fill="{glow_color}" opacity="0.1" filter="url(#blur1)"/>')
    # Hair-thin neural filaments - vibrant
    nodes, pos = neural_nodes(30, (50, 750), (250, 580), "#8a9040", (0.2, 0.55), (0.5, 2))
    els += neural_connections(pos, "#7a8838", 100, 0.18)
    els += nodes
    # Soft warm diffused light
    els.append('<ellipse cx="400" cy="250" rx="350" ry="200" fill="url(#glow1)" filter="url(#blur3)" opacity="0.4"/>')
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 50), ("#1a1a14", 100)])

def img_safety_rugged():
    """Rugged steep terrain with warning-colored neural paths."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(10, w, h, ["#1a1a14", "#201e18"], (0.15, 0.4))
    # Rocky ground shapes - earthy
    for _ in range(12):
        x = rand(0, w)
        y = rand(400, 850)
        points = []
        for j in range(random.randint(4, 7)):
            px = x + rand(-80, 80)
            py = y + rand(-40, 40)
            points.append(f"{px:.0f},{py:.0f}")
        color = random.choice(["#20201a", "#242218", "#2c2a20"])
        els.append(f'<polygon points="{" ".join(points)}" fill="{color}" opacity="{rand(0.2, 0.45):.2f}"/>')
    # Exposed roots (thick) - visible
    for _ in range(10):
        x1 = rand(0, w)
        y1 = rand(350, 550)
        x2 = x1 + rand(-200, 200)
        y2 = rand(550, 850)
        cx = (x1+x2)/2 + rand(-60, 60)
        cy = (y1+y2)/2
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#302e1e" stroke-width="{rand(3,9):.1f}" fill="none" opacity="{rand(0.2, 0.4):.2f}"/>')
    # Warning amber neural traces - vivid
    nodes, pos = neural_nodes(30, (200, 1400), (350, 800), "#e8a040", (0.4, 0.85), (2, 4.5))
    els += neural_connections(pos, "#d08830", 200, 0.2)
    els += nodes
    # Red warning accents
    red_nodes, _ = neural_nodes(8, (400, 1200), (400, 700), "#e06040", (0.4, 0.7), (2, 4))
    els += red_nodes
    # Amber atmosphere
    els.append(f'<ellipse cx="800" cy="500" rx="500" ry="300" fill="#e8a040" opacity="0.03" filter="url(#blur3)"/>')
    return make_svg(w, h, els, [("#141310", 0), ("#1a1a14", 50), ("#141310", 100)])

def img_safety_maintained():
    """Well-maintained trail with golden-green neural guideposts."""
    w, h = 1600, 900
    els = []
    els += organic_shapes(6, w, h, ["#22201a", "#28261e"], (0.1, 0.25))
    # Tall trees - visible
    for x in [200, 450, 1150, 1400]:
        els.append(f'<path d="M{x},-20 L{x+rand(-5,5):.0f},920" stroke="#3a3422" stroke-width="{rand(6,14):.0f}" fill="none" opacity="0.3"/>')
    # Clear golden-lit path through center
    els.append('<path d="M600,900 Q780,600 800,300 Q810,100 800,-20" stroke="#30301e" stroke-width="80" fill="none" opacity="0.1"/>')
    # Golden-green guidepost nodes along trail - bright!
    trail_nodes = []
    for i in range(14):
        t = i / 13
        x = 600 + (800-600)*t + rand(-20, 20) + (200 * t * (1-t)) * (1 if i%2==0 else -1) * 0.5
        y = 850 - t * 870
        r = rand(2.5, 5)
        trail_nodes.append((x, y))
        color = "#e8b840" if i % 3 == 0 else "#8a9040"
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{color}" opacity="0.7"/>')
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r*4:.1f}" fill="{color}" opacity="0.12" filter="url(#blur1)"/>')
    # Connections along trail
    for i in range(len(trail_nodes)-1):
        x1, y1 = trail_nodes[i]
        x2, y2 = trail_nodes[i+1]
        cx = (x1+x2)/2 + rand(-15, 15)
        cy = (y1+y2)/2 + rand(-15, 15)
        els.append(f'<path d="M{x1:.0f},{y1:.0f} Q{cx:.0f},{cy:.0f} {x2:.0f},{y2:.0f}" stroke="#9a9850" stroke-width="1.2" fill="none" opacity="0.3"/>')
    # Golden overhead light
    els += light_rays(10, 800, -30, h, "#e8c040", 0.06)
    els.append('<ellipse cx="800" cy="300" rx="300" ry="250" fill="url(#glowGold)" filter="url(#blur3)" opacity="0.5"/>')
    return make_svg(w, h, els, [("#1a1a14", 0), ("#22201a", 50), ("#1a1a14", 100)])

def img_legal_aerial():
    """Aerial view of forest with clearings and neural patterns."""
    w, h = 1600, 900
    els = []
    # Dense canopy base (top-down view) - rich varied greens
    for _ in range(60):
        x, y = rand(0, w), rand(0, h)
        r = rand(20, 80)
        shade = random.choice(["#22201a", "#28261c", "#2e2c20", "#2a2820", "#28261e", "#383428"])
        els.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{shade}" opacity="{rand(0.2, 0.5):.2f}"/>')
    # Clearings (lighter patches) with golden glow
    clearings = [(400, 350, 120, 90), (1000, 500, 150, 100), (700, 200, 80, 60), (1300, 300, 100, 70)]
    for cx, cy, rx, ry in clearings:
        els.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#3a3422" opacity="0.4"/>')
        els.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx*0.6:.0f}" ry="{ry*0.6:.0f}" fill="#e8b840" opacity="0.08" filter="url(#blur2)"/>')
        els.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx*0.3:.0f}" ry="{ry*0.3:.0f}" fill="#8a9040" opacity="0.12" filter="url(#blur1)"/>')
    # River cutting through - teal-blue
    els.append('<path d="M0,450 Q200,420 400,460 Q600,500 800,440 Q1000,380 1200,420 Q1400,460 1600,430" stroke="#308a80" stroke-width="14" fill="none" opacity="0.25"/>')
    els.append('<path d="M0,450 Q200,420 400,460 Q600,500 800,440 Q1000,380 1200,420 Q1400,460 1600,430" stroke="#40b8a8" stroke-width="6" fill="none" opacity="0.15"/>')
    # Vibrant neural network in clearings
    nodes, pos = neural_nodes(40, (200, 1400), (100, 800), "#8a9040", (0.4, 0.8), (1.5, 3.5))
    els += neural_connections(pos, "#9a9850", 250, 0.18)
    els += nodes
    # Gold highlights at clearings
    gold_nodes, _ = neural_nodes(10, (300, 1200), (200, 600), "#e8b840", (0.5, 0.8), (2, 4))
    els += gold_nodes
    return make_svg(w, h, els, [("#141310", 0), ("#1a1a14", 50), ("#141310", 100)])


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
