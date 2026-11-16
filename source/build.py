"""
SAN'T VIAJES — Rebranding 2026
Genera la tipografía personalizada "SV Conecta" (Regular, Bold, Black)
y los logotipos vectoriales a partir de esa misma tipografía.

Uso:   python build.py
Requiere: pip install fonttools shapely brotli
"""
import base64
import json
import math
import os

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from shapely import affinity
from shapely.geometry import LineString, Point, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAMILY = "SV Conecta"
PS_FAMILY = "SVConecta"
VERSION = "1.000"

CAP, XH, ASC, DESC = 700, 520, 740, -210
# (estilo, peso CSS, radio del trazo = medio grosor)
WEIGHTS = [("Regular", 400, 42), ("Bold", 700, 64), ("Black", 900, 88)]

PALETTE = {
    "noche":   ("#0F1B33", "Azul Noche",      "Fondo principal, textos"),
    "brisa":   ("#8FD5D6", "Aqua Brisa",      "SAN'T, mar, frescura"),
    "sol":     ("#F7C64A", "Amarillo Sol",    "VIAJES, avión, energía"),
    "corazon": ("#EB5A1E", "Naranja Corazón", "Acentos, llamados a la acción"),
    "arena":   ("#F7E4D4", "Crema Arena",     "Lema, fondos cálidos"),
    "nube":    ("#FFFFFF", "Blanco Nube",     "Borde sticker, fondos"),
}


# ---------------------------------------------------------------- primitivas
def arc(cx, cy, rx, ry, a0, a1, step=3):
    n = max(2, int(math.ceil(abs(a1 - a0) / step)))
    out = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        out.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    return out


def ell(cx, cy, rx, ry):
    return arc(cx, cy, rx, ry, 0, 360)


def bowl(x0, y1, y2, xr):
    rad = (y1 - y2) / 2
    cx, cy = xr - rad, (y1 + y2) / 2
    return [(x0, y1), (cx, y1)] + arc(cx, cy, rad, rad, 90, -90) + [(x0, y2)]


def L(*p):
    return ("L", list(p))


def Lp(pts):
    return ("L", list(pts))


def D(x, y):
    return ("D", (x, y))


class Ctx:
    def __init__(s, r):
        s.r = r
        s.t, s.b = CAP - r, r
        s.m = (s.t + s.b) / 2
        s.xt = XH - r
        s.xm = (s.xt + s.b) / 2
        s.at = ASC - r
        s.d = DESC + r
        s.dot = 2.3 * r + 40  # distancia trazo → punto


GLYPHS = {}


def glyph(chars, diag=False):
    def deco(fn):
        for c in chars:
            GLYPHS[c] = (fn, diag)
        return fn
    return deco


# ---------------------------------------------------------------- mayúsculas
@glyph("A", True)
def _A(g):
    w, t, b = 540, g.t, g.b
    h = b + (t - b) * 0.32
    xl = (w / 2) * (h - b) / (t - b)
    return w, [L((0, b), (w / 2, t), (w, b)), L((xl, h), (w - xl, h))]


@glyph("B")
def _B(g):
    w = 440
    return w, [L((0, g.b), (0, g.t)), Lp(bowl(0, g.t, g.m, w * 0.9)), Lp(bowl(0, g.m, g.b, w))]


@glyph("C")
def _C(g):
    w = 520
    return w, [Lp(arc(w / 2, g.m, w / 2, (g.t - g.b) / 2, 42, 318))]


@glyph("D")
def _D(g):
    w = 500
    return w, [L((0, g.b), (0, g.t)), Lp(bowl(0, g.t, g.b, w))]


@glyph("E")
def _E(g):
    w = 400
    return w, [L((w, g.t), (0, g.t), (0, g.b), (w, g.b)), L((0, g.m), (w * 0.82, g.m))]


@glyph("F")
def _F(g):
    w = 390
    return w, [L((w, g.t), (0, g.t), (0, g.b)), L((0, g.m), (w * 0.8, g.m))]


@glyph("G")
def _G(g):
    w = 540
    return w, [Lp(arc(w / 2, g.m, w / 2, (g.t - g.b) / 2, 40, 360)), L((w, g.m), (w * 0.56, g.m))]


@glyph("H")
def _H(g):
    w = 480
    return w, [L((0, g.b), (0, g.t)), L((w, g.b), (w, g.t)), L((0, g.m), (w, g.m))]


@glyph("I")
def _I(g):
    return 0, [L((0, g.b), (0, g.t))]


@glyph("ı")
def _dotless(g):
    return 0, [L((0, g.b), (0, g.xt))]


@glyph("J")
def _J(g):
    w = 380
    ry = min(w / 2, (g.t - g.b) * 0.45)
    return w, [Lp([(w, g.t)] + arc(w / 2, g.b + ry, w / 2, ry, 0, -168))]


@glyph("K")
def _K(g):
    w = 460
    return w, [L((0, g.b), (0, g.t)), L((w, g.t), (0, g.m), (w, g.b))]


@glyph("L")
def _L(g):
    w = 380
    return w, [L((0, g.t), (0, g.b), (w, g.b))]


