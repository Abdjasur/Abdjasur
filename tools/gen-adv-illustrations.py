# Generates the six isometric illustrations for the advantages section (images/adv-*.svg).
# Usage: python3 tools/gen-adv-illustrations.py images
import math, os, sys
OUT = sys.argv[1]
W, Hc = 800, 500
C, S = math.cos(math.pi/6), 0.5
K = 1.2
TILE, GAP, OVER = 104, 3, 12        # tile size, joint, overhang past outer pedestals
H, T = 82, 6                        # pedestal height, tile thickness
N = 2                               # 2x2 tiles
SPAN = N*TILE
OX, OY = 400, 222

def P(x, y, z):
    return (OX + (x - y)*C*K, OY + (x + y)*S*K - z*K)

def pts(ps):
    return " ".join(f"{a:.1f},{b:.1f}" for a, b in ps)

def poly(ps3, fill, extra=""):
    return f'<polygon points="{pts([P(*p) for p in ps3])}" fill="{fill}" {extra}/>'

def ell(x, y, z, r):
    cx, cy = P(x, y, z)
    return cx, cy, r*K*math.sqrt(2)*C, r*K*math.sqrt(2)*S

def frustum(x, y, z1, r1, z2, r2, fill, top=None, stroke=None):
    cx, cy1, rx1, ry1 = ell(x, y, z1, r1)
    _, cy2, rx2, ry2 = ell(x, y, z2, r2)
    s = f'<path d="M{cx-rx1:.1f},{cy1:.1f} A{rx1:.1f},{ry1:.1f} 0 0 0 {cx+rx1:.1f},{cy1:.1f} L{cx+rx2:.1f},{cy2:.1f} A{rx2:.1f},{ry2:.1f} 0 0 1 {cx-rx2:.1f},{cy2:.1f} Z" fill="{fill}"/>'
    if top:
        s += f'<ellipse cx="{cx:.1f}" cy="{cy2:.1f}" rx="{rx2:.1f}" ry="{ry2:.1f}" fill="{top}"/>'
    if stroke:
        s += f'<path d="M{cx-rx1:.1f},{cy1:.1f} A{rx1:.1f},{ry1:.1f} 0 0 0 {cx+rx1:.1f},{cy1:.1f}" fill="none" stroke="{stroke}" stroke-width="1"/>'
    return s

def pedestal(x, y, h=H - T):
    g = []
    cx, cy, rx, ry = ell(x, y, 0, 24)
    g.append(f'<ellipse cx="{cx:.1f}" cy="{cy+3:.1f}" rx="{rx*1.15:.1f}" ry="{ry*1.15:.1f}" fill="#000" opacity=".35" filter="url(#blur)"/>')
    g.append(frustum(x, y, 0, 21, 3, 21, "url(#cyl)", "#262c2a", "#2cc3b3"))
    g.append(frustum(x, y, 3, 18, 24, 9, "url(#cyl)"))
    for a in (-60, -30, 0, 30, 60):                           # ribs on the cone
        t = math.radians(a + 45)
        x1, y1 = P(x + 18*math.cos(t), y + 18*math.sin(t), 3)
        x2, y2 = P(x + 9*math.cos(t), y + 9*math.sin(t), 24)
        g.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#4b5552" stroke-width="1.4"/>')
    g.append(frustum(x, y, 24, 8.5, h - 6, 8.5, "url(#cyl)"))
    z = 27
    while z < h - 7:                                           # thread
        cx, cyz, rx, ry = ell(x, y, z, 8.5)
        g.append(f'<path d="M{cx-rx:.1f},{cyz:.1f} A{rx:.1f},{ry:.1f} 0 0 0 {cx+rx:.1f},{cyz:.1f}" fill="none" stroke="#56615d" stroke-width="1"/>')
        z += 3.2
    g.append(frustum(x, y, h - 6, 10, h - 2, 15, "url(#cyl)"))
    g.append(frustum(x, y, h - 2, 15, h, 15, "#2a312f", "#1c2120", "#2cc3b3"))
    return "".join(g)

