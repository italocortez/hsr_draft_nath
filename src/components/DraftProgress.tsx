import { Turn } from "@/lib/utils";
import "../css/DraftProgress.css";
import { useRef, useEffect, useState } from "react";

interface DraftProgressProps {
    currentDraftOrder: Turn[];
    currentStep: number;
    isDraftStarted?: boolean;
    isDraftComplete?: boolean;
}

const ScrollArrow = ({ direction, disabled }: { direction: 'left' | 'right', disabled: boolean }) => (
    <div
        className={`scroll-arrow-overlay ${direction} ${disabled ? 'disabled' : ''}`}
    >
        {direction === 'left' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
        ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
        )}
    </div>
);

export function DraftProgress({ 
    currentDraftOrder, 
    currentStep,
    isDraftStarted = false, 
    isDraftComplete = false 
}: DraftProgressProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState<boolean[]>([ false, false ]); // [ left arrow , right arrow ]
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 }); // Manual dragging

    // Update scroll button states
    const updateScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowScrollButton([(scrollLeft > 0), (scrollLeft < scrollWidth - clientWidth - 1)]);
    };

    // Auto-scroll to current step (container-only, no page scroll)
    useEffect(() => {
        if (!scrollContainerRef.current) return;
        
        const container = scrollContainerRef.current;
        const currentBox = container.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
        if (currentBox) {
            const containerRect = container.getBoundingClientRect();
            const currentBoxRect = currentBox.getBoundingClientRect();
            
            // Calculate position relative to container
            const boxLeft = currentBoxRect.left - containerRect.left + container.scrollLeft;
            const boxWidth = currentBoxRect.width;
            const containerWidth = containerRect.width;
            
            // Position current turn at 1/8 from left to show more upcoming turns
            const targetScrollLeft = boxLeft - (containerWidth / 8) + (boxWidth / 2);
            
            // Smooth scroll only within the container
            container.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        }
    }, [currentStep]);

    // Scroll event handler
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => updateScrollButtons();
        container.addEventListener('scroll', handleScroll);
        
        // Initial check
        updateScrollButtons();
        
        return () => container.removeEventListener('scroll', handleScroll);
    }, [currentDraftOrder]);

    // Drag functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        
        setIsDragging(true);
        setDragStart({
            x: e.pageX,
            scrollLeft: scrollContainerRef.current.scrollLeft
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        
        e.preventDefault();
        const walk = (e.pageX - dragStart.x) * 2; // Multiply for faster scrolling
        scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Drag progress track as long as LMB is held
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
            };
        }
    }, [isDragging, dragStart]);

    return (
        <div className="DraftProgress Box">
            {/* Header */}
            <div className="roadmap-header">
                <h3 className="roadmap-title">Draft Order</h3>
                
                {/* <div className="roadmap-status">
                    {isDraftStarted && !isDraftComplete && currentPhase && (
                        <span className="current-turn" style={{ 
                            color: currentPhase.team === "blue" ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)" 
                        }}>
                            {currentPhase.team === "blue" ? "Blue" : "Red"} {currentPhase.action === "pick" ? "Pick" : "Ban"}
                        </span>
                    )}
                </div> */}

                <span className="step-indicator">
                    {`Step ${Math.min(currentStep + 1, currentDraftOrder.length)} of ${currentDraftOrder.length}`}
                </span>
            </div>

            {/* Roadmap Container */}
            <div className={`roadmap-container ${isDragging ? 'dragging' : ''} ${!isDraftComplete ? `ongoing` : ``}`}>
                {/* Overlay Arrows - positioned relative to container */}
                <ScrollArrow direction="left" disabled={!showScrollButton[0]} />
                <ScrollArrow direction="right" disabled={!showScrollButton[1]} />
                
                {/* Progress Track */}
                <div 
                    className="roadmap-track"
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                >
                    {/* Draft Steps */}
                    <div className="steps-container">
                        {/* Progress Line */}
                        <div className="progress-line">
                            <div 
                                className="progress-fill" 
                                style={{ 
                                    width: `${(currentStep / Math.max(currentDraftOrder.length - 1, 1)) * 100}%`, 
                                    maxWidth: `100%`
                                }} 
                            />
                        </div>

                        {currentDraftOrder.map((turn: Turn, index: number) => {
                            const isCurrent = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <h3
                                    key={index}
                                    data-step={index} // For auto-scroll
                                    className={`roadmap-step ${turn.team} ${(isCurrent && isDraftStarted) ? `current` : isCompleted ? `completed` : `future`}`}
                                    title={`${turn.team === "blue" ? "Blue" : "Red"} team is ${turn.action === "pick" ? "picking" : "banning"}`}
                                    
                                    style={{ 
                                        animation: (!isDraftStarted ? `slideFromTop 400ms both cubic-bezier(0.22, 0.61, 0.36, 1)` : ``),
                                        animationDelay: (!isDraftStarted ? `${index * 50}ms` : ``),
                                    }}
                                >
                                    <span className="step-text">
                                        {turn.action === "pick" ? "Pick" : "Ban"}
                                    </span>
                                </h3>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}