@glyph("M")
def _M(g):
    w = 600
    return w, [L((0, g.b), (0, g.t), (w / 2, g.b + (g.t - g.b) * 0.3), (w, g.t), (w, g.b))]


@glyph("N")
def _N(g):
    w = 490
    return w, [L((0, g.b), (0, g.t), (w, g.b), (w, g.t))]


@glyph("O")
def _O(g):
    w = 580
    return w, [Lp(ell(w / 2, g.m, w / 2, (g.t - g.b) / 2))]


def _pb(g):
    return g.b + (g.t - g.b) * 0.44


@glyph("P")
def _P(g):
    w = 440
    return w, [L((0, g.b), (0, g.t)), Lp(bowl(0, g.t, _pb(g), w))]


@glyph("Q")
def _Q(g):
    w, s = _O(g)
    return w, s + [L((w * 0.6, g.b + (g.t - g.b) * 0.24), (w * 1.0, g.b - 15))]


@glyph("R")
def _R(g):
    w = 450
    pb = _pb(g)
    return w, [L((0, g.b), (0, g.t)), Lp(bowl(0, g.t, pb, w)), L((w * 0.42, pb), (w, g.b))]


def s_curve(w, top, bot, cx=None):
    H = top - bot
    hu, hl = H * 0.235, H * 0.265
    cx = w / 2 if cx is None else cx
    up = arc(cx, top - hu, w / 2 * 0.95, hu, 28, 270)
    lo = arc(cx, bot + hl, w / 2, hl, 90, -152)
    return up + lo[1:]


@glyph("S")
def _S(g):
    w = 460
    return w, [Lp(s_curve(w, g.t, g.b))]


@glyph("T", True)
def _T(g):
    w = 480
    return w, [L((0, g.t), (w, g.t)), L((w / 2, g.t), (w / 2, g.b))]


@glyph("U")
def _U(g):
    w = 490
    ra = w / 2
    return w, [Lp([(0, g.t)] + arc(w / 2, g.b + ra, w / 2, ra, 180, 360) + [(w, g.t)])]


@glyph("V", True)
def _V(g):
    w = 540
    return w, [L((0, g.t), (w / 2, g.b), (w, g.t))]


@glyph("W", True)
def _W(g):
    w = 780
    return w, [L((0, g.t), (w * 0.25, g.b), (w / 2, g.b + (g.t - g.b) * 0.72), (w * 0.75, g.b), (w, g.t))]


@glyph("X", True)
def _X(g):
    w = 520
    return w, [L((0, g.t), (w, g.b)), L((0, g.b), (w, g.t))]


@glyph("Y", True)
def _Y(g):
    w = 520
    return w, [L((0, g.t), (w / 2, g.m)), L((w, g.t), (w / 2, g.m), (w / 2, g.b))]


@glyph("Z")
def _Z(g):
    w = 450
    return w, [L((0, g.t), (w, g.t), (0, g.b), (w, g.b))]


# ---------------------------------------------------------------- minúsculas
def xo(g, w, cx=None):
    cx = w / 2 if cx is None else cx
    return Lp(ell(cx, g.xm, w / 2, (g.xt - g.b) / 2))


@glyph("a")
def _a(g):
    w = 420
    return w, [xo(g, w), L((w, g.xt), (w, g.b))]


@glyph("b")
def _b(g):
    w = 420
    return w, [L((0, g.at), (0, g.b)), xo(g, w)]


@glyph("c")
def _c(g):
    w = 400
    return w, [Lp(arc(w / 2, g.xm, w / 2, (g.xt - g.b) / 2, 45, 315))]


@glyph("d")
def _d(g):
    w = 420
    return w, [xo(g, w), L((w, g.at), (w, g.b))]


@glyph("e")
def _e(g):
    w = 420
    return w, [L((0, g.xm), (w, g.xm)), Lp(arc(w / 2, g.xm, w / 2, (g.xt - g.b) / 2, 0, 305))]


@glyph("f", True)
def _f(g):
    w, s, rx = 290, 110, 120
    return w, [Lp([(s, g.b)] + arc(s + rx, g.at - rx, rx, rx, 180, 55)), L((0, g.xt), (s + 150, g.xt))]


@glyph("g")
def _g(g):
    w = 420
    ry = 150
    return w, [xo(g, w), Lp([(w, g.xt)] + arc(w / 2, g.d + ry, w / 2, ry, 0, -165))]


def arch(g, x0, x1, top_y):
    rx = (x1 - x0) / 2
    ra = min(rx, (top_y - g.b) * 0.55)
    return Lp([(x0, top_y - ra)] + arc(x0 + rx, top_y - ra, rx, ra, 180, 0) + [(x1, g.b)])


@glyph("h")
def _h(g):
    w = 400
    return w, [L((0, g.at), (0, g.b)), arch(g, 0, w, g.xt)]


@glyph("i")
def _i(g):
    return 0, [L((0, g.b), (0, g.xt)), D(0, g.xt + g.dot)]


@glyph("j")
def _j(g):
    s, rx, ry = 170, 150, 130
    return s, [Lp([(s, g.xt)] + arc(s - rx, g.d + ry, rx, ry, 0, -90)), D(s, g.xt + g.dot)]


