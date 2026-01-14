import "../css/Header.css";
import { ReactNode, useEffect, useRef, useState } from "react";

interface MobileDropdownProps {
    children: ReactNode;
}
const MobileDropdown: React.FC<MobileDropdownProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        // Close dropdown when any button inside is clicked
        const handleButtonClick = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current?.contains(event.target as Node)) {
                const closestButton = (event.target as HTMLElement).closest('button');
                if (closestButton && dropdownRef.current.contains(closestButton)) {
                    closeDropdown();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        if (isOpen) document.addEventListener("click", handleButtonClick);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("click", handleButtonClick);
        };
    }, [isOpen]);

    return (
        <div className="mobile-tabs">
            <button
                ref={triggerRef}
                onClick={_ => setIsOpen(!isOpen)}
                className="select-button button"
                title="Select Team"
            >
                <svg 
                    className="" 
                    focusable="false" 
                    aria-hidden="true" 
                    viewBox="0 0 24 24" 
                    data-testid="MenuSharpIcon" 
                    fill="white"
                    style={{ height: `2.75rem`, width: `2.75rem` }}
                >
                    <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="menu Box" ref={dropdownRef}>
                    {children}
                </div>
            )}
        </div>
    );
};

export type Tab = "landing" | "draft" | "teamtest" | "costs" | "tutorial";

interface HeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function Header(props: HeaderProps) {
    const { activeTab, onTabChange } = props;

    return (
        <div className="Header">
            {/* Logo */}
            <button className="logo" onClick={_ => onTabChange("landing")}>
                <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>

                Star Rail PvP
            </button>

            {/* Tab Navigation */}
            <div className="tabs">
                <button
                    onClick={_ => onTabChange("draft" as Tab)}
                    className={(activeTab === "draft") ? `active` : undefined}
                >
                    {`Draft`}
                </button>
                <button
                    onClick={_ => onTabChange("teamtest" as Tab)}
                    className={(activeTab === "teamtest") ? `active` : undefined}
                >
                    {`Loadouts`}
                </button>
                <button
                    onClick={_ => onTabChange("costs" as Tab)}
                    className={(activeTab === "costs") ? `active` : undefined}
                >
                    {`Costs`}
                </button>
                <button
                    onClick={_ => onTabChange("tutorial" as Tab)}
                    className={(activeTab === "tutorial") ? `active` : undefined}
                >
                    {`Tutorial`}
                </button>
            </div>

            {/* Mobile Tab Navigation */}
            <MobileDropdown>
                <button
                    onClick={_ => onTabChange("draft" as Tab)}
                    className={(activeTab === "draft") ? `active` : undefined}
                >
                    {`Draft`}
                </button>
                <button
                    onClick={_ => onTabChange("teamtest" as Tab)}
                    className={(activeTab === "teamtest") ? `active` : undefined}
                >
                    {`Loadouts`}
                </button>
                <button
                    onClick={_ => onTabChange("costs" as Tab)}
                    className={(activeTab === "costs") ? `active` : undefined}
                >
                    {`Costs`}
                </button>
                <button
                    onClick={_ => onTabChange("tutorial" as Tab)}
                    className={(activeTab === "tutorial") ? `active` : undefined}
                >
                    {`Tutorial`}
                </button>
            </MobileDropdown>
        </div>
    );
}