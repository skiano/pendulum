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

const cX = 600
const cY = 1000

const line = create('line', {
  x1: cX,
  y1: 0,
  x2: cX,
  y2: cY,
  style: 'stroke:rgb(255,0,0);stroke-width:2',
});

const bob = create('circle', {
  cx: cX,
  cy: cY,
  r: 20,
  fill: 'rgba(255, 0, 0, 1)',
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
p2.$add(trail)

document.getElementById('pictures').appendChild(p2)


let length = cY
let angle = Math.PI / 4
let angularVelocity = 0
let angularAcceleration = 0
let g = 10
let x = cX
let y = cY


let f = 0
let o = 0.4
let nextX = 0
let nextY = 0
let start = Date.now();

const loop = () => {
  const t = Date.now() - start

  x = Math.sin(angle) * length
  y = Math.cos(angle) * length

  bob.update({
    cx: x + cX,
    cy: y,
  })

  line.update({
    x2: x + cX,
    y2: y,
  })

  angularAcceleration = -0.005 * Math.sin(angle)

  angle += angularVelocity
  angularVelocity += angularAcceleration
  angularVelocity = angularVelocity * 0.993

  if (Math.abs(y - nextY) > 2 || Math.abs(x + cX - nextX) > 2) {
    nextX = x + cX
    nextY = y

    console.log(t)

    const dY = t / 5 % 1200

    trail.update({
      d: trail._attributes.d ? trail._attributes.d + ` L${nextX},${dY}` : `M${nextX},${dY}` 
    })
   
    // p2.$add(create('circle', {
    //   cx: x + cX,
    //   cy: y,
    //   r: 4,
    //   fill: `rgba(0, 0, 255, ${o})`,
    // }))
  }

  if (f++ < 3400) requestAnimationFrame(loop)
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
