document.getElementById('downloadBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = "Preparing to download...";
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.url?.includes('krishikosh.egranth.ac.in')) {
        status.textContent = "⚠ Please open a Krishikosh page first";
        return;
      }
  
      await chrome.runtime.sendMessage({ action: "activateDownloadMode" });
      
      status.textContent = "Refreshing page...";
      await chrome.tabs.reload(tab.id);
      
      setTimeout(() => {
        status.textContent = "Download process started!";
      }, 2000);
      
    } catch (error) {
      status.textContent = " Error:× " + error.message;
      console.error(error);
    }
  });