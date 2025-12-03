using Grafovi.Models;

namespace Grafovi.Services
{
    public class GraphStateService
    {
        public Graf Graf { get; set; } = new Graf();
        public bool TezinskiGraf { get; set; } = false;
        public bool UsmerenGraf { get; set; } = false;

        // Settings
        public string BojaCvora { get; set; } = "#97C2FC";
        public string BojaGrane { get; set; } = "#2B7CE9";
        public int VelicinaCvora { get; set; } = 16;
        public bool ZakljucanoPomeranje { get; set; } = false;
        public bool CuvajPoziciju { get; set; } = false;

        public event Action? OnChange;

        public void NotifyStateChanged() => OnChange?.Invoke();
        
        public void ResetSettings()
        {
            BojaCvora = "#97C2FC";
            BojaGrane = "#2B7CE9";
            VelicinaCvora = 16;
            ZakljucanoPomeranje = false;
            CuvajPoziciju = false;
            NotifyStateChanged();
        }
    }
}
