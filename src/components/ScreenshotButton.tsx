import { useState, JSX } from "react";
import * as htmlToImage from 'html-to-image';
import "../css/ScreenshotButton.css";

interface ScreenshotButtonProps {
    action: "clipboard" | "download";
    targetElementId: string;
    disabled?: boolean;
}

// Store original styles to restore later - used for generating Screenshot in Mobile screen 
interface OriginalStyles {
    element: HTMLElement;
    styles: { [key: string]: string };
}

const backgroundColor: string = `transparent`;
const minWidth: number = 1280;
const minHeight: number = 720;
const qualityScale: number = 1.5;

const generateFilename = (): string => `Draft-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;

// Detect if User is on Mobile/Safari - Special handling
const isMobileOrSafari = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /safari/.test(userAgent) && !/chrome/.test(userAgent) || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

// Download Screenshot
const downloadBlob = (blob: Blob, filename?: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || generateFilename();
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

function ScreenshotButton(props: ScreenshotButtonProps): JSX.Element {
    const { action, targetElementId, disabled } = props;
    const [isLoading, setLoading] = useState<boolean>(false);

    // Force Mobile screen into default Desktop dimensions
    const forceDesktopLayout = (element: HTMLElement): OriginalStyles[] => {
        const originalStyles: OriginalStyles[] = [];
        
        // Store original inline styles for the main element
        const mainOriginalStyles: { [key: string]: string } = {};
        
        // Properties we want to override for desktop layout
        const propertiesToStore = [
            'width', 'minWidth', 'maxWidth',
            'height', 'minHeight', 'maxHeight',
            'transform', 'transformOrigin', 'zoom',
            'gridTemplateColumns'
        ];
        
        propertiesToStore.forEach(prop => {
            mainOriginalStyles[prop] = element.style.getPropertyValue(prop);
        });
        
        originalStyles.push({
            element: element,
            styles: mainOriginalStyles
        });

        // Force desktop dimensions and layout
        element.style.setProperty('width', `${minWidth}px`, 'important');
        element.style.setProperty('minWidth', `${minWidth}px`, 'important');
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('minHeight', `${minHeight}px`, 'important');
        
        // Force desktop grid layouts (override mobile media queries)
        if (element.classList.contains('main')) {
            element.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
        }
        
        if (element.classList.contains('characters-container')) {
            element.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))', 'important');
        }
        
        // Find all child elements that might have mobile-specific styling
        const allElements = element.querySelectorAll('*') as NodeListOf<HTMLElement>;
        
        allElements.forEach((child) => {
            const childOriginalStyles: { [key: string]: string } = {};
            const childComputedStyles = window.getComputedStyle(child);
            
            // Store original inline styles
            const mobileProperties = [
                'width', 'maxWidth', 'minWidth',
                'fontSize', 'padding', 'margin',
                'flexDirection', 'flexWrap',
                'gridTemplateColumns', 'gap',
                'display'
            ];
            
            mobileProperties.forEach(prop => {
                childOriginalStyles[prop] = child.style.getPropertyValue(prop);
            });
            
            originalStyles.push({
                element: child,
                styles: childOriginalStyles
            });
            
            // Force desktop grid layouts for specific classes
            if (child.classList.contains('main')) {
                child.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
            }
            
            if (child.classList.contains('characters-container')) {
                child.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))', 'important');
            }
            
            // Force desktop-like behavior for common mobile patterns
            const classList = child.className.toLowerCase();
            if (classList.includes('mobile') || classList.includes('responsive')) {
                child.style.setProperty('width', 'auto', 'important');
                child.style.setProperty('maxWidth', 'none', 'important');
            }
            
            // Fix flex containers that wrap on mobile
            if (childComputedStyles.flexWrap === 'wrap') {
                child.style.setProperty('flexWrap', 'nowrap', 'important');
            }
            
            // Ensure grid layouts don't collapse
            if (childComputedStyles.display === 'grid') {
                child.style.setProperty('minWidth', 'auto', 'important');
            }
        });

        return originalStyles;
    };

    // Restore original dimensions once clipboard/download process completes
    const restoreOriginalStyles = (originalStyles: OriginalStyles[]): void => {
        originalStyles.forEach(({ element, styles }) => {
            Object.keys(styles).forEach(prop => {
                const originalValue = styles[prop];
                
                if (originalValue) {
                    element.style.setProperty(prop, originalValue);
                } else {
                    element.style.removeProperty(prop);
                }
            });
            
            // Remove any !important overrides we added
            element.style.removeProperty('width');
            element.style.removeProperty('minWidth');
            element.style.removeProperty('maxWidth');
            element.style.removeProperty('height');
            element.style.removeProperty('minHeight');
            element.style.removeProperty('flexWrap');
            element.style.removeProperty('grid-template-columns');
        });
        
        // Force a reflow to ensure styles are applied
        document.body.offsetHeight;
        
        console.log('Original styles restored successfully');
    };

    // Create and return a Blob of a target div to be Screenshot to Clipboard/File
    const generateScreenshot = async (): Promise<Blob> => {
        const elem = document.getElementById(targetElementId);
        if (!elem) throw new Error(`Element with ID='${targetElementId}' not found`);

        let originalStyles: OriginalStyles[] = [];
        
        try {
            // Force desktop layout on mobile (overlay automatically shows via isLoading state)
            if (isMobileOrSafari()) {
                console.log('Mobile detected - forcing desktop layout');
                
                // Small delay to ensure overlay is rendered
                await new Promise(resolve => setTimeout(resolve, 50));
                
                originalStyles = forceDesktopLayout(elem);
                
                // Wait for layout to settle
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            // Calculate screenshot dimensions
            const rect = elem.getBoundingClientRect();
            const screenshotWidth = Math.max(rect.width, minWidth) * qualityScale;
            const screenshotHeight = Math.max(rect.height, minHeight) * qualityScale;

            const options = {
                quality: 1,
                pixelRatio: 1,
                height: screenshotHeight,
                canvasHeight: screenshotHeight,
                width: screenshotWidth,
                canvasWidth: screenshotWidth,
                skipAutoScale: true,
                backgroundColor: backgroundColor,
                
                style: {
                    zoom: String(qualityScale),
                    transformOrigin: 'top left',
                    width: `${Math.max(rect.width, minWidth)}px`,
                    minWidth: `${minWidth}px`,
                    minHeight: `${minHeight}px`,
                },
            };

            const minDataLength = 50_000;
            let blob: Blob | null = null;

            // First attempt
            blob = await htmlToImage.toBlob(elem, options);
            
            // Retry once if first attempt failed
            if (!blob || blob.size <= minDataLength) {
                console.log('First screenshot attempt failed, retrying...');
                await new Promise(resolve => setTimeout(resolve, 200));
                blob = await htmlToImage.toBlob(elem, options);
            }

            if (!blob || blob.size <= minDataLength) {
                throw new Error(`Screenshot generation failed. Final blob size: ${blob?.size || 0} bytes`);
            }

            console.log(`Screenshot successful! Blob size: ${blob.size} bytes, dimensions: ${screenshotWidth}x${screenshotHeight}`);
            return blob;
            
        } finally {
            // Always restore original styles first
            if (originalStyles.length > 0) {
                console.log('Restoring original mobile layout');
                restoreOriginalStyles(originalStyles);
                
                // Wait a moment for styles to be restored
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Overlay will automatically hide when isLoading becomes false
        }
    };

    // Capture a div and save it to Clipboard
    const saveToClipboard = async (): Promise<void> => {
        const blob = await generateScreenshot();
        const filename = generateFilename();

        if (isMobileOrSafari()) {
            // Mobile/Safari: Use Web Share API with fallback to download
            const file = new File([blob], filename, { type: 'image/png' });

            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Draft Screenshot',
                        text: 'Draft screenshot',
                    });
                } else {
                    throw new Error('Web Share API not supported');
                }
            } catch (err) {
                console.log('Share failed or not supported, falling back to download:', err);
                
                // Fallback: Auto-download for mobile using helper function
                downloadBlob(blob, filename);
                console.log('Screenshot downloaded (mobile fallback)');
            }
        } else {
            // Desktop: Copy to clipboard
            if (navigator.clipboard && window.ClipboardItem) {
                const clipboardItem = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([clipboardItem]);
                console.log('Screenshot copied to clipboard');
            } else {
                // Fallback: Download if clipboard not supported using helper function
                console.log('Clipboard not supported, downloading instead');
                downloadBlob(blob, filename);
            }
        }
    };

    // Capture a div and save it to File
    const saveToFile = async (): Promise<void> => {
        const blob = await generateScreenshot();
        downloadBlob(blob);
    };

    const handleClick = async (): Promise<void> => {
        if (disabled || isLoading) return;
        setLoading(true);

        // Wait for Button UI
        await new Promise(resolve => setTimeout(resolve, 250));
        
        try {
            if (action === "clipboard") await saveToClipboard();
            if (action === "download") await saveToFile();
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Unknown error occurred';
            console.error(`Screenshot ${action} failed:`, err);
            // You can replace this with your preferred error handling
            alert(`Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const CameraIcon: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M9 3H15L17 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7L9 3Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <circle 
                cx="12" 
                cy="13" 
                r="4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
    const DownloadIcon: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M8 12L12 16L16 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12 2V16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
    const LoadingSpinner: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: `spin 800ms linear infinite` }}
        >
            <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="32" 
                strokeDashoffset="32"
            />
        </svg>
    );
    const ScreenshotOverlay: React.FC = () => (
        <div className="ScreenshotOverlay">
            <div className="content">
                <LoadingSpinner />
                <h2 className="title">Creating Screenshot...</h2>
                <h3 className="sub-title">Please wait while we capture your Draft</h3>
            </div>
        </div>
    );

    const getButtonIcon = (): React.ReactNode => {
        if (action === "clipboard") return <CameraIcon />;
        if (action === "download") return <DownloadIcon />;
        return (<></>);
    };
    const getButtonTitle = (): string => {
        if (action === "clipboard") return `Copy Draft to Clipboard`;
        if (action === "download") return `Download Draft`;
        return ``;
    }

    return (
        <>
            {/* Overlay hides layout changes during process on Mobile screens */}
            {(isLoading && isMobileOrSafari()) && <ScreenshotOverlay />}

            <button
                className="ScreenshotButton"
                onClick={handleClick}
                disabled={disabled || isLoading}
                title={getButtonTitle()}
            >
                {isLoading ? <LoadingSpinner /> : getButtonIcon()}
            </button>
        </>
    );
}

