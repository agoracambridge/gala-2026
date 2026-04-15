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

function Hero() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero">
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
