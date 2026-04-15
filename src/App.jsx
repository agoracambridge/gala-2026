import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const carouselImages = [
  { src: '/images/venue.jpg', alt: 'Elegant dining room with crystal chandeliers at The \'Quin House' },
  { src: '/images/venue-2.jpg', alt: 'The \'Quin House lounge and bar area' },
  { src: '/images/venue-3.jpg', alt: 'The \'Quin House interior details' },
  { src: '/images/venue-4.jpg', alt: 'The \'Quin House event space' },
]

const faqData = [
  {
    question: 'Will there be food and drink?',
    answer:
      'A curated menu of seafood, fine meats, and cocktails has been arranged. Accommodations have been made for vegetarian diets. Reach out to the host if you have any concerns or requests.',
  },
  {
    question: 'Will there be parking?',
    answer:
      'A valet service is available through The \u2019Quin, and street parking is available along Commonwealth Ave. However, it is recommended to avoid driving to The \u2019Quin, as parking is limited.',
  },
  {
    question: 'Can I bring a plus one?',
    answer:
      'All Agora members can bring one additional guest. Invited guests and Agora partners should ask the host for additional guest invitations.',
  },
  {
    question: 'What is Agora?',
    answer:
      'Agora is a social society at Harvard. Comprising of a men\u2019s and women\u2019s chapter, Agora seeks to cultivate grand ambitions and thoughtful pursuits among its members. Originally founded in 2023, Agora members have started venture-backed companies, studied abroad as Rhodes scholars, led initiatives such as Prod & HF0, and spearheaded frontier ML/AI research.',
  },
]

