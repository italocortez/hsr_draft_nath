import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import "../css/Tutorial.css";

export function Tutorial() {
  const seedTutorial = useMutation(api.tutorial.seedTutorial);
  const tutorialSteps = useQuery(api.tutorial.list) || [];

  useEffect(() => {
    // Seed tutorial data on component mount
    seedTutorial();
  }, [seedTutorial]);

  if (tutorialSteps.length === 0) {
    return (
      <div className="tutorial-container">
        <div className="tutorial-loading">
          <div className="loading-spinner"></div>
          <p>Loading tutorial content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-container">
      <div className="tutorial-header">
        <h1>Quick Guide</h1>
        <p className="tutorial-subtitle">Learn how to use the PvP</p>
      </div>

      <div className="tutorial-content">
        {tutorialSteps.map((step) => (
          <div key={step._id} className="tutorial-step">
            <div className="step-header">
              <span className="step-number">{step.step_order}</span>
              <h2 className="step-title">{step.step_name || "Text couldn't be loaded"}</h2>
            </div>
            
            <div className="step-content">
              <div className="step-explanation">
                {step.step_explanation && step.step_explanation.length > 0 
                  ? step.step_explanation.map((sentence, index) => (
                      <p key={index}>{sentence}</p>
                    ))
                  : <p>Text couldn't be loaded</p>
                }
              </div>
              
              {step.reference_img && (
                <div className="step-image">
                  {step.imageUrl ? (
                    <img 
                      src={step.imageUrl} 
                      alt={`Reference for ${step.step_name}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="image-fallback" style={{ display: step.imageUrl ? 'none' : 'flex' }}>
                    <div className="fallback-icon">📷</div>
                    <span>Image not found</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