def box3(x0, y0, x1, y1, z0, z1, top, left, right, extra=""):
    s = poly([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], left, extra)     # front-left face (y=y1)
    s += poly([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], right, extra)   # front-right face (x=x1)
    s += poly([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], top, extra)
    return s

def tile_rect(i, j):
    x0 = -OVER + i*(TILE + GAP); y0 = -OVER + j*(TILE + GAP)
    return x0, y0, x0 + TILE, y0 + TILE

def platform(skip=()):
    g = []
    tot = N*TILE + (N - 1)*GAP
    g.append(box3(-OVER + 2, -OVER + 2, -OVER + tot - 2, -OVER + tot - 2, H - T - 2, H - 3, "#0c1210", "#0c1210", "#0c1210"))
    for s_ in sorted([(i, j) for i in range(N) for j in range(N)], key=lambda t: t[0] + t[1]):
        if s_ in skip: continue
        x0, y0, x1, y1 = tile_rect(*s_)
        g.append(box3(x0, y0, x1, y1, H - T, H, "url(#tileTop)", "#aebbb5", "#8f9d97"))
        g.append(f'<polyline points="{pts([P(x0,y1,H),P(x0,y0,H),P(x1,y0,H)])}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/>')
    return "".join(g)

def pedestal_grid(only_front=False):
    step = TILE + GAP
    ps = [(i*step - OVER + (0 if i == 0 else -GAP/2) + (OVER if i == 0 else 0), 0) for i in range(3)]
    xs = [0, step - OVER - GAP/2, 2*step - 2*OVER - GAP]
    xs = [-OVER + OVER, -OVER + TILE + GAP/2, -OVER + 2*TILE + GAP - OVER]
    cells = sorted([(a, b) for a in xs for b in xs], key=lambda t: t[0] + t[1])
    return "".join(pedestal(a, b) for a, b in cells)

def ground():
    g = []
    cx, cy = P(SPAN/2 - OVER, SPAN/2 - OVER, 0)
    g.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="330" ry="150" fill="url(#floor)"/>')
    for k in range(-2, 7):                                      # faint iso grid
        a = k*50 - 60
        g.append(f'<line x1="{P(a,-140,0)[0]:.1f}" y1="{P(a,-140,0)[1]:.1f}" x2="{P(a,340,0)[0]:.1f}" y2="{P(a,340,0)[1]:.1f}" stroke="#2cc3b3" stroke-opacity=".07"/>')
        g.append(f'<line x1="{P(-140,a,0)[0]:.1f}" y1="{P(-140,a,0)[1]:.1f}" x2="{P(340,a,0)[0]:.1f}" y2="{P(340,a,0)[1]:.1f}" stroke="#2cc3b3" stroke-opacity=".07"/>')
    return "".join(g)

DEFS = '''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#123d2c"/><stop offset=".55" stop-color="#0b271c"/><stop offset="1" stop-color="#071a13"/></linearGradient>
<radialGradient id="beam" cx=".72" cy="-.1" r=".9"><stop offset="0" stop-color="#5fe3a1" stop-opacity=".35"/><stop offset=".5" stop-color="#2cc3b3" stop-opacity=".06"/><stop offset="1" stop-color="#2cc3b3" stop-opacity="0"/></radialGradient>
<radialGradient id="floor"><stop offset="0" stop-color="#3ddc84" stop-opacity=".16"/><stop offset="1" stop-color="#3ddc84" stop-opacity="0"/></radialGradient>
<linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#0d100f"/><stop offset=".35" stop-color="#3c4644"/><stop offset=".6" stop-color="#1d2322"/><stop offset="1" stop-color="#0a0c0b"/></linearGradient>
<linearGradient id="tileTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7f5"/><stop offset="1" stop-color="#d9e2dd"/></linearGradient>
<linearGradient id="water" x1="0" x2="1"><stop offset="0" stop-color="#5fd0ff"/><stop offset="1" stop-color="#2c8cff"/></linearGradient>
<linearGradient id="warm" x1="0" x2="1"><stop offset="0" stop-color="#ffb35c"/><stop offset="1" stop-color="#ff6b3d"/></linearGradient>
<linearGradient id="cool" x1="0" x2="1"><stop offset="0" stop-color="#2cc3b3"/><stop offset="1" stop-color="#5fe3a1"/></linearGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>'''