function FractalVines() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let startTime

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight

    // Seeded PRNG
    let rngState = 71
    const rng = () => {
      rngState = (rngState * 16807) % 2147483647
      return rngState / 2147483647
    }

    // ── Spatial grid — roots avoid each other only ──
    const CELL = 40
    const cols = Math.ceil(W / CELL)
    const rows = Math.ceil(H / CELL)
    const grid = new Float64Array(cols * rows)
    let rootId = 0

    function markCell(px, py, id) {
      const c = Math.floor(px / CELL), r = Math.floor(py / CELL)
      if (c >= 0 && c < cols && r >= 0 && r < rows) grid[r * cols + c] = id
    }

    function isOccupiedByOther(px, py, myId) {
      const cc = Math.floor(px / CELL), rc = Math.floor(py / CELL)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const c = cc + dc, r = rc + dr
          if (c >= 0 && c < cols && r >= 0 && r < rows) {
            const v = grid[r * cols + c]
            if (v > 0 && v !== myId) return true
          }
        }
      return false
    }

    // Evaluate cubic bezier at t
    function bezAt(p0, cp1, cp2, p1, t) {
      const u = 1 - t
      return {
        x: u*u*u*p0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p1.x,
        y: u*u*u*p0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p1.y,
      }
    }

    function bezTangent(p0, cp1, cp2, p1, t) {
      const u = 1 - t
      return {
        x: 3*u*u*(cp1.x-p0.x) + 6*u*t*(cp2.x-cp1.x) + 3*t*t*(p1.x-cp2.x),
        y: 3*u*u*(cp1.y-p0.y) + 6*u*t*(cp2.y-cp1.y) + 3*t*t*(p1.y-cp2.y),
      }
    }

    function markBez(p0, cp1, cp2, p1, id) {
      for (let s = 0; s <= 10; s++) {
        const pt = bezAt(p0, cp1, cp2, p1, s / 10)
        markCell(pt.x, pt.y, id)
      }
    }

    // ── Build vines ──
    const allCurves = []

    function buildVine(sx, sy, angle, segLen, numSegs, depth, maxDepth, rid, rootOffset) {
      if (depth > maxDepth || numSegs < 1) return

      const curveBias = (rng() - 0.5) * 0.3
      const curves = []
      let x = sx, y = sy, a = angle

      for (let i = 0; i < numSegs; i++) {
        const bend = curveBias + (rng() - 0.5) * 0.6
        const halfLen = segLen * 0.5

        const cp1 = {
          x: x + Math.cos(a) * halfLen + Math.cos(a + Math.PI/2) * bend * halfLen,
          y: y + Math.sin(a) * halfLen + Math.sin(a + Math.PI/2) * bend * halfLen,
        }

        a += bend * 0.5 + (rng() - 0.5) * 0.3

        const ex = x + Math.cos(a) * segLen
        const ey = y + Math.sin(a) * segLen

        const cp2 = {
          x: ex - Math.cos(a) * halfLen + Math.cos(a + Math.PI/2) * bend * halfLen * 0.5,
          y: ey - Math.sin(a) * halfLen + Math.sin(a + Math.PI/2) * bend * halfLen * 0.5,
        }

        // Only avoid other root vines (skip first 2 segs for children)
        if (i >= 2 && isOccupiedByOther(ex, ey, rid)) break

        markBez({x,y}, cp1, cp2, {x:ex,y:ey}, rid)
        curves.push({ p0:{x,y}, cp1, cp2, p1:{x:ex,y:ey} })
        x = ex; y = ey
      }

      if (curves.length === 0) return

      const thickness = Math.max(0.5, 2.2 * (1 - depth * 0.28))
      const opacity = 0.2 + 0.15 * (1 - depth / maxDepth)

      // Within a vine: same depth branches grow simultaneously
      // Different root vines are staggered by rootOffset
      allCurves.push({
        curves,
        thickness,
        opacity,
        depth,
        growStart: rootOffset + depth * 0.6,
        growDur: curves.length * 0.18 + rng() * 0.2,
      })

      // Spawn children from along the curves
      const numChildren = 3 + Math.floor(rng() * 4)
      for (let i = 0; i < numChildren; i++) {
        const ci = Math.floor(rng() * curves.length)
        const c = curves[ci]
        const t = 0.1 + rng() * 0.8
        const bp = bezAt(c.p0, c.cp1, c.cp2, c.p1, t)
        const tang = bezTangent(c.p0, c.cp1, c.cp2, c.p1, t)
        const parentAngle = Math.atan2(tang.y, tang.x)
        const branchAngle = parentAngle + (rng() > 0.5 ? 1 : -1) * (0.3 + rng() * 0.9)
        const childSegs = 2 + Math.floor(rng() * 4)
        const childLen = segLen * (0.5 + rng() * 0.25)

        buildVine(bp.x, bp.y, branchAngle, childLen, childSegs, depth + 1, maxDepth, rid, rootOffset)
      }
    }

    // ── Plant roots — each with a staggered start time ──
    rootId = 1; buildVine(0, H * 0.82, -0.35, H * 0.05, 10, 0, 4, rootId, 0)
    rootId = 2; buildVine(0, H * 0.22, 0.3, H * 0.04, 8, 0, 4, rootId, 0.4)
    rootId = 3; buildVine(0, H * 0.55, -0.1, H * 0.035, 7, 0, 3, rootId, 0.8)

    rootId = 4; buildVine(W, H * 0.78, Math.PI + 0.3, H * 0.045, 10, 0, 4, rootId, 0.2)
    rootId = 5; buildVine(W, H * 0.15, Math.PI - 0.25, H * 0.038, 8, 0, 4, rootId, 0.6)
    rootId = 6; buildVine(W, H * 0.5, Math.PI + 0.12, H * 0.032, 7, 0, 3, rootId, 1.0)

    rootId = 7; buildVine(W * 0.04, 0, Math.PI * 0.4, H * 0.032, 6, 0, 3, rootId, 0.3)
    rootId = 8; buildVine(W * 0.96, 0, Math.PI * 0.6, H * 0.032, 6, 0, 3, rootId, 0.5)

    // ── Render ──
    function drawFrame(time) {
      if (!startTime) startTime = time
      const elapsed = (time - startTime) / 1000

      ctx.clearRect(0, 0, W, H)

      for (const seg of allCurves) {
        const t = (elapsed - seg.growStart) / seg.growDur
        if (t <= 0) continue
        const progress = Math.min(1, t)
        const ease = 1 - Math.pow(1 - progress, 2)

        ctx.save()
        ctx.strokeStyle = `rgba(142, 118, 12, ${seg.opacity})`
        ctx.lineWidth = seg.thickness
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // How many full curves + partial last curve to draw
        const totalCurves = seg.curves.length
        const drawLen = ease * totalCurves
        const fullCurves = Math.floor(drawLen)
        const partialT = drawLen - fullCurves

        ctx.beginPath()
        let started = false

        for (let ci = 0; ci <= fullCurves && ci < totalCurves; ci++) {
          const c = seg.curves[ci]
          const isPartial = ci === fullCurves

          if (!started) {
            ctx.moveTo(c.p0.x, c.p0.y)
            started = true
          }

          if (isPartial && partialT > 0) {
            // Draw partial cubic bezier using de Casteljau subdivision at partialT
            const t = partialT
            // Split bezier [p0,cp1,cp2,p1] at t — left half control points
            const a0 = c.p0
            const a1 = { x: c.p0.x+(c.cp1.x-c.p0.x)*t, y: c.p0.y+(c.cp1.y-c.p0.y)*t }
            const m = { x: c.cp1.x+(c.cp2.x-c.cp1.x)*t, y: c.cp1.y+(c.cp2.y-c.cp1.y)*t }
            const a2 = { x: a1.x+(m.x-a1.x)*t, y: a1.y+(m.y-a1.y)*t }
            const b1 = { x: c.cp2.x+(c.p1.x-c.cp2.x)*t, y: c.cp2.y+(c.p1.y-c.cp2.y)*t }
            const b0 = { x: m.x+(b1.x-m.x)*t, y: m.y+(b1.y-m.y)*t }
            const a3 = { x: a2.x+(b0.x-a2.x)*t, y: a2.y+(b0.y-a2.y)*t }
            ctx.bezierCurveTo(a1.x, a1.y, a2.x, a2.y, a3.x, a3.y)
          } else if (!isPartial) {
            ctx.bezierCurveTo(c.cp1.x, c.cp1.y, c.cp2.x, c.cp2.y, c.p1.x, c.p1.y)
          }
        }
        ctx.stroke()
        ctx.restore()
      }

      const maxTime = Math.max(...allCurves.map(s => s.growStart + s.growDur))
      if (elapsed < maxTime + 0.3) {
        animId = requestAnimationFrame(drawFrame)
      }
    }

    animId = requestAnimationFrame(drawFrame)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fractal-vines" aria-hidden="true" />
}

