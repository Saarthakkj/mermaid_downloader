chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Mermaid Downloader: Message received in content script:", request);
  if (request.action === "downloadSVG") {
    console.log("Mermaid Downloader: Action 'downloadSVG' recognized, format:", request.format);
    downloadAllSVGsAsImage(request.format);
  }
});

function downloadAllSVGsAsImage(format) {
  console.log("Mermaid Downloader: Attempting to find all SVG elements...");
  // Selector for Mermaid SVGs: those inside a div.mermaid or any SVG with ID starting with 'mermaid-'
  const svgElements = document.querySelectorAll('div.mermaid > svg, svg[id^="mermaid-"]');

  if (svgElements.length === 0) {
    console.warn("Mermaid Downloader: No Mermaid SVG elements found with selectors 'div.mermaid > svg' or 'svg[id^=\"mermaid-\"]'. Trying specific ID as fallback.");
    // Fallback to the original specific ID if no elements are found with the general query
    const specificSvgElement = document.getElementById('mermaid-l8sqiw1dxv9');
    if (specificSvgElement) {
      console.log("Mermaid Downloader: Found single SVG element by specific ID 'mermaid-l8sqiw1dxv9'.");
      processAndDownloadSVG(specificSvgElement, format, 0); // Process it as a single element
    } else {
      console.error("Mermaid Downloader: No Mermaid SVG elements found with any selectors.");
      alert('No Mermaid SVG elements found. Please check console for details.');
    }
    return;
  }

  console.log(`Mermaid Downloader: Found ${svgElements.length} SVG element(s). Processing each...`);
  svgElements.forEach((svgElement, index) => {
    processAndDownloadSVG(svgElement, format, index);
  });
}

function processAndDownloadSVG(svgElement, format, index) {
  console.log(`Mermaid Downloader: Processing SVG element ${index + 1}...`, svgElement);

  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  console.log(`Mermaid Downloader: SVG ${index + 1} serialized, creating image...`);
  const img = new Image();
  img.onload = function() {
    console.log(`Mermaid Downloader: Image for SVG ${index + 1} loaded, creating canvas...`);
    const canvas = document.createElement('canvas');
    const rect = svgElement.getBoundingClientRect();

    canvas.width = rect.width > 0 ? rect.width : 300;
    canvas.height = rect.height > 0 ? rect.height : 150;
    if (rect.width === 0 || rect.height === 0) {
        console.warn(`Mermaid Downloader: SVG ${index + 1} getBoundingClientRect has zero width or height. Using default canvas dimensions.`, rect);
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    console.log(`Mermaid Downloader: Image for SVG ${index + 1} drawn on canvas.`);

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const imageDataUrl = canvas.toDataURL(mimeType);
    console.log(`Mermaid Downloader: Image data URL for SVG ${index + 1} created, MimeType:`, mimeType);

    const link = document.createElement('a');
    link.href = imageDataUrl;
    // Differentiate filenames if multiple SVGs are downloaded
    link.download = `diagram-${index + 1}.${format}`;
    document.body.appendChild(link);
    console.log(`Mermaid Downloader: Triggering download for SVG ${index + 1}...`);
    link.click();
    document.body.removeChild(link);
    console.log(`Mermaid Downloader: Download link for SVG ${index + 1} clicked and removed.`);
  };
  img.onerror = function() {
    console.error(`Mermaid Downloader: Error loading SVG data URL into image for SVG ${index + 1}.`);
    alert(`Error processing SVG ${index + 1}. Could not load SVG into an image.`);
  };
  img.src = svgDataUrl;
} 