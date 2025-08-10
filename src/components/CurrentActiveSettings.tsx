import { DraftSettings, RuleSet, DraftMode, BanRestriction } from "./DraftingInterface";
import "../css/CurrentActiveSettings.css";

interface CurrentActiveSettingsProps {
  settings: DraftSettings;
  ruleSet: RuleSet;
  draftMode: DraftMode;
}

export function CurrentActiveSettings({ settings, ruleSet, draftMode }: CurrentActiveSettingsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBanRestriction = (restriction: BanRestriction) => {
    switch (restriction) {
      case "none": return "None";
      case "onePerRole": return "One Per Role";
      case "oneDPS": return "One DPS";
      case "oneSupport": return "One Support";
      case "oneSustain": return "One Sustain";
      default: return restriction;
    }
  };

  return (
    <div className="CurrentActiveSettings Box">
      <h3 className="title">Current Active Settings</h3>
      
      <div className="settings-grid">
        {/* Draft Configuration */}
        <div className="setting-group">
          <h4 className="group-title">Draft Configuration</h4>
          <div className="setting-item">
            <span className="label">Rule Set:</span>
            <span className="value">{ruleSet === "memoryofchaos" ? "Memory of Chaos" : "Apocalyptic Shadow"}</span>
          </div>
          <div className="setting-item">
            <span className="label">Draft Mode:</span>
            <span className="value">{draftMode === "4ban" ? "4 Ban" : "6 Ban"}</span>
          </div>
          <div className="setting-item">
            <span className="label">Ban Restrictions per Team:</span>
            <span className="value">{formatBanRestriction(settings.banRestriction)}</span>
          </div>
        </div>

        {/* Timer Settings */}
        <div className="setting-group">
          <h4 className="group-title">Timer Settings</h4>
          <div className="setting-item">
            <span className="label">Phase Time:</span>
            <span className="value">{settings.phaseTime}s</span>
          </div>
          <div className="setting-item">
            <span className="label">Reserve Time:</span>
            <span className="value">{formatTime(settings.reserveTime)}</span>
          </div>
        </div>

        {/* Memory of Chaos Settings */}
        <div className="setting-group">
          <h4 className="group-title">Memory of Chaos</h4>
          <div className="setting-item">
            <span className="label">Roster Difference:</span>
            <span className="value">{-settings.mocSettings.rosterDifferenceAdvantagePerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Roster Threshold:</span>
            <span className="value">{settings.mocSettings.rosterThreshold}</span>
          </div>
          <div className="setting-item">
            <span className="label">Under Threshold:</span>
            <span className="value">{-settings.mocSettings.underThresholdAdvantagePerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Above Threshold:</span>
            <span className="value">{settings.mocSettings.aboveThresholdPenaltyPerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Death Penalty:</span>
            <span className="value">{settings.mocSettings.deathPenalty}</span>
          </div>
        </div>

        {/* Apocalyptic Shadow Settings */}
        <div className="setting-group">
          <h4 className="group-title">Apocalyptic Shadow</h4>
          <div className="setting-item">
            <span className="label">Roster Difference:</span>
            <span className="value">{settings.apocSettings.rosterDifferenceAdvantagePerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Roster Threshold:</span>
            <span className="value">{settings.apocSettings.rosterThreshold}</span>
          </div>
          <div className="setting-item">
            <span className="label">Under Threshold:</span>
            <span className="value">{settings.apocSettings.underThresholdAdvantagePerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Above Threshold:</span>
            <span className="value">{-settings.apocSettings.aboveThresholdPenaltyPerPoint}</span>
          </div>
          <div className="setting-item">
            <span className="label">Death Penalty:</span>
            <span className="value">{-settings.apocSettings.deathPenalty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
