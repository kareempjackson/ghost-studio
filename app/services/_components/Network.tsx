import { servicesPage } from "@/lib/services";

/** The plate's own units, off the comp. */
const W = 1436;
const H = 756;

/** The chain runs from saturated to pale, so the eye reads it in order. */
const FROM = [95, 207, 143] as const; // #5fcf8f
const TO = [227, 247, 236] as const; // #e3f7ec
const RING = "#7ee0a6";

const mix = (t: number) =>
  `rgb(${FROM.map((c, i) => Math.round(c + (TO[i] - c) * t)).join(" ")})`;

/** Each link bows a little, alternately, so the chain never reads as a graph. */
const BEND = [-28, 22, -26, 18, 12];

interface Node {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * A link as a filled ribbon rather than a stroke: wide where it leaves a
 * node, pinched between, so it reads as the two circles drawing on each
 * other. Both ends start at the centres; the circles cover them.
 */
function ribbon(a: Node, b: Node, bend: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const cx = (a.x + b.x) / 2 + nx * bend;
  const cy = (a.y + b.y) / 2 + ny * bend;
  const wa = a.r * 0.5;
  const wb = b.r * 0.5;
  const wm = Math.min(wa, wb) * 0.45;
  const p = (x: number, y: number, w: number, s: 1 | -1) =>
    `${(x + nx * w * s).toFixed(1)} ${(y + ny * w * s).toFixed(1)}`;
  return [
    `M${p(a.x, a.y, wa, 1)}`,
    `Q${p(cx, cy, wm, 1)} ${p(b.x, b.y, wb, 1)}`,
    `L${p(b.x, b.y, wb, -1)}`,
    `Q${p(cx, cy, wm, -1)} ${p(a.x, a.y, wa, -1)}`,
    "Z",
  ].join(" ");
}

/**
 * The people in the room, drawn as one chain on the forest ground.
 *
 * Wide, the whole plate shows; narrow, it is cropped from the sides rather
 * than shrunk, so the circles stay big enough to be faces.
 */
export function Network({ ground }: { ground: string }) {
  const { nodes, alt } = servicesPage.method.network;
  const links = nodes.slice(1).map((b, i) => ({ a: nodes[i], b, i }));

  return (
    <div
      style={{ backgroundColor: ground }}
      className="aspect-[4/3] overflow-hidden sm:aspect-[1436/756]"
    >
      <svg
        role="img"
        aria-label={alt}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="block size-full"
      >
        <defs>
          {links.map(({ a, b, i }) => (
            <linearGradient
              key={i}
              id={`gs-net-link-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
            >
              <stop offset="0" stopColor={mix(i / links.length)} />
              <stop offset="1" stopColor={mix((i + 1) / links.length)} />
            </linearGradient>
          ))}
          <radialGradient id="gs-net-ground" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#2f6556" />
            <stop offset="1" stopColor="#173d34" />
          </radialGradient>
          {nodes.map((node, i) => (
            <clipPath key={i} id={`gs-net-clip-${i}`}>
              <circle cx={node.x} cy={node.y} r={node.r} />
            </clipPath>
          ))}
        </defs>

        {links.map(({ a, b, i }) => (
          <path
            key={i}
            d={ribbon(a, b, BEND[i % BEND.length])}
            fill={`url(#gs-net-link-${i})`}
          />
        ))}

        {nodes.map((node, i) => (
          <g key={i}>
            {node.src ? (
              <image
                href={node.src}
                x={node.x - node.r}
                y={node.y - node.r}
                width={node.r * 2}
                height={node.r * 2}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#gs-net-clip-${i})`}
              />
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill="url(#gs-net-ground)"
              />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="none"
              stroke={RING}
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