@glyph("k")
def _k(g):
    w = 370
    return w, [L((0, g.at), (0, g.b)), L((w, g.xt), (0, g.b + (g.xt - g.b) * 0.42), (w, g.b))]


@glyph("l")
def _l(g):
    return 0, [L((0, g.at), (0, g.b))]


@glyph("m")
def _m(g):
    w = 640
    return w, [L((0, g.xt), (0, g.b)), arch(g, 0, w / 2, g.xt), arch(g, w / 2, w, g.xt)]


@glyph("n")
def _n(g):
    w = 400
    return w, [L((0, g.xt), (0, g.b)), arch(g, 0, w, g.xt)]


@glyph("o")
def _o(g):
    return 440, [xo(g, 440)]


@glyph("p")
def _p(g):
    w = 420
    return w, [L((0, g.xt), (0, g.d)), xo(g, w)]


@glyph("q")
def _q(g):
    w = 420
    return w, [xo(g, w), L((w, g.xt), (w, g.d))]


@glyph("r", True)
def _r(g):
    w, rx = 270, 210
    ry = min(rx, (g.xt - g.b) * 0.55)
    return w, [L((0, g.xt), (0, g.b)), Lp(arc(rx, g.xt - ry, rx, ry, 180, 62))]


@glyph("s")
def _s(g):
    w = 370
    return w, [Lp(s_curve(w, g.xt, g.b))]


@glyph("t", True)
def _t(g):
    w, s, rx, ry = 290, 100, 160, 130
    return w, [Lp([(s, g.at - 40)] + arc(s + rx, g.b + ry, rx, ry, 180, 290)), L((0, g.xt), (s + 160, g.xt))]


@glyph("u")
def _u(g):
    w = 400
    ra = min(w / 2, (g.xt - g.b) * 0.55)
    return w, [Lp([(0, g.xt)] + arc(w / 2, g.b + ra, w / 2, ra, 180, 360) + [(w, g.b + ra)]), L((w, g.xt), (w, g.b))]


@glyph("v", True)
def _v(g):
    w = 440
    return w, [L((0, g.xt), (w / 2, g.b), (w, g.xt))]


@glyph("w", True)
def _w(g):
    w = 660
    return w, [L((0, g.xt), (w * 0.25, g.b), (w / 2, g.b + (g.xt - g.b) * 0.75), (w * 0.75, g.b), (w, g.xt))]


@glyph("x", True)
def _x(g):
    w = 420
    return w, [L((0, g.xt), (w, g.b)), L((0, g.b), (w, g.xt))]


@glyph("y", True)
def _y(g):
    w = 440
    xd = w - (w / 2) * (g.xt - g.d) / (g.xt - g.b)
    return w, [L((0, g.xt), (w / 2, g.b)), L((w, g.xt), (xd, g.d))]


@glyph("z")
def _z(g):
    w = 380
    return w, [L((0, g.xt), (w, g.xt), (0, g.b), (w, g.b))]


# ---------------------------------------------------------------- números
@glyph("0")
def _0(g):
    w = 460
    return w, [Lp(ell(w / 2, g.m, w / 2, (g.t - g.b) / 2))]


@glyph("1")
def _1(g):
    w = 280
    return w, [L((0, g.t - (g.t - g.b) * 0.22), (w * 0.62, g.t), (w * 0.62, g.b))]


@glyph("2")
def _2(g):
    w = 440
    ry = (g.t - g.b) * 0.27
    return w, [Lp(arc(w / 2, g.t - ry, w / 2, ry, 160, -25) + [(0, g.b), (w, g.b)])]


@glyph("3")
def _3(g):
    w = 440
    H = g.t - g.b
    hu, hl = H * 0.235, H * 0.265
    up = arc(w / 2, g.t - hu, w / 2 * 0.92, hu, 155, -90)
    lo = arc(w / 2, g.b + hl, w / 2, hl, 90, -155)
    return w, [Lp(up + lo[1:])]


@glyph("4")
def _4(g):
    w = 470
    y = g.b + (g.t - g.b) * 0.3
    return w, [L((w * 0.72, g.b), (w * 0.72, g.t), (0, y), (w, y))]


@glyph("5")
def _5(g):
    w = 450
    ry = (g.t - g.b) * 0.31
    cy = g.b + ry
    a = math.radians(140)
    x0, y0 = w / 2 + w / 2 * math.cos(a), cy + ry * math.sin(a)
    return w, [Lp([(w * 0.95, g.t), (x0, g.t)] + arc(w / 2, cy, w / 2, ry, 140, -150))]


def _six(g, w):
    ry = (g.t - g.b) * 0.32
    cy = g.b + ry
    a = math.radians(165)
    return [Lp(ell(w / 2, cy, w / 2, ry)), L((w * 0.72, g.t), (w / 2 + w / 2 * math.cos(a), cy + ry * math.sin(a)))]


@glyph("6")
def _6(g):
    return 450, _six(g, 450)


