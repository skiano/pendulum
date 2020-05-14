const TWO_PI = Math.PI * 2;
const QUARTER_CIRCLE = TWO_PI / 4

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

const rotate = ([x, y], [cx, cy], angle) => {
  const cosa = Math.cos(angle)
  const sina = Math.sin(angle)
  const rotatedX = cosa * (x - cx) - sina * (y - cy) + cx;
  const rotatedY = sina * (x - cx) + cosa * (y - cy) + cy;
  return [
    rotatedX,
    rotatedY,
  ]
}

const clip = (v, min, max) => {
  if (v < min) return min
  if (v > max) return max
  return v
}

const model = (options = {}) => {
  const {
    box,
    paper,
    projection,
    stringLength,
    initialAngle,
    initialVelocity,
  } = Object.assign({
    box: [1200, 1200, 1200],
    paper: [1200, 1200],
    stringLength: 900,
    // initialAngle: [QUARTER_CIRCLE / 2, 0],
    // initialVelocity: [0, 0.01],
    // initialAngle: [QUARTER_CIRCLE / 3, QUARTER_CIRCLE / 2],
    // initialVelocity: [0.0, 0.007],
    initialAngle: [-QUARTER_CIRCLE * 0.4, 0],
    initialVelocity: [0.0, 0.004],
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

  /////////////////////
  // CHANGING THINGS //
  /////////////////////

  let xangle = initialAngle[0]
  let yangle = initialAngle[1]
  let [vx, vy] = initialVelocity
  let prevX = 0
  let prevY = 0
  let prevZ = 0
  let bobX = fixedPoint[0] + Math.sin(initialAngle) * stringLength
  let bobY = fixedPoint[1]
  let bobZ = fixedPoint[2] - Math.cos(initialAngle) * stringLength
  let gravity = -0.0015
  let isDrawing = true

  let paperAngle = TWO_PI
  let paperCenter = fixedPoint
  let paperPoints = []
  let streamPoints = []

  let paperRectangle = [
    [fixedPoint[0] - (paper[0] / 2), fixedPoint[1] - (paper[0] / 2)],
    [fixedPoint[0] + (paper[0] / 2), fixedPoint[1] - (paper[0] / 2)],
    [fixedPoint[0] + (paper[0] / 2), fixedPoint[1] + (paper[0] / 2)],
    [fixedPoint[0] - (paper[0] / 2), fixedPoint[1] + (paper[0] / 2)],
  ]

  ///////////////////////
  // 2D PICTURE LAYERS //
  ///////////////////////

  const PICTURE_2D = picture()

  const LINE_2D = PICTURE_2D.$add('path', {
    d: ``,
    fill: 'none',
    stroke: 'rgba(200, 20, 55, 1)',
    'stroke-width': 2,
  })

  ///////////////////////
  // 3D PICTURE LAYERS //
  ///////////////////////

  const PICTURE_3D = picture()

  // BACKGROUND
  PICTURE_3D.$add('path', {
    d: 'M 0,0 L 1200,0 L 1200,1200 L 0,1200 Z',
    fill: 'rgba(0, 0, 0, 0.03)',
    'stroke-width': 1,
  })

  // PAPER
  const PAPER_3D = PICTURE_3D.$add('path', {
    d: '',
    fill: 'white',
    stroke: 'rgba(0, 0, 0, 0.4)',
    'stroke-width': 1,
  })

  const LINE_3D = PICTURE_3D.$add('path', {
    d: '',
    fill: 'none',
    stroke: 'rgba(200, 20, 55, 1)',
    'stroke-width': 2,
  })

  // BOB SHADOW
  const SHADOW_3D = PICTURE_3D.$add('ellipse', {
    rx: 16,
    ry: 8,
    fill: 'rgba(0, 0, 0, 0.2)',
  })

  // PLUMB LINE
  const f = projection(fixedPoint)
  const c = projection([w/2, d/2, 0])
  PICTURE_3D.$add('line', {
    x1: f[0],
    y1: f[1],
    x2: c[0],
    y2: c[1],
    stroke: 'rgba(0, 0, 255, 1)',
    'stroke-dasharray': "6,6"
  })
  PICTURE_3D.$add('ellipse', {
    cx: c[0],
    cy: c[1],
    rx: 5,
    ry: 3,
    fill: 'rgba(0, 0, 255, 1)',
  })

  // STRING
  const STRING_3D = PICTURE_3D.$add('line', {
    stroke: 'rgba(200, 20, 55, 1)',
    'stroke-width': 1.5,
  })

  // BOB
  const BOB_3D = PICTURE_3D.$add('circle', {
    r: 12,
    fill: 'rgba(200, 20, 55, 1)',
  })

  // FIXED POINT
  PICTURE_3D.$add('ellipse', {
    cx: f[0],
    cy: f[1],
    rx: 5,
    ry: 3,
    fill: 'rgba(0, 0, 255, 1)',
  })

  ///////////////
  // ANIMATION //
  ///////////////

  const updatePosition = () => {
    let tanx = Math.tan(xangle)
    let tany = Math.tan(yangle)
    let h = stringLength / Math.sqrt(1 + Math.pow(tanx, 2) + Math.pow(tany, 2))
    let dx = h * tanx
    let dy = h * tany

    bobX = fixedPoint[0] + dx
    bobY = fixedPoint[1] + dy
    bobZ = fixedPoint[2] - h

    // paperPoints.push(rotate([bobX, bobY], paperCenter, -paperAngle))

    let prev = streamPoints
    streamPoints = []
    prev.forEach(s => {
      s.v[2] = s.v[2] -1
      s.p = [
        s.p[0] + s.v[0],
        s.p[1] + s.v[1],
        s.p[2] + s.v[2],
      ]
      if (s.p[2] <= 0) {
        paperPoints.push(rotate([s.p[0], s.p[1]], paperCenter, -paperAngle))
      } else {
        streamPoints.push(s)
      }
    })

    if (isDrawing && prevX) {
      streamPoints.push({
        p: [bobX, bobY, bobZ],
        v: [
          (bobX - prevX) * 1,
          (bobY - prevY) * 1,
          (bobZ - prevZ) * 1,
        ]
      })
    }

    prevX = bobX
    prevY = bobY
    prevZ = bobZ
  }

  const update3dPicture = () => {
    const b = projection([bobX, bobY, bobZ])
    const s = projection([bobX, bobY, 0])

    STRING_3D.update({
      x1: f[0],
      y1: f[1],
      x2: b[0],
      y2: b[1],
    })

    BOB_3D.update({
      cx: b[0],
      cy: b[1],
    })

    SHADOW_3D.update({
      cx: s[0],
      cy: s[1],
    })

    LINE_3D.update({
      d: [
        paperPoints.map((p, i) => {
          p = rotate(p, paperCenter, paperAngle)
          p = projection(p).join()
          return i > 0 ? `L${p}` : `M${p}`
        }).join(' '),
          streamPoints.map((s, i) => {
          p = projection(s.p).join()
          return i > 0 || paperPoints.length  ? `L${p}` : `M${p}`
        }).join(' ')
      ].join(' '),
    })

    PAPER_3D.update({
      d: paperRectangle.map((p, i) => {
        p = rotate(p, paperCenter, paperAngle)
        p = projection(p).join()
        return i > 0 ? `L${p}` : `M${p}`
      }).join(' ') + 'Z'
    })
  }

  const update2dPicture = () => {
    if (isDrawing && paperPoints.length) {
      const [x, y] = paperPoints[paperPoints.length - 1]
      const p = `${x},${1200 - y}`
      const d = LINE_2D._attributes.d
      LINE_2D.update({
        d: d ? d + ` L${p}` : `M${p}`
      })
    }
  }
  
  let t = 0
  let pv = 0.01
  let pa = 0.00005
  let start = Date.now()

  function loop() {
    t = Date.now() - start

    updatePosition()
    update2dPicture()
    update3dPicture()

    // calcluate angular accelerations
    const ax = gravity * Math.sin(xangle)
    const ay = gravity * Math.sin(yangle)

    // Increment velocities (multiply by frame time?)
    vx += ax
    vy += ay

    // Increment angles
    xangle = clip(xangle + vx, -QUARTER_CIRCLE, QUARTER_CIRCLE);
    yangle = clip(yangle + vy, -QUARTER_CIRCLE, QUARTER_CIRCLE);

    // damp
    vx *= 0.9998
    vy *= 0.9998

    // rotate paper
    if (isDrawing) {
      pa = Math.sin(t / 600) * -0.001
      pv += pa
    } else {
      pv = Math.abs(pv) < 0.000001 ? 0 : pv * 0.9
    }

    paperAngle += pv

    if (t > 25000) {
      isDrawing = false
    }

    requestAnimationFrame(loop)
  }

  loop()

  return [PICTURE_3D, PICTURE_2D]
}

// https://www.khanacademy.org/computing/computer-programming/programming-natural-simulations/programming-oscillations/a/trig-and-forces-the-pendulum

const pics = model()
const container = document.getElementById('pictures')
pics.forEach((p) => container.appendChild(p))
