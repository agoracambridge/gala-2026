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
        id: 'dress-code',
        question: 'What is the dress code?',
        answer:
            'The dress code for the evening is black-tie optional. We encourage guests to dress in  attire that suits their personal style, whether that means a classic tuxedo, a dark suit & tie, a formal gown, or a chic cocktail outfit. Members are expected to adhere to club attire.'
    },
    {
        id: 'food',

        question: 'What food will be served?',
        answer:
            'A curated menu of seafood, fine meats, and cocktails has been arranged. Accommodations have been made for vegetarian diets. Reach out to the host if you have any concerns or requests.',
    },
    {
        id: 'parking',
        question: 'Will there be parking?',
        answer:
            'A valet service is available through The \u2019Quin, and street parking is available along Commonwealth Ave. However, it is recommended to avoid driving to The \u2019Quin, as parking is limited.',
    },
    {
        id: 'plus-one',
        question: 'Can I bring a plus one?',
        answer:
            'All Agora members can bring one additional guest. Invited guests and Agora partners should ask the host for additional guest invitations.',
    },
    {
        id: 'about',
        question: 'What is Agora?',
        answer:
            'Agora is a social society at Harvard. Comprising of a men\u2019s and women\u2019s chapter, Agora seeks to cultivate grand ambitions and thoughtful pursuits among its members. Originally founded in 2024, Agora members have started venture-backed companies, studied abroad as Rhodes scholars, led initiatives such as Prod & HF0, and spearheaded frontier ML/AI research.',
    },
]