@glyph("7", True)
def _7(g):
    w = 440
    return w, [L((0, g.t), (w, g.t), (w * 0.3, g.b))]


@glyph("8")
def _8(g):
    w = 450
    H = g.t - g.b
    hu, hl = H * 0.23, H * 0.27
    return w, [Lp(ell(w / 2, g.t - hu, w / 2 * 0.86, hu)), Lp(ell(w / 2, g.b + hl, w / 2, hl))]


@glyph("9")
def _9(g):
    w = 450
    return w, rot(w, _six(g, w), g.t + g.b, 0)


# ---------------------------------------------------------------- signos
def rot(w, strokes, hsum, dy):
    out = []
    for k, data in strokes:
        if k == "L":
            out.append(("L", [(w - x, hsum - y + dy) for x, y in data]))
        elif k == "D":
            x, y = data
            out.append(("D", (w - x, hsum - y + dy)))
    return out


@glyph(".")
def _dot(g):
    return 0, [D(0, g.b)]


@glyph(",")
def _comma(g):
    return 50, [L((50, g.b + 30), (0, g.b - 140))]


@glyph(":")
def _colon(g):
    return 0, [D(0, g.b), D(0, g.xt)]


@glyph(";")
def _semi(g):
    return 50, [L((50, g.b + 30), (0, g.b - 140)), D(50, g.xt)]


@glyph("!")
def _excl(g):
    return 0, [L((0, g.t), (0, g.b + g.dot)), D(0, g.b)]


@glyph("?")
def _quest(g):
    w = 380
    ry = (g.t - g.b) * 0.27
    cy = g.t - ry
    return w, [Lp(arc(w / 2, cy, w / 2, ry, 165, -90) + [(w / 2, g.b + g.dot)]), D(w / 2, g.b)]


@glyph("¡")
def _iexcl(g):
    w, s = _excl(g)
    return w, rot(w, s, g.t + g.b, -(CAP - XH))


@glyph("¿")
def _iquest(g):
    w, s = _quest(g)
    return w, rot(w, s, g.t + g.b, -(CAP - XH))


@glyph("'")
def _apos(g):
    return 0, [L((0, g.t), (0, g.t - 170))]


@glyph("’")
def _rsq(g):
    return 50, [L((50, g.t), (0, g.t - 190))]


@glyph('"')
def _quot(g):
    return 160, [L((0, g.t), (0, g.t - 170)), L((160, g.t), (160, g.t - 170))]


@glyph("-")
def _hyph(g):
    return 240, [L((0, 280), (240, 280))]


@glyph("–")
def _endash(g):
    return 460, [L((0, 280), (460, 280))]


@glyph("(")
def _lpar(g):
    return 130, [Lp(arc(260, g.m - 40, 260, (g.t - g.b) / 2 + 140, 122, 238))]


@glyph(")")
def _rpar(g):
    w, s = _lpar(g)
    return w, [("L", [(w - x, y) for x, y in s[0][1]])]


@glyph("/", True)
def _slash(g):
    return 300, [L((0, g.b - 60), (300, g.t))]


@glyph("+")
def _plus(g):
    w = 380
    return w, [L((w / 2, 110), (w / 2, 450)), L((0, 280), (w, 280))]


@glyph("=")
def _eq(g):
    w = 380
    return w, [L((0, 190), (w, 190)), L((0, 370), (w, 370))]


@glyph("#")
def _hash(g):
    w = 500
    return w, [L((120, g.b), (190, g.t - 60)), L((310, g.b), (380, g.t - 60)),
               L((20, 220), (480, 220)), L((40, 450), (500, 450))]


@glyph("%")
def _pct(g):
    w = 580
    rx, ry = 70 + g.r * 0.6, 95 + g.r * 0.6
    return w, [Lp(ell(rx, g.t - ry, rx, ry)), Lp(ell(w - rx, g.b + ry, rx, ry)), L((w * 0.82, g.t), (w * 0.18, g.b))]


@glyph("$")
def _dollar(g):
    w = 460
    return w, [Lp(s_curve(w, g.t, g.b)), L((w / 2, g.t + 70), (w / 2, g.b - 70))]


@glyph("@")
def _at(g):
    cy = 260
    pts = [(440, 390), (440, 190)] + arc(510, 190, 70, 70, 180, 360) + [(580, cy)] + arc(330, cy, 250, 310, 0, 300)
    return 580, [Lp(ell(330, cy, 110, 130)), Lp(pts)]


@glyph("°")
def _deg(g):
    rr = 60 + g.r * 0.3
    return 2 * rr, [Lp(ell(rr, g.t - rr, rr, rr))]


# ---------------------------------------------------------------- acentos
def accent(kind, cx, g, caps):
    y0 = (CAP + 40 + g.r) if caps else (XH + 60 + g.r)
    if kind == "acute":
        return [L((cx - 45, y0), (cx + 50, y0 + 100))]
    if kind == "grave":
        return [L((cx + 45, y0), (cx - 50, y0 + 100))]
    if kind == "tilde":
        pts = [(cx - 110 + i * 11, y0 + 35 + 30 * math.sin(i / 20 * 2 * math.pi)) for i in range(21)]
        return [Lp(pts)]
    if kind == "dier":
        dx = 50 + g.r * 0.9
        return [D(cx - dx, y0 + 30), D(cx + dx, y0 + 30)]