export default ScreenshotButton;
import { useState, JSX } from "react";
import * as htmlToImage from 'html-to-image';
import "../css/ScreenshotButton.css";

interface ScreenshotButtonProps {
    action: "clipboard" | "download";
    targetElementId: string;
    disabled?: boolean;
}

// Store original styles to restore later - used for generating Screenshot in Mobile screen 
interface OriginalStyles {
    element: HTMLElement;
    styles: { [key: string]: string };
}

const backgroundColor: string = `transparent`;
const minWidth: number = 1280;
const minHeight: number = 720;
const qualityScale: number = 1.5;

const generateFilename = (): string => `Draft-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;

// Detect if User is on Mobile/Safari - Special handling
const isMobileOrSafari = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /safari/.test(userAgent) && !/chrome/.test(userAgent) || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

// Download Screenshot
const downloadBlob = (blob: Blob, filename?: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || generateFilename();
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

function ScreenshotButton(props: ScreenshotButtonProps): JSX.Element {
    const { action, targetElementId, disabled } = props;
    const [isLoading, setLoading] = useState<boolean>(false);

    // Force Mobile screen into default Desktop dimensions
    const forceDesktopLayout = (element: HTMLElement): OriginalStyles[] => {
        const originalStyles: OriginalStyles[] = [];
        
        // Store original inline styles for the main element
        const mainOriginalStyles: { [key: string]: string } = {};
        
        // Properties we want to override for desktop layout
        const propertiesToStore = [
            'width', 'minWidth', 'maxWidth',
            'height', 'minHeight', 'maxHeight',
            'transform', 'transformOrigin', 'zoom',
            'gridTemplateColumns'
        ];
        
        propertiesToStore.forEach(prop => {
            mainOriginalStyles[prop] = element.style.getPropertyValue(prop);
        });
        
        originalStyles.push({
            element: element,
            styles: mainOriginalStyles
        });

        // Force desktop dimensions and layout
        element.style.setProperty('width', `${minWidth}px`, 'important');
        element.style.setProperty('minWidth', `${minWidth}px`, 'important');
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('minHeight', `${minHeight}px`, 'important');
        
        // Force desktop grid layouts (override mobile media queries)
        if (element.classList.contains('main')) {
            element.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
        }
        
        if (element.classList.contains('characters-container')) {
            element.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))', 'important');
        }
        
        // Find all child elements that might have mobile-specific styling
        const allElements = element.querySelectorAll('*') as NodeListOf<HTMLElement>;
        
        allElements.forEach((child) => {
            const childOriginalStyles: { [key: string]: string } = {};
            const childComputedStyles = window.getComputedStyle(child);
            
            // Store original inline styles
            const mobileProperties = [
                'width', 'maxWidth', 'minWidth',
                'fontSize', 'padding', 'margin',
                'flexDirection', 'flexWrap',
                'gridTemplateColumns', 'gap',
                'display'
            ];
            
            mobileProperties.forEach(prop => {
                childOriginalStyles[prop] = child.style.getPropertyValue(prop);
            });
            
            originalStyles.push({
                element: child,
                styles: childOriginalStyles
            });
            
            // Force desktop grid layouts for specific classes
            if (child.classList.contains('main')) {
                child.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
            }
            
            if (child.classList.contains('characters-container')) {
                child.style.setProperty('grid-template-columns', 'repeat(4, minmax(0, 1fr))', 'important');
            }
            
            // Force desktop-like behavior for common mobile patterns
            const classList = child.className.toLowerCase();
            if (classList.includes('mobile') || classList.includes('responsive')) {
                child.style.setProperty('width', 'auto', 'important');
                child.style.setProperty('maxWidth', 'none', 'important');
            }
            
            // Fix flex containers that wrap on mobile
            if (childComputedStyles.flexWrap === 'wrap') {
                child.style.setProperty('flexWrap', 'nowrap', 'important');
            }
            
            // Ensure grid layouts don't collapse
            if (childComputedStyles.display === 'grid') {
                child.style.setProperty('minWidth', 'auto', 'important');
            }
        });

        return originalStyles;
    };

    // Restore original dimensions once clipboard/download process completes
    const restoreOriginalStyles = (originalStyles: OriginalStyles[]): void => {
        originalStyles.forEach(({ element, styles }) => {
            Object.keys(styles).forEach(prop => {
                const originalValue = styles[prop];
                
                if (originalValue) {
                    element.style.setProperty(prop, originalValue);
                } else {
                    element.style.removeProperty(prop);
                }
            });
            
            // Remove any !important overrides we added
            element.style.removeProperty('width');
            element.style.removeProperty('minWidth');
            element.style.removeProperty('maxWidth');
            element.style.removeProperty('height');
            element.style.removeProperty('minHeight');
            element.style.removeProperty('flexWrap');
            element.style.removeProperty('grid-template-columns');
        });
        
        // Force a reflow to ensure styles are applied
        document.body.offsetHeight;
        
        console.log('Original styles restored successfully');
    };

    // Create and return a Blob of a target div to be Screenshot to Clipboard/File
    const generateScreenshot = async (): Promise<Blob> => {
        const elem = document.getElementById(targetElementId);
        if (!elem) throw new Error(`Element with ID='${targetElementId}' not found`);

        let originalStyles: OriginalStyles[] = [];
        
        try {
            // Force desktop layout on mobile (overlay automatically shows via isLoading state)
            if (isMobileOrSafari()) {
                console.log('Mobile detected - forcing desktop layout');
                
                // Small delay to ensure overlay is rendered
                await new Promise(resolve => setTimeout(resolve, 50));
                
                originalStyles = forceDesktopLayout(elem);
                
                // Wait for layout to settle
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            // Calculate screenshot dimensions
            const rect = elem.getBoundingClientRect();
            const screenshotWidth = Math.max(rect.width, minWidth) * qualityScale;
            const screenshotHeight = Math.max(rect.height, minHeight) * qualityScale;

            const options = {
                quality: 1,
                pixelRatio: 1,
                height: screenshotHeight,
                canvasHeight: screenshotHeight,
                width: screenshotWidth,
                canvasWidth: screenshotWidth,
                skipAutoScale: true,
                backgroundColor: backgroundColor,
                
                style: {
                    zoom: String(qualityScale),
                    transformOrigin: 'top left',
                    width: `${Math.max(rect.width, minWidth)}px`,
                    minWidth: `${minWidth}px`,
                    minHeight: `${minHeight}px`,
                },
            };

            const minDataLength = 50_000;
            let blob: Blob | null = null;

            // First attempt
            blob = await htmlToImage.toBlob(elem, options);
            
            // Retry once if first attempt failed
            if (!blob || blob.size <= minDataLength) {
                console.log('First screenshot attempt failed, retrying...');
                await new Promise(resolve => setTimeout(resolve, 200));
                blob = await htmlToImage.toBlob(elem, options);
            }

            if (!blob || blob.size <= minDataLength) {
                throw new Error(`Screenshot generation failed. Final blob size: ${blob?.size || 0} bytes`);
            }

            console.log(`Screenshot successful! Blob size: ${blob.size} bytes, dimensions: ${screenshotWidth}x${screenshotHeight}`);
            return blob;
            
        } finally {
            // Always restore original styles first
            if (originalStyles.length > 0) {
                console.log('Restoring original mobile layout');
                restoreOriginalStyles(originalStyles);
                
                // Wait a moment for styles to be restored
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Overlay will automatically hide when isLoading becomes false
        }
    };

    // Capture a div and save it to Clipboard
    const saveToClipboard = async (): Promise<void> => {
        const blob = await generateScreenshot();
        const filename = generateFilename();

        if (isMobileOrSafari()) {
            // Mobile/Safari: Use Web Share API with fallback to download
            const file = new File([blob], filename, { type: 'image/png' });

            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Draft Screenshot',
                        text: 'Draft screenshot',
                    });
                } else {
                    throw new Error('Web Share API not supported');
                }
            } catch (err) {
                console.log('Share failed or not supported, falling back to download:', err);
                
                // Fallback: Auto-download for mobile using helper function
                downloadBlob(blob, filename);
                console.log('Screenshot downloaded (mobile fallback)');
            }
        } else {
            // Desktop: Copy to clipboard
            if (navigator.clipboard && window.ClipboardItem) {
                const clipboardItem = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([clipboardItem]);
                console.log('Screenshot copied to clipboard');
            } else {
                // Fallback: Download if clipboard not supported using helper function
                console.log('Clipboard not supported, downloading instead');
                downloadBlob(blob, filename);
            }
        }
    };

    // Capture a div and save it to File
    const saveToFile = async (): Promise<void> => {
        const blob = await generateScreenshot();
        downloadBlob(blob);
    };

    const handleClick = async (): Promise<void> => {
        if (disabled || isLoading) return;
        setLoading(true);

        // Wait for Button UI
        await new Promise(resolve => setTimeout(resolve, 250));
        
        try {
            if (action === "clipboard") await saveToClipboard();
            if (action === "download") await saveToFile();
        } catch (err) {
            const errorMessage = (err instanceof Error) ? err.message : 'Unknown error occurred';
            console.error(`Screenshot ${action} failed:`, err);
            // You can replace this with your preferred error handling
            alert(`Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const CameraIcon: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M9 3H15L17 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7L9 3Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <circle 
                cx="12" 
                cy="13" 
                r="4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
    const DownloadIcon: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M8 12L12 16L16 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12 2V16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
    const LoadingSpinner: React.FC = () => (
        <svg 
            width="1.375rem" 
            height="1.375rem" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: `spin 800ms linear infinite` }}
        >
            <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="32" 
                strokeDashoffset="32"
            />
        </svg>
    );
    const ScreenshotOverlay: React.FC = () => (
        <div className="ScreenshotOverlay">
            <div className="content">
                <LoadingSpinner />
                <h2 className="title">Creating Screenshot...</h2>
                <h3 className="sub-title">Please wait while we capture your Draft</h3>
            </div>
        </div>
    );

    const getButtonIcon = (): React.ReactNode => {
        if (action === "clipboard") return <CameraIcon />;
        if (action === "download") return <DownloadIcon />;
        return (<></>);
    };
    const getButtonTitle = (): string => {
        if (action === "clipboard") return `Copy Draft to Clipboard`;
        if (action === "download") return `Download Draft`;
        return ``;
    }

    return (
        <>
            {/* Overlay hides layout changes during process on Mobile screens */}
            {(isLoading && isMobileOrSafari()) && <ScreenshotOverlay />}

            <button
                className="ScreenshotButton"
                onClick={handleClick}
                disabled={disabled || isLoading}
                title={getButtonTitle()}
            >
                {isLoading ? <LoadingSpinner /> : getButtonIcon()}
            </button>
        </>
    );
}

export default ScreenshotButton;
