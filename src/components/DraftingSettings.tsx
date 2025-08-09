import { useState, useEffect } from "react";
import {
	DraftSettings,
	BanRestriction,
	RuleSet,
	DraftMode,
	DraftState,
	MoCSettings,
	ApocSettings,
} from "./DraftingInterface";
import "../css/DraftingSettings.css";

// Default values - used as fallbacks, not constants
export const DEFAULT_PHASE_TIME = 30; // 30 seconds per phase
export const DEFAULT_RESERVE_TIME = 480; // 8 minutes (480 seconds) reserve time per team
export const DEFAULT_BAN_RESTRICTION: BanRestriction = "none";

export const DEFAULT_MOC_SETTINGS: MoCSettings = {
	rosterDifferenceAdvantagePerPoint: 0,
	rosterThreshold: 80.0,
	underThresholdAdvantagePerPoint: 0.20,
	aboveThresholdPenaltyPerPoint: 0.20,
	deathPenalty: 0.25,
};

export const DEFAULT_APOC_SETTINGS: ApocSettings = {
	rosterDifferenceAdvantagePerPoint: 30.0,
	rosterThreshold: 90.0,
	underThresholdAdvantagePerPoint: 0.0,
	aboveThresholdPenaltyPerPoint: 0.0,
	deathPenalty: 100.0,
};

interface DraftingSettingsProps {
	draftState: DraftState;
	settings: DraftSettings;
	isDraftInProgress: boolean;
	onSettingsChange: (settings: DraftSettings) => void;
	onRuleSetChange: (ruleSet: RuleSet) => void;
	onDraftModeChange: (draftMode: DraftMode) => void;
}

