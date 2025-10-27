let isDownloadModeActive = false;
let stopDownloading = false;
const downloadedFiles = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "activateDownloadMode") {
    isDownloadModeActive = true;
    stopDownloading = false;
    downloadedFiles.clear();
    sendResponse({ success: true });
  }
  else if (message.action === "checkDownloads") {
    sendResponse({ 
      downloadedCount: downloadedFiles.size,
      stopped: stopDownloading
    });
  }
  return true;
});

function shouldDownload(url) {
  return isDownloadModeActive && 
         !stopDownloading &&
         !downloadedFiles.has(url) &&
         isKrishikoshUrl(url);
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!shouldDownload(details.url)) return;
    
    downloadedFiles.add(details.url);
    downloadFile(details.url);
  },
  { urls: ["*://krishikosh.egranth.ac.in/*"] }
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!shouldDownload(details.url)) return;
    
    downloadedFiles.add(details.url);
    downloadFile(details.url);
  },
  { urls: ["*://krishikosh.egranth.ac.in/*"] },
  ["responseHeaders"]
);

function isKrishikoshUrl(url) {
  return /https:\/\/krishikosh\.egranth\.ac\.in\/server\/api\/core\/bitstreams\/[a-f0-9-]+\/content/i.test(url);
}

function downloadFile(url) {
  if (stopDownloading) return;
  
  chrome.downloads.download({
    url: url,
    filename: getFilenameFromUrl(url),
    conflictAction: 'uniquify',
    saveAs: false
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Download failed - stopping:', chrome.runtime.lastError);
      stopDownloading = true;
    } else {
      stopDownloading = true; // Stop after one successful download
    }
  });
}

function getFilenameFromUrl(url) {
  const uuid = url.match(/bitstreams\/([a-f0-9-]+)\/content/i)?.[1] || Date.now();
  return `Krishikosh/${uuid}.file`;
}