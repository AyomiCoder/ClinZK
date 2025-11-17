import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="grid-pattern"></div>
        <div className="glow-effect"></div>
      </div>
      
      <div className="landing-content">
        <div className="landing-hero">
          <div className="zk-badge">
            <span>Zero-Knowledge Proofs</span>
          </div>
          
          <h1 className="landing-title">
            <span className="title-gradient">ClinZK</span>
          </h1>
          
          <p className="landing-subtitle">
            Privacy-Preserving Clinical Trial Eligibility Verification
          </p>
          
          <p className="landing-description">
            Verify your eligibility for clinical trials using cryptographic proofs. 
            Your medical data remains private while proving your qualifications.
          </p>
        </div>

        <div className="landing-cta">
          <button 
            onClick={() => navigate('/retrieve')}
            className="btn btn-primary btn-large btn-cta-primary"
          >
            <span>Retrieve Your Credential</span>
            <span className="btn-arrow">→</span>
          </button>
          
          <button 
            onClick={() => navigate('/history')}
            className="btn btn-secondary btn-large btn-cta-secondary"
          >
            <span>View Proof History</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

