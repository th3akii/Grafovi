namespace Grafovi.Models.Komande
{
    public class KomandaDodajGranu : IKomanda
    {
        private string? granaID;
        private string pocetniNaziv;
        private string krajnjiNaziv;
        private double tezina;
        private bool usmerenGraf;

        private bool pocetniPostojao;
        private bool krajnjiPostojao;
        private int pocetniCvorID;
        private int krajnjiCvorID;

        public KomandaDodajGranu(string pocetniNaziv, string krajnjiNaziv, double tezina, bool usmerenGraf)
        {
            this.pocetniNaziv = pocetniNaziv;
            this.krajnjiNaziv = krajnjiNaziv;
            this.tezina = tezina;
            this.usmerenGraf = usmerenGraf;
        }

        public void Izvrsi(Graf graf)
        {
            pocetniPostojao = graf.cvorovi.Any(c => c.naziv == pocetniNaziv);
            krajnjiPostojao = graf.cvorovi.Any(c => c.naziv == krajnjiNaziv);

            graf.Dodaj(pocetniNaziv, krajnjiNaziv, tezina, usmerenGraf);

            var pocetniCvor = graf.cvorovi.First(c => c.naziv == pocetniNaziv);
            var krajnjiCvor = graf.cvorovi.First(c => c.naziv == krajnjiNaziv);
            
            pocetniCvorID = pocetniCvor.ID;
            krajnjiCvorID = krajnjiCvor.ID;

            var novaGrana = graf.grane
                .Where(g => g.pocetniCvor.ID == pocetniCvorID && g.krajnjiCvor.ID == krajnjiCvorID && g.tezina == tezina)
                .OrderByDescending(g => g.ID)
                .FirstOrDefault();

            if (novaGrana != null)
            {
                granaID = novaGrana.ID;
            }
        }

        public void Ponisti(Graf graf)
        {
            var grana = graf.grane.FirstOrDefault(g => g.ID == granaID);
            if (grana != null)
            {
                graf.ObrisiGranu(grana);
            }

            if (!pocetniPostojao)
            {
                var pocetniCvor = graf.cvorovi.FirstOrDefault(c => c.ID == pocetniCvorID);
                if (pocetniCvor != null && !graf.grane.Any(g => g.pocetniCvor.ID == pocetniCvorID || g.krajnjiCvor.ID == pocetniCvorID))
                {
                    graf.ObrisiCvor(pocetniCvor);
                }
            }

            if (!krajnjiPostojao)
            {
                var krajnjiCvor = graf.cvorovi.FirstOrDefault(c => c.ID == krajnjiCvorID);
                if (krajnjiCvor != null && !graf.grane.Any(g => g.pocetniCvor.ID == krajnjiCvorID || g.krajnjiCvor.ID == krajnjiCvorID))
                {
                    graf.ObrisiCvor(krajnjiCvor);
                }
            }
        }
    }
}