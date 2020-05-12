const create = (tag = 'circle', attributes) => {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', tag)
  elm._attributes = {}
  elm.update = (attr) => {
    for (let a in attr) {
      if (elm._attributes[a] !== attr[a]) {
        elm._attributes[a] = attr[a]
        elm.setAttribute(a, attr[a])
      }
    }
  }
  elm.update(attributes)
  return elm
};

const picture = () => {
  const pict = document.createElement('div');
  const wrap = document.createElement('div');
  const svg = create('svg', {
    fill: "#333",
    viewBox: "0 0 1200 1200",
  });

  pict.classList.add('picture');
  wrap.classList.add('picture__content');

  wrap.appendChild(svg);
  pict.appendChild(wrap);

  pict.$add = (elm) => {
    svg.appendChild(elm)
  }

  return pict;
};

const project = (x, y) => {
  const tilt = 300
  const shift = 230
  const base = 1000
  const yf = y / 1200
  const scale = 0.8
  return [(x * scale) + (shift * yf), base - (tilt * yf)]
}

const pw = 1200
const ph = 1200
const origin = [pw / 2, 0]

const trail = create('path', {
  d: ``,
  fill: 'none',
  stroke: 'rgba(0, 0, 255, 1)',
  'stroke-width': '1',
  'stroke-linecap': 'round',
  // 'stroke-dasharray': "10,10"
});

const base = create('path', {
  d: `M${project(0,0).join()} L${project(1200,0).join()} L${project(1200,1200).join()} L${project(0,1200).join()} Z`,
  fill: 'rgba(0, 0, 0, 0.03)',
  stroke: 'rgba(0, 0, 0, 0.4)',
  'stroke-width': '1',
  // 'stroke-linecap': 'round',
  // 'stroke-dasharray': "10,10"
});

const circle = create('path', {
  d: ``,
  fill: 'none',
  stroke: 'rgba(255, 0, 0, 0.5)',
  'stroke-width': '3',
  'stroke-linecap': 'round',
  'stroke-dasharray': "10,10"
});

const p2 = picture()

p2.$add(base)
p2.$add(trail)

document.getElementById('pictures').appendChild(p2)

let f = 0;
let start = Date.now();
let time = start;

let amp = 500

const loop = () => {
  time = Date.now() - start

  amp *= 0.99995

  const freq = 0.0052
  const displace = 0

  const r = (amp * Math.sin(freq * (time - displace)))

  const theta = time / 1000
  const x = r * Math.sin(theta) + 600
  const y = r * Math.cos(theta) + 600

  const c = project(x, y)

  trail.update({
    d: trail._attributes.d
      ? trail._attributes.d + ` L${c[0]},${c[1]}`
      : `M${c[0]},${c[1]}` 
  })

  if (f++ < 4400) requestAnimationFrame(loop)
}

loop()