function FractalVines() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animId
        let startTime
        let animDone = false
        let lastElapsed = 0

        const SEED = 71

        function bezAt(p0, cp1, cp2, p1, t) {
            const u = 1 - t
            return {
                x: u * u * u * p0.x + 3 * u * u * t * cp1.x + 3 * u * t * t * cp2.x + t * t * t * p1.x,
                y: u * u * u * p0.y + 3 * u * u * t * cp1.y + 3 * u * t * t * cp2.y + t * t * t * p1.y,
            }
        }

        function bezTangent(p0, cp1, cp2, p1, t) {
            const u = 1 - t
            return {
                x: 3 * u * u * (cp1.x - p0.x) + 6 * u * t * (cp2.x - cp1.x) + 3 * t * t * (p1.x - cp2.x),
                y: 3 * u * u * (cp1.y - p0.y) + 6 * u * t * (cp2.y - cp1.y) + 3 * t * t * (p1.y - cp2.y),
            }
        }

        // ── Generate vines using actual canvas dimensions ──
        function generate(W, H) {
            let rngState = SEED
            const rng = () => {
                rngState = (rngState * 16807) % 2147483647
                return rngState / 2147483647
            }

            const CELL = Math.max(20, Math.min(W, H) * 0.03)
            const cols = Math.ceil(W / CELL)
            const rows = Math.ceil(H / CELL)
            const grid = new Float64Array(cols * rows)

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

            function markBez(p0, cp1, cp2, p1, id) {
                for (let s = 0; s <= 10; s++) {
                    const pt = bezAt(p0, cp1, cp2, p1, s / 10)
                    markCell(pt.x, pt.y, id)
                }
            }

            const curves = []

            function buildVine(sx, sy, angle, segLen, numSegs, depth, maxDepth, rid, rootOffset) {
                if (depth > maxDepth || numSegs < 1) return

                const curveBias = (rng() - 0.5) * 0.3
                const segs = []
                let x = sx, y = sy, a = angle

                for (let i = 0; i < numSegs; i++) {
                    const bend = curveBias + (rng() - 0.5) * 0.6
                    const halfLen = segLen * 0.5

                    const cp1 = {
                        x: x + Math.cos(a) * halfLen + Math.cos(a + Math.PI / 2) * bend * halfLen,
                        y: y + Math.sin(a) * halfLen + Math.sin(a + Math.PI / 2) * bend * halfLen,
                    }

                    a += bend * 0.5 + (rng() - 0.5) * 0.3

                    const ex = x + Math.cos(a) * segLen
                    const ey = y + Math.sin(a) * segLen

                    const cp2 = {
                        x: ex - Math.cos(a) * halfLen + Math.cos(a + Math.PI / 2) * bend * halfLen * 0.5,
                        y: ey - Math.sin(a) * halfLen + Math.sin(a + Math.PI / 2) * bend * halfLen * 0.5,
                    }

                    if (i >= 2 && isOccupiedByOther(ex, ey, rid)) break

                    markBez({ x, y }, cp1, cp2, { x: ex, y: ey }, rid)
                    segs.push({ p0: { x, y }, cp1, cp2, p1: { x: ex, y: ey } })
                    x = ex; y = ey
                }

                if (segs.length === 0) return

                const thickness = Math.max(0.4, 2.2 * (1 - depth * 0.15))
                const opacity = 0.2 + 0.15 * (1 - depth / maxDepth)

                curves.push({
                    curves: segs, thickness, opacity, depth,
                    growStart: rootOffset + depth * 0.6,
                    growDur: segs.length * 0.18 + rng() * 0.2,
                })

                const numChildren = 3 + Math.floor(rng() * 4)
                for (let i = 0; i < numChildren; i++) {
                    const ci = Math.floor(rng() * segs.length)
                    const c = segs[ci]
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

            let rootId
            rootId = 1; buildVine(0, H * 0.82, -0.35, H * 0.05, 10, 0, 6, rootId, 0)
            rootId = 2; buildVine(0, H * 0.22, 0.3, H * 0.04, 8, 0, 6, rootId, 0.4)
            rootId = 3; buildVine(0, H * 0.55, -0.1, H * 0.035, 7, 0, 5, rootId, 0.8)

            rootId = 4; buildVine(W, H * 0.78, Math.PI + 0.35, H * 0.04, 7, 0, 6, rootId, 0.2)
            rootId = 5; buildVine(W, H * 0.15, Math.PI - 0.25, H * 0.038, 8, 0, 6, rootId, 0.6)
            rootId = 6; buildVine(W, H * 0.5, Math.PI + 0.12, H * 0.032, 7, 0, 5, rootId, 1.0)

            rootId = 7; buildVine(W * 0.04, 0, Math.PI * 0.4, H * 0.032, 6, 0, 5, rootId, 0.3)
            rootId = 8; buildVine(W * 0.96, 0, Math.PI * 0.6, H * 0.032, 6, 0, 5, rootId, 0.5)

            rootId = 9; buildVine(W, H * 0.95, 220 * Math.PI / 180, H * 0.045, 10, 0, 6, rootId, 0.7)

            return curves
        }

        // ── Initial generation at initial size ──
        let genW = canvas.offsetWidth
        let genH = canvas.offsetHeight
        let allCurves = generate(genW, genH)
        let maxTime = Math.max(...allCurves.map(s => s.growStart + s.growDur))

        function regenerate() {
            genW = canvas.offsetWidth
            genH = canvas.offsetHeight
            allCurves = generate(genW, genH)
            maxTime = Math.max(...allCurves.map(s => s.growStart + s.growDur))
        }

        let prevW = 0, prevH = 0
        function applySize() {
            const dpr = window.devicePixelRatio
            const w = canvas.offsetWidth * dpr
            const h = canvas.offsetHeight * dpr
            if (w === prevW && h === prevH) return
            prevW = w
            prevH = h
            canvas.width = w
            canvas.height = h
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        function drawFull(elapsed) {
            const cw = canvas.offsetWidth
            const ch = canvas.offsetHeight
            ctx.clearRect(0, 0, cw, ch)

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
                        const t = partialT
                        const a1x = c.p0.x + (c.cp1.x - c.p0.x) * t
                        const a1y = c.p0.y + (c.cp1.y - c.p0.y) * t
                        const mx = c.cp1.x + (c.cp2.x - c.cp1.x) * t
                        const my = c.cp1.y + (c.cp2.y - c.cp1.y) * t
                        const a2x = a1x + (mx - a1x) * t
                        const a2y = a1y + (my - a1y) * t
                        const b1x = c.cp2.x + (c.p1.x - c.cp2.x) * t
                        const b1y = c.cp2.y + (c.p1.y - c.cp2.y) * t
                        const b0x = mx + (b1x - mx) * t
                        const b0y = my + (b1y - my) * t
                        const a3x = a2x + (b0x - a2x) * t
                        const a3y = a2y + (b0y - a2y) * t
                        ctx.bezierCurveTo(a1x, a1y, a2x, a2y, a3x, a3y)
                    } else if (!isPartial) {
                        ctx.bezierCurveTo(c.cp1.x, c.cp1.y, c.cp2.x, c.cp2.y, c.p1.x, c.p1.y)
                    }
                }
                ctx.stroke()
                ctx.restore()
            }
        }

        function drawFrame(time) {
            if (!startTime) {
                startTime = time
                // Re-generate if canvas wasn't laid out when effect first ran
                const cw = canvas.offsetWidth
                const ch = canvas.offsetHeight
                if (cw !== genW || ch !== genH) {
                    regenerate()
                }
            }
            const elapsed = (time - startTime) / 1000
            lastElapsed = elapsed

            applySize()
            drawFull(elapsed)

            if (elapsed < maxTime + 0.3) {
                animId = requestAnimationFrame(drawFrame)
            } else {
                animDone = true
            }
        }

        applySize()
        animId = requestAnimationFrame(drawFrame)

        const onResize = () => {
            regenerate()
            applySize()
            drawFull(animDone ? maxTime + 1 : lastElapsed)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return <canvas ref={canvasRef} className="fractal-vines" aria-hidden="true" />
}

