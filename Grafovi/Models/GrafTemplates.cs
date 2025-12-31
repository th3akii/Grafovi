namespace Grafovi.Models
{
    public class GrafTemplates
    {
        public string naziv { get; set; }
        public string slika { get; set; }
        public string? grafFajl { get; set; }
        public Graf? graf { get; set; }

        public GrafTemplates()
        {
            naziv = string.Empty;
            slika = string.Empty;
        }

        public GrafTemplates(string naziv, string slika, Graf graf)
        {
            this.naziv = naziv;
            this.slika = slika;
            this.graf = graf;
        }

        public GrafTemplates(string naziv, string slika, string grafFajl)
        {
            this.naziv = naziv;
            this.slika = slika;
            this.grafFajl = grafFajl;
        }
    }
}