using Grafovi.Models;
using System.Net.Http.Json;

namespace Grafovi.Services
{
    public class GrafTemplateService
    {
        private readonly HttpClient httpClient;
        
        public GrafTemplateService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }
        public async Task<List<GrafTemplates>> GetGrafTemplates()
        {
            try
            {
                var templates = await httpClient.GetFromJsonAsync<List<GrafTemplates>>("/templates/templates.json");
                return templates ?? new List<GrafTemplates>();
            }
            catch
            {
                return new List<GrafTemplates>();
            }
        }

        public async Task<Graf?> UcitajGraf(string fileName)
        {
            try
            {
                var graf = await httpClient.GetFromJsonAsync<Graf>(fileName);
                return graf;
            }
            catch
            {
                return null;
            }
        }
    }
}