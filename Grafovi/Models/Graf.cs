namespace Grafovi.Models
{
    public class Graf
    {
        public int ID { get; set; }
        public string naziv { get; set; }
        public List<GrafCvor> cvorovi { get; set; }
        public List<GrafGrana> grane { get; set; }
        public bool usmeren { get; set; } = false;
        public bool tezinski { get; set; } = false;

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
            if (grana == null)
            {
                return;
            }

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
                var granaId = KreirajIdGrane(pocetniCvor, krajnjiCvor, usmerenGraf);
                grane.Add(new GrafGrana
                {
                    ID = granaId,
                    pocetniCvor = pocetniCvor,
                    krajnjiCvor = krajnjiCvor,
                    tezina = tezinaInput,
                    usmerena = usmerenGraf
                });
            }

            usmeren = usmerenGraf;
        }

        public void DodajJedanCvor(string nazivCvora)
        {
            var cvorPostoji = cvorovi.Any(c => c.naziv == nazivCvora);
            if (!cvorPostoji)
            {
                var noviCvor = new GrafCvor(cvorovi.Count + 1, nazivCvora);
                cvorovi.Add(noviCvor);
            }
        }

        string KreirajIdGrane(GrafCvor pocetni, GrafCvor krajnji, bool usmerenGraf)
        {
            if (pocetni == null || krajnji == null)
            {
                return Guid.NewGuid().ToString("N");
            }

            if (usmerenGraf)
            {
                return $"{pocetni.naziv}{krajnji.naziv}";
            }

            var nazivi = new[] { pocetni.naziv, krajnji.naziv }
                .OrderBy(n => n, StringComparer.Ordinal)
                .ToArray();

            return $"{nazivi[0]}{nazivi[1]}";
        }

        public void UkloniGraneBezPostojecihCvorova()
        {
            if (cvorovi.Count == 0 || grane.Count == 0)
            {
                return;
            }

            var postojeciCvorovi = new HashSet<int>(cvorovi.Select(c => c.ID));
            grane.RemoveAll(g =>
                g.pocetniCvor == null ||
                g.krajnjiCvor == null ||
                !postojeciCvorovi.Contains(g.pocetniCvor.ID) ||
                !postojeciCvorovi.Contains(g.krajnjiCvor.ID));
        }
    }
}