COMPOSE = {}
for base, marks in {"A": "ÁÀ", "E": "ÉÈ", "I": "ÍÌ", "O": "ÓÒ", "U": "ÚÙ",
                    "a": "áà", "e": "éè", "ı": "íì", "o": "óò", "u": "úù"}.items():
    COMPOSE[marks[0]] = (base, "acute")
    COMPOSE[marks[1]] = (base, "grave")
COMPOSE.update({"Ñ": ("N", "tilde"), "ñ": ("n", "tilde"), "Ü": ("U", "dier"), "ü": ("u", "dier"), "ï": ("ı", "dier")})


# ---------------------------------------------------------------- símbolos de marca (rellenos)
def heart_poly(width):
    pts = []
    for i in range(240):
        t = 2 * math.pi * i / 240
        pts.append((16 * math.sin(t) ** 3, 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)))
    p = Polygon(pts)
    p = affinity.scale(p, width / 32, width / 32, origin=(0, 0))
    minx, miny, _, _ = p.bounds
    return affinity.translate(p, -minx, -miny)


def sparkle_poly(R):
    pts = []
    for i in range(240):
        a = 2 * math.pi * i / 240
        c, s = math.cos(a), math.sin(a)
        pts.append((R * math.copysign(abs(c) ** 2.3, c), R * math.copysign(abs(s) ** 2.3, s)))
    p = Polygon(pts).buffer(R * 0.04, quad_segs=8)
    minx, miny, _, _ = p.bounds
    return affinity.translate(p, -minx, -miny)


PLANE_PTS = [(57, 84), (57, 64), (94, 42), (94, 33), (57, 44), (57, 22), (68, 13), (68, 6), (50, 11),
             (32, 6), (32, 13), (43, 22), (43, 44), (6, 33), (6, 42), (43, 64), (43, 84)]


def plane_poly(width, angle=-45):
    pts = PLANE_PTS + arc(50, 84, 7, 7, 180, 0, step=15)[1:-1]
    p = Polygon(pts).buffer(1.2, quad_segs=6)
    p = affinity.rotate(p, angle, origin=(50, 50))
    minx, miny, maxx, _ = p.bounds
    p = affinity.scale(p, width / (maxx - minx), width / (maxx - minx), origin=(minx, miny))
    minx, miny, _, _ = p.bounds
    return affinity.translate(p, -minx, -miny)


SPECIAL = {"♥": lambda: affinity.translate(heart_poly(620), 0, 20),
           "✦": lambda: affinity.translate(sparkle_poly(300), 0, 40),
           "✈": lambda: affinity.translate(plane_poly(680), 0, -40)}


# ---------------------------------------------------------------- construcción
def polys(geom):
    if geom.is_empty:
        return []
    if geom.geom_type == "Polygon":
        return [geom]
    return [p for p in getattr(geom, "geoms", []) if p.geom_type == "Polygon"]


def render_weight(r):
    """Devuelve {char: (geom, advance)} para un peso."""
    # Las minúsculas usan un trazo algo más ligero en los pesos gruesos
    # para que los ojos de la a, e, s… no se cierren.
    rl = 42 + (r - 42) * 0.6
    G_up, G_lo = Ctx(r), Ctx(rl)
    sf = 1 + (r - 42) / 350
    out = {}

    def is_lower(ch):
        return ch.islower() or ch == "ı"

    def make(strokes, w, diag, rad, extra=()):
        sb = 14 if diag else 46
        off = rad + sb
        shapes = []
        items = [(s, 1.0) for s in strokes] + [(s, 0.78) for s in extra]  # acentos más ligeros
        for (k, data), f in items:
            if k == "L":
                shapes.append(LineString([(off + x * sf, y) for x, y in data]).buffer(rad * f, quad_segs=16))
            elif k == "D":
                x, y = data
                shapes.append(Point(off + x * sf, y).buffer(rad * 1.15 * f, quad_segs=16))
        geom = unary_union(shapes).simplify(0.5)
        return geom, round(w * sf + 2 * rad + 2 * sb)

    for ch, (fn, diag) in GLYPHS.items():
        g = G_lo if is_lower(ch) else G_up
        w, strokes = fn(g)
        out[ch] = make(strokes, w, diag, g.r)
    for ch, (base, mark) in COMPOSE.items():
        fn, diag = GLYPHS[base]
        g = G_lo if is_lower(base) else G_up
        w, strokes = fn(g)
        out[ch] = make(strokes, w, diag, g.r, accent(mark, w / 2, g, base.isupper()))
    for ch, fn in SPECIAL.items():
        p = fn()
        minx, _, maxx, _ = p.bounds
        out[ch] = (affinity.translate(p, 60), round(maxx - minx + 120))
    out[" "] = (Polygon(), 250 + r)
    return out


