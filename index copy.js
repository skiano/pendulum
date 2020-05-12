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

const pw = 1200
const ph = 1200
const origin = [pw / 2, 0]
const length = 1000

const calc = (thetaX, thetaY) => {
  const G = -0.005
  const sinThetaX = Math.sin(thetaX)
  const sinThetaY = Math.sin(thetaY)

  return {
    position: {
      x: sinThetaX * length,
      y: sinThetaY * length,
      z: Math.cos(thetaX) * length,
    },
    acceleration: {
      x: sinThetaX * G,
      y: sinThetaY * G,
    },
  }
}

const line = create('line', {
  x1: origin[0],
  y1: 0,
  x2: origin[0],
  y2: origin[1] + length,
  style: 'stroke:rgb(255,0,0);stroke-width:2',
});

const line2 = create('line', {
  x1: origin[0],
  y1: 0,
  x2: origin[0],
  y2: origin[1] + length,
  style: 'stroke:rgb(0,0,255);stroke-width:2',
});

const bob = create('circle', {
  cx: origin[0],
  cy: origin[1] + length,
  r: 20,
  fill: 'rgba(255, 0, 0, 1)',
});

const bob2 = create('circle', {
  cx: origin[0],
  cy: origin[1] + length,
  r: 20,
  fill: 'rgba(0, 0, 255, 1)',
});

const trail = create('path', {
  d: ``,
  fill: 'none',
  stroke: 'rgba(0, 0, 0, 0.5)',
  'stroke-width': '3',
  'stroke-linecap': 'round',
  'stroke-dasharray': "10,10"
});

const p2 = picture();
p2.$add(line)
p2.$add(bob)
p2.$add(line2)
p2.$add(bob2)
p2.$add(trail)

document.getElementById('pictures').appendChild(p2)

// let dx = 600
// let dy = 600

let f = 0
let time = Date.now();
let xAngle = Math.PI / 2
let yAngle = Math.PI / 6
let xVelocity = 0
let yVelocity = 0
let x = 0
let y = 0
let z = 0

const loop = () => {
  const DAMP = 0.993
  const { position, acceleration } = calc(xAngle, yAngle)

  time = Date.now() - time

  x = position.x + origin[0]
  y = position.y + origin[0]
  z = position.z + origin[1]

  bob.update({ cx: x, cy: z })
  line.update({ x2: x, y2: z })

  bob2.update({ cx: y, cy: z })
  line2.update({ x2: y, y2: z })

  xAngle += xVelocity
  yAngle += yVelocity

  xVelocity += acceleration.x
  xVelocity = xVelocity * DAMP
  yVelocity += acceleration.y
  yVelocity = yVelocity * DAMP

  const trailX = position.x + 600 
  const trailY = position.y + 600
  trail.update({
    d: trail._attributes.d ? trail._attributes.d + ` L${trailX},${trailY}` : `M${trailX},${trailY}` 
  })

  if (f++ < 1400) requestAnimationFrame(loop)
}

loop()








// https://css-tricks.com/svg-path-syntax-illustrated-guide/

const exampleLine = picture();

const dots = [
  [100, 100],
  [200, 900],
  [400, 800],
  [200, 400],
  [1100, 500],
]

let p = ''

dots.forEach(([cx, cy], i) => {
  if (i === 0) {
    p += `M${cx},${cy}`
  } else {
    p += ` A 1 2, 20, 1 0, ${cx} ${cy}`
  }


  const d = create('circle', {
    cx: cx,
    cy: cy,
    r: 10,
    fill: 'rgba(0, 0, 255, 0.3)',
  })

  exampleLine.$add(d)
})

exampleLine.$add(create('path', {
  d: p,
  fill: 'none',
  stroke: 'red',
}))

document.getElementById('pictures').appendChild(exampleLine)