const SettingsIcon: React.FC = () => (
    <svg
        width="1.375rem"
        height="1.375rem"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const InfoIcon: React.FC<{ tooltip: string }> = ({ tooltip }) => (
	<div className="info-icon" title={tooltip}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
			<path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M12,17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	</div>
);
const CloseIcon: React.FC = () => (
    <svg 
        width="1.5rem" 
        height="1.5rem" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export function DraftingSettings({
	draftState,
	settings,
	isDraftInProgress,
	onSettingsChange,
	onRuleSetChange,
	onDraftModeChange,
}: DraftingSettingsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
	const [localSettings, setLocalSettings] = useState<DraftSettings>(settings);
	const [localRuleSet, setLocalRuleSet] = useState<RuleSet>(draftState.ruleSet);
	const [localDraftMode, setLocalDraftMode] = useState<DraftMode>(draftState.draftMode);
	
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const parseTime = (timeString: string): number => {
		if (!timeString || timeString.trim() === "") return NaN;
		const [mins, secs] = timeString.split(":").map(Number);
		if (isNaN(mins) || isNaN(secs)) return NaN;
		return mins * 60 + secs;
	};
	
	// Track temporary input values (can be empty strings during editing)
	const [tempInputs, setTempInputs] = useState({
		phaseTime: settings.phaseTime.toString(),
		reserveTime: formatTime(settings.reserveTime),
		mocRosterDifference: settings.mocSettings.rosterDifferenceAdvantagePerPoint.toString(),
		mocRosterThreshold: settings.mocSettings.rosterThreshold.toString(),
		mocUnderThreshold: settings.mocSettings.underThresholdAdvantagePerPoint.toString(),
		mocAboveThreshold: settings.mocSettings.aboveThresholdPenaltyPerPoint.toString(),
		mocDeathPenalty: settings.mocSettings.deathPenalty.toString(),
		apocRosterDifference: settings.apocSettings.rosterDifferenceAdvantagePerPoint.toString(),
		apocRosterThreshold: settings.apocSettings.rosterThreshold.toString(),
		apocUnderThreshold: settings.apocSettings.underThresholdAdvantagePerPoint.toString(),
		apocAboveThreshold: settings.apocSettings.aboveThresholdPenaltyPerPoint.toString(),
		apocDeathPenalty: settings.apocSettings.deathPenalty.toString(),
	});

	// Update local state when props change
	useEffect(() => {
		setLocalSettings(settings);
		setLocalRuleSet(draftState.ruleSet);
		setLocalDraftMode(draftState.draftMode);
		setTempInputs({
			phaseTime: settings.phaseTime.toString(),
			reserveTime: formatTime(settings.reserveTime),
			mocRosterDifference: settings.mocSettings.rosterDifferenceAdvantagePerPoint.toString(),
			mocRosterThreshold: settings.mocSettings.rosterThreshold.toString(),
			mocUnderThreshold: settings.mocSettings.underThresholdAdvantagePerPoint.toString(),
			mocAboveThreshold: settings.mocSettings.aboveThresholdPenaltyPerPoint.toString(),
			mocDeathPenalty: settings.mocSettings.deathPenalty.toString(),
			apocRosterDifference: settings.apocSettings.rosterDifferenceAdvantagePerPoint.toString(),
			apocRosterThreshold: settings.apocSettings.rosterThreshold.toString(),
			apocUnderThreshold: settings.apocSettings.underThresholdAdvantagePerPoint.toString(),
			apocAboveThreshold: settings.apocSettings.aboveThresholdPenaltyPerPoint.toString(),
			apocDeathPenalty: settings.apocSettings.deathPenalty.toString(),
		});
	}, [settings, draftState.ruleSet, draftState.draftMode]);

	// Ensure local state is synced when modal opens
	useEffect(() => {
		if (isOpen) {
			setLocalSettings(settings);
			setLocalRuleSet(draftState.ruleSet);
			setLocalDraftMode(draftState.draftMode);
			setTempInputs({
				phaseTime: settings.phaseTime.toString(),
				reserveTime: formatTime(settings.reserveTime),
				mocRosterDifference: settings.mocSettings.rosterDifferenceAdvantagePerPoint.toString(),
				mocRosterThreshold: settings.mocSettings.rosterThreshold.toString(),
				mocUnderThreshold: settings.mocSettings.underThresholdAdvantagePerPoint.toString(),
				mocAboveThreshold: settings.mocSettings.aboveThresholdPenaltyPerPoint.toString(),
				mocDeathPenalty: settings.mocSettings.deathPenalty.toString(),
				apocRosterDifference: settings.apocSettings.rosterDifferenceAdvantagePerPoint.toString(),
				apocRosterThreshold: settings.apocSettings.rosterThreshold.toString(),
				apocUnderThreshold: settings.apocSettings.underThresholdAdvantagePerPoint.toString(),
				apocAboveThreshold: settings.apocSettings.aboveThresholdPenaltyPerPoint.toString(),
				apocDeathPenalty: settings.apocSettings.deathPenalty.toString(),
			});
		}
	}, [isOpen, settings, draftState.ruleSet, draftState.draftMode]);

	// Check if current inputs are valid for saving
	const hasValidInputs = () => {
		const phaseTime = parseInt(tempInputs.phaseTime);
		const reserveTime = parseTime(tempInputs.reserveTime);
		
		// Check required numeric fields
		const requiredFields = [
			phaseTime,
			reserveTime,
			parseFloat(tempInputs.mocRosterDifference),
			parseFloat(tempInputs.mocRosterThreshold),
			parseFloat(tempInputs.mocUnderThreshold),
			parseFloat(tempInputs.mocAboveThreshold),
			parseFloat(tempInputs.mocDeathPenalty),
			parseFloat(tempInputs.apocRosterDifference),
			parseFloat(tempInputs.apocRosterThreshold),
			parseFloat(tempInputs.apocUnderThreshold),
			parseFloat(tempInputs.apocAboveThreshold),
			parseFloat(tempInputs.apocDeathPenalty),
		];

		// Check if any field is NaN or invalid
		if (requiredFields.some(field => isNaN(field))) return false;
		
		// Check minimum values
		if (phaseTime < 8 || reserveTime < 8) return false;
		
		return true;
	};

	const getInvalidFields = () => {
		const invalid = [];
		
		const phaseTime = parseInt(tempInputs.phaseTime);
		const reserveTime = parseTime(tempInputs.reserveTime);
		
		if (isNaN(phaseTime) || phaseTime < 8) invalid.push("Phase Time");
		if (isNaN(reserveTime) || reserveTime < 8) invalid.push("Reserve Time");
		if (isNaN(parseFloat(tempInputs.mocRosterDifference))) invalid.push("MoC Roster Difference");
		if (isNaN(parseFloat(tempInputs.mocRosterThreshold))) invalid.push("MoC Roster Threshold");
		if (isNaN(parseFloat(tempInputs.mocUnderThreshold))) invalid.push("MoC Under Threshold");
		if (isNaN(parseFloat(tempInputs.mocAboveThreshold))) invalid.push("MoC Above Threshold");
		if (isNaN(parseFloat(tempInputs.mocDeathPenalty))) invalid.push("MoC Death Penalty");
		if (isNaN(parseFloat(tempInputs.apocRosterDifference))) invalid.push("Apoc Roster Difference");
		if (isNaN(parseFloat(tempInputs.apocRosterThreshold))) invalid.push("Apoc Roster Threshold");
		if (isNaN(parseFloat(tempInputs.apocUnderThreshold))) invalid.push("Apoc Under Threshold");
		if (isNaN(parseFloat(tempInputs.apocAboveThreshold))) invalid.push("Apoc Above Threshold");
		if (isNaN(parseFloat(tempInputs.apocDeathPenalty))) invalid.push("Apoc Death Penalty");
		
		return invalid;
	};

	const handleApplySettings = () => {
		if (!hasValidInputs()) return;

		const newSettings: DraftSettings = {
			phaseTime: parseInt(tempInputs.phaseTime),
			reserveTime: parseTime(tempInputs.reserveTime),
			banRestriction: localSettings.banRestriction,
			mocSettings: {
				rosterDifferenceAdvantagePerPoint: parseFloat(tempInputs.mocRosterDifference),
				rosterThreshold: parseFloat(tempInputs.mocRosterThreshold),
				underThresholdAdvantagePerPoint: parseFloat(tempInputs.mocUnderThreshold),
				aboveThresholdPenaltyPerPoint: parseFloat(tempInputs.mocAboveThreshold),
				deathPenalty: parseFloat(tempInputs.mocDeathPenalty),
			},
			apocSettings: {
				rosterDifferenceAdvantagePerPoint: parseFloat(tempInputs.apocRosterDifference),
				rosterThreshold: parseFloat(tempInputs.apocRosterThreshold),
				underThresholdAdvantagePerPoint: parseFloat(tempInputs.apocUnderThreshold),
				aboveThresholdPenaltyPerPoint: parseFloat(tempInputs.apocAboveThreshold),
				deathPenalty: parseFloat(tempInputs.apocDeathPenalty),
			},
		};

		onSettingsChange(newSettings);
		onRuleSetChange(localRuleSet);
		onDraftModeChange(localDraftMode);
        handleClose();
	};

	const handleResetToDefaults = () => {
		const defaultSettings: DraftSettings = {
			phaseTime: DEFAULT_PHASE_TIME,
			reserveTime: DEFAULT_RESERVE_TIME,
			banRestriction: DEFAULT_BAN_RESTRICTION,
			mocSettings: { ...DEFAULT_MOC_SETTINGS },
			apocSettings: { ...DEFAULT_APOC_SETTINGS },
		};

		setLocalSettings(defaultSettings);
		setLocalRuleSet("apocalypticshadow");
		setLocalDraftMode("4ban");
		setTempInputs({
			phaseTime: DEFAULT_PHASE_TIME.toString(),
			reserveTime: formatTime(DEFAULT_RESERVE_TIME),
			mocRosterDifference: DEFAULT_MOC_SETTINGS.rosterDifferenceAdvantagePerPoint.toString(),
			mocRosterThreshold: DEFAULT_MOC_SETTINGS.rosterThreshold.toString(),
			mocUnderThreshold: DEFAULT_MOC_SETTINGS.underThresholdAdvantagePerPoint.toString(),
			mocAboveThreshold: DEFAULT_MOC_SETTINGS.aboveThresholdPenaltyPerPoint.toString(),
			mocDeathPenalty: DEFAULT_MOC_SETTINGS.deathPenalty.toString(),
			apocRosterDifference: DEFAULT_APOC_SETTINGS.rosterDifferenceAdvantagePerPoint.toString(),
			apocRosterThreshold: DEFAULT_APOC_SETTINGS.rosterThreshold.toString(),
			apocUnderThreshold: DEFAULT_APOC_SETTINGS.underThresholdAdvantagePerPoint.toString(),
			apocAboveThreshold: DEFAULT_APOC_SETTINGS.aboveThresholdPenaltyPerPoint.toString(),
			apocDeathPenalty: DEFAULT_APOC_SETTINGS.deathPenalty.toString(),
		});
	};

    const isValid = hasValidInputs();
	const invalidFields = getInvalidFields();
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    // Fix for preventing accidental modal closure when dragging text selection outside modal
    const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only track mousedown if it's directly on the overlay (not on modal content)
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay = 'true';
        }
    };
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if both mousedown and click happened on the overlay
        if (e.target === e.currentTarget && 
            (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay === 'true') {
            handleClose();
        }
        // Clear the flag
        delete (e.currentTarget as HTMLDivElement).dataset.mousedownOnOverlay;
    };

    return (
        <>
            {/* Settings Modal */}
			{isOpen && (
                <div 
                    className="SettingsOverlay"
                    onMouseDown={handleOverlayMouseDown}
					onClick={handleOverlayClick}    
                >
                    <div className="content Box" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="header">
                            <h2 className="title">Draft Settings</h2>

                            {/* Close Button */}
                            <button className="close-button" onClick={handleClose}>
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="body">
                            {/* Info for when Draft is in progress */}
                            {isDraftInProgress && <h3 className="draft-info" style={{ marginBottom: `-1.25rem` }}>Certain fields are locked while Draft is in progress</h3>}

                            {/* Validation Warning */}
                            {!isValid && (
                                <div className="validation-warning" style={{ 
                                    backgroundColor: '#dc2626', 
                                    color: 'white', 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem', 
                                    marginBottom: '1rem',
                                    border: '1px solid #b91c1c'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>⚠️ Invalid Settings</h4>
                                    <p style={{ margin: '0 0 0.5rem 0' }}>The following fields have invalid values and must be corrected before saving:</p>
                                    <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                                        {invalidFields.map(field => (
                                            <li key={field}>{field}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Draft Configuration */}
                            <div className="settings-section">
                                <h3 className="section-title">Configuration</h3>
                                
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <h4 className="setting-label">Rule Set</h4>
                                        <select
                                            className="setting-input"
                                            value={localRuleSet}
                                            onChange={(e) => setLocalRuleSet(e.target.value as RuleSet)}
                                            disabled={isDraftInProgress}
                                            name="rule-set"
                                        >
                                            <option value="memoryofchaos">Memory of Chaos</option>
                                            <option value="apocalypticshadow">Apocalyptic Shadow</option>
                                        </select>
                                    </div>

                                    <div className="setting-item">
                                        <h4 className="setting-label">Draft Mode</h4>
                                        <select
                                            className="setting-input"
                                            value={localDraftMode}
                                            onChange={(e) => setLocalDraftMode(e.target.value as DraftMode)}
                                            disabled={isDraftInProgress}
                                            name="draft-mode"
                                        >
                                            <option value="4ban">4 Ban</option>
                                            <option value="6ban">6 Ban</option>
                                        </select>
                                    </div>

                                    <div className="setting-item">
                                        <h4 className="setting-label">Ban Restriction per Team</h4>
                                        <select
                                            className="setting-input"
                                            value={localSettings.banRestriction}
                                            onChange={(e) =>
                                                setLocalSettings({
                                                    ...localSettings,
                                                    banRestriction: e.target.value as BanRestriction,
                                                })
                                            }
                                            disabled={isDraftInProgress}
                                            name="ban-restriction-per-team"
                                        >
                                            <option value="none">None</option>
                                            <option value="onePerRole">One Per Role</option>
                                            <option value="oneDPS">One DPS</option>
                                            <option value="oneSupport">One Support</option>
                                            <option value="oneSustain">One Sustain</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Settings */}
                            <div className="settings-section">
                                <h3 className="section-title">Timer Settings</h3>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <h4 className="setting-label">Phase Time (seconds)</h4>
                                        <input
                                            type="number"
                                            className={`setting-input ${(isNaN(parseInt(tempInputs.phaseTime)) || parseInt(tempInputs.phaseTime) < 8) ? 'invalid' : ''}`}
                                            value={tempInputs.phaseTime}
                                            onChange={(e) => {
                                                setTempInputs({
                                                    ...tempInputs,
                                                    phaseTime: e.target.value,
                                                });
                                            }}
                                            min="8"
                                            max="300"
                                            disabled={isDraftInProgress}
                                            name="phase-time"
                                            placeholder="Enter phase time..."
                                        />
                                        <p className="setting-note">Minimum value: 8 seconds</p>
                                    </div>

                                    <div className="setting-item">
                                        <h4 className="setting-label">Reserve Time (MM:SS)</h4>
                                        <input
                                            type="text"
                                            className={`setting-input ${(isNaN(parseTime(tempInputs.reserveTime)) || parseTime(tempInputs.reserveTime) < 8) ? 'invalid' : ''}`}
                                            value={tempInputs.reserveTime}
                                            onChange={(e) => {
                                                setTempInputs({
                                                    ...tempInputs,
                                                    reserveTime: e.target.value,
                                                });
                                            }}
                                            pattern="[0-9]{1,2}:[0-9]{2}"
                                            placeholder="MM:SS"
                                            disabled={isDraftInProgress}
                                            name="reserve-time"
                                        />
                                        <p className="setting-note">Minimum value: 8 seconds (0:08)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Apocalyptic Shadow Settings */}
                            <div className="settings-section">
                                <h3 className="section-title">Apocalyptic Shadow Settings</h3>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Roster Difference Advantage Per Point</h4>
                                            <InfoIcon tooltip="Adds score advantage for lower-cost team per point difference" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.apocRosterDifference)) ? 'invalid' : ''}`}
                                            value={tempInputs.apocRosterDifference}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    apocRosterDifference: e.target.value,
                                                })
                                            }
                                            step="0.1"
                                            name="apoc-roster-difference-advantage-per-point"
                                            placeholder="Enter value..."
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Roster Threshold</h4>
                                            <InfoIcon tooltip="Maximum team points before threshold rules apply" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.apocRosterThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.apocRosterThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    apocRosterThreshold: e.target.value,
                                                })
                                            }
                                            step="0.1"
                                            name="apoc-roster-threshold"
                                            placeholder="Enter threshold..."
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Under Threshold Advantage Per Point</h4>
                                            <InfoIcon tooltip="Adds score per point under the threshold" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.apocUnderThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.apocUnderThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    apocUnderThreshold: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="apoc-under-threshold-advantage-per-point"
                                            placeholder="Enter value..."
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Above Threshold Penalty Per Point</h4>
                                            <InfoIcon tooltip="Reduces score per point exceeding the threshold" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.apocAboveThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.apocAboveThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    apocAboveThreshold: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="apoc-above-threshold-penalty-per-point"
                                            placeholder="Enter penalty..."
                                        />
                                        <p className="setting-note">This value will be multiplied by -1</p>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Death Penalty</h4>
                                            <InfoIcon tooltip="Reduces score per reported character death" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.apocDeathPenalty)) ? 'invalid' : ''}`}
                                            value={tempInputs.apocDeathPenalty}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    apocDeathPenalty: e.target.value,
                                                })
                                            }
                                            step="0.1"
                                            name="apoc-death-penalty"
                                            placeholder="Enter penalty..."
                                        />
                                        <p className="setting-note">This value will be multiplied by -1</p>
                                    </div>
                                </div>
                            </div>

                            {/* Memory of Chaos Settings */}
                            <div className="settings-section">
                                <h3 className="section-title">Memory of Chaos Settings</h3>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Roster Difference Advantage Per Point</h4>
                                            <InfoIcon tooltip="Reduces cycles for the lower-cost team per point cost difference" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.mocRosterDifference)) ? 'invalid' : ''}`}
                                            value={tempInputs.mocRosterDifference}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    mocRosterDifference: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="moc-roster-difference-advantage-per-point"
                                            placeholder="Enter value..."
                                        />
                                        <p className="setting-note">This value will be multiplied by -1</p>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Roster Threshold</h4>
                                            <InfoIcon tooltip="Maximum team points before threshold rules apply" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.mocRosterThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.mocRosterThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    mocRosterThreshold: e.target.value,
                                                })
                                            }
                                            step="0.1"
                                            name="moc-roster-threshold"
                                            placeholder="Enter threshold..."
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Under Threshold Advantage Per Point</h4>
                                            <InfoIcon tooltip="Reduces cycles per point under the threshold" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.mocUnderThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.mocUnderThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    mocUnderThreshold: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="moc-under-threshold-advantage-per-point"
                                            placeholder="Enter value..."
                                        />
                                        <p className="setting-note">This value will be multiplied by -1</p>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Above Threshold Penalty Per Point</h4>
                                            <InfoIcon tooltip="Adds cycles per point exceeding the threshold" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.mocAboveThreshold)) ? 'invalid' : ''}`}
                                            value={tempInputs.mocAboveThreshold}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    mocAboveThreshold: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="moc-above-threshold-penalty-per-point"
                                            placeholder="Enter penalty..."
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-label-with-info">
                                            <h4 className="setting-label">Death Penalty</h4>
                                            <InfoIcon tooltip="Adds cycles per reported character death" />
                                        </div>
                                        <input
                                            type="number"
                                            className={`setting-input ${isNaN(parseFloat(tempInputs.mocDeathPenalty)) ? 'invalid' : ''}`}
                                            value={tempInputs.mocDeathPenalty}
                                            onChange={(e) =>
                                                setTempInputs({
                                                    ...tempInputs,
                                                    mocDeathPenalty: e.target.value,
                                                })
                                            }
                                            step="0.01"
                                            name="moc-death-penalty"
                                            placeholder="Enter penalty..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="footer">
                            {/* Reset to Default */}
                            <button 
                                className="button reset" 
                                onClick={handleResetToDefaults}
                            >
                                Reset to Defaults
                            </button>

                            <div className="right">
                                {/* Cancel Button */}
                                <button 
                                    className="button cancel" 
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                
                                {/* Apply Settings */}
                                <button 
                                    className={`button apply ${!isValid ? 'disabled' : ''}`}
                                    onClick={handleApplySettings}
                                    disabled={!isValid}
                                    title={!isValid ? `Cannot save with invalid values: ${invalidFields.join(', ')}` : 'Apply settings'}
                                >
                                    Apply Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
				className="DraftingSettings"
				onClick={handleOpen}
                title="Draft Settings"
			>
				<SettingsIcon />
				{`Settings`}
			</button>
        </>
    );
}
