import './style.css'

const canvas = document.getElementById('field')
const ctx = canvas.getContext('2d')
let w = 0
let h = 0
let t = 0
const mouse = { x: 0.5, y: 0.35, tx: 0.5, ty: 0.35, active: false }
const sparks = []

function resize() {
  w = canvas.width = window.innerWidth * devicePixelRatio
  h = canvas.height = window.innerHeight * devicePixelRatio
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
}

window.addEventListener('resize', resize)
resize()

const nodes = Array.from({ length: 72 }, () => ({
  x: Math.random(),
  y: Math.random(),
  z: Math.random() * 0.8 + 0.2,
  vx: (Math.random() - 0.5) * 0.00042,
  vy: (Math.random() - 0.5) * 0.00032
}))

function spawnSpark(x, y) {
  sparks.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 2.2,
    vy: (Math.random() - 0.5) * 2.2,
    life: 1
  })
}

function draw() {
  t += 0.01
  mouse.x += (mouse.tx - mouse.x) * 0.07
  mouse.y += (mouse.ty - mouse.y) * 0.07
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  const mx = mouse.x * window.innerWidth
  const my = mouse.y * window.innerHeight
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, 480)
  g.addColorStop(0, 'rgba(61,126,255,0.2)')
  g.addColorStop(0.35, 'rgba(20,50,140,0.12)')
  g.addColorStop(1, 'rgba(4,8,22,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

  ctx.lineWidth = 1.3
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    for (let x = 0; x <= window.innerWidth; x += 6) {
      const y =
        window.innerHeight * 0.62 +
        Math.sin(x * 0.004 + t * (1.1 + i * 0.14) + i) * (16 + i * 9) +
        Math.sin(x * 0.0014 + t * 0.8 + i * 2) * 28 +
        (mouse.y - 0.5) * 36
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(90,150,255,${0.12 + i * 0.05})`
    ctx.stroke()
  }

  nodes.forEach((n) => {
    const dx = mouse.x - n.x
    const dy = mouse.y - n.y
    const dist = Math.hypot(dx, dy) || 0.001
    if (mouse.active && dist < 0.22) {
      n.vx += (dx / dist) * 0.000032
      n.vy += (dy / dist) * 0.000032
    }
    n.x += n.vx
    n.y += n.vy
    n.vx *= 0.995
    n.vy *= 0.995
    if (n.x < 0 || n.x > 1) n.vx *= -1
    if (n.y < 0 || n.y > 1) n.vy *= -1
    n.x = Math.min(1, Math.max(0, n.x))
    n.y = Math.min(1, Math.max(0, n.y))
  })

  const vw = window.innerWidth
  const vh = window.innerHeight
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    const ax = a.x * vw
    const ay = a.y * vh
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      const bx = b.x * vw
      const by = b.y * vh
      const d = Math.hypot(ax - bx, ay - by)
      if (d < 170) {
        ctx.strokeStyle = `rgba(126,182,255,${(1 - d / 170) * 0.3})`
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }
    }
    const md = Math.hypot(ax - mx, ay - my)
    if (md < 180) {
      ctx.strokeStyle = `rgba(180,210,255,${(1 - md / 180) * 0.48})`
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(mx, my)
      ctx.stroke()
    }
    ctx.fillStyle = `rgba(150,196,255,${0.4 + a.z * 0.55})`
    ctx.beginPath()
    ctx.arc(ax, ay, 1.5 + a.z * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]
    s.x += s.vx
    s.y += s.vy
    s.life -= 0.02
    if (s.life <= 0) {
      sparks.splice(i, 1)
      continue
    }
    ctx.fillStyle = `rgba(180,210,255,${s.life})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2)
    ctx.fill()
  }

  requestAnimationFrame(draw)
}

draw()

const cursor = document.getElementById('cursor')
const glow = document.getElementById('cursorGlow')
let cx = window.innerWidth / 2
let cy = window.innerHeight / 2
let gx = cx
let gy = cy

window.addEventListener('pointermove', (e) => {
  mouse.tx = e.clientX / window.innerWidth
  mouse.ty = e.clientY / window.innerHeight
  mouse.active = true
  gx = e.clientX
  gy = e.clientY
})