def svg(body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hc}" role="img" aria-label="{title}">{DEFS}'
            f'<rect width="{W}" height="{Hc}" fill="url(#bg)"/><rect width="{W}" height="{Hc}" fill="url(#beam)"/>{body}</svg>')

def arrow_path(points3, color, width=9, head=16, extra=''):
    ps = [P(*p) for p in points3]
    d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in ps[:-1])
    (ax, ay), (bx, by) = ps[-2], ps[-1]
    ang = math.atan2(by - ay, bx - ax)
    hx, hy = bx - head*math.cos(ang), by - head*math.sin(ang)
    d += f" L{hx:.1f},{hy:.1f}"
    left = (hx + head*.6*math.cos(ang + math.pi/2), hy + head*.6*math.sin(ang + math.pi/2))
    right = (hx + head*.6*math.cos(ang - math.pi/2), hy + head*.6*math.sin(ang - math.pi/2))
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
            f'<polygon points="{pts([left,(bx,by),right])}" fill="{color}" {extra}/>')

CEN = -OVER + (N*TILE + GAP)/2      # platform centre coordinate

def scene_drainage():
    b = ground()
    for dx, dy in ((-60, 40), (10, 70), (70, 10)):          # water leaving under the deck
        b += arrow_path([(CEN + dx*.2, CEN + dy*.2, 2), (CEN + dx*1.6, CEN + dy*1.6, 2), (CEN + dx*2.3, CEN + dy*2.3, 2)], "url(#water)", 8, 18, 'opacity=".9"')
    b += pedestal_grid() + platform()
    j = -OVER + TILE + GAP/2
    for t in (15, 45, 70):                                     # drops falling into joints
        for (x, y) in ((j, -OVER + t*2.2), (-OVER + t*2.2, j)):
            px, py = P(x, y, H)
            b += f'<path d="M{px:.1f},{py-26:.1f} q10,15 0,22 q-10,-7 0,-22Z" fill="#4cc3ff" opacity=".95"/>'
    cx, cy = P(CEN, CEN, H + 95)
    b += f'<g filter="url(#glow)"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="34" fill="#0b2a1c" stroke="#4cc3ff" stroke-width="3"/><path d="M{cx:.1f},{cy-20:.1f} c10,13 14,19 14,26 a14,14 0 0 1 -28,0 c0,-7 4,-13 14,-26Z" fill="url(#water)"/></g>'
    return svg(b, "Suv tayanchlar orasidan tez oqib ketadi")

