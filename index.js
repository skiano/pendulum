const TWO_PI = Math.PI * 2;

const create = (tag = 'circle', attributes) => {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', tag)
  elm._attributes = {}
  elm._ismagic = true
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

  pict.$add = (...args) => {
    const elm = args[0]._ismagic
      ? args[0]
      : create(...args)
    svg.appendChild(elm)
    return elm    
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

const distance = (a, b) => {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow((b[i] - a[i]), 2)
  }
  return Math.sqrt(sum)
}

const model = (options = {}) => {
  const {
    box,
    projection,
    stringLength,
    initialAngle,
    initialVelocity,
  } = Object.assign({
    box: [1200, 1200, 1200],
    stringLength: 1100,
    initialAngle: TWO_PI / 8,
    initialVelocity: [0, 0, 0],
    projection: ([x, y, z = 0]) => {
      const tilt = 300
      const shift = 275
      const base = 1100
      const yf = y / 1200
      const zoom = 0.6
      return [(x * zoom) + (shift * yf) + 100, base - (tilt * yf) - z * zoom]
    },
  }, options)

  const [w, d, h] = box
  const fixedPoint = [w/2, d/2, h];

  console.log(initialAngle, Math.sin(initialAngle))

  let bobX = fixedPoint[0] + Math.sin(initialAngle) * stringLength
  let bobY = fixedPoint[1]
  let bobZ = fixedPoint[2] - Math.cos(initialAngle) * stringLength

  console.log(bobZ, bobX, bobY)

  const TWO_D = picture()
  const THREE_D = picture()

  // BASE
  THREE_D.$add('path', {
    d: [
      `M ${projection([0, 0, 0]).join()}`,
      `L ${projection([w, 0, 0]).join()}`,
      `L ${projection([w, d, 0]).join()}`,
      `L ${projection([0, d, 0]).join()}`,
      `Z`
    ],
    fill: 'none',
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-dasharray': "6,6"
  })

  // BACK
  THREE_D.$add('path', {
    d: [
      `M ${projection([0, d, 0]).join()}`,
      `L ${projection([0, d, h]).join()}`,
      `L ${projection([w, d, h]).join()}`,
      `L ${projection([w, d, 0]).join()}`,
      `Z`
    ],
    fill: 'none',
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-dasharray': "6,6"
  })

  // FIXED POINT
  const f = projection(fixedPoint)
  THREE_D.$add('circle', {
    cx: f[0],
    cy: f[1],
    r: 5,
    fill: 'rgba(0, 0, 255, 1)',
  })

  // PLUMB LINE
  const c = projection([w/2, d/2, 0])
  THREE_D.$add('line', {
    x1: f[0],
    y1: f[1],
    x2: c[0],
    y2: c[1],
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-dasharray': "6,6"
  })
  THREE_D.$add('circle', {
    cx: c[0],
    cy: c[1],
    r: 5,
    fill: 'rgba(0, 0, 255, 1)',
  })

  // STRING
  const b = projection([bobX, bobY, bobZ])
  const string = THREE_D.$add('line', {
    x1: f[0],
    y1: f[1],
    x2: b[0],
    y2: b[1],
    stroke: 'rgba(0, 0, 255, 1)',
  })

  // BOB
  const bob = THREE_D.$add('circle', {
    cx: b[0],
    cy: b[1],
    r: 12,
    fill: 'rgba(0, 0, 255, 1)',
  })

  // RIGHT
  THREE_D.$add('path', {
    d: [
      `M ${projection([w, 0, 0]).join()}`,
      `L ${projection([w, d, 0]).join()}`,
      `L ${projection([w, d, h]).join()}`,
      `L ${projection([w, 0, h]).join()}`,
      `Z`
    ],
    fill: 'none',
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-width': 1.5,
  })

  // FRONT
  THREE_D.$add('path', {
    d: [
      `M ${projection([0, 0, 0]).join()}`,
      `L ${projection([0, 0, h]).join()}`,
      `L ${projection([w, 0, h]).join()}`,
      `L ${projection([w, 0, 0]).join()}`,
      `Z`
    ],
    fill: 'none',
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-width': 1.5,
  })

  // TOP
  THREE_D.$add('path', {
    d: [
      `M ${projection([0, 0, h]).join()}`,
      `L ${projection([w, 0, h]).join()}`,
      `L ${projection([w, d, h]).join()}`,
      `L ${projection([0, d, h]).join()}`,
      `Z`
    ],
    fill: 'none',
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-width': 1.5,
  })

  return [THREE_D, TWO_D]
}

const pics = model()

const container = document.getElementById('pictures')

pics.forEach((p) => container.appendChild(p))


//////////////
//////////////


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

