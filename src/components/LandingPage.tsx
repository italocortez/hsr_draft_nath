import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import '../css/LandingPage.css';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  
  // Fetch UI element icons from the database
  const uiIcons = useQuery(api.icons.getUIElements) || [];
  
  // Create a map for easy icon lookup
  const iconMap = uiIcons.reduce((acc, icon) => {
    acc[icon.name] = icon.imageUrl;
    return acc;
  }, {} as Record<string, string>);

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText("nathyron");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = "nathyron";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">PvP HSR Draft Tool</h1>
          <p className="hero-subtitle">
            Drafting interface for Honkai: Star Rail PvP matches
          </p>
          
          <div className="navigation-grid">
            <button 
              className="nav-card draft-card"
              onClick={() => onNavigate('draft')}
            >
              <div className="nav-card-icon">
                <img src={iconMap['draft_offline']} alt="Draft" className="nav-icon-img" />
              </div>
              <h3>Draft - Offline</h3>
              <p>Start a draft session meant to be screenshare by one person</p>
            </button>

            <button 
              className="nav-card loadouts-card"
              onClick={() => onNavigate('teamtest')}
            >
              <div className="nav-card-icon">
                <img src={iconMap['loadouts']} alt="Loadouts" className="nav-icon-img" />
              </div>
              <h3>Loadouts</h3>
              <p>Test team compositions</p>
            </button>

            <button 
              className="nav-card costs-card"
              onClick={() => onNavigate('costs')}
            >
              <div className="nav-card-icon">
                <img src={iconMap['cost_tables']} alt="Cost Tables" className="nav-icon-img" />
              </div>
              <h3>Cost Tables</h3>
              <p>View character and lightcone costs</p>
            </button>

            <button 
              className="nav-card tutorial-card"
              onClick={() => onNavigate('tutorial')}
            >
              <div className="nav-card-icon">
                <img src={iconMap['tutorial']} alt="Tutorial" className="nav-icon-img" />
              </div>
              <h3>Tutorial</h3>
              <p>Learn how to use the website</p>
            </button>

            <button 
              className="nav-card contact-card"
              onClick={scrollToContact}
            >
              <div className="nav-card-icon">
                <img src={iconMap['contact_us']} alt="Contact Us" className="nav-icon-img" />
              </div>
              <h3>Contact Us</h3>
              <p>Get in touch with us</p>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="contact-section">
        <div className="contact-content">
          <h2>Contact Us</h2>
          <p className="contact-intro">
            This website was developed by Nathyron and is primarily used by the community 'The Genius Society.' 
            You can reach out via the Discord server below or directly through the Discord username.
          </p>
          
          <div className="contact-methods">
            {/* Discord Server */}
            <div className="contact-method">
              <h3>Discord Server</h3>
              <a
                href="https://discord.com/invite/HbXErzYVQ5"
                target="_blank"
                rel="noopener noreferrer"
                className="discord-link"
              >
                <svg className="discord-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join The Genius Society Discord
                <svg className="external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Discord Username */}
            <div className="contact-method">
              <h3>Discord Username</h3>
              <div className="username-container">
                <code className="username-code">nathyron</code>
                <button
                  onClick={handleCopyUsername}
                  className="copy-button"
                >
                  {copied ? (
                    <>
                      <svg className="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