def scene_insulation():
    b = ground()
    b += arrow_path([(-150, 150, 18), (-40, 150, 18), (60, 60, 20), (200, 60, 18), (300, 60, 16)], "url(#cool)", 10, 20, 'opacity=".95"')
    b += pedestal_grid() + platform()
    cx, cy = P(CEN - 30, CEN - 30, H)
    b += f'<path d="M{cx:.1f},{cy:.1f} c-18,-30 18,-45 0,-75 c-12,-20 6,-30 0,-45" fill="none" stroke="url(#warm)" stroke-width="12" stroke-linecap="round"/>'
    b += f'<polygon points="{cx-14:.1f},{cy-140:.1f} {cx:.1f},{cy-162:.1f} {cx+14:.1f},{cy-140:.1f}" fill="#ffb35c"/>'
    sx, sy = 640, 110
    b += f'<path d="M{sx-38},{sy-10} h14 l20,-18 v56 l-20,-18 h-14z" fill="#e9f7f3"/>'
    for k, r in enumerate((16, 30, 44)):
        b += f'<path d="M{sx+r*.4:.1f},{sy-r:.1f} a{r},{r} 0 0 1 0,{2*r}" fill="none" stroke="#e9f7f3" stroke-opacity="{.7-k*.28:.2f}" stroke-width="4" stroke-linecap="round"/>'
    b += f'<circle cx="{sx}" cy="{sy}" r="62" fill="none" stroke="#3ddc84" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 6"/>'
    return svg(b, "Qoplama ostidagi havo bo'shlig'i issiqlik va shovqindan himoya qiladi")

def cable(y, z, color, w=7):
    a = P(-190, y, z); m = P(CEN, y, z); e = P(330, y, z)
    return f'<path d="M{a[0]:.1f},{a[1]:.1f} L{e[0]:.1f},{e[1]:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/><path d="M{a[0]:.1f},{a[1]-w*.25:.1f} L{e[0]:.1f},{e[1]-w*.25:.1f}" stroke="#fff" stroke-opacity=".35" stroke-width="{w*.25:.1f}" stroke-linecap="round"/>'

def scene_utilities():
    b = ground()
    y0 = -OVER + TILE/2 + 6
    b += cable(y0 + 90, 14, "#3a4a5a", 16)                      # pipe
    for k, col in enumerate(("#ff6b3d", "#ffc53d", "#2cc3b3", "#5fa8ff")):
        b += cable(y0 + 30 + k*7, 6, col, 6)
    b += pedestal_grid() + platform()
    return svg(b, "Kabel va quvurlar qoplama ostida yashirinadi")

def balloon(x, y, color, lift):
    tx, ty = P(x, y, H)
    bx, by = tx + lift[0], ty - lift[1]
    return (f'<path d="M{tx:.1f},{ty:.1f} C{tx+10:.1f},{ty-40:.1f} {bx-12:.1f},{by+60:.1f} {bx:.1f},{by+36:.1f}" fill="none" stroke="#e9f7f3" stroke-opacity=".8" stroke-width="1.6"/>'
            f'<ellipse cx="{bx:.1f}" cy="{by:.1f}" rx="27" ry="33" fill="{color}"/>'
            f'<ellipse cx="{bx-9:.1f}" cy="{by-12:.1f}" rx="7" ry="11" fill="#fff" opacity=".45"/>'
            f'<polygon points="{bx-5:.1f},{by+36:.1f} {bx:.1f},{by+31:.1f} {bx+5:.1f},{by+36:.1f}" fill="{color}"/>')

def scene_light():
    b = ground() + pedestal_grid() + platform()
    b += balloon(CEN - 20, CEN - 30, "#2cc3b3", (-45, 120))
    b += balloon(CEN + 10, CEN - 10, "#3ddc84", (8, 140))
    b += balloon(CEN + 25, CEN + 20, "#ffb35c", (55, 110))
    return svg(b, "Yengil konstruksiya, qo'shimcha mahkamlagichlarsiz")

