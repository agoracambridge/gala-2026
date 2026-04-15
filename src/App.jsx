import { useState, useEffect, useCallback } from 'react'
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

function VineBackground() {
  return (
    <div className="vines" aria-hidden="true">
      <svg className="vines__svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* ── Left vine cluster ── */}
        <path className="vine vine--1" d="M120,900 C120,780 90,720 100,640 C110,560 80,500 95,420 C110,340 70,280 90,200 C110,120 85,60 100,0" strokeWidth="1.5" />
        <path className="vine vine--2" d="M95,420 C130,400 160,420 180,390 C200,360 230,370 250,345 Q270,325 260,300" strokeWidth="1.2" />
        <path className="vine vine--3" d="M180,390 C175,370 190,355 205,360 C220,365 215,380 200,385" strokeWidth="1" />
        <path className="vine vine--4" d="M100,640 C70,620 40,630 20,600 C0,570 -10,540 15,510 Q35,490 30,460" strokeWidth="1.2" />
        <path className="vine vine--5" d="M20,600 C35,585 50,590 48,575 C46,560 30,558 25,570" strokeWidth="0.8" />
        <path className="vine vine--6" d="M90,200 C60,185 40,195 25,175 C10,155 20,135 40,130 C55,127 50,145 38,148" strokeWidth="1" />
        <path className="vine vine--7" d="M250,345 C265,335 275,345 268,355 C260,365 248,358 252,348" strokeWidth="0.8" />
        {/* ── Right vine cluster ── */}
        <path className="vine vine--8" d="M1320,900 C1320,800 1350,740 1340,660 C1330,580 1360,510 1345,430 C1330,350 1365,280 1345,200 C1325,120 1355,50 1340,0" strokeWidth="1.5" />
        <path className="vine vine--9" d="M1345,430 C1310,410 1280,430 1260,400 C1240,370 1210,380 1190,355 Q1170,335 1180,305" strokeWidth="1.2" />
        <path className="vine vine--10" d="M1260,400 C1265,378 1250,362 1235,368 C1220,374 1225,390 1242,394" strokeWidth="1" />
        <path className="vine vine--11" d="M1340,660 C1370,640 1400,650 1415,618 C1430,586 1440,555 1420,525 Q1405,505 1410,470" strokeWidth="1.2" />
        <path className="vine vine--12" d="M1415,618 C1400,602 1385,608 1388,592 C1391,576 1408,574 1412,588" strokeWidth="0.8" />
        <path className="vine vine--13" d="M1345,200 C1375,185 1395,198 1410,178 C1425,158 1415,136 1395,132 C1380,130 1386,148 1398,150" strokeWidth="1" />
        <path className="vine vine--14" d="M1180,305 C1168,295 1158,305 1165,316 C1172,327 1185,320 1180,310" strokeWidth="0.8" />
        {/* ── Top corner wisps ── */}
        <path className="vine vine--15" d="M0,80 C40,75 70,90 100,70 C130,50 120,25 145,15 Q165,8 160,30" strokeWidth="1" />
        <path className="vine vine--16" d="M1440,80 C1400,75 1370,90 1340,70 C1310,50 1320,25 1295,15 Q1275,8 1280,30" strokeWidth="1" />
      </svg>
    </div>
  )
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
      <VineBackground />
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
