namespace Grafovi.Models
{
    public class Graf
    {
        public int ID { get; set; }
        public string naziv { get; set; }
        public List<GrafCvor> cvorovi { get; set; }
        public List<GrafGrana> grane { get; set; }

        public Graf()
        {
            cvorovi = new List<GrafCvor>();
            grane = new List<GrafGrana>();
        }

        public void ObrisiCvor(GrafCvor cvor)
        {
            grane.RemoveAll(g => g.pocetniCvor == cvor || g.krajnjiCvor == cvor);
            cvorovi.Remove(cvor);
        }
        
        public void ObrisiGranu(GrafGrana grana)
        {
            cvorovi.RemoveAll(c => c == grana.pocetniCvor || c == grana.krajnjiCvor);
            grane.Remove(grana);
        }

        public void Dodaj(string pocetniNaziv, string krajnjiNaziv, double tezinaInput, bool usmerenGraf)
        {
            var pocetniCvor = cvorovi.FirstOrDefault(c => c.naziv == pocetniNaziv);
            if (pocetniCvor == null)
            {
                pocetniCvor = new GrafCvor(cvorovi.Count + 1, pocetniNaziv);
                cvorovi.Add(pocetniCvor);
            }

            var krajnjiCvor = cvorovi.FirstOrDefault(c => c.naziv == krajnjiNaziv);
            if (krajnjiCvor == null)
            {
                krajnjiCvor = new GrafCvor(cvorovi.Count + 1, krajnjiNaziv);
                cvorovi.Add(krajnjiCvor);
            }

            var granaPostoji = grane.Any(g =>
                (g.pocetniCvor == pocetniCvor && g.krajnjiCvor == krajnjiCvor) ||
                (!usmerenGraf && g.pocetniCvor == krajnjiCvor && g.krajnjiCvor == pocetniCvor)
            );
            if (!granaPostoji)
            {
                grane.Add(new GrafGrana
                {
                    ID = grane.Count + 1,
                    pocetniCvor = pocetniCvor,
                    krajnjiCvor = krajnjiCvor,
                    tezina = tezinaInput,
                    usmerena = false
                });
            }
        }
    }
}