def scene_level():
    b = ground() + pedestal_grid() + platform()
    L, Wd, Hh = 150, 22, 16                                      # spirit level on top
    x0, y0 = CEN - L/2, CEN - Wd/2
    b += box3(x0, y0, x0 + L, y0 + Wd, H, H + Hh, "#ffc53d", "#e0a21f", "#c98c12")
    vx, vy = P(CEN, CEN, H + Hh)
    b += f'<ellipse cx="{vx:.1f}" cy="{vy:.1f}" rx="24" ry="8" fill="#7fe0d6" stroke="#0b2a1c" stroke-width="2"/><ellipse cx="{vx:.1f}" cy="{vy:.1f}" rx="7" ry="4" fill="#fff"/>'
    b += f'<line x1="{vx-12:.1f}" y1="{vy-8:.1f}" x2="{vx-12:.1f}" y2="{vy+8:.1f}" stroke="#0b2a1c" stroke-width="2"/><line x1="{vx+12:.1f}" y1="{vy-8:.1f}" x2="{vx+12:.1f}" y2="{vy+8:.1f}" stroke="#0b2a1c" stroke-width="2"/>'
    cx, cy = P(CEN + 30, CEN - 60, H + 80)
    b += f'<g filter="url(#glow)"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="26" fill="#3ddc84"/><path d="M{cx-12:.1f},{cy:.1f} l8,9 l16,-18" fill="none" stroke="#0b2a1c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>'
    fx, fy = P(-OVER + 2*TILE + GAP - OVER + 30, -OVER + 2*TILE + GAP - OVER + 30, H/2)
    b += (f'<g stroke="#3ddc84" stroke-width="4" stroke-linecap="round" fill="#3ddc84"><line x1="{fx+36:.1f}" y1="{fy-30:.1f}" x2="{fx+36:.1f}" y2="{fy+30:.1f}"/>'
          f'<polygon points="{fx+28:.1f},{fy-24:.1f} {fx+36:.1f},{fy-36:.1f} {fx+44:.1f},{fy-24:.1f}"/><polygon points="{fx+28:.1f},{fy+24:.1f} {fx+36:.1f},{fy+36:.1f} {fx+44:.1f},{fy+24:.1f}"/></g>')
    return svg(b, "Tayanch balandligi sozlanadi, yuza tekis bo'ladi")

def rot_tile(x0, y0, x1, y1, lift, ang):
    a = math.radians(ang)
    def r(x, y, z):                     # rotate around the tile's back edge (y=y0), then lift
        dy, dz = y - y0, z - (H - T)
        return (x, y0 + dy*math.cos(a) - dz*math.sin(a), H - T + lift + dy*math.sin(a) + dz*math.cos(a))
    top = [r(x0, y0, H), r(x1, y0, H), r(x1, y1, H), r(x0, y1, H)]
    bot = [r(x0, y0, H - T), r(x1, y0, H - T), r(x1, y1, H - T), r(x0, y1, H - T)]
    s = poly([bot[3], bot[2], top[2], top[3]], "#aebbb5")
    s += poly([bot[1], bot[2], top[2], top[1]], "#8f9d97")
    s += poly(top, "url(#tileTop)")
    return s

def scene_maintenance():
    b = ground() + pedestal_grid() + platform(skip={(1, 1)})
    x0, y0, x1, y1 = tile_rect(1, 1)
    b += rot_tile(x0, y0, x1, y1, 95, -14)
    a = P(x1 + 20, y1 + 10, H - 10); m = P(x1 + 60, y1 - 20, H + 40); e = P(x1 + 30, y1 - 30, H + 90)
    b += f'<path d="M{a[0]:.1f},{a[1]:.1f} Q{m[0]+40:.1f},{m[1]:.1f} {e[0]:.1f},{e[1]:.1f}" fill="none" stroke="#3ddc84" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>'
    b += f'<polygon points="{e[0]-12:.1f},{e[1]+14:.1f} {e[0]-6:.1f},{e[1]-10:.1f} {e[0]+16:.1f},{e[1]+2:.1f}" fill="#3ddc84"/>'
    return svg(b, "Qoplama elementini oson ko'tarib almashtirish mumkin")

os.makedirs(OUT, exist_ok=True)
for name, fn in (("drainage", scene_drainage), ("insulation", scene_insulation), ("utilities", scene_utilities),
                 ("light", scene_light), ("level", scene_level), ("maintenance", scene_maintenance)):
    open(os.path.join(OUT, f"adv-{name}.svg"), "w").write(fn())
print("ok")