def to_glyph(geom):
    pen = TTGlyphPen(None)
    for p in polys(geom):
        p = orient(p, -1.0)  # contorno exterior en sentido horario (TrueType)
        for ring in [p.exterior] + list(p.interiors):
            pts = []
            for x, y in list(ring.coords)[:-1]:
                q = (round(x), round(y))
                if not pts or pts[-1] != q:
                    pts.append(q)
            if len(pts) > 1 and pts[0] == pts[-1]:
                pts.pop()
            if len(pts) < 3:
                continue
            pen.moveTo(pts[0])
            for q in pts[1:]:
                pen.lineTo(q)
            pen.closePath()
    return pen.glyph()


def gname(ch):
    return "space" if ch == " " else "uni%04X" % ord(ch)


def build_font(style, wclass, data):
    order = [".notdef"] + sorted((gname(c) for c in data), key=lambda n: (n != "space", n))
    glyphs, adv = {}, {}
    pen = TTGlyphPen(None)
    for a, b2, c, d2 in [(50, 0, 450, 700), (100, 50, 400, 650)]:
        if a == 50:
            pen.moveTo((a, b2)); pen.lineTo((a, d2)); pen.lineTo((c, d2)); pen.lineTo((c, b2))
        else:
            pen.moveTo((a, b2)); pen.lineTo((c, b2)); pen.lineTo((c, d2)); pen.lineTo((a, d2))
        pen.closePath()
    glyphs[".notdef"], adv[".notdef"] = pen.glyph(), 500
    for ch, (geom, a) in data.items():
        glyphs[gname(ch)], adv[gname(ch)] = to_glyph(geom), a
    cmap = {ord(ch): gname(ch) for ch in data}
    cmap[0xA0] = "space"

    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    glyf = fb.font["glyf"]
    metrics = {}
    for n in order:
        gl = glyf[n]
        gl.recalcBounds(glyf)
        metrics[n] = (adv[n], getattr(gl, "xMin", 0))
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1050, descent=-280)

    ribbi = style in ("Regular", "Bold")
    names = dict(
        familyName=FAMILY if ribbi else f"{FAMILY} {style}",
        styleName=style if ribbi else "Regular",
        uniqueFontIdentifier=f"{VERSION};SANT;{PS_FAMILY}-{style}",
        fullName=f"{FAMILY} {style}",
        psName=f"{PS_FAMILY}-{style}",
        version=f"Version {VERSION}",
        copyright="© 2026 San't Viajes. Todos los derechos reservados.",
        manufacturer="San't Viajes",
        designer="San't Viajes — Rebranding 2026",
        description="Tipografía display redondeada de la marca San't Viajes. Viajes que conectan contigo.",
        licenseDescription="Uso exclusivo de San't Viajes y sus proveedores autorizados.",
    )
    if not ribbi:
        names.update(typographicFamily=FAMILY, typographicSubfamily=style)
    fb.setupNameTable(names)
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-260, sTypoLineGap=80,
                usWinAscent=1100, usWinDescent=320, sxHeight=XH, sCapHeight=CAP,
                usWeightClass=wclass, achVendID="SANT",
                fsSelection=(0x20 if style == "Bold" else 0x40) | 0x80, version=4)
    fb.setupPost()
    fb.font["head"].macStyle = 1 if style == "Bold" else 0
    ttf = os.path.join(ROOT, "fonts", "ttf", f"{PS_FAMILY}-{style}.ttf")
    fb.save(ttf)
    f = TTFont(ttf)
    f.flavor = "woff2"
    woff = os.path.join(ROOT, "fonts", "woff2", f"{PS_FAMILY}-{style}.woff2")
    f.save(woff)
    return ttf, woff, len(order)


# ---------------------------------------------------------------- logotipos SVG
def ring_d(ring, tx):
    pts = [tx(x, y) for x, y in list(ring.coords)[:-1]]
    return "M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in pts) + "Z"


def geom_d(geom, tx):
    return "".join(ring_d(rg, tx) for p in polys(geom) for rg in [p.exterior] + list(p.interiors))


def text_d(font, text, size, x, base, tracking=0, align="center"):
    s = size / 1000
    total = sum(font[c][1] for c in text) + tracking * (len(text) - 1)
    x0 = x - total * s / 2 if align == "center" else x
    out, cur = [], 0
    for c in text:
        geom, a = font[c]
        out.append(geom_d(geom, lambda px, py, c0=cur: (x0 + (c0 + px) * s, base - py * s)))
        cur += a + tracking
    return "".join(out), total * s


def shape_d(poly, cx, cy, w, angle=0):
    minx, miny, maxx, maxy = poly.bounds
    s = w / (maxx - minx)
    p = affinity.rotate(poly, -angle, origin="centroid") if angle else poly
    mx, my = (minx + maxx) / 2, (miny + maxy) / 2
    return geom_d(p, lambda px, py: (cx + (px - mx) * s, cy - (py - my) * s))


