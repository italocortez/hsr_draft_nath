import { useState, useEffect } from "react";
import {
	DraftSettings,
	BanRestriction,
	RuleSet,
	DraftMode,
	DraftState,
} from "./DraftingInterface";
import "../css/DraftingSettings.css";

interface DraftingSettingsProps {
	settings: DraftSettings;
	onSettingsChange: (settings: DraftSettings) => void;
	isDraftInProgress: boolean;
	draftState: DraftState;
	onRuleSetChange: (ruleSet: RuleSet) => void;
	onDraftModeChange: (draftMode: DraftMode) => void;
	isOpen: boolean;
	onClose: () => void;
}

const InfoIcon: React.FC<{ tooltip: string }> = ({ tooltip }) => (
	<div className="info-icon" title={tooltip}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
			<path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M12,17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	</div>
);

export function DraftingSettings({
	settings,
	onSettingsChange,
	isDraftInProgress,
	draftState,
	onRuleSetChange,
	onDraftModeChange,
	isOpen,
	onClose,
}: DraftingSettingsProps) {
	const [localSettings, setLocalSettings] = useState<DraftSettings>(settings);
	const [localRuleSet, setLocalRuleSet] = useState<RuleSet>(draftState.ruleSet);
	const [localDraftMode, setLocalDraftMode] = useState<DraftMode>(draftState.draftMode);

	// Update local state when props change
	useEffect(() => {
		setLocalSettings(settings);
		setLocalRuleSet(draftState.ruleSet);
		setLocalDraftMode(draftState.draftMode);
	}, [settings, draftState.ruleSet, draftState.draftMode]);

	const handleApplySettings = () => {
		onSettingsChange(localSettings);
		onRuleSetChange(localRuleSet);
		onDraftModeChange(localDraftMode);
		onClose();
	};

	const handleResetToDefaults = () => {
		const defaultSettings: DraftSettings = {
			phaseTime: 30,
			reserveTime: 480,
			banRestriction: "none",
			mocSettings: {
				rosterDifferenceAdvantagePerPoint: 0,
				rosterThreshold: 45.0,
				underThresholdAdvantagePerPoint: 0.25,
				aboveThresholdPenaltyPerPoint: 0.1667,
				deathPenalty: 0.25,
			},
			apocSettings: {
				rosterDifferenceAdvantagePerPoint: 40.0,
				rosterThreshold: 50.0,
				underThresholdAdvantagePerPoint: 0.0,
				aboveThresholdPenaltyPerPoint: 0.0,
				deathPenalty: 100.0,
			},
		};

		setLocalSettings(defaultSettings);
		setLocalRuleSet("apocalypticshadow");
		setLocalDraftMode("4ban");
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const parseTime = (timeString: string): number => {
		const [mins, secs] = timeString.split(":").map(Number);
		return mins * 60 + secs;
	};

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

    if (!isOpen) {
        return (<></>);
    }
	return (
		<div className="SettingsOverlay" onClick={onClose}>
			<div className="DraftingSettings Box" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="header">
					<h2 className="title">Draft Settings</h2>

                    {/* Close Button */}
					<button className="close-button" onClick={onClose}>
                        <CloseIcon />
					</button>
				</div>

                {/* Body */}
				<div className="body">
                    {/* Info for when Draft is in progress */}
                    {isDraftInProgress && <h3 className="draft-info">Certain fields are locked while Draft is in progress</h3>}

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
									className="setting-input"
									value={localSettings.phaseTime}
									onChange={(e) => {
										const value = parseInt(e.target.value) || 0;
										if (value >= 8) {
											setLocalSettings({
												...localSettings,
												phaseTime: value,
											});
										}
									}}
									min="8"
									max="300"
									disabled={isDraftInProgress}
								/>
								<p className="setting-note">Minimum value: 8 seconds</p>
							</div>

							<div className="setting-item">
								<h4 className="setting-label">Reserve Time (MM:SS)</h4>
								<input
									type="text"
									className="setting-input"
									value={formatTime(localSettings.reserveTime)}
									onChange={(e) => {
										const parsed = parseTime(e.target.value);
										if (!isNaN(parsed) && parsed >= 8) {
											setLocalSettings({
												...localSettings,
												reserveTime: parsed,
											});
										}
									}}
									pattern="[0-9]{1,2}:[0-9]{2}"
									placeholder="MM:SS"
									disabled={isDraftInProgress}
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
									className="setting-input"
									value={localSettings.apocSettings.rosterDifferenceAdvantagePerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											apocSettings: {
												...localSettings.apocSettings,
												rosterDifferenceAdvantagePerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.1"
								/>
							</div>

							<div className="setting-item">
								<div className="setting-label-with-info">
									<h4 className="setting-label">Roster Threshold</h4>
									<InfoIcon tooltip="Maximum team points before threshold rules apply" />
								</div>
								<input
									type="number"
									className="setting-input"
									value={localSettings.apocSettings.rosterThreshold}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											apocSettings: {
												...localSettings.apocSettings,
												rosterThreshold: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.1"
								/>
							</div>

							<div className="setting-item">
								<div className="setting-label-with-info">
									<h4 className="setting-label">Under Threshold Advantage Per Point</h4>
									<InfoIcon tooltip="Adds score per point under the threshold" />
								</div>
								<input
									type="number"
									className="setting-input"
									value={localSettings.apocSettings.underThresholdAdvantagePerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											apocSettings: {
												...localSettings.apocSettings,
												underThresholdAdvantagePerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
								/>
							</div>

							<div className="setting-item">
								<div className="setting-label-with-info">
									<h4 className="setting-label">Above Threshold Penalty Per Point</h4>
									<InfoIcon tooltip="Reduces score per point exceeding the threshold" />
								</div>
								<input
									type="number"
									className="setting-input"
									value={localSettings.apocSettings.aboveThresholdPenaltyPerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											apocSettings: {
												...localSettings.apocSettings,
												aboveThresholdPenaltyPerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
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
									className="setting-input"
									value={localSettings.apocSettings.deathPenalty}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											apocSettings: {
												...localSettings.apocSettings,
												deathPenalty: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.1"
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
									className="setting-input"
									value={localSettings.mocSettings.rosterDifferenceAdvantagePerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											mocSettings: {
												...localSettings.mocSettings,
												rosterDifferenceAdvantagePerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
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
									className="setting-input"
									value={localSettings.mocSettings.rosterThreshold}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											mocSettings: {
												...localSettings.mocSettings,
												rosterThreshold: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.1"
								/>
							</div>

							<div className="setting-item">
								<div className="setting-label-with-info">
									<h4 className="setting-label">Under Threshold Advantage Per Point</h4>
									<InfoIcon tooltip="Reduces cycles per point under the threshold" />
								</div>
								<input
									type="number"
									className="setting-input"
									value={localSettings.mocSettings.underThresholdAdvantagePerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											mocSettings: {
												...localSettings.mocSettings,
												underThresholdAdvantagePerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
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
									className="setting-input"
									value={localSettings.mocSettings.aboveThresholdPenaltyPerPoint}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											mocSettings: {
												...localSettings.mocSettings,
												aboveThresholdPenaltyPerPoint: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
								/>
							</div>

							<div className="setting-item">
								<div className="setting-label-with-info">
									<h4 className="setting-label">Death Penalty</h4>
									<InfoIcon tooltip="Adds cycles per reported character death" />
								</div>
								<input
									type="number"
									className="setting-input"
									value={localSettings.mocSettings.deathPenalty}
									onChange={(e) =>
										setLocalSettings({
											...localSettings,
											mocSettings: {
												...localSettings.mocSettings,
												deathPenalty: parseFloat(e.target.value) || 0,
											},
										})
									}
									step="0.01"
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
						{`Reset to Defaults`}
					</button>

					<div className="right">
                        {/* Cancel Button */}
						<button 
                            className="button cancel" 
                            onClick={onClose}
                        >
							{`Cancel`}
						</button>
                        
                        {/* Apply Settings */}
						<button 
                            className="button apply" 
                            onClick={handleApplySettings}
                        >
							{`Apply Settings`}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