window.addEventListener('pointerleave', () => {
  mouse.active = false
})

window.addEventListener('pointerdown', (e) => {
  for (let i = 0; i < 12; i++) spawnSpark(e.clientX, e.clientY)
})

function loopCursor() {
  cx += (gx - cx) * 0.28
  cy += (gy - cy) * 0.28
  glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`
  cursor.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`
  requestAnimationFrame(loopCursor)
}
loopCursor()

const hoverables = 'a, button, input, textarea, select, .card, .product, .sol, .stat'
document.querySelectorAll(hoverables).forEach((el) => {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'))
})

function attachTilt(el) {
  const lift = el.classList.contains('product--focus') ? -6 : -3
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    const rx = (0.5 - y) * 7
    const ry = (x - 0.5) * 8
    el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift}px)`
  })
  el.addEventListener('pointerleave', () => {
    el.style.transform = lift === -6 ? 'translateY(-6px)' : ''
  })
}

document.querySelectorAll('.card, .product').forEach(attachTilt)

const clock = document.getElementById('clock')
const lat = document.getElementById('lat')
setInterval(() => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  clock.textContent = `${hh}:${mm}:${ss} CST`
  lat.textContent = String(8 + Math.floor(Math.random() * 11))
}, 1000)

const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 12)
})

const menuBtn = document.getElementById('menuBtn')
const drawer = document.getElementById('drawer')
menuBtn.addEventListener('click', () => drawer.classList.toggle('open'))
drawer.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => drawer.classList.remove('open'))
})

const langToggle = document.getElementById('langToggle')
const langLabel = document.getElementById('langLabel')
let currentLang = (localStorage.getItem('syj-lang') === 'en') ? 'en' : 'zh'

function applyLang(lang) {
  currentLang = lang
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  document.querySelectorAll('[data-zh][data-en]').forEach((el) => {
    el.textContent = el.dataset[lang]
  })
  langLabel.textContent = lang === 'en' ? '中' : 'EN'
  document.title = lang === 'en'
    ? 'Shuiyunjian · Hangzhou Shuiyunjian Data Information Technology'
    : '水云间 · 杭州水云间数据信息技术有限公司'
  localStorage.setItem('syj-lang', lang)
  if (document.getElementById('solPanel')) renderScene(activeSol)
}

langToggle.addEventListener('click', () => {
  applyLang(currentLang === 'en' ? 'zh' : 'en')
})

const stats = document.querySelectorAll('.stat')
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const target = Number(el.dataset.count)
      const decimals = Number(el.dataset.decimals || 0)
      const num = el.querySelector('.num')
      const start = performance.now()
      const dur = 1200
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        const val = target * eased
        num.textContent = decimals ? val.toFixed(decimals) : String(Math.round(val))
        if (p < 1) requestAnimationFrame(tick)
        else el.classList.add('is-done')
      }
      requestAnimationFrame(tick)
      io.unobserve(el)
    })
  },
  { threshold: 0.5 }
)
stats.forEach((s) => io.observe(s))

const scenes = {
  mfg: {
    code: 'SCENE / MANUFACTURING',
    zh: {
      title: '产线数据一张网，质量闭环可追溯',
      body: '汇聚 MES、SCADA、质检与供应链数据，构建工单级数字孪生。异常在秒级被看见，根因沿溯源回溯到工艺参数。',
      list: ['设备时序入湖与边缘预处理', '良率预测与工艺参数推荐', '供应商质量协同门户']
    },
    en: {
      title: 'One network of line data, a traceable quality loop',
      body: 'MES, SCADA, inspection and supply-chain data converge into a work-order digital twin. Anomalies surface in seconds and root causes trace back through lineage to process parameters.',
      list: ['Time-series ingestion & edge preprocessing', 'Yield prediction & parameter recommendation', 'Supplier quality collaboration portal']
    }
  },
  gov: {
    code: 'SCENE / GOVERNMENT',
    zh: {
      title: '一数一源，跨部门共享不再靠拷盘',
      body: '建设政务数据目录、授权运营与安全沙箱。群众办事少填表，监管部门看得见过程，审计留得下痕迹。',
      list: ['人口法人空间时空库融合', '数据授权运营与隐私计算', '城市运行指标驾驶舱']
    },
    en: {
      title: 'One source per datum, sharing without copy-and-paste',
      body: 'A government data catalog, authorized operations and secure sandboxes. Citizens fill fewer forms, regulators see the process and audits leave a trail.',
      list: ['Population, legal-entity and spatio-temporal fusion', 'Authorized operations & privacy computing', 'City operations metrics cockpit']
    }
  },
  fin: {
    code: 'SCENE / RISK',
    zh: {
      title: '特征即服务，风控从规则走向模型',
      body: '交易、设备、图谱与外部征信统一入特征仓库。模型可热更新，决策可解释，合规审计可回放。',
      list: ['实时反欺诈流水线', '图谱关联与团伙识别', '模型监控与漂移告警']
    },
    en: {
      title: 'Features as a service, risk from rules to models',
      body: 'Transactions, devices, graphs and external credit data land in one feature store. Models hot-reload, decisions stay explainable and audits replay.',
      list: ['Real-time anti-fraud pipeline', 'Graph linkage & gang detection', 'Model monitoring & drift alerts']
    }
  },
  rtl: {
    code: 'SCENE / RETAIL',
    zh: {
      title: '人货场打通，增长动作可度量',
      body: '会员、库存、投放与到店轨迹汇入同一语义层。从活动复盘到下一场投放，决策节奏按小时走。',
      list: ['全渠道会员 360', '库存与定价协同', '投放归因与素材洞察']
    },
    en: {
      title: 'Connected people, goods and place with measurable growth',
      body: 'Members, inventory, campaigns and store traffic share one semantic layer. From post-mortem to next launch, decisions run by the hour.',
      list: ['Omni-channel member 360', 'Inventory & pricing collaboration', 'Attribution & creative insight']
    }
  },
  chain: {
    code: 'SCENE / BLOCKCHAIN',
    zh: {
      title: '一物一链，来源与流转全程可证',
      body: '把生产、仓储、物流与核验事件写入联盟链。批次身份不可篡改，监管抽检与消费者扫码共用同一条可信记录。',
      list: ['批次上链与跨主体协同', '防伪核验与流转可视化', '监管审计与合规存证']
    },
    en: {
      title: 'One item, one chain, proven from source to transfer',
      body: 'Production, warehousing, logistics and verification events are written to a consortium chain. Batch identity stays immutable, shared by inspectors and consumers alike.',
      list: ['Batch on-chain & multi-party sync', 'Anti-counterfeit verification & flow view', 'Regulatory audit & evidence']
    }
  }
}

const panel = document.getElementById('solPanel')
const panelCode = document.querySelector('.sol-panel__code')
const solTitle = document.getElementById('solTitle')
const solBody = document.getElementById('solBody')
const solList = document.getElementById('solList')
let activeSol = 'mfg'

function renderScene(key) {
  activeSol = key
  const scene = scenes[key][currentLang] || scenes[key].zh
  panelCode.textContent = scenes[key].code
  solTitle.textContent = scene.title
  solBody.textContent = scene.body
  solList.innerHTML = scene.list.map((item) => `<li>${item}</li>`).join('')
}

document.querySelectorAll('.sol').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sol').forEach((b) => b.classList.remove('sol--active'))
    btn.classList.add('sol--active')
    panel.classList.add('is-swap')
    window.setTimeout(() => {
      renderScene(btn.dataset.sol)
      panel.classList.remove('is-swap')
    }, 180)
  })
})

const revealIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('reveal')
      revealIO.unobserve(entry.target)
    })
  },
  { threshold: 0.16 }
)
document.querySelectorAll('.card, .product, .stat, .sol-panel, .about__copy, .timeline, .contact-card, .map').forEach((el) => {
  revealIO.observe(el)
})

langLabel.textContent = currentLang === 'en' ? '中' : 'EN'
if (currentLang === 'en') applyLang('en')