function Hero() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero">
      <FractalVines />
      <h1 className="hero__heading">You&rsquo;re Invited</h1>
      <div className="hero__line-h" />
      <div className="hero__title-wrap">
        <div className="hero__line-v" />
        <h2 className="hero__title">Agora Spring Gala</h2>
        <div className="hero__line-v" />
      </div>
      <div className="hero__details">
        <span>April 30th, 6-11 PM</span>
        <span>&lsquo;Quin House, Boston</span>
        <span>Black-tie Optional</span>
      </div>
      <button
        className={`hero__scroll${scrolled ? ' hero__scroll--hidden' : ''}`}
        onClick={() =>
          document.getElementById('about').scrollIntoView({ behavior: 'smooth' })
        }
        aria-label="Scroll to next section"
      >
        <svg viewBox="0 0 20 12">
          <polyline points="2,2 10,10 18,2" />
        </svg>
      </button>
    </section>
  )
}

function Carousel() {
  const [current, setCurrent] = useState(0)
  const len = carouselImages.length

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  return (
    <div className="carousel">
      <div className="carousel__track">
        {carouselImages.map((img, i) => (
          <img
            key={i}
            className={`carousel__slide${i === current ? ' carousel__slide--active' : ''}`}
            src={img.src}
            alt={img.alt}
          />
        ))}
      </div>
      <button className="carousel__btn carousel__btn--prev" onClick={prev} aria-label="Previous image">
        <svg viewBox="0 0 12 20"><polyline points="10,2 2,10 10,18" /></svg>
      </button>
      <button className="carousel__btn carousel__btn--next" onClick={next} aria-label="Next image">
        <svg viewBox="0 0 12 20"><polyline points="2,2 10,10 2,18" /></svg>
      </button>
      <div className="carousel__dots">
        {carouselImages.map((_, i) => (
          <button
            key={i}
            className={`carousel__dot${i === current ? ' carousel__dot--active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function About() {
  return (
    <section className="about" id="about">
      <h2 className="about__heading">
        <span className="heading-ul">An evening of celebration</span>
      </h2>
      <p className="about__intro">
        &emsp;&emsp;Join Agora and its members for its inaugural{' '}
        <em>Spring Gala</em>, an evening celebrating all that its members have
        accomplished in and out of the club.
      </p>
      <div className="about__content">
        <Carousel />
        <div className="about__right">
          <p className="about__description">
            &emsp;&emsp;Hosted at the newly opened{' '}
            <em>&lsquo;Quin House of Boston</em>, the <em>Spring Gala</em> is a
            who&rsquo;s-who&rsquo;s evening of Harvard entrepreneurship: ring a
            toast for the members graduating; mingle with the alumni acting on
            grand ambition; and meet the members making things happen.
          </p>
          <a className="about__rsvp" href="#rsvp">
            RSVP
          </a>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="faq" id="faq">
      <h2 className="faq__heading">
        Q<span className="heading-ul">uestions &amp; answers</span>
      </h2>
      <div className="faq__list">
        {faqData.map((item, i) => (
          <div
            key={i}
            className={`faq__item${openIndex === i ? ' faq__item--open' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="faq__question">
              <span>{item.question}</span>
              <svg className="faq__chevron" viewBox="0 0 16 10">
                <polyline points="1,1 8,8 15,1" />
              </svg>
            </div>
            <div className="faq__answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Hero />
      <About />
      <FAQ />
    </>
  )
}