function Hero() {
    const actionsRef = useRef(null)

    useEffect(() => {
        const onScroll = () => {
            const el = actionsRef.current
            if (!el) return
            const fade = Math.max(0, 1 - window.scrollY / 300)
            el.style.opacity = fade
            el.style.pointerEvents = fade < 0.05 ? 'none' : 'auto'
        }
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
                <span><a className="hero__venue-link" href="https://thequinhouse.com" target="_blank" rel="noopener noreferrer">&lsquo;Quin House, Boston</a></span>
                <span><a
                    className="hero__venue-link"
                    href="#faq-dress-code"
                    onClick={(e) => {
                        e.preventDefault()
                        history.pushState(null, '', '#faq-dress-code')
                        window.dispatchEvent(new HashChangeEvent('hashchange'))
                    }}
                >Black-tie Optional</a></span>
            </div>
            <div className="hero__actions" ref={actionsRef}>
                <a className="hero__rsvp" href="https://luma.com/vgrs0l58" target="_blank" rel="noopener noreferrer">
                    RSVP
                </a>
                <button
                    className="hero__scroll"
                    onClick={() =>
                        document.getElementById('about').scrollIntoView({ behavior: 'smooth' })
                    }
                    aria-label="Scroll to next section"
                >
                    <svg viewBox="0 0 20 12">
                        <polyline points="2,2 10,10 18,2" />
                    </svg>
                </button>
            </div>
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
                &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Join Agora and its members for its inaugural{' '}
                <em>Spring Gala</em>, an evening celebrating all that its members have
                accomplished in and out of the club.
            </p>
            <div className="about__content">
                <Carousel />
                <div className="about__right">
                    <p className="about__description">
                        &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Hosted at the newly opened{' '}
                        <em><a className="about__venue-link" href="https://thequinhouse.com" target="_blank" rel="noopener noreferrer">&lsquo;Quin House of Boston</a></em>, the <em>Spring Gala</em> is a
                        who&rsquo;s-who&rsquo;s evening of Harvard entrepreneurship: ring a
                        toast for the members graduating; mingle with the alumni acting on
                        grand ambition; and meet the members making things happen.
                        You'll be joined by special guests from across the startup ecosystem, current members & alumni, and the generous partners that make it all happen. Come for an unforgettable night of celebration. Leave with incredible conversation and connection.
                    </p>
                    <a className="about__rsvp" href="https://luma.com/vgrs0l58" target="_blank" rel="noopener noreferrer">
                        RSVP
                    </a>
                </div>
            </div>
        </section>
    )
}

function smoothScrollTo(targetY, duration = 1500) {
    const startY = window.scrollY
    const delta = targetY - startY
    const startTime = performance.now()
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    function step(now) {
        const t = Math.min((now - startTime) / duration, 1)
        window.scrollTo(0, startY + delta * ease(t))
        if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
}

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

    useEffect(() => {
        const applyHash = () => {
            const hash = window.location.hash.replace(/^#/, '')
            if (!hash?.startsWith('faq-')) return
            const slug = hash.slice(4)
            const idx = faqData.findIndex((item) => item.id === slug)
            if (idx < 0) return
            setOpenIndex(idx)
            requestAnimationFrame(() => {
                const el = document.getElementById(hash)
                if (!el) return
                const targetY = el.getBoundingClientRect().top + window.scrollY
                smoothScrollTo(targetY, 1500)
            })
        }
        applyHash()
        window.addEventListener('hashchange', applyHash)
        return () => window.removeEventListener('hashchange', applyHash)
    }, [])

    return (
        <section className="faq" id="faq">
            <h2 className="faq__heading">
                Q<span className="heading-ul">uestions &amp; answers</span>
            </h2>
            <div className="faq__list">
                {faqData.map((item, i) => (
                    <div
                        key={i}
                        id={item.id ? `faq-${item.id}` : undefined}
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
