import { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How close to Central Park?',
      answer: 'Just a 2-minute walk – perfect for morning strolls or evening relaxation.',
      img: '68b15bda10373e8001f09e9e_pexels-pixabay-327502.avif'
    },
    {
      question: 'Why the location is special?',
      answer: 'It\'s on 5th Avenue, near Central Park, The Met, and many great cafés.',
      img: '68b15bda8d21b4250b605d17_pexels-nextvoyage-3779785.avif'
    },
    {
      question: 'Do you allow small pets?',
      answer: 'Yes – small pets are welcome, so feel free to bring your furry friends along.',
      img: '68b15bdb84ced6d62d970f32_pexels-konrads-photo-32115960.avif'
    },
    {
      question: 'What\'s the cancellation policy?',
      answer: 'Free cancellation within 48 hours of booking. Standard Airbnb policy applies.',
      img: '68b15bdab7cceb20c362bfca_pexels-cottonbro-3206078.avif'
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <div className="w-layout-blockcontainer container big-container w-container">
        <div className="faq-content">
          <div className="section-heading-and-button align-left">
            <div 
              data-wf-section-heading-variant="left-black" 
              className="section-heading w-variant-fec327d6-643f-39bf-de41-b310845edbfd"
            >
              <div data-wf-caption-variant="black" className="caption">
                <div className="caption-shape"></div>
                <div className="regular-s">FAQ</div>
              </div>
              <h2 className="h2 section-title w-variant-fec327d6-643f-39bf-de41-b310845edbfd">Everything You Need to Know</h2>
            </div>
            <a 
              href="https://www.airbnb.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="black-button w-inline-block"
              data-wf-black-button-variant="primary"
            >
              <div className="black-button-icon-wrapper">
                <div className="button-icons">
                  <img 
                    src="/stayscape-images/68adc88e0d9ecf56a75aab0f_ArrowUpRight.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon button-icon"
                  />
                  <img 
                    src="/stayscape-images/68aed3d0db1bb90e683bba6a_ArrowUpRight.svg" 
                    loading="lazy" 
                    alt="" 
                    className="icon button-icon absolute-icon"
                  />
                </div>
              </div>
              <div className="medium-s button-text">Reserve Now</div>
            </a>
          </div>
          
          <div className="faq-items">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <img 
                    src={`/stayscape-images/${faq.img}`}
                    loading="lazy" 
                    alt="" 
                    className="faq-image"
                  />
                  <h3 className="h3">{faq.question}</h3>
                  <img 
                    src="/stayscape-images/68adc88ec8b6e29b0b774984_ArrowDown.svg" 
                    loading="lazy" 
                    alt="" 
                    className={`icon faq-icon ${openIndex === index ? 'open' : ''}`}
                  />
                </div>
                <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                  <p className="medium-m faq-answer-text">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