def isotipo_inner(c_route="#FFFFFF", c_plane=None, c_heart=None):
    c_plane = c_plane or PALETTE["sol"][0]
    c_heart = c_heart or PALETTE["corazon"][0]

    def hp(t, sc=10.5, cx=250, cy=282):
        X = 16 * math.sin(t) ** 3
        Y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        return cx + sc * X, cy - sc * (Y + 2.5)

    pin_top = (250, 272)
    route = [pin_top, hp(2 * math.pi)]
    n = 160
    t0, t1 = 2 * math.pi, 1.0
    for i in range(1, n + 1):
        route.append(hp(t0 + (t1 - t0) * i / n))
    d = "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in route)
    ex, ey = route[-1]
    heart = shape_d(heart_poly(100), 250, 312, 90)
    plane = shape_d(plane_poly(100, angle=0), ex + 46, ey - 48, 112, angle=-38)
    return (f'<path d="{d}" fill="none" stroke="{c_route}" stroke-width="15" stroke-linecap="round" '
            f'stroke-linejoin="round" stroke-dasharray="1 30"/>'
            f'<ellipse cx="250" cy="370" rx="40" ry="9" fill="{c_heart}" opacity=".9"/>'
            f'<path d="{heart}" fill="{c_heart}"/>'
            f'<path d="{plane}" fill="{c_plane}"/>')


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def sticker_logo(F, bg=None):
    black, bold = F["Black"], F["Bold"]
    P = {k: v[0] for k, v in PALETTE.items()}
    size1, size3 = 180, 60
    trk = -40
    # Línea 1: SAN ✦ T
    _, wsan = text_d(black, "SAN", size1, 0, 0, trk, "left")
    _, wt = text_d(black, "T", size1, 0, 0, trk, "left")
    gap = 46
    _, wvia = text_d(black, "VIAJES", size1 * 1.04, 0, 0, trk, "left")
    _, wtag = text_d(bold, "VIAJES QUE CONECTAN", size3, 0, 0, -10, "left")
    W = max(wsan + gap + wt, wvia, wtag) + 190
    cx = W / 2
    y1 = 95 + size1 * 0.7 + 20
    x1 = cx - (wsan + gap + wt) / 2
    d_san, _ = text_d(black, "SAN", size1, x1, y1, trk, "left")
    d_t, _ = text_d(black, "T", size1, x1 + wsan + gap, y1, trk, "left")
    y2 = y1 + size1 * 1.04 * 0.7 + 34
    d_via, _ = text_d(black, "VIAJES", size1 * 1.04, cx, y2, trk)
    y3 = y2 + size3 * 0.7 + 34
    d_t1, _ = text_d(bold, "VIAJES QUE CONECTAN", size3, cx, y3, -10)
    y4 = y3 + size3 * 0.7 + 22
    d_t2, _ = text_d(bold, "CONTIGO", size3, cx, y4, -10)
    spark = shape_d(sparkle_poly(100), x1 + wsan + gap / 2 + 4, y1 - size1 * 0.7 - 6, 62)
    H = y4 + 95
    gx = x1 + wsan - 30
    bridge = f"M{gx:.1f} {y1 - size1 * 0.6:.1f}h{gap + 60}v{size1 * 0.55:.1f}h{-(gap + 60)}Z"
    allp = d_san + d_t + d_via + d_t1 + d_t2 + spark + bridge
    body = ""
    if bg:
        body += f'<rect width="{W:.0f}" height="{H:.0f}" rx="48" fill="{bg}"/>'
    body += (f'<g stroke-linejoin="round" stroke-linecap="round">'
             f'<path d="{allp}" fill="#fff" stroke="#fff" stroke-width="86"/>'
             f'<path d="{allp}" fill="{P["noche"]}" stroke="{P["noche"]}" stroke-width="46"/></g>'
             f'<path d="{d_san + d_t}" fill="{P["brisa"]}"/>'
             f'<path d="{spark}" fill="{P["corazon"]}"/>'
             f'<path d="{d_via}" fill="{P["sol"]}"/>'
             f'<path d="{d_t1 + d_t2}" fill="{P["arena"]}"/>')
    return svg(W, H, body, "San't Viajes — Viajes que conectan contigo")


def horizontal_logo(F, dark):
    P = {k: v[0] for k, v in PALETTE.items()}
    black, bold = F["Black"], F["Bold"]
    c1 = P["brisa"] if dark else P["noche"]
    c2 = P["sol"] if dark else P["corazon"]
    c3 = P["arena"] if dark else P["noche"]
    route = "#FFFFFF" if dark else P["noche"]
    size, trk = 120, -30
    ix, iy, isz = 0, 0, 230
    tx = isz + 20
    _, wsan = text_d(black, "SAN", size, 0, 0, trk, "left")
    _, wt = text_d(black, "T", size, 0, 0, trk, "left")
    gap = 32
    base = 128
    d_san, _ = text_d(black, "SAN", size, tx, base, trk, "left")
    d_t, _ = text_d(black, "T", size, tx + wsan + gap, base, trk, "left")
    xv = tx + wsan + gap + wt + 34
    d_via, wvia = text_d(black, "VIAJES", size, xv, base, trk, "left")
    spark = shape_d(sparkle_poly(100), tx + wsan + gap / 2 + 3, base - size * 0.7 - 4, 42)
    d_tag, wtag = text_d(bold, "VIAJES QUE CONECTAN CONTIGO", 40, tx + 6, base + 62, 0, "left")
    W = max(xv + wvia, tx + wtag) + 16
    H = 230
    body = (f'<g transform="translate({ix},{iy}) scale({isz / 512})">{isotipo_inner(route)}</g>'
            f'<path d="{d_san + d_t}" fill="{c1}"/><path d="{spark}" fill="{P["corazon"]}"/>'
            f'<path d="{d_via}" fill="{c2}"/><path d="{d_tag}" fill="{c3}" opacity=".9"/>')
    return svg(W, H, body, "San't Viajes")


