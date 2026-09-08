chrome.permissions.onRemoved.addListener(async () => {
  const scripts=await chrome.scripting.getRegisteredContentScripts();
  for(const script of scripts){
    if(!(await chrome.permissions.contains({origins:script.matches}))) await chrome.scripting.unregisterContentScripts({ids:[script.id]});
  }
});
