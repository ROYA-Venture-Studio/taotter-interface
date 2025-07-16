import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Icon } from '../../ui'
import './Footer.css'

const Footer = ({ 
  logo = "Taotter",
  className = ''
}) => {
  const [isClientsOpen, setIsClientsOpen] = useState(false)
  const [isTalentsOpen, setIsTalentsOpen] = useState(false)
  const [isCompanyOpen, setIsCompanyOpen] = useState(false)

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', href: '#' },
    { name: 'Instagram', icon: 'instagram', href: '#' },
    { name: 'X (Twitter)', icon: 'x , twitter', href: '#' },
    { name: 'LinkedIn', icon: 'linkedin', href: '#' }
  ]

  const clientsLinks = [
    { label: 'Find Talent', href: '#' },
    { label: 'Post a Job', href: '#' },
    { label: 'How it Works', href: '#' },
    { label: 'Success Stories', href: '#' }
  ]

  const talentsLinks = [
    { label: 'Find Work', href: '#' },
    { label: 'Create Profile', href: '#' },
    { label: 'Build Portfolio', href: '#' },
    { label: 'Career Tips', href: '#' }
  ]

  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' }
  ]

  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Settings', href: '#' }
  ]

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <footer className={`footer ${className}`}>
      {isDesktop ? (
        <div className="footer__container">
          <div className="footer__columns">
            {/* For Clients */}
            <div className="footer__column footer__column--clients">
              <div className="footer__column-title">For Clients</div>
              <ul className="footer__column-links">
                {clientsLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* For Talents */}
            <div className="footer__column footer__column--talents">
              <div className="footer__column-title">For Talents</div>
              <ul className="footer__column-links">
                {talentsLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div className="footer__column footer__column--company">
              <div className="footer__column-title">Company</div>
              <ul className="footer__column-links">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Get in Touch / Follow Us */}
            <div className="footer__column footer__column--contact">
              <div className="footer__column-title">Get in Touch</div>
              <div className="footer__social-title">Follow Us</div>
              <div className="footer__social-links">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="footer__social-link"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon name={social.icon} size={24} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="footer__divider" />
          {/* Bottom Row */}
          <div className="footer__bottom-row">
            <div className="footer__bottom-left">
              <div className="footer__logo">
                <div className="footer__logo-text">{logo}</div>
              </div>
              <div className="footer__copyright-text">
                ©{logo}2024. All rights reserved.
              </div>
            </div>
            <div className="footer__bottom-right">
              <ul className="footer__legal-links">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer__legal-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="footer__container">
          {/* Collapsible Sections */}
          <div className="footer__sections">
            {/* For Clients */}
            <div className="footer__section">
              <button 
                className="footer__section-toggle"
                onClick={() => setIsClientsOpen(!isClientsOpen)}
                aria-expanded={isClientsOpen}
                aria-controls="clients-menu"
              >
                <span>For Clients</span>
                <Icon 
                  name={isClientsOpen ? 'Arrow-up' : 'Arrow-down'} 
                  size={16} 
                  className="footer__section-icon"
                />
              </button>
              <div 
                id="clients-menu"
                className={`footer__section-content ${isClientsOpen ? 'footer__section-content--open' : ''}`}
                aria-hidden={!isClientsOpen}
              >
                <ul className="footer__links">
                  {clientsLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="footer__link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* For Talents */}
            <div className="footer__section">
              <button 
                className="footer__section-toggle"
                onClick={() => setIsTalentsOpen(!isTalentsOpen)}
                aria-expanded={isTalentsOpen}
                aria-controls="talents-menu"
              >
                <span>For Talents</span>
                <Icon 
                  name={isTalentsOpen ? 'Arrow-up' : 'Arrow-down'} 
                  size={16} 
                  className="footer__section-icon"
                />
              </button>
              <div 
                id="talents-menu"
                className={`footer__section-content ${isTalentsOpen ? 'footer__section-content--open' : ''}`}
                aria-hidden={!isTalentsOpen}
              >
                <ul className="footer__links">
                  {talentsLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="footer__link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Company */}
            <div className="footer__section">
              <button 
                className="footer__section-toggle"
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                aria-expanded={isCompanyOpen}
                aria-controls="company-menu"
              >
                <span>Company</span>
                <Icon 
                  name={isCompanyOpen ? 'Arrow-up' : 'Arrow-down'} 
                  size={16} 
                  className="footer__section-icon"
                />
              </button>
              <div 
                id="company-menu"
                className={`footer__section-content ${isCompanyOpen ? 'footer__section-content--open' : ''}`}
                aria-hidden={!isCompanyOpen}
              >
                <ul className="footer__links">
                  {companyLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="footer__link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Get in Touch Section */}
          <div className="footer__contact">
            <h3 className="footer__contact-title">Get in Touch</h3>
            <p className="footer__contact-info">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          {/* Follow Us Section */}
          <div className="footer__social">
            <h3 className="footer__social-title">Follow Us</h3>
            <div className="footer__social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  className="footer__social-link"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <Icon name={social.icon} size={24} />
                </a>
              ))}
            </div>
          </div>
          {/* Logo */}
          <div className="footer__logo">
            <div className="footer__logo-text">{logo}</div>
          </div>
          {/* Footer Links */}
          <div className="footer__legal">
            <ul className="footer__legal-links">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer__legal-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Copyright */}
          <div className="footer__copyright">
            <p>&copy; {logo} 2024. All Rights Reserved</p>
          </div>
        </div>
      )}
    </footer>
  )
}

Footer.propTypes = {
  logo: PropTypes.string,
  className: PropTypes.string,
}

export default Footer
