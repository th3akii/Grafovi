using Microsoft.JSInterop;

namespace Grafovi.Services;

public class ThemeService
{
    private readonly IJSRuntime _jsRuntime;
    private string _currentTheme = "dark"; // Default dark theme
    
    public event Action? OnThemeChanged;
    
    public ThemeService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }
    
    public string CurrentTheme => _currentTheme;
    
    public bool IsDarkTheme => _currentTheme == "dark";
    
    public async Task InitializeAsync()
    {
        try
        {
            var savedTheme = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", "theme");
            _currentTheme = string.IsNullOrEmpty(savedTheme) ? "dark" : savedTheme;
            await ApplyThemeAsync();
        }
        catch
        {
            _currentTheme = "dark";
            await ApplyThemeAsync();
        }
    }
    
    public async Task ToggleThemeAsync()
    {
        _currentTheme = _currentTheme == "dark" ? "light" : "dark";
        await ApplyThemeAsync();
        await SaveThemeAsync();
        OnThemeChanged?.Invoke();
    }
    
    private async Task ApplyThemeAsync()
    {
        try
        {
            await _jsRuntime.InvokeVoidAsync("eval", $"document.documentElement.setAttribute('data-theme', '{_currentTheme}')");
        }
        catch
        {
            // JS runtime might not be ready yet
        }
    }
    
    private async Task SaveThemeAsync()
    {
        try
        {
            await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "theme", _currentTheme);
        }
        catch
        {
            // Ignore errors
        }
    }
}
