namespace Grafovi.Models.Komande
{
    public class KomandaObrisiGranu : IKomanda
    {
        private string granaID;
        private GrafGrana? obrisanaGrana;

        public KomandaObrisiGranu(string granaID)
        {
            this.granaID = granaID;
        }

        public void Izvrsi(Graf graf)
        {
            obrisanaGrana = graf.grane.FirstOrDefault(g => g.ID == granaID);
            if (obrisanaGrana != null)
            {
                graf.ObrisiGranu(obrisanaGrana);
            }
        }

        public void Ponisti(Graf graf)
        {
            if (obrisanaGrana != null)
            {
                var pocetniPostoji = graf.cvorovi.Any(c => c.ID == obrisanaGrana.pocetniCvor.ID);
                var krajnjiPostoji = graf.cvorovi.Any(c => c.ID == obrisanaGrana.krajnjiCvor.ID);

                if (!pocetniPostoji)
                {
                    graf.cvorovi.Add(obrisanaGrana.pocetniCvor);
                }
                if (!krajnjiPostoji)
                {
                    graf.cvorovi.Add(obrisanaGrana.krajnjiCvor);
                }

                graf.grane.Add(obrisanaGrana);
            }
        }
    }
}