def mono_wordmark(F, color):
    black = F["Black"]
    size, trk = 160, -36
    _, wsan = text_d(black, "SAN", size, 0, 0, trk, "left")
    _, wt = text_d(black, "T", size, 0, 0, trk, "left")
    gap, base = 40, 150
    d1, _ = text_d(black, "SAN", size, 10, base, trk, "left")
    d2, _ = text_d(black, "T", size, 10 + wsan + gap, base, trk, "left")
    xv = 10 + wsan + gap + wt + 46
    d3, wv = text_d(black, "VIAJES", size, xv, base, trk, "left")
    sp = shape_d(sparkle_poly(100), 10 + wsan + gap / 2 + 3, base - size * 0.7 - 6, 54)
    return svg(xv + wv + 10, 190, f'<path d="{d1 + d2 + d3 + sp}" fill="{color}"/>', "San't Viajes")


def main():
    for sub in ("fonts/ttf", "fonts/woff2", "logos", "brand"):
        os.makedirs(os.path.join(ROOT, sub), exist_ok=True)
    F, report, css, css_embed = {}, [], [], []
    for style, wclass, r in WEIGHTS:
        data = render_weight(r)
        F[style] = data
        ttf, woff, n = build_font(style, wclass, data)
        report.append((style, n, os.path.getsize(ttf), os.path.getsize(woff)))
        fn = f"{PS_FAMILY}-{style}"
        css.append(f"@font-face{{font-family:\"{FAMILY}\";font-weight:{wclass};font-style:normal;font-display:swap;"
                   f"src:url(\"woff2/{fn}.woff2\") format(\"woff2\"),url(\"ttf/{fn}.ttf\") format(\"truetype\");}}")
        b64 = base64.b64encode(open(woff, "rb").read()).decode()
        css_embed.append(f"@font-face{{font-family:\"{FAMILY}\";font-weight:{wclass};font-style:normal;font-display:block;"
                         f"src:url(data:font/woff2;base64,{b64}) format(\"woff2\");}}")
    open(os.path.join(ROOT, "fonts", "sv-conecta.css"), "w", encoding="utf-8").write("\n".join(css) + "\n")
    open(os.path.join(ROOT, "fonts", "sv-conecta-embebida.css"), "w", encoding="utf-8").write("\n".join(css_embed) + "\n")

    P = {k: v[0] for k, v in PALETTE.items()}
    logos = {
        "logo-sticker.svg": sticker_logo(F),
        "logo-sticker-fondo.svg": sticker_logo(F, P["noche"]),
        "logo-horizontal-claro.svg": horizontal_logo(F, dark=False),
        "logo-horizontal-oscuro.svg": horizontal_logo(F, dark=True),
        "wordmark-noche.svg": mono_wordmark(F, P["noche"]),
        "wordmark-blanco.svg": mono_wordmark(F, "#FFFFFF"),
        "isotipo-app.svg": svg(512, 512, f'<rect width="512" height="512" rx="112" fill="{P["noche"]}"/>' + isotipo_inner(), "San't Viajes isotipo"),
        "isotipo-claro.svg": svg(512, 512, isotipo_inner(P["noche"]), "San't Viajes isotipo"),
        "isotipo-oscuro.svg": svg(512, 512, isotipo_inner(), "San't Viajes isotipo"),
    }
    for name, content in logos.items():
        open(os.path.join(ROOT, "logos", name), "w", encoding="utf-8").write(content)

    tokens = ":root{\n" + "".join(f"  --sv-{k}:{v[0]}; /* {v[1]} — {v[2]} */\n" for k, v in PALETTE.items()) + \
             f"  --sv-font-display:\"{FAMILY}\",\"Arial Rounded MT Bold\",system-ui,sans-serif;\n" \
             "  --sv-font-body:\"DM Sans\",system-ui,-apple-system,\"Segoe UI\",sans-serif;\n}\n"
    open(os.path.join(ROOT, "brand", "tokens.css"), "w", encoding="utf-8").write(tokens)
    json.dump({k: {"hex": v[0], "nombre": v[1], "uso": v[2]} for k, v in PALETTE.items()},
              open(os.path.join(ROOT, "brand", "colores.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    chars = "".join(sorted(c for c in F["Regular"] if c != " "))
    open(os.path.join(ROOT, "fonts", "juego-de-caracteres.txt"), "w", encoding="utf-8").write(chars + "\n")
    for row in report:
        print("%-8s %3d glifos  ttf %6d B  woff2 %6d B" % row)
    print("caracteres:", len(chars))


if __name__ == "__main__":
    main()
