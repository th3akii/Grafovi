const AUTOSAVE_KEY = 'grafovi_autosave_data';

function saveToLocalStorage(currentUserSettings, currentGraph) {
    try
    {
        const data = {
            settings : currentUserSettings,
            graph : currentGraph,
            timestamp : new Date().toISOString()
        }
        let jsonString = JSON.stringify(data)
        localStorage.setItem(AUTOSAVE_KEY, jsonString)
        console.log('Auto-saved:', new Date().toLocaleTimeString());
    }
    catch (error)
    {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try
    {
        const jsonString = localStorage.getItem(AUTOSAVE_KEY);
        if (!jsonString) {
            console.log('No auto-save data found'); 
            return null;
        }

        const data = JSON.parse(jsonString);
        console.log('Loaded auto-save from:', data.timestamp); 
        return data;
    }
    catch (error)
    {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

function clearLocalStorage() {
    try
    {
        localStorage.removeItem(AUTOSAVE_KEY);
    }
    catch (error)
    {
        console.error('Error clearing localStorage:', error);
    }
}