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

            
            if (pocetniCvor == krajnjiCvor)
            {
                var postojecaPetlja = grane.Any(g => g.pocetniCvor == pocetniCvor && g.krajnjiCvor == krajnjiCvor);
                if (postojecaPetlja)
                {
                    throw new InvalidOperationException("Već postoji petlja na ovom čvoru!");
                }
            }

            string granaId = KreirajIDGrane(pocetniCvor, krajnjiCvor, usmerenGraf);
            grane.Add(new GrafGrana
            {
                ID = granaId,
                pocetniCvor = pocetniCvor,
                krajnjiCvor = krajnjiCvor,
                tezina = tezinaInput,
                usmerena = usmerenGraf
            });

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

        string KreirajIDGrane(GrafCvor pocetni, GrafCvor krajnji, bool usmerenGraf